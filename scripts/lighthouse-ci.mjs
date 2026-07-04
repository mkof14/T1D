import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');
const port = Number(process.env.T1D_LIGHTHOUSE_PORT || 4173);
const host = '127.0.0.1';

const contentTypeFor = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.webmanifest')) return 'application/manifest+json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8';
  return 'application/octet-stream';
};

const shouldCompress = (filePath) => /\.(html|js|css|json|svg|xml|txt|webmanifest)$/.test(filePath);

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${host}:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filePath = path.join(distDir, pathname);
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const body = readFileSync(filePath);
    const contentType = contentTypeFor(filePath);
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    if (shouldCompress(filePath) && acceptEncoding.includes('gzip')) {
      const compressed = gzipSync(body);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding',
      });
      res.end(compressed);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch {
    const fallback = readFileSync(path.join(distDir, 'index.html'));
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    if (acceptEncoding.includes('gzip')) {
      const compressed = gzipSync(fallback);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding',
      });
      res.end(compressed);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fallback);
  }
});

await new Promise((resolve, reject) => {
  server.listen(port, host, () => resolve());
  server.on('error', reject);
});

process.env.LHCI_URL = `http://${host}:${port}/`;

const child = spawn('npx', ['lhci', 'autorun', '--config=.lighthouserc.json'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  server.close();
  process.exit(code ?? 1);
});
