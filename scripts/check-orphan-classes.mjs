#!/usr/bin/env node
/**
 * Fail if any class used in the built HTML has no rule in the built CSS.
 *
 * This exists because a careless edit to global.css once deleted a 404-line
 * span of it — the avatar, the hero, the timeline and the whole security page
 * — and everything still built, typechecked and linted clean. The only symptom
 * was a page that looked wrong. A missing rule is invisible to every other
 * check we run, so it gets its own.
 *
 * Run after `astro build`. Reads dist/ only.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, ext, out);
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

const html = walk(DIST, '.html');
const cssFiles = walk(DIST, '.css');

if (!html.length || !cssFiles.length) {
  console.error('no built HTML or CSS found — run `pnpm build` first');
  process.exit(2);
}

const css = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

const used = new Map();
for (const file of html) {
  for (const [, attr] of readFileSync(file, 'utf8').matchAll(/class="([^"]+)"/g)) {
    for (const cls of attr.split(/\s+/)) {
      if (cls && !cls.startsWith('astro-')) {
        if (!used.has(cls)) used.set(cls, file.replace(`${DIST}/`, ''));
      }
    }
  }
}

/**
 * A plain substring test is wrong: `.avatar` appears inside `.avatar-img`, so a
 * deleted `.avatar` rule would still look present. The next character after the
 * class name must not be one that could continue it.
 */
const hasRule = (cls) => {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\.${escaped}(?![\\w-])`).test(css);
};

const orphans = [...used].filter(([cls]) => !hasRule(cls));

if (orphans.length) {
  console.error(`::error::${orphans.length} class(es) used in markup have no CSS rule:`);
  for (const [cls, file] of orphans) console.error(`  .${cls}  (first seen in ${file})`);
  process.exit(1);
}

console.log(`All ${used.size} classes used in markup have a matching CSS rule.`);
