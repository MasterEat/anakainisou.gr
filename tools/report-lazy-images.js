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

function createLineIndex(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

function getLineNumber(offsets, index) {
  let low = 0;
  let high = offsets.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const offset = offsets[mid];
    const next = mid + 1 < offsets.length ? offsets[mid + 1] : Number.POSITIVE_INFINITY;
    if (index >= offset && index < next) {
      return mid + 1;
    }
    if (index < offset) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return offsets.length;
}

function parseAttributes(tag) {
  const attrSection = tag.replace(/^<img\s*/i, '').replace(/\s*\/?>$/i, '');
  const attrs = [];
  let i = 0;
  while (i < attrSection.length) {
    while (i < attrSection.length && /\s/.test(attrSection[i])) {
      i += 1;
    }
    if (i >= attrSection.length) {
      break;
    }
    const nameStart = i;
    while (i < attrSection.length && !/[\s=]/.test(attrSection[i])) {
      i += 1;
    }
    const name = attrSection.slice(nameStart, i);
    let value = null;
    if (attrSection[i] === '=') {
      i += 1;
      while (i < attrSection.length && /\s/.test(attrSection[i])) {
        i += 1;
      }
      if (i < attrSection.length) {
        const quote = attrSection[i];
        if (quote === '"' || quote === '\'') {
          i += 1;
          const valueStart = i;
          while (i < attrSection.length && attrSection[i] !== quote) {
            i += 1;
          }
          value = attrSection.slice(valueStart, i);
          if (i < attrSection.length && attrSection[i] === quote) {
            i += 1;
          }
        } else {
          const valueStart = i;
          while (i < attrSection.length && !/\s/.test(attrSection[i])) {
            i += 1;
          }
          value = attrSection.slice(valueStart, i);
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

function classifyImage(tag, context) {
  const attrs = parseAttributes(tag);
  const lowerTag = tag.toLowerCase();
  const hasLoading = /\bloading\s*=/.test(lowerTag);
  const dataHero = attrs.some((attr) => attr.name.toLowerCase() === 'data-hero');
  const classValue = (getAttr(attrs, 'class') || '').toLowerCase();
  const idValue = (getAttr(attrs, 'id') || '').toLowerCase();
  const contextLower = context.toLowerCase();
  const nearFooter = /footer-brand|brand--footer|site-footer/.test(contextLower);
  const nearHeader = /site-header|header-inner|logo-link/.test(contextLower);
  const hasHeroKeyword = classValue.includes('hero') || idValue.includes('hero');
  const hasLogoKeyword = classValue.includes('logo') || idValue.includes('logo');

  const heroFromData = dataHero && !hasLoading;
  const heroFromClass = hasHeroKeyword && !nearFooter;
  const heroLogo = hasLogoKeyword && nearHeader && !nearFooter;

  const hero = heroFromData || heroFromClass || heroLogo;
  const lightbox = /lb-img|lightbox-full/.test(classValue) || /lb-img|lightbox-full/.test(idValue);

  return { hero, lightbox };
}

function makeSnippet(tag) {
  return tag.length > 160 ? `${tag.slice(0, 160)}…` : tag;
}

function run() {
  const files = walk(root);
  const htmlFiles = files.filter((file) => HTML_EXT.has(path.extname(file).toLowerCase()));
  const jsFiles = files.filter((file) => JS_EXT.has(path.extname(file).toLowerCase()));

  const missingLoading = [];
  const allowedMissing = [];
  const pictureIssues = [];
  const jsCreations = [];
  const thumbIssues = [];

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const offsets = createLineIndex(content);

    const imgRegex = /<img(?![^>]*\bloading\s*=)[^>]*>/gi;
    for (const match of content.matchAll(imgRegex)) {
      const index = match.index || 0;
      const line = getLineNumber(offsets, index);
      const context = content.slice(Math.max(0, index - 200), Math.min(content.length, index + match[0].length + 200));
      const classification = classifyImage(match[0], context);
      const record = { file: path.relative(root, file), line, snippet: makeSnippet(match[0]) };
      if (classification.hero || classification.lightbox) {
        allowedMissing.push({ ...record, reason: classification.hero ? 'hero/logo or above-the-fold' : 'lightbox full-size image' });
      } else {
        missingLoading.push(record);
      }
    }

    const pictureRegex = /<picture>[\s\S]*?<img(?![^>]*\bloading\s*=)[^>]*>[\s\S]*?<\/picture>/gi;
    for (const match of content.matchAll(pictureRegex)) {
      const index = match.index || 0;
      const line = getLineNumber(offsets, index);
      pictureIssues.push({ file: path.relative(root, file), line, snippet: makeSnippet(match[0]) });
    }

    const thumbRegex = /<img[^>]*class\s*=\s*"[^"]*(thumb|strip|gallery)[^"]*"[^>]*>/gi;
    for (const match of content.matchAll(thumbRegex)) {
      if (/\bloading\s*=\s*"lazy"/.test(match[0])) {
        continue;
      }
      const index = match.index || 0;
      const line = getLineNumber(offsets, index);
      thumbIssues.push({ file: path.relative(root, file), line, snippet: makeSnippet(match[0]) });
    }
  }

  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const offsets = createLineIndex(content);
    const pattern = /new Image\(|document\.createElement\(['"]img['"]\)|\.innerHTML\s*=\s*`[^`]*<img/gi;
    for (const match of content.matchAll(pattern)) {
      const index = match.index || 0;
      const line = getLineNumber(offsets, index);
      jsCreations.push({ file: path.relative(root, file), line, snippet: makeSnippet(match[0]) });
    }
  }

  const sections = [];

  sections.push('Lazy-loading audit report');
  sections.push('================================');

  if (missingLoading.length) {
    sections.push('\nImages missing loading="lazy":');
    for (const item of missingLoading) {
      sections.push(`  - ${item.file}:${item.line} → ${item.snippet}`);
    }
  } else {
    sections.push('\nNo images missing loading="lazy" outside approved exceptions.');
  }

  if (allowedMissing.length) {
    sections.push('\nAllowed exceptions (not lazied intentionally):');
    for (const item of allowedMissing) {
      sections.push(`  - ${item.file}:${item.line} (${item.reason}) → ${item.snippet}`);
    }
  }

  if (pictureIssues.length) {
    sections.push('\n<picture> blocks with inner <img> missing loading attribute:');
    for (const item of pictureIssues) {
      sections.push(`  - ${item.file}:${item.line} → ${item.snippet}`);
    }
  }

  if (jsCreations.length) {
    sections.push('\nPotential JS image creation without lazy-loading:');
    for (const item of jsCreations) {
      sections.push(`  - ${item.file}:${item.line} → ${item.snippet}`);
    }
  }

  if (thumbIssues.length) {
    sections.push('\nGallery/thumb images missing loading="lazy":');
    for (const item of thumbIssues) {
      sections.push(`  - ${item.file}:${item.line} → ${item.snippet}`);
    }
  }

  if (!pictureIssues.length && !jsCreations.length && !thumbIssues.length) {
    sections.push('\nNo additional issues detected.');
  }

  console.log(sections.join('\n'));
}

run();
