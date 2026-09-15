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

1. **Avatar with a perspective tilt** (landing hero). See below.
2. **Timeline draw-in** (experience). IntersectionObserver adds `.is-visible`.
3. **"This page, audited"** (`/security`). See below.
4. **Misconfiguration spotter** (`/security`). Three real findings: a public
   bucket policy, an `iam:PassRole` escalation path, SSH open to the world.

All motion is guarded by `prefers-reduced-motion`.

## Why the avatar is an image, not a 3D model

Asked for "a 3D model based on that image", the answer was no, for two
reasons worth writing down so it is not revisited by accident:

- **The asset cannot be made here.** Deriving a 3D head from a single image
  needs photogrammetry or ML tooling this environment does not have. The
  alternative is a *generic* 3D head, which does not resemble Dani — and a
  portrait that is not recognisably you fails at the one job it has.
- **The weight.** A minimal three.js build with a loader is ~150 KB gzipped.
  The site ships **2,487 bytes** of external JS. A ~60× increase for one
  decorative element works directly against the Lighthouse-95 target.

Dani's avatar is already a 3D-style render, so the real image plus a CSS
perspective tilt gets the dimensional feel for 59 KB and a handful of
transforms. `--rx` / `--ry` are written by script on `pointermove`, throttled
to one write per animation frame, capped at 9° because past that it stops
reading as a tilt and starts reading as a wobble.

It replaced a hand-drawn SVG line portrait. That went through three rounds —
smooth outlines read as a helmet, spiky ones as flames, and only chained
elliptical arcs read as curls — and was still clearly a drawing of nobody in
particular. The real image was better on every axis including size.

It is a **cutout, not a framed photo** — the source PNG has its background
removed, so there is no circle, border or crop and the silhouette is the shape.
An earlier circular crop read, in Dani's words, as "a circle with the photo
inside".

`sharp` is installed as a devDependency purely so `astro:assets` can re-encode
it: the 300 KB source PNG becomes a **24 KB WebP** (15 KB at the small
breakpoint) with alpha intact, emitted with a proper srcset. That is a 92%
saving on the one image every page loads, which is worth a build-time
dependency — and `sharp` was already on the `allowBuilds` allowlist.

Note `<Image>` takes `format` (singular); `formats` is a `<Picture>` prop.
Astro will not upscale, so the widths cap at the source's 375px.

Dark mode uses only a faint purple lift. The worry that dark hair would merge
into a black background turned out to be unfounded — the render carries enough
rim light — and a stronger glow left a visible haze under the shoulders.

## How the eyes follow the pointer

The first version tilted the whole image in 3D. Dani's note: "now it's like
all the image is following the mouse, is it possible to make only the eyes?"

The image is a raster, so the painted pupils cannot be moved, and overlaying
synthetic eyes looks pasted-on — these are heavily stylised, with a lash line,
lid shadow and a gloss highlight that would all have to be faked exactly.

What works instead: each eye is a small circular window holding a **second copy
of the same image**, aligned so the iris sits inside the window. Shifting that
copy a couple of pixels moves the iris while the face around it stays put.
Because the pixels come from the original, colour and shading match perfectly,
and real sclera slides in on the trailing side — which is what an eye movement
actually looks like.

Geometry measured off the 375x666 source by rendering it under a pixel grid:
irises at (134, 290) and (252, 290), radius ~17. Every position is a percentage
so it holds at any rendered size.

**Travel is asymmetric, and has to be.** In the source the irises already sit
left of centre in their openings — there is visible sclera to their right at
rest — so there is less room to look left than right. At more than about 2px
leftward (on a 240px avatar) the white balloons and the circular window starts
clipping the iris, which reads as broken. Found by sweeping the value and
rendering each step. Left travel is therefore 0.0075 of the rendered width
against 0.0135 rightward; vertical stays tight at 0.0075 either way, because
the lid crops the iris sooner than the corners do.

`getImage()` is used rather than three `<Image>` tags so all three copies point
at one asset — the browser fetches the 24 KB WebP once.

Verified by rendering the real markup and stylesheet at five gaze directions
before shipping.

## Prowler scans this repository, for real

`/security` renders findings from an actual Prowler scan of this repository's
GitHub configuration — not a mock-up.

**Which provider, and why.** Prowler supports 23 providers. Three were
candidates:

