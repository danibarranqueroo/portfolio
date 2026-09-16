import { defaultLang, type Lang, ui } from './ui';

/** Read the locale out of a URL. Falls back to the default locale. */
export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split('/');
  return maybeLang in ui ? (maybeLang as Lang) : defaultLang;
}

/** Translator bound to one locale, falling back to the default locale. */
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

/**
 * Add the trailing slash Astro builds pages at.
 *
 * Canonical tags and the sitemap use `/about/`. Anything linking to `/about`
 * is answered with a 307 to the slashed form, so every such link cost a round
 * trip before the page even started loading.
 */
export const withSlash = (path: string): string =>
  path === '/' || path.endsWith('/') ? path : `${path}/`;

/**
 * Prefix a path with the locale, leaving the default locale unprefixed.
 *
 * Slashed, so internal links land on the canonical URL directly rather than
 * being redirected to it.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return withSlash(lang === defaultLang ? clean : `/${lang}${clean}`);
}
