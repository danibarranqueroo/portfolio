# Portfolio — agent notes

Personal portfolio / CV site. Astro + TypeScript, static output, deployed to
Cloudflare Workers static assets.

**Read `docs/DECISIONS.md` before changing dependencies, CSP, or lint config.**
Most surprising choices here are deliberate and explained there.

## Commands

```sh
pnpm dev         # dev server
pnpm build       # static build to dist/
pnpm preview     # serve dist/
pnpm check       # biome + astro check (what CI runs)
pnpm lint:fix    # biome autofix
```

## Non-negotiables

- **Exact versions only.** No `^` or `~` in `package.json`. `savePrefix: ''`
  enforces this; do not override it.
- **The 7-day quarantine stays.** `minimumReleaseAge: 10080`. If a package will
  not install because it is too new, wait — do not lower the setting.
- **`allowBuilds` is an allowlist, not a convenience.** Adding an entry means a
  package may execute code at install time. Justify it in the commit.
- **Commits are signed.** Enforced by branch protection.
- **Blog stays out of the nav until it has posts.** A nav link to an empty blog
  is worse than no link.

## Layout

```
src/i18n/          locale table + helpers (EN default unprefixed, ES at /es/)
src/layouts/       BaseLayout: head, hreflang, nav
src/styles/        Tailwind v4 @theme tokens (placeholder palette)
src/content/       CV data + blog posts (Zod-validated)
public/_headers    Cloudflare security headers
docs/DECISIONS.md  why things are the way they are
```

## i18n

English is unprefixed at `/`; Spanish lives at `/es/`. Every page needs both.
`BaseLayout` emits reciprocal `hreflang` alternates plus `x-default`
automatically — do not hand-roll them per page.
