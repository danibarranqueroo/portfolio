#!/usr/bin/env node
/**
 * Render the built CV pages to real PDF files.
 *
 * Playwright's page.pdf() uses the browser's own print pipeline, so the output
 * is a vector PDF with selectable text that honours @page and the print
 * stylesheet. It is not an image of the page.
 *
 * The alternative was leaving the button on window.print(), which also makes a
 * genuine PDF but only after the visitor walks through a dialog and depends on
 * their own margin and background settings. A file at a URL is something you
 * can link to and attach.
 *
 * Runs after `astro build` and writes into dist/, so the PDFs deploy as static
 * assets alongside everything else.
 *
 *   node scripts/render-cv-pdf.mjs
 */
import { copyFileSync, createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const DIST = resolve(process.cwd(), 'dist');
const PUBLIC = resolve(process.cwd(), 'public');

const PAGES = [
  { url: '/cv/', out: 'cv/daniel-barranquero-cv.pdf' },
  { url: '/es/cv/', out: 'cv/daniel-barranquero-cv-es.pdf' },
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

/** Serve dist/ over http. The built pages use absolute asset paths, so file:// will not do. */
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = join(DIST, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!file.startsWith(DIST) || !existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const server = await serve();
const { port } = server.address();
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  for (const { url, out } of PAGES) {
    const res = await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'networkidle' });
    if (!res?.ok()) throw new Error(`${url} returned ${res?.status()}`);

    // Webfonts are decorative here but the CV is typographic; without this the
    // PDF can be rendered with the fallback stack.
    await page.evaluate(() => document.fonts.ready);

    mkdirSync(join(DIST, 'cv'), { recursive: true });
    await page.pdf({
      path: join(DIST, out),
      format: 'A4',
      printBackground: true,
      // Margins live in the @page rule so the screen and the PDF agree.
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    // Also drop a copy in public/. The dev server has no idea dist/ exists,
    // so without this the download link 404s on localhost and the browser
    // saves the 404 page as an .html file. astro build copies public/ into
    // dist/ on the next run, and this step overwrites it with a fresh render,
    // so production always ships the current one.
    mkdirSync(join(PUBLIC, 'cv'), { recursive: true });
    copyFileSync(join(DIST, out), join(PUBLIC, out));

    const kb = Math.round(statSync(join(DIST, out)).size / 1024);
    console.log(`  ${out}  ${kb} KB  (dist + public)`);
  }
} finally {
  await browser.close();
  server.close();
}
