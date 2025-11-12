const path = require('path');
const fs = require('fs/promises');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'assets', 'dist');

const cssBundles = [
  {
    name: 'base.min.css',
    files: ['assets/style.css'],
  },
  {
    name: 'home.min.css',
    files: ['assets/css/services.css', 'assets/css/lightbox.css'],
  },
  {
    name: 'projects.min.css',
    files: ['assets/css/erga.css', 'assets/css/lightbox.css'],
  },
];

const jsBundles = [
  { entry: 'assets/app.js', outfile: 'app.min.js' },
  { entry: 'assets/js/lightbox.js', outfile: 'lightbox.min.js' },
  { entry: 'assets/js/erga.js', outfile: 'erga.min.js' },
];

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function stripJsComments(source) {
  let output = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inRegex = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escape = false;

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        output += char;
      }
      i += 1;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (inSingle) {
      output += char;
      if (!escape && char === "'") {
        inSingle = false;
      }
      escape = !escape && char === '\\';
      i += 1;
      continue;
    }

    if (inDouble) {
      output += char;
      if (!escape && char === '"') {
        inDouble = false;
      }
      escape = !escape && char === '\\';
      i += 1;
      continue;
    }

    if (inTemplate) {
      output += char;
      if (!escape && char === '`') {
        inTemplate = false;
      }
      escape = !escape && char === '\\';
      i += 1;
      continue;
    }

    if (!inRegex && char === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (!inRegex && char === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (!inRegex && char === '/') {
      // Detect regex literal heuristically
      const prev = output.trim().slice(-1);
      const regexStarters = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';']);
      if (!prev || regexStarters.has(prev)) {
        inRegex = true;
      }
    } else if (inRegex && char === '/' && source[i - 1] !== '\\') {
      inRegex = false;
    }

    output += char;

    if (char === "'") {
      inSingle = true;
      escape = false;
    } else if (char === '"') {
      inDouble = true;
      escape = false;
    } else if (char === '`') {
      inTemplate = true;
      escape = false;
    } else {
      escape = char === '\\' && !escape;
    }

    i += 1;
  }

  return output;
}

function minifyJs(source) {
  const noComments = stripJsComments(source);
  return noComments
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

async function buildCss() {
  for (const bundle of cssBundles) {
    const contents = await Promise.all(
      bundle.files.map((file) => fs.readFile(path.join(rootDir, file), 'utf8'))
    );
    const combined = contents.join('\n');
    const minified = minifyCss(combined);
    await fs.writeFile(path.join(outDir, bundle.name), minified, 'utf8');
  }
}

async function buildJs() {
  for (const bundle of jsBundles) {
    const input = await fs.readFile(path.join(rootDir, bundle.entry), 'utf8');
    const minified = minifyJs(input);
    await fs.writeFile(path.join(outDir, bundle.outfile), minified, 'utf8');
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await buildCss();
  await buildJs();
  console.log('Assets built in', path.relative(rootDir, outDir));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