- **`github` — 27 checks, used.** Branch protection, signed commits, workflow
  token permissions, secret scanning, Dependabot, CODEOWNERS. Directly
  applicable today.
- **`cloudflare` — 29 checks, deferred.** HSTS, minimum TLS, DNSSEC, WAF, CAA,
  SPF/DKIM/DMARC. Nearly all are zone-level and need a registered domain, so
  this waits for Phase 7. When the domain lands, the same pipeline gains a
  second provider and the page gets a second section.
- **`iac` — not applicable.** Scans Terraform, CloudFormation and Kubernetes
  manifests. This project has none; `wrangler.jsonc` is not IaC in that sense.

**The pipeline.** `.github/workflows/security-scan.yml` runs weekly, installs
Prowler pinned to 5.42.0, scans, and pipes the JSON-OCSF through
`scripts/normalize-prowler.mjs`, which reduces 116 KB of OCSF envelope to a
20 KB file holding only what renders. That file, `src/data/security-scan.json`,
**is committed** — so the page has real data in local development, and its
history is a record of how the posture changed over time.

Three details that are easy to get wrong:

- **The built-in `GITHUB_TOKEN` is not enough.** Reading branch protection and
  security settings needs Administration:Read, which it does not have. The
  workflow needs a fine-grained PAT in `PROWLER_GITHUB_TOKEN`, and skips with a
  warning rather than failing when the secret is absent.
- **The result is committed through the REST API, not `git push`.** `main`
  requires signed commits; commits created via the API are signed by GitHub,
  while a push from Actions is unsigned and would be rejected by our own
  ruleset.
- **Prowler exits 3 when it finds anything**, so the scan step tolerates a
  non-zero exit. Treating that as failure would break the workflow on every run
  that found a single issue.

**Failures are published, with a stated reason.** Each failing check carries a
disposition in `scripts/normalize-prowler.mjs` — `blocked`, `accepted` or
`todo` — so the page says why something is still failing instead of hiding it.
Publishing a green score that was achieved by omission would make the page
worthless. Every disposition is a reviewed commit, not render-time invention.

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

## Responsive layout: two grid bugs, both about specificity and placement

The page was unreadable below 900px. Two separate causes, both worth
remembering because neither is visible in the source.

**1. A media query cannot out-specify a class.** The collapse to one column
reset `main > *` (specificity 0,0,1), but `main > .wide { grid-column: wide }`
sits outside the query at (0,1,1) and wins, because a media query adds no
specificity. The `.wide` sections kept asking for `wide-start`/`wide-end`
lines that the single-column grid no longer defined, so grid invented implicit
columns for them and squeezed the text track to one word per line, with
sections overlapping.

The fix is not a more specific override. It is to keep both line names on the
one column, so `grid-column: text` and `grid-column: wide` both resolve and no
override is needed at all:

```css
main { grid-template-columns: [wide-start text-start] minmax(0, 1fr) [text-end wide-end]; }
```

**2. Three children, two columns.** `.role` declared `14px 1fr` but holds a
spine, a head and an impacts block. Below the breakpoint the third child
wrapped onto a second row into the 14px spine column and its text was crushed.
Explicit placement fixes it: the spine spans `grid-row: 1 / -1`, and head and
impacts are both placed in column 2.

**How these were found.** By rendering, not by reading. The built stylesheet is
inlined into a copy of each page and loaded in `iframe`s of fixed width, since
an iframe reports its own width to media queries. Two things bite when doing
this: the page's CSP meta blocks an injected `<style>` (its hash is not in the
policy, which is the CSP working correctly), and Tailwind's `@layer` wrappers
have to be unwrapped for the preview renderer to apply anything.

## The CV is written separately from the site

The CV used to render from the site's own content, on the argument that they
could then never drift. Dani asked for it to be condensed, and doing that
proved the argument wrong: a CV bullet and a paragraph of prose are different
things. The site says "Commits merged into Prowler, the sixth-highest of 398
contributors on a project with 14.8k stars"; the CV says "528 commits merged,
sixth of 398 contributors on a 14.8k-star project."

So `content.cv` is its own block, written short. Two sets of copy to keep
true, and neither is a compromise. If a number changes, it has to change in
both places.

Laid out after the NIT Warangal Overleaf template Dani chose: single column,
serif, small-caps section heads over a rule, title left with dates right,
italic subtitle, tight bullets. It is CSS, not LaTeX, so it reproduces that
structure rather than being the template. Sections follow it too, which is
why there is no Summary: the template has none, and the role line plus the
first bullet already say it.

