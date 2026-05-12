const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const port = Number(portArgIndex >= 0 ? args[portArgIndex + 1] : process.env.PORT) || 3000;
const host = '127.0.0.1';

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.pdf', 'application/pdf']
]);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  const filePath = resolveRequestPath(req.url);
  if (!filePath) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      send(res, 404, 'Not Found');
      return;
    }

    if (stats.isDirectory()) {
      const redirectTo = req.url.endsWith('/') ? `${req.url}index.html` : `${req.url}/`;
      res.writeHead(302, { Location: redirectTo });
      res.end();
      return;
    }

    const type = contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`Static server running at http://${host}:${port}/RayLeos/`);
});
