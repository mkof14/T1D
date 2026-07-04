import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteUrl = String(process.env.VITE_SITE_URL || process.env.T1D_SITE_URL || 'http://localhost:3002').replace(/\/$/, '');
const publicDir = join(process.cwd(), 'public');

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
    return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
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

console.log(`[seo] Generated robots.txt and sitemap.xml for ${siteUrl}`);
