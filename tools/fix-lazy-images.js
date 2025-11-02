#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.github']);
const HTML_EXT = new Set(['.html', '.htm']);
const JS_EXT = new Set(['.js']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseAttributes(section) {
  const attrs = [];
  let i = 0;
  while (i < section.length) {
    while (i < section.length && /\s/.test(section[i])) {
      i += 1;
    }
    if (i >= section.length) {
      break;
    }
    const nameStart = i;
    while (i < section.length && !/[\s=]/.test(section[i])) {
      i += 1;
    }
    const name = section.slice(nameStart, i);
    let value = null;
    if (section[i] === '=') {
      i += 1;
      while (i < section.length && /\s/.test(section[i])) {
        i += 1;
      }
      if (i < section.length) {
        const quote = section[i];
        if (quote === '"' || quote === '\'') {
          i += 1;
          const valueStart = i;
          while (i < section.length && section[i] !== quote) {
            i += 1;
          }
          value = section.slice(valueStart, i);
          if (i < section.length && section[i] === quote) {
            i += 1;
          }
        } else {
          const valueStart = i;
          while (i < section.length && !/\s/.test(section[i])) {
            i += 1;
          }
          value = section.slice(valueStart, i);
        }
      }
    }
    if (name) {
      attrs.push({ name, value });
    }
  }
  return attrs;
}

function getAttr(attrs, name) {
  const lower = name.toLowerCase();
  const found = attrs.find((attr) => attr.name.toLowerCase() === lower);
  return found ? found.value : null;
}

function setAttr(attrs, name, value) {
  const lower = name.toLowerCase();
  for (const attr of attrs) {
    if (attr.name.toLowerCase() === lower) {
      if (attr.value === value) {
        return false;
      }
      attr.value = value;
      return true;
    }
  }
  attrs.push({ name, value });
  return true;
}

function removeAttr(attrs, name) {
  const lower = name.toLowerCase();
  const initial = attrs.length;
  for (let i = attrs.length - 1; i >= 0; i -= 1) {
    if (attrs[i].name.toLowerCase() === lower) {
      attrs.splice(i, 1);
    }
  }
  return attrs.length !== initial;
}

function buildTag(attrs, selfClosing, closingSuffix) {
  const parts = attrs.map((attr) => {
    if (attr.value === null || typeof attr.value === 'undefined') {
      return attr.name;
    }
    return `${attr.name}="${attr.value}"`;
  });
  if (parts.length) {
    return `<img ${parts.join(' ')}${selfClosing ? closingSuffix : '>'}`;
  }
  return `<img${selfClosing ? closingSuffix : '>'}`;
}

function getImageSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 10) {
    return null;
  }
  // PNG
  if (buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xcc) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset += 2 + length;
    }
  }
  return null;
}

function classifyImage(attrs, context, hasLoading) {
  const classValue = (getAttr(attrs, 'class') || '').toLowerCase();
  const idValue = (getAttr(attrs, 'id') || '').toLowerCase();
  const hasLogoKeyword = classValue.includes('logo') || idValue.includes('logo');
  const hasHeroKeyword = classValue.includes('hero') || idValue.includes('hero');
  const hasDataHero = attrs.some((attr) => attr.name.toLowerCase() === 'data-hero');
  const contextLower = context.toLowerCase();
  const nearFooter = /footer-brand|brand--footer|site-footer/.test(contextLower);
  const nearHeader = /site-header|header-inner|logo-link/.test(contextLower);

  const heroFromData = hasDataHero && !hasLoading;
  const heroFromClass = hasHeroKeyword && !nearFooter;
  const heroLogo = hasLogoKeyword && nearHeader && !nearFooter;

  const lightbox = /lb-img|lightbox-full/.test(classValue) || /lb-img|lightbox-full/.test(idValue);

  return {
    hero: heroFromData || heroFromClass || heroLogo,
    lightbox,
  };
}

function shouldSkipLazy(attrs) {
  const classValue = (getAttr(attrs, 'class') || '').toLowerCase();
  const idValue = (getAttr(attrs, 'id') || '').toLowerCase();
  return /no-lazy/.test(classValue) || /no-lazy/.test(idValue);
}

function processHtmlFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let lazyApplied = 0;
  let heroAdjusted = 0;
  let dimensionsAdded = 0;
  let decodingApplied = 0;

  const result = original.replace(/<img[^>]*>/gi, (match, offset) => {
    const trimmed = match.trimEnd();
    const hasSelfClosing = trimmed.slice(-2) === '/>';
    const charBefore = match[match.length - 3] || '';
    const closingSuffix = hasSelfClosing && /\s/.test(charBefore) ? ' />' : hasSelfClosing ? '/>' : '>';
    const body = match.slice(4, match.length - closingSuffix.length);
    const attrs = parseAttributes(body);
    const hasLoading = attrs.some((attr) => attr.name.toLowerCase() === 'loading');
    const context = original.slice(Math.max(0, offset - 200), Math.min(original.length, offset + match.length + 200));
    const classification = classifyImage(attrs, context, hasLoading);
    const skipLazy = shouldSkipLazy(attrs);

    let tagChanged = false;

    if (classification.hero) {
      if (removeAttr(attrs, 'loading')) {
        tagChanged = true;
      }
      if (setAttr(attrs, 'fetchpriority', 'high')) {
        tagChanged = true;
        heroAdjusted += 1;
      }
      if (setAttr(attrs, 'decoding', 'sync')) {
        tagChanged = true;
        decodingApplied += 1;
      }
    } else if (classification.lightbox) {
      if (removeAttr(attrs, 'loading')) {
        tagChanged = true;
      }
      if (setAttr(attrs, 'decoding', 'async')) {
        tagChanged = true;
        decodingApplied += 1;
      }
    } else if (!skipLazy) {
      if (setAttr(attrs, 'loading', 'lazy')) {
        tagChanged = true;
        lazyApplied += 1;
      }
      if (setAttr(attrs, 'decoding', 'async')) {
        tagChanged = true;
        decodingApplied += 1;
      }
    }

    const src = getAttr(attrs, 'src');
    const hasWidth = attrs.some((attr) => attr.name.toLowerCase() === 'width');
    const hasHeight = attrs.some((attr) => attr.name.toLowerCase() === 'height');
    if (src && (!hasWidth || !hasHeight)) {
      const isRemote = /^(https?:)?\/\//i.test(src) || src.startsWith('data:');
      if (!isRemote) {
        const resolved = path.resolve(path.dirname(filePath), src);
        const size = getImageSize(resolved);
        if (size) {
          if (!hasWidth) {
            if (setAttr(attrs, 'width', String(size.width))) {
              tagChanged = true;
              dimensionsAdded += 1;
            }
          }
          if (!hasHeight) {
            if (setAttr(attrs, 'height', String(size.height))) {
              tagChanged = true;
              dimensionsAdded += 1;
            }
          }
        }
      }
    }

    if (tagChanged) {
      updated = true;
      return buildTag(attrs, hasSelfClosing, closingSuffix);
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(filePath, result);
  }

  return { updated, lazyApplied, heroAdjusted, dimensionsAdded, decodingApplied };
}

function processJsFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let updated = false;
  let insertions = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(\s*)(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(document\.createElement\(['"]img['"]\)|new Image\s*\(\s*\));?\s*$/);
    if (!match) {
      continue;
    }
    const indent = match[1] || '';
    const name = match[3];
    if (/hero|logo/i.test(name)) {
      continue;
    }
    const namePattern = new RegExp(`\\b${name.replace(/[$]/g, '\\$&')}\\s*\\.\\s*loading\\b`);
    if (namePattern.test(original)) {
      continue;
    }
    lines.splice(i + 1, 0, `${indent}${name}.loading = 'lazy';`, `${indent}${name}.decoding = 'async';`);
    i += 2;
    updated = true;
    insertions += 1;
  }

  if (updated) {
    fs.writeFileSync(filePath, lines.join('\n'));
  }

  return { updated, insertions };
}

function run() {
  const files = walk(root);
  const htmlFiles = files.filter((file) => HTML_EXT.has(path.extname(file).toLowerCase()));
  const jsFiles = files.filter((file) => JS_EXT.has(path.extname(file).toLowerCase()));

  const summaries = [];

  for (const file of htmlFiles) {
    const stats = processHtmlFile(file);
    if (stats.updated) {
      summaries.push(`${path.relative(root, file)} → imgs updated (lazy:${stats.lazyApplied}, hero:${stats.heroAdjusted}, decoding:${stats.decodingApplied}, dimensions:${stats.dimensionsAdded})`);
    }
  }

  for (const file of jsFiles) {
    const stats = processJsFile(file);
    if (stats.updated) {
      summaries.push(`${path.relative(root, file)} → JS image helpers inserted (${stats.insertions})`);
    }
  }

  if (summaries.length) {
    console.log('Lazy-loading fixer results:');
    for (const line of summaries) {
      console.log(`- ${line}`);
    }
  } else {
    console.log('No lazy-loading adjustments were necessary.');
  }
}

run();
