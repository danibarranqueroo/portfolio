# Decisions

Why things are the way they are. Update this when a choice is made or reversed;
it is the record that stops the same question being re-litigated later.

## Versions

| Choice | Version | Reason |
|---|---|---|
| Node | 24.20.0 | Active LTS ("Krypton"). Also the **last line that bundles Corepack** — it was unbundled in Node 25+, and we rely on Corepack to pin pnpm. |
| pnpm | 11.26.0 | pnpm 12.0 shipped 2026-08-26 and 12.3.x already regressed installs behind common CI flags. The 11 line has every security default we want (`strictDepBuilds`, `minimumReleaseAge`, `trustPolicy`) without being brand new. Revisit around Dec 2026. |
| TypeScript | 6.0.3 | **Not 7.x.** `@astrojs/check@0.9.10` declares `peerDependencies: typescript "^5.0.0 \|\| ^6.0.0"`. TypeScript 7 (the native Go port) would break `astro check`. Upgrade when Astro's checker supports it. |
| Astro | 7.2.10 | Not 7.3.x — see the quarantine note below. |

## The 7-day quarantine has teeth

`minimumReleaseAge: 10080` (7 days) in `pnpm-workspace.yaml` refuses to resolve
any version published in the last week. When this project was set up, that
disqualified the newest release of **7 of 16** packages we wanted, including
Astro itself (7.3.2 was 1 day old) and Vitest 5.0.0.

This is the policy working, not a problem. Renovate will pick these up
automatically once they age past the window. Do not lower this setting to get a
newer version; wait, or justify an exception in a reviewed commit.

## `allowBuilds`, not `onlyBuiltDependencies`

pnpm 11 prefers an `allowBuilds` map, and will append a stub of one to
`pnpm-workspace.yaml` if it meets a package that wants to run an install script.
We keep exactly three entries — `esbuild`, `lefthook`, `sharp` — each with a
comment saying why. **Adding an entry is a security decision** and belongs in a
reviewed commit, not a drive-by fix to make an install stop complaining.

## CSP is split across two places, deliberately

`security.csp: true` in `astro.config.mjs` emits a `<meta>` CSP carrying
build-time SHA-256 hashes for every inline script and style, so we never need
`unsafe-inline`.

But **a `<meta>` CSP cannot express `frame-ancestors`, `report-uri`, or
`sandbox`.** Those are set as real HTTP headers in `public/_headers`. Both
policies apply at once and the browser enforces their intersection. Neither
half is redundant.

## Known conflict: Shiki vs CSP

Astro warns at build time:

> Shiki syntax highlighting uses inline styles that are not compatible with
> Content Security Policy (CSP).

This is latent — we have no code blocks yet — but it lands the moment the blog
ships. Options, to decide in the blog phase:

1. Configure Shiki with a CSS-variables theme so it emits classes rather than
   inline styles (preferred — keeps Shiki and keeps CSP strict).
2. Feed the style hashes to `security.csp.styleDirective.hashes`.
3. Switch to Prism, as the warning suggests.
4. Weaken CSP. Rejected.

## Theme toggle: `is:inline` scripts are NOT hashed by Astro's CSP

The theme button needs a blocking inline script in `<head>` — anything
deferred or bundled runs after first paint, so a visitor with a stored theme
would see the system theme flash first. That means `is:inline`.

**`is:inline` opts a script out of Astro's processing, which also opts it out
of Astro's automatic CSP hashing.** The build succeeds, dev looks fine, and
the script is then silently blocked in production — restoring exactly the
flash it was added to prevent. It only shows up in a real build.

The fix: the script text lives in `src/lib/theme-init.mjs` as a single
constant. `astro.config.mjs` imports it, derives its SHA-256, and passes that
to `security.csp.scriptDirective.hashes`; `BaseLayout.astro` imports the same
constant and renders it with `set:html`. Neither side can drift — edit the
script and the hash follows.

Keep it on one line. Whitespace a build step might normalise would change the
hash and re-break it.

*Related trap:* Biome's `organizeImports` will split an import block around an
interleaved comment or `const` and can drop an import entirely. Keep every
import in `astro.config.mjs` contiguous at the top.

## Forcing a theme only overrides `color-scheme`

Because every colour token is a `light-dark()` pair, pinning a theme does not
redefine a single token:

