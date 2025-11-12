const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const scripts = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1].trim());
}

if (!scripts.length) {
  throw new Error('No JSON-LD scripts found in index.html');
}

const disallowedHost = 'www.anakainisou.gr';
const breadcrumbExpected = [
  'https://anakainisou.gr/',
  'https://anakainisou.gr/#services'
];

const checkUrlField = (value, fieldPath) => {
  if (typeof value === 'string' && value.includes(disallowedHost)) {
    throw new Error(`${fieldPath} includes disallowed host: ${value}`);
  }
};

const walk = (obj, pathParts = []) => {
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => walk(item, pathParts.concat(String(idx))));
    return;
  }
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const nextPath = pathParts.concat(key);
      if (['url', 'image', 'logo'].includes(key)) {
        checkUrlField(value, nextPath.join('.'));
      }
      walk(value, nextPath);
    });
  }
};

scripts.forEach((jsonText, index) => {
  if (!jsonText) {
    throw new Error(`JSON-LD script #${index + 1} is empty`);
  }
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`JSON-LD script #${index + 1} is not valid JSON: ${error.message}`);
  }

  walk(data);

  if (data['@type'] === 'BreadcrumbList') {
    const items = Array.isArray(data.itemListElement) ? data.itemListElement : [];
    if (items.length !== breadcrumbExpected.length) {
      throw new Error(`BreadcrumbList should contain exactly ${breadcrumbExpected.length} items`);
    }
    const seen = new Set();
    items.forEach((item, idx) => {
      const itemUrl = item && item.item;
      if (!itemUrl) {
        throw new Error(`Breadcrumb item #${idx + 1} is missing the item URL`);
      }
      if (seen.has(itemUrl)) {
        throw new Error(`Duplicate breadcrumb URL detected: ${itemUrl}`);
      }
      seen.add(itemUrl);
      if (itemUrl !== breadcrumbExpected[idx]) {
        throw new Error(`Breadcrumb item #${idx + 1} expected ${breadcrumbExpected[idx]} but found ${itemUrl}`);
      }
    });
  }
});

console.log('Schema validation passed for index.html JSON-LD.');
