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

## We are not at zero JS, and that is on purpose

`prefetch: { prefetchAll: true }` ships **2.4 KB** of JavaScript
(`dist/_astro/page.*.js`) to make hover-navigation instant. That is the entire
client-side JS budget for the site right now.

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

## Open

- **Domain** not registered. `site` in `astro.config.mjs` is a placeholder and
  must change before launch, or canonical tags and the sitemap will be wrong.
- **Palette** in `src/styles/global.css` is a structural placeholder. The
  warm/cool fork is settled on the design canvas, then the values are replaced.
- **Repo visibility**: private for now. OpenSSF Scorecard only publishes scores
  for public repos, so the security showcase is incomplete until it flips.
