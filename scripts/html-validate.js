const fs = require('fs');

const files = ['index.html', 'erga.html', 'privacy-policy.html', 'terms.html'];

const titleRegex = /<title\b[^>]*>[\s\S]*?<\/title>/gi;
const metaDescriptionRegex = /<meta[^>]+name=["']description["'][^>]*>/gi;
const canonicalRegex = /<link[^>]+rel=["']canonical["'][^>]*>/gi;
const ogTitleRegex = /<meta[^>]+property=["']og:title["'][^>]*>/gi;
const ogDescRegex = /<meta[^>]+property=["']og:description["'][^>]*>/gi;
const ogUrlRegex = /<meta[^>]+property=["']og:url["'][^>]*>/gi;
const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
const idRegex = /\bid\s*=\s*["']([^"']+)["']/gi;

function getHref(tag) {
  const match = tag.match(/href\s*=\s*["']([^"']+)["']/i);
  return match ? match[1] : '';
}

function extractContent(tag, attr) {
  const regex = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i');
  const match = tag.match(regex);
  return match ? match[1] : '';
}

const canonicalExpectations = {
  'index.html': 'https://anakainisou.gr/',
  'erga.html': 'https://anakainisou.gr/erga.html',
  'privacy-policy.html': 'https://anakainisou.gr/privacy-policy.html',
  'terms.html': 'https://anakainisou.gr/terms.html'
};

files.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8');

  const titles = html.match(titleRegex) || [];
  if (titles.length !== 1) {
    throw new Error(`${file}: expected 1 <title>, found ${titles.length}`);
  }

  const metaDescriptions = html.match(metaDescriptionRegex) || [];
  if (metaDescriptions.length !== 1) {
    throw new Error(`${file}: expected 1 meta description, found ${metaDescriptions.length}`);
  }

  const canonicals = html.match(canonicalRegex) || [];
  if (canonicals.length !== 1) {
    throw new Error(`${file}: expected 1 canonical link, found ${canonicals.length}`);
  }
  const canonicalHref = getHref(canonicals[0]);
  if (!canonicalHref) {
    throw new Error(`${file}: canonical link missing href`);
  }
  if (!canonicalHref.startsWith('https://anakainisou.gr/')) {
    throw new Error(`${file}: canonical must start with https://anakainisou.gr/`);
  }
  const expectedCanonical = canonicalExpectations[file];
  if (!expectedCanonical) {
    throw new Error(`${file}: no canonical expectation configured`);
  }
  if (canonicalHref !== expectedCanonical) {
    throw new Error(`${file}: canonical must equal ${expectedCanonical}`);
  }

  const ogTitles = html.match(ogTitleRegex) || [];
  if (ogTitles.length !== 1) {
    throw new Error(`${file}: expected 1 og:title, found ${ogTitles.length}`);
  }

  const ogDescs = html.match(ogDescRegex) || [];
  if (ogDescs.length !== 1) {
    throw new Error(`${file}: expected 1 og:description, found ${ogDescs.length}`);
  }

  const ogUrls = html.match(ogUrlRegex) || [];
  if (ogUrls.length !== 1) {
    throw new Error(`${file}: expected 1 og:url, found ${ogUrls.length}`);
  }
  const ogUrl = extractContent(ogUrls[0], 'content');
  if (!ogUrl) {
    throw new Error(`${file}: og:url missing content value`);
  }
  if (ogUrl !== canonicalHref) {
    throw new Error(`${file}: og:url must match canonical`);
  }

  const ids = new Set();
  let idMatch;
  while ((idMatch = idRegex.exec(html)) !== null) {
    const id = idMatch[1];
    if (ids.has(id)) {
      throw new Error(`${file}: duplicate id "${id}" detected`);
    }
    ids.add(id);
  }

  const invalidLinks = [];
  let anchorMatch;
  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    const href = anchorMatch[1];
    if (href.includes('index.html')) {
      invalidLinks.push(href);
    }
  }
  if (invalidLinks.length) {
    throw new Error(`${file}: found invalid link references ${invalidLinks.join(', ')}`);
  }
});

console.log('HTML validation checks passed for all files.');
