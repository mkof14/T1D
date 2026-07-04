import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const siteUrl = String(process.env.VITE_SITE_URL || process.env.T1D_SITE_URL || 'http://localhost:3002').replace(/\/$/, '');
const publicDir = join(process.cwd(), 'public');
const downloadsDir = join(publicDir, 'downloads');
const iconsDir = join(publicDir, 'icons');

mkdirSync(downloadsDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value;
  }
  return table;
})();

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc = crcTable[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([length, payload, crc]);
};

const writeSolidPng = (filePath, size, rgb) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x += 1) {
    row[1 + x * 3] = rgb[0];
    row[2 + x * 3] = rgb[1];
    row[3 + x * 3] = rgb[2];
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(filePath, png);
};

writeSolidPng(join(iconsDir, 'icon-192.png'), 192, [14, 165, 233]);
writeSolidPng(join(iconsDir, 'icon-512.png'), 512, [14, 165, 233]);

const desktopUrl = `${siteUrl}/download/desktop?install=desktop`;
const mobileUrl = `${siteUrl}/download/mobile?install=mobile`;

writeFileSync(
  join(downloadsDir, 'steady-desktop.url'),
  ['[InternetShortcut]', `URL=${desktopUrl}`, `IconFile=${siteUrl}/icons/icon-192.png`, 'IconIndex=0', ''].join('\r\n'),
  'utf8',
);

writeFileSync(
  join(downloadsDir, 'steady-desktop.webloc'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>URL</key>',
    `  <string>${desktopUrl}</string>`,
    '</dict>',
    '</plist>',
    '',
  ].join('\n'),
  'utf8',
);

writeFileSync(
  join(downloadsDir, 'steady-mobile.html'),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Steady" />
  <link rel="manifest" href="${siteUrl}/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="${siteUrl}/icons/icon-192.png" />
  <title>Steady Mobile</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #f8fcff; color: #0f172a; }
    main { max-width: 28rem; margin: 0 auto; padding: 2rem 1.25rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.75rem; }
    p, li { line-height: 1.55; }
    a.button { display: inline-block; margin-top: 1rem; padding: 0.85rem 1.1rem; border-radius: 9999px; background: #0ea5e9; color: white; text-decoration: none; font-weight: 700; }
    ol { padding-left: 1.2rem; }
  </style>
</head>
<body>
  <main>
    <h1>Steady on mobile</h1>
    <p>Save Steady to your home screen for quick access.</p>
    <ol>
      <li>Open Steady in Safari (iPhone/iPad) or Chrome (Android).</li>
      <li>iPhone/iPad: Share → Add to Home Screen.</li>
      <li>Android: menu → Install app or Add to Home screen.</li>
    </ol>
    <a class="button" href="${mobileUrl}">Open Steady</a>
  </main>
  <script>setTimeout(function(){ window.location.replace(${JSON.stringify(mobileUrl)}); }, 1200);</script>
</body>
</html>
`,
  'utf8',
);

const manifest = {
  name: 'Steady',
  short_name: 'Steady',
  description: 'Calm support for children, parents, and adults with type 1 or type 2 diabetes.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#f8fcff',
  theme_color: '#0ea5e9',
  lang: 'en',
  categories: ['health', 'medical', 'lifestyle'],
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  ],
};

const portableManifest = {
  ...manifest,
  start_url: `${siteUrl}/`,
  scope: `${siteUrl}/`,
  icons: [
    { src: `${siteUrl}/icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${siteUrl}/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: `${siteUrl}/favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  ],
};

writeFileSync(join(downloadsDir, 'steady-app.webmanifest'), `${JSON.stringify(portableManifest, null, 2)}\n`, 'utf8');
writeFileSync(join(publicDir, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`[download] Generated icons, shortcuts, and manifest for ${siteUrl}`);
