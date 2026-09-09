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

/** Prefix a path with the locale, leaving the default locale unprefixed. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}
