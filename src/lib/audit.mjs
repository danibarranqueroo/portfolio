import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Facts about this site, read from the real artifacts at build time.
 *
 * Nothing here is written by hand. Every number comes from the lockfile, the
 * manifest, the workspace policy, the workflow files or git. If a claim on the
 * security page is wrong, the fix is in the repo, not in the copy.
 */

// Resolve from the working directory, not import.meta.url. Vite rewrites this
// module during the build, so import.meta.url no longer points at src/lib/ and
// every read silently falls back — which showed up as an audit page full of
// zeroes. Astro builds from the project root, so cwd is the stable anchor.
const read = (rel) => readFileSync(resolve(process.cwd(), rel), 'utf8');

function safe(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Total packages the lockfile resolves, including everything transitive. */
function lockfilePackages() {
  const lock = read('pnpm-lock.yaml');
  const section = lock.split(/^packages:/m)[1];
  if (!section) return 0;
  const body = section.split(/^\w/m)[0];
  return (body.match(/^ {2}'?[^\s:][^:]*'?:$/gm) ?? []).length;
}

/** Direct dependencies declared with a floating range. Should always be zero. */
function floatingRanges() {
  const pkg = JSON.parse(read('package.json'));
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return Object.entries(all)
    .filter(([, v]) => /^[\^~]/.test(v))
    .map(([k]) => k);
}

/** Release quarantine, in days, from the pnpm supply-chain policy. */
function quarantineDays() {
  const ws = read('pnpm-workspace.yaml');
  const m = ws.match(/^minimumReleaseAge:\s*(\d+)/m);
  return m ? Math.round(Number(m[1]) / 1440) : 0;
}

/** Packages explicitly permitted to run install scripts. */
function allowedBuilds() {
  const ws = read('pnpm-workspace.yaml');
  const block = ws.split(/^allowBuilds:/m)[1];
  if (!block) return [];
  return [...block.matchAll(/^\s{2}([a-z0-9@/-]+):\s*true/gim)].map((m) => m[1]);
}

/** Every `uses:` in the workflows, and how many are pinned to a commit SHA. */
function actionPinning() {
  const files = ['.github/workflows/ci.yml'];
  let total = 0;
  let pinned = 0;
  for (const f of files) {
    // Anchor to a YAML key at line start. Without this, the literal "uses:"
    // inside the pin-checking shell script gets counted as an action and the
    // page reports a false "not all pinned".
    const uses = [...read(f).matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)];
    for (const [, ref] of uses) {
      total += 1;
      if (/@[0-9a-f]{40}$/.test(ref)) pinned += 1;
    }
  }
  return { total, pinned };
}

const floating = safe(floatingRanges, ['?']);
const actions = safe(actionPinning, { total: 0, pinned: 0 });

export const audit = {
  packages: safe(lockfilePackages, 0),
  directDeps: safe(() => {
    const pkg = JSON.parse(read('package.json'));
    return (
      Object.keys(pkg.dependencies ?? {}).length + Object.keys(pkg.devDependencies ?? {}).length
    );
  }, 0),
  floatingCount: floating.length,
  quarantineDays: safe(quarantineDays, 0),
  allowedBuilds: safe(allowedBuilds, []),
  actionsTotal: actions.total,
  actionsPinned: actions.pinned,

  commit: safe(
    () => execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(),
    'unknown',
  ),
  // %G? returns G for a good signature, U for good-but-untrusted, N for none.
  signature: safe(
    () => execFileSync('git', ['log', '-1', '--format=%G?'], { encoding: 'utf8' }).trim(),
    '?',
  ),
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' '),

  pnpm: safe(() => JSON.parse(read('package.json')).packageManager?.split('+')[0] ?? '?', '?'),
  node: safe(() => read('.nvmrc').trim(), '?'),
};
