#!/usr/bin/env node
import fs from 'node:fs';
/**
 * Rasterise public/favicon.svg into a multi-size public/favicon.ico.
 *
 * Modern browsers use the SVG, but .ico is still fetched at /favicon.ico by
 * older clients and some aggregators, so the two must not drift. Regenerate
 * with `node scripts/render-favicon-ico.mjs` after editing the SVG.
 *
 * Two things this file exists to remember:
 *
 *   1. The SVG must declare width and height alongside viewBox. Without an
 *      intrinsic size it cannot be drawn through an Image, and every frame
 *      comes out transparent.
 *   2. An XML comment may not contain two consecutive hyphens. Writing a CSS
 *      custom property name in a comment inside the SVG silently invalidates
 *      the whole document, and the favicon then fails to parse with no build,
 *      lint or typecheck error anywhere.
 *
 * The .ico carries PNG payloads rather than BMP, which every browser that
 * still reads .ico supports and which keeps the file small.
 */
import pw from 'playwright';

// playwright is CommonJS, so it has no named exports to destructure at import.
const { chromium } = pw;

const SIZES = [16, 32, 48];
const src = fs.readFileSync('public/favicon.svg', 'utf8');

if (!src.includes('width=')) {
  throw new Error('favicon.svg declares no intrinsic width, so it cannot be rasterised');
}

const uri = `data:image/svg+xml;base64,${Buffer.from(src).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
const pngs = [];

for (const size of SIZES) {
  const b64 = await page.evaluate(
    async (args) => {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('the SVG failed to decode'));
        img.src = args.u;
      });
      const c = document.createElement('canvas');
      c.width = args.size;
      c.height = args.size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, args.size, args.size);
      return c.toDataURL('image/png').split(',')[1];
    },
    { u: uri, size },
  );

  const buf = Buffer.from(b64, 'base64');
  pngs.push({ size, buf });
  console.log(`  PNG ${size}x${size}: ${buf.length} bytes`);
}
await browser.close();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);

let offset = 6 + 16 * pngs.length;
const entries = [];
for (const item of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(item.size, 0);
  e.writeUInt8(item.size, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(item.buf.length, 8);
  e.writeUInt32LE(offset, 12);
  entries.push(e);
  offset += item.buf.length;
}

fs.writeFileSync(
  'public/favicon.ico',
  Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]),
);
console.log(`  favicon.ico: ${fs.statSync('public/favicon.ico').size} bytes`);
