const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const repoRoot = path.resolve(__dirname, '..');
const productionOrigin = 'https://rayleos.com';
const stagingOrigin = 'https://broskii09.github.io';
const stagingBase = `${stagingOrigin}/RayLeos`;
const pages = [
  {
    file: 'RayLeos/index.html',
    url: `${stagingBase}/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-home.jpg`
  },
  {
    file: 'RayLeos/shows/index.html',
    url: `${stagingBase}/shows/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-shows.jpg`
  },
  {
    file: 'RayLeos/food-bar/index.html',
    url: `${stagingBase}/food-bar/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-food-bar.jpg`
  },
  {
    file: 'RayLeos/booking/index.html',
    url: `${stagingBase}/booking/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-booking.jpg`
  },
  {
    file: 'RayLeos/visit/index.html',
    url: `${stagingBase}/visit/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-visit.jpg`
  },
  {
    file: 'RayLeos/about/index.html',
    url: `${stagingBase}/about/`,
    image: `${stagingBase}/assets/img/og/rayleos-og-about.jpg`
  }
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

function localAssetPathFromMetadataUrl(url) {
  const parsed = new URL(url);
  const localPath = parsed.pathname.replace(/^\/RayLeos\//, '');
  return path.join(repoRoot, 'RayLeos', localPath.replace(/^\/+/, ''));
}

function jpegDimensions(filePath) {
  const data = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) break;
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: String(data.readUInt16BE(offset + 5)),
        width: String(data.readUInt16BE(offset + 7))
      };
    }
    offset += 2 + length;
  }
  throw new Error(`Could not read JPEG dimensions for ${filePath}`);
}

// Temporary for GitHub Pages social preview testing. Before production launch,
// switch canonical, OG, and Twitter image metadata back to https://rayleos.com/.
test('public pages use staging metadata and local OG image assets', () => {
  for (const page of pages) {
    const html = read(page.file);
    const canonicalUrl = canonical(html);
    const ogUrl = attr(html, 'property="og:url"');
    const ogImage = attr(html, 'property="og:image"');
    const twitterImage = attr(html, 'name="twitter:image"');
    const imagePath = localAssetPathFromMetadataUrl(ogImage);
    const dimensions = jpegDimensions(imagePath);

    expect(canonicalUrl, `${page.file} canonical`).toBe(page.url);
    expect(ogUrl, `${page.file} og:url`).toBe(page.url);
    expect(canonicalUrl).toContain(stagingBase);
    expect(ogUrl).toContain(stagingBase);
    expect(canonicalUrl).not.toContain(productionOrigin);
    expect(ogUrl).not.toContain(productionOrigin);

    for (const selector of [
      'property="og:title"',
      'property="og:description"',
      'property="og:type"',
      'property="og:image"',
      'property="og:image:type"',
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
    expect(attr(html, 'property="og:image:type"')).toBe('image/jpeg');
    expect(attr(html, 'property="og:image:width"')).toBe(dimensions.width);
    expect(attr(html, 'property="og:image:height"')).toBe(dimensions.height);
    expect(attr(html, 'name="twitter:card"')).toBe('summary_large_image');
    expect(ogImage, `${page.file} OG image`).toBe(page.image);
    expect(twitterImage, `${page.file} Twitter image`).toBe(page.image);
    expect(attr(html, 'property="og:image:alt"'), `${page.file} OG image alt`).not.toBe('');
    expect(attr(html, 'name="twitter:image:alt"'), `${page.file} Twitter image alt`).not.toBe('');
    expect(fs.existsSync(imagePath), `${page.file} OG image asset exists`).toBe(true);
    expect(fs.existsSync(localAssetPathFromMetadataUrl(twitterImage)), `${page.file} Twitter image asset exists`).toBe(true);
    expect(html).not.toMatch(/property="og:(url|image)" content="https:\/\/rayleos\.com/i);
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
    const productionUrl = page.url.replace(stagingBase, productionOrigin);
    expect(sitemap).toContain(`<loc>${productionUrl}</loc>`);
  }
  expect(sitemap).not.toContain('/RayLeos/');
  expect(sitemap).not.toContain(stagingOrigin);

  const robots = read('RayLeos/robots.txt');
  expect(robots).toContain('Sitemap: https://rayleos.com/sitemap.xml');
});
