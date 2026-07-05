import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const siteUrl = String(process.env.VITE_SITE_URL || process.env.T1D_SITE_URL || 'http://localhost:3002').replace(/\/$/, '');
const publicDir = join(process.cwd(), 'public');

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

const writeSolidPng = (filePath, width, height, rgb) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0;
  for (let x = 0; x < width; x += 1) {
    row[1 + x * 3] = rgb[0];
    row[2 + x * 3] = rgb[1];
    row[3 + x * 3] = rgb[2];
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(filePath, png);
};

const publicPaths = [
  '/',
  '/system',
  '/night',
  '/family',
  '/how-it-works',
  '/faq',
  '/learning-center',
  '/news',
  '/trust',
  '/privacy',
  '/terms',
  '/medical-disclaimer',
  '/compliance',
  '/download/desktop',
  '/download/mobile',
];

writeFileSync(
  join(publicDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    'Disallow: /access',
    'Disallow: /create-account',
    'Disallow: /household-setup',
    'Disallow: /workspace',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n'),
  'utf8',
);

const urlEntries = publicPaths
  .map((path) => {
    const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
    const priority = path === '/' ? '1.0' : '0.8';
    const lastmod = new Date().toISOString().slice(0, 10);
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  })
  .join('\n');

writeFileSync(
  join(publicDir, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n'),
  'utf8',
);

writeSolidPng(join(publicDir, 'og-image.png'), 1200, 630, [14, 165, 233]);

console.log(`[seo] Generated robots.txt, sitemap.xml, and og-image.png for ${siteUrl}`);