**Fitting one page took measuring, not guessing.** It started at roughly a
page and a half. The cuts, in order of how much they bought: dropping the
summary, getting every bullet onto one line, shortening the cloud list,
merging three achievements into two, and finally taking the print contact
line down to 7.8pt so it stops wrapping a stray "Granada, Spain" and costing
a whole line.

Verified by clipping the rendered print layout to exactly 794x1123 px, one
A4 page at 96dpi, and checking the last section survives. That binary test is
reliable; measuring the PNG is not, because the preview renderer always emits
square images. The real PDF comes from the browser's own print engine, so
pagination can still differ by a line.

## A deleted CSS rule is invisible to every other check

Condensing the CV replaced a span of `global.css` delimited by two section
comments. The span was much larger than intended: it took the avatar, the hero
name and statement, the experience timeline animation and the entire security
page with it. 66 selectors, 404 lines.

Everything still passed. The build succeeded, `astro check` was clean, Biome
was clean, CI was green. The only symptom was the landing page showing three
copies of the avatar, because the eye-tracking windows lost the
`overflow: hidden` that clips them, and Dani noticed it on screen.

So `scripts/check-orphan-classes.mjs` now runs in CI: every class in the built
HTML must have a matching rule in the built CSS. It found one genuine orphan
immediately (`.spotter`, which styled nothing and hooked nothing) and it
catches the exact failure above.

Two things about writing it that are worth keeping:

- **Substring matching is wrong here.** `.avatar` occurs inside `.avatar-img`,
  so a deleted `.avatar` rule still looked present. The class name must not be
  followed by a character that could continue it.
- **A guard is worth nothing until it has failed on purpose.** The first
  version passed its own negative test, which is how the substring flaw
  surfaced. Every rule it now protects was checked by deleting that rule and
  watching the check fail.

## The CV is a generated PDF, not a print dialog

`window.print()` does produce a genuine vector PDF, not a screenshot, but it
made the visitor walk through a dialog and the result depended on their own
margin and background settings. `pnpm build` now renders both locales with
Playwright into `dist/cv/daniel-barranquero-cv.pdf`, so the button is a plain
download link to a real file. One page, vector, selectable text, no images.

CI installs Chromium (`playwright install --with-deps chromium`) before
building, because the build no longer completes without it.

## Fonts are self-hosted, and the PDF is why

Self-hosting had been on the list for a while as a privacy and control point.
What forced it was determinism: faces fetched from Google load lazily, so
`document.fonts.ready` can resolve before they start, and the rendered PDF came
out in Times and Arial on roughly half the runs. Local files removed the
variance; three consecutive renders now produce identical fonts.

`scripts/fetch-fonts.mjs` downloads them and writes `src/styles/fonts.css`.
Two things keep the payload sane: Newsreader is requested as a weight RANGE so
Google serves one variable file rather than three statics (129 KB once instead
of per weight), and only the `latin` subset is kept. Google's latin subset
spans U+0000-00FF, which covers every accent the Spanish copy uses; `latin-ext`
is for Central and Eastern European and would have roughly doubled the payload
for characters this site never renders. 296 KB across seven files.

## The CSP was blocking the site's own stylesheet

Found while debugging the PDF fonts, and it would have shipped.

`security.csp.styleDirective.resources` **replaces** Astro's default sources
rather than extending them. Listing only `https://fonts.googleapis.com` there
silently dropped `'self'`, so the built pages carried a `style-src` with no
`'self'` and the browser refused to load `/_astro/*.css`.

It never appeared in the browser because **the dev server emits no CSP meta at
all**. Every page Dani had looked at was unstyled-proof only by accident of
being served by Vite. The first deploy would have been an unstyled site.

Self-hosting the fonts removed the need for the override entirely, so the
directive is gone and Astro's default stands. The general lesson: a config key
named `resources` was additive in my head and replacing in fact, and only
rendering the built output caught it.

## Open

- **Domain** not registered. `site` in `astro.config.mjs` is a placeholder and
  must change before launch, or canonical tags and the sitemap will be wrong.
- **Palette** in `src/styles/global.css` is a structural placeholder. The
  warm/cool fork is settled on the design canvas, then the values are replaced.
- **Repo visibility**: private for now. OpenSSF Scorecard only publishes scores
  for public repos, so the security showcase is incomplete until it flips.
