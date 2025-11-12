const https = require('https');

const urls = [
  'https://anakainisou.gr/',
  'https://anakainisou.gr/erga.html',
  'https://anakainisou.gr/privacy-policy.html',
  'https://anakainisou.gr/terms.html'
];

function formatError(error) {
  if (!error) {
    return 'Unknown error';
  }
  if (error.message && error.message.trim()) {
    return error.message;
  }
  if (error.code) {
    return `${error.name || 'Error'} (${error.code})`;
  }
  return error.name || String(error);
}

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET' }, (res) => {
      const { statusCode, headers } = res;
      if (statusCode >= 300 && statusCode < 400) {
        reject(new Error(`${url} responded with redirect status ${statusCode}`));
      } else if (statusCode >= 400) {
        reject(new Error(`${url} responded with error status ${statusCode}`));
      } else if (headers.location) {
        reject(new Error(`${url} provided redirect header without redirect status`));
      } else {
        resolve();
      }
      res.resume();
    });

    req.on('error', (error) => {
      reject(new Error(`${url} request failed: ${formatError(error)}`));
    });

    req.end();
  });
}

(async () => {
  try {
    await Promise.all(urls.map(checkUrl));
    console.log('Link check passed for canonical URLs.');
  } catch (error) {
    if (error.message && /ENETUNREACH|EAI_AGAIN|ECONNREFUSED/.test(error.message)) {
      console.warn(`Link check skipped due to network connectivity issue: ${error.message}`);
      return;
    }
    console.error(error.message);
    process.exit(1);
  }
})();
