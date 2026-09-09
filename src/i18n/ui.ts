export const languages = { en: 'English', es: 'Español' } as const;
export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;

/** Every user-facing string, keyed by locale. Missing keys fall back to `en`. */
export const ui = {
  en: {
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.recommendations': 'Recommendations',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',
    'theme.toggle': 'Switch between light and dark theme',
  },
  es: {
    'nav.about': 'Sobre mí',
    'nav.experience': 'Experiencia',
    'nav.projects': 'Proyectos',
    'nav.recommendations': 'Recomendaciones',
    'nav.contact': 'Contacto',
    'nav.cv': 'CV',
    'theme.toggle': 'Cambiar entre tema claro y oscuro',
  },
} as const satisfies Record<Lang, Record<string, string>>;