```css
:root { color-scheme: light dark; }          /* follow the OS */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

Which icon the button shows is decided purely in CSS — a `prefers-color-scheme`
media query for the default, then `[data-theme]` rules after it to win when the
visitor has chosen. So the icon is correct on first paint with no JavaScript.
Rule order matters: the `[data-theme]` rules must come after the media query.

**Known limitation:** the toggle is two-state. Once a visitor picks a theme
there is no in-page way back to "follow my OS" short of clearing site data.
A three-state cycle (system → light → dark) would fix it at the cost of a
control that needs a label to be understandable. Two-state was chosen
deliberately; revisit if anyone asks.

## We are not at zero JS, and that is on purpose

`prefetch: { prefetchAll: true }` ships **2.4 KB** of JavaScript
(`dist/_astro/page.*.js`) to make hover-navigation instant. That is the only
external script on the site.

The theme toggle adds no external JS: both of its scripts are inline and
CSP-hashed, costing roughly 400 bytes of HTML per page.

The trade is deliberate: 2.4 KB for materially better navigation across a
multi-page site. If a strictly-zero-JS baseline ever matters more, delete the
`prefetch` block in `astro.config.mjs` and the file disappears. Do not claim
"zero JS" in copy while this is on.

## Biome, with two overrides

Biome replaces ESLint + Prettier — one Rust binary instead of a large
dependency tree, which is a supply-chain win as much as a speed one.

Two overrides in `biome.json` exist for real reasons, not to silence noise:

- **`.astro` files** — Biome parses only the frontmatter and cannot see that a
  variable is used in the template below, so `noUnusedVariables` and
  `noUnusedImports` fire on essentially every component. `astro check` catches
  the genuine cases, so nothing is lost.
- **`src/styles/global.css`** — the `prefers-reduced-motion` reset must use
  `!important` to override animation and transition declarations wherever they
  are set. That is the documented pattern, so `noImportantStyles` is off for
  that file only.

`css.parser.tailwindDirectives: true` is required for Biome to parse Tailwind
v4 syntax (`@theme`, `@import "tailwindcss"`) at all.

`public/` is excluded — it holds static assets, not source.

## The four interactive pieces

Built together at Dani's request so they could be compared, with the note that
the design direction ("concentrated craft") argues for keeping at most two.
Expect to cut some.

1. **Animated portrait** (landing hero). Draws in, blinks, pupils track the
   cursor. The paths are a PLACEHOLDER abstract head — no photo has been
   supplied, and inventing someone's likeness is worse than an obvious
   stand-in. Swap the paths in `Portrait.astro#portrait-art`; every behaviour
   keeps working.
2. **Timeline draw-in** (experience). IntersectionObserver adds `.is-visible`.
3. **"This page, audited"** (`/security`). See below.
4. **Misconfiguration spotter** (`/security`). Three real findings: a public
   bucket policy, an `iam:PassRole` escalation path, SSH open to the world.

All motion is guarded by `prefers-reduced-motion`.

## The audit page must never state something untrue

Everything on `/security` is derived at build time from real artifacts —
lockfile, manifest, `pnpm-workspace.yaml`, workflow files, git. Nothing is
typed by hand. If a number there is wrong, fix the repo, not the copy.

Two bugs during construction, both of which would have published a false claim:

- **A naive `/uses:/` regex counted the literal `uses:` inside the shell script
  of the pin-checking CI job**, reporting "6/8 actions pinned" when all 6 real
  actions are pinned. Now anchored to a YAML key at line start.
- **`import.meta.url` does not survive Vite's build transform.** `audit.mjs`
  resolved its file reads relative to it, so during a real build every read
  failed, `safe()` swallowed it, and the page rendered zeroes — while running
  the module directly under `node` looked perfect. Now anchored to
  `process.cwd()`, which Astro guarantees is the project root.

The lesson generalises: a page that makes factual claims about itself needs
its data path verified **in a real build**, not just in isolation.

## Astro `<script>` blocks are TypeScript

JSDoc `@type` annotations work in `astro.config.mjs` (a `.mjs` file) but not
inside an `.astro` `<script>` block, which is checked as TypeScript — annotate
parameters directly there. `querySelectorAll` also returns `Element`, which has
no `.style`; pass a generic (`querySelectorAll<SVGCircleElement>`) when you
need one.

## Layout: a wide shell with a narrow measure

The first build used `max-width: 660px` on the whole page. That is a prose
measure applied to everything, so on a 1440px screen the site was a thin
ribbon with ~390px of dead margin each side.

Widening the container alone would be wrong — it produces unreadably long
lines of body text. Instead `main` is a three-track grid:

```css
main {
  grid-template-columns:
    [wide-start] minmax(0, 1fr)
    [text-start] minmax(0, 720px) [text-end]
    minmax(0, 1fr) [wide-end];
}
main > *      { grid-column: text; }
main > .wide  { grid-column: wide; }
```

Prose, ledes and notes stay in the 720px `text` track. Hero, key/value rows,
roles, quotes and code opt into `wide` (1060px at full width). Roles and quotes
also gain a second column above 820px, so the width is used structurally rather
than just stretching.

## Two process lessons from that refactor

**Never `str.replace()` CSS without asserting.** Biome reformats
`global.css` to multi-line on every commit, so single-line patterns written
against an earlier shape silently match nothing. Six edits were lost this way
and only surfaced when the built values were audited. Patch a property inside a
named rule with a scoped regex, and assert on every edit.

**Check cascade order, not just presence.** `.portrait` had both a base rule
(210px) and a `max-width: 520px` override (116px), but the override was emitted
*first*. Equal specificity means document order decides, so the base won and
phones would have rendered a 210px portrait on a 375px screen. Grepping for the
rule said "present"; only comparing character offsets found the bug.

There is now a check for this class of bug — see the cascade-order scan in the
verification notes. Every responsive override must come after the rule it
overrides.

## Open

- **Domain** not registered. `site` in `astro.config.mjs` is a placeholder and
  must change before launch, or canonical tags and the sitemap will be wrong.
- **Palette** in `src/styles/global.css` is a structural placeholder. The
  warm/cool fork is settled on the design canvas, then the values are replaced.
- **Repo visibility**: private for now. OpenSSF Scorecard only publishes scores
  for public repos, so the security showcase is incomplete until it flips.
