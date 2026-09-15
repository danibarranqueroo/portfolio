// @ts-check
import { createHash } from 'node:crypto';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { THEME_INIT } from './src/lib/theme-init.mjs';

// The theme bootstrap is is:inline, so Astro does not hash it for us. Derived
// here from the same constant the layout renders, so the two cannot drift.
// Astro types a CSP hash as the template literal `sha256-${string}`, not a
// plain string, so the annotation is required — astro check rejects it otherwise.
/** @type {`sha256-${string}`} */
const THEME_INIT_HASH = `sha256-${createHash('sha256').update(THEME_INIT).digest('base64')}`;

// Absolute URL. Canonical tags, hreflang alternates, the sitemap and
// robots.txt are all derived from this, so it must match the live host
// exactly, including whether www is the canonical form.
const SITE = 'https://danibarranquero.com';

export default defineConfig({
  site: SITE,

  // English is unprefixed at "/", Spanish lives under "/es/".
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
      // Recommendations is still placeholder. Leaving it in the sitemap would
      // invite Google to index a page that reads "[QUOTE ONE]". It is also
      // absent from the nav, and carries a noindex tag, so nothing points at
      // it until the real quotes land. Remove this filter then.
      filter: (page) => !page.includes('/recommendations'),
    }),
  ],

  security: {
    // Emits a <meta> CSP with build-time SHA-256 hashes for every inline
    // script and style, so we never need 'unsafe-inline'.
    // NOTE: a meta CSP cannot express frame-ancestors / report-uri / sandbox.
    // Those are set as real headers in public/_headers — both policies apply
    // and the browser enforces their intersection.
    csp: {
      scriptDirective: {
        // Hash of the inline theme bootstrap. Without it the CSP blocks the
        // script in production and the stored theme flashes on every load —
        // a bug that only appears in a real build, never in dev.
        hashes: [THEME_INIT_HASH],
      },
    },
  },

  vite: { plugins: [tailwindcss()] },

  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
