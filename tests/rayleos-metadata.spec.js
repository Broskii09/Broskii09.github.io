const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const repoRoot = path.resolve(__dirname, '..');
const productionOrigin = 'https://rayleos.com';
const stagingOrigin = 'https://broskii09.github.io';
const pages = [
  { file: 'RayLeos/index.html', url: 'https://rayleos.com/' },
  { file: 'RayLeos/shows/index.html', url: 'https://rayleos.com/shows/' },
  { file: 'RayLeos/food-bar/index.html', url: 'https://rayleos.com/food-bar/' },
  { file: 'RayLeos/booking/index.html', url: 'https://rayleos.com/booking/' },
  { file: 'RayLeos/visit/index.html', url: 'https://rayleos.com/visit/' },
  { file: 'RayLeos/about/index.html', url: 'https://rayleos.com/about/' }
];

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function attr(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<[^>]+${escaped}[^>]+content="([^"]+)"`, 'i'));
  return match?.[1] || '';
}

function canonical(html) {
  return html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || '';
}

function localAssetPathFromProductionUrl(url) {
  const parsed = new URL(url);
  return path.join(repoRoot, 'RayLeos', parsed.pathname.replace(/^\/+/, ''));
}

test('public pages use production metadata and local OG image assets', () => {
  for (const page of pages) {
    const html = read(page.file);
    const canonicalUrl = canonical(html);
    const ogUrl = attr(html, 'property="og:url"');
    const ogImage = attr(html, 'property="og:image"');

    expect(canonicalUrl, `${page.file} canonical`).toBe(page.url);
    expect(ogUrl, `${page.file} og:url`).toBe(page.url);
    expect(canonicalUrl).toContain(productionOrigin);
    expect(ogUrl).toContain(productionOrigin);
    expect(canonicalUrl).not.toContain(stagingOrigin);
    expect(ogUrl).not.toContain(stagingOrigin);

    for (const selector of [
      'property="og:title"',
      'property="og:description"',
      'property="og:type"',
      'property="og:image"',
      'property="og:image:alt"',
      'property="og:site_name"',
      'property="og:locale"',
      'name="twitter:card"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',
      'name="twitter:image:alt"'
    ]) {
      expect(attr(html, selector), `${page.file} ${selector}`).not.toBe('');
    }

    expect(attr(html, 'property="og:type"')).toBe('website');
    expect(attr(html, 'property="og:image:width"')).toBe('1200');
    expect(attr(html, 'property="og:image:height"')).toBe('630');
    expect(attr(html, 'name="twitter:card"')).toBe('summary_large_image');
    expect(ogImage).toMatch(/^https:\/\/rayleos\.com\/assets\/img\/og\/.+\.jpg$/);
    expect(fs.existsSync(localAssetPathFromProductionUrl(ogImage)), `${page.file} OG image asset exists`).toBe(true);
    expect(html).not.toMatch(/property="og:[^"]+" content="https:\/\/broskii09\.github\.io/i);
  }
});

test('structured data, sitemap, and robots use the production domain', () => {
  for (const page of pages) {
    const html = read(page.file);
    const jsonText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
    expect(jsonText, `${page.file} JSON-LD`).toBeTruthy();
    const structured = JSON.parse(jsonText);
    expect(structured.url).toBe('https://rayleos.com/');
    expect(structured['@id']).toBe('https://rayleos.com/#venue');
    expect(JSON.stringify(structured)).not.toContain(stagingOrigin);
  }

  const sitemap = read('RayLeos/sitemap.xml');
  for (const page of pages) {
    expect(sitemap).toContain(`<loc>${page.url}</loc>`);
  }
  expect(sitemap).not.toContain('/RayLeos/');
  expect(sitemap).not.toContain(stagingOrigin);

  const robots = read('RayLeos/robots.txt');
  expect(robots).toContain('Sitemap: https://rayleos.com/sitemap.xml');
});
