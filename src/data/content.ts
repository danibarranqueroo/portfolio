import type { Lang } from '../i18n/ui';

/**
 * Placeholder site content, one entry per locale.
 *
 * Anything in [BRACKETS] is a real fact still to be supplied. Nothing here is
 * invented about Dani's history — that is deliberate, so no fabricated claim
 * can survive into the published site by accident.
 *
 * This module is temporary scaffolding for reviewing the design. When real CV
 * data arrives it moves into a Zod-validated content collection under
 * src/content/cv/, which the CV page and the PDF both render from.
 */

export interface Impact {
  metric: string;
  text: string;
}
export interface Role {
  company: string;
  meta: string;
  impacts: Impact[];
  tags: string[];
}
export interface Quote {
  text: string;
  name: string;
  role: string;
}
export interface Row {
  k: string;
  v: string;
}

interface PageCopy {
  eyebrow: string;
  title: string;
  lede: string;
}

export interface SiteContent {
  landing: PageCopy & { now: Row[]; cta: string; note: string };
  about: PageCopy & { body: string[]; education: Row[]; note: string };
  experience: PageCopy & { roles: Role[]; oss: Row[]; note: string };
  projects: PageCopy & { items: Row[]; note: string };
  recommendations: PageCopy & { quotes: Quote[]; note: string };
  contact: PageCopy & { channels: Row[]; note: string };
  footer: { rights: string; source: string };
}

const PH = {
  role: '[ROLE TITLE]',
  company1: '[COMPANY ONE]',
  company2: '[COMPANY TWO]',
  tech: '[TECH]',
};

export const content: Record<Lang, SiteContent> = {
  en: {
    landing: {
      eyebrow: 'Cloud security engineer',
      title: 'Daniel\nBarranquero',
      lede: '[ONE SENTENCE: what you do, who for, and why it matters. Written last, once the rest of the site exists.]',
      cta: 'Read the CV',
      now: [
        { k: 'Role', v: `${PH.role} at ${PH.company1}` },
        { k: 'Focus', v: '[PRIMARY AREA OF WORK]' },
        { k: 'Open source', v: '[PROJECT] — [YOUR INVOLVEMENT]' },
        { k: 'Based in', v: '[CITY]' },
      ],
      note: 'Placeholder content. Bracketed text marks a real fact still to be supplied — nothing here is invented.',
    },
    about: {
      eyebrow: 'About',
      title: 'Who I am',
      lede: '[ONE LINE THAT IS NOT YOUR JOB TITLE — what actually drives the work.]',
      body: [
        '[PARAGRAPH ONE — how you got into cloud security, in your own voice. Two or three sentences.]',
        '[PARAGRAPH TWO — what you are good at and what you are still learning. Specific beats modest.]',
        '[PARAGRAPH THREE — what you do when you are not working, if you want it here at all.]',
      ],
      education: [
        { k: '[YEARS]', v: '[DEGREE] — [INSTITUTION]' },
        { k: '[YEARS]', v: '[DEGREE] — [INSTITUTION]' },
        { k: '[YEAR]', v: '[CERTIFICATION] — [ISSUER]' },
      ],
      note: 'Education sits here rather than on its own page: two degrees and a certification make a section, not a page. Stated once, plainly.',
    },
    experience: {
      eyebrow: 'Experience',
      title: 'What I’ve\nshipped',
      lede: '[TWO LINES ON HOW YOU WORK — the thread connecting these roles, not a restatement of them.]',
      roles: [
        {
          company: PH.company1,
          meta: `${PH.role} · [START] – present`,
          impacts: [
            { metric: '[N]×', text: '[IMPACT: what changed, and what it was worth.]' },
            { metric: '[N] hrs', text: '[IMPACT: time or toil removed, and for whom.]' },
            { metric: '[N]', text: '[IMPACT: scale — accounts, findings, services covered.]' },
          ],
          tags: [PH.tech, PH.tech, PH.tech, PH.tech],
        },
        {
          company: PH.company2,
          meta: `${PH.role} · [START] – [END]`,
          impacts: [
            { metric: '[N]%', text: '[IMPACT: a number you can defend in an interview.]' },
            { metric: '[N]', text: '[IMPACT: something that outlived your time there.]' },
          ],
          tags: [PH.tech, PH.tech, PH.tech],
        },
      ],
      oss: [
        { k: '[PROJECT]', v: '[WHAT YOU CONTRIBUTED, AND WHY IT MATTERED]' },
        { k: '[PROJECT]', v: '[WHAT YOU CONTRIBUTED, AND WHY IT MATTERED]' },
      ],
      note: 'The layout assumes every impact line leads with a number. If a line has no number, it probably belongs in About instead.',
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Things I\nbuilt',
      lede: '[ONE LINE — what connects these, or why you built them at all.]',
      items: [
        { k: '[PROJECT]', v: '[WHAT IT DOES, AND WHAT IT TAUGHT YOU]' },
        { k: '[PROJECT]', v: '[WHAT IT DOES, AND WHAT IT TAUGHT YOU]' },
        { k: '[PROJECT]', v: '[WHAT IT DOES, AND WHAT IT TAUGHT YOU]' },
      ],
      note: 'This page was missing from the original six. For a cloud-security engineer it usually does more work than Education.',
    },
    recommendations: {
      eyebrow: 'Recommendations',
      title: 'In other\npeople’s words',
      lede: '[ONE LINE OF FRAMING — who these people are to you, and over what period.]',
      quotes: [
        {
          text: '[QUOTE ONE — the strongest thing a senior engineer said about working with you. Two or three sentences; longer reads as padding.]',
          name: '[NAME]',
          role: '[ROLE] · [COMPANY]',
        },
        {
          text: '[QUOTE TWO — ideally about a different quality than the first, so the two do not overlap.]',
          name: '[NAME]',
          role: '[ROLE] · [COMPANY]',
        },
        {
          text: '[QUOTE THREE — optional. Three is plenty; more starts to read defensive.]',
          name: '[NAME]',
          role: '[ROLE] · [COMPANY]',
        },
      ],
      note: 'Every quote needs its author’s permission before it ships. Where the recommendation already exists publicly on LinkedIn, link it.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Get in\ntouch',
      lede: '[ONE LINE — what you do and do not want to be contacted about.]',
      channels: [
        { k: 'Email', v: '[EMAIL]' },
        { k: 'GitHub', v: '[GITHUB URL]' },
        { k: 'LinkedIn', v: '[LINKEDIN URL]' },
        { k: 'PGP', v: '[FINGERPRINT] — key at /pgp.txt' },
        { k: 'Security', v: '/.well-known/security.txt' },
      ],
      note: 'The PGP key and security.txt are the point of this page. They cost almost nothing and they are a real signal in your field.',
    },
    footer: { rights: '© [YEAR] Daniel Barranquero', source: 'Source' },
  },

  es: {
    landing: {
      eyebrow: 'Ingeniero de seguridad cloud',
      title: 'Daniel\nBarranquero',
      lede: '[UNA FRASE: qué haces, para quién y por qué importa. Se escribe la última, cuando el resto del sitio ya existe.]',
      cta: 'Ver el CV',
      now: [
        { k: 'Puesto', v: '[PUESTO] en [EMPRESA UNO]' },
        { k: 'Enfoque', v: '[ÁREA PRINCIPAL DE TRABAJO]' },
        { k: 'Open source', v: '[PROYECTO] — [TU PARTICIPACIÓN]' },
        { k: 'Ubicación', v: '[CIUDAD]' },
      ],
      note: 'Contenido de marcador. El texto entre corchetes marca un dato real pendiente — aquí no hay nada inventado.',
    },
    about: {
      eyebrow: 'Sobre mí',
      title: 'Quién soy',
      lede: '[UNA LÍNEA QUE NO SEA TU PUESTO — qué mueve realmente el trabajo.]',
      body: [
        '[PÁRRAFO UNO — cómo llegaste a la seguridad cloud, con tu voz. Dos o tres frases.]',
        '[PÁRRAFO DOS — en qué eres bueno y qué sigues aprendiendo. Concreto antes que modesto.]',
        '[PÁRRAFO TRES — qué haces cuando no trabajas, si lo quieres aquí.]',
      ],
      education: [
        { k: '[AÑOS]', v: '[TITULACIÓN] — [INSTITUCIÓN]' },
        { k: '[AÑOS]', v: '[TITULACIÓN] — [INSTITUCIÓN]' },
        { k: '[AÑO]', v: '[CERTIFICACIÓN] — [EMISOR]' },
      ],
      note: 'La formación va aquí y no en su propia página: dos titulaciones y una certificación son una sección, no una página. Dicho una vez, sin más.',
    },
    experience: {
      eyebrow: 'Experiencia',
      title: 'Lo que he\nconstruido',
      lede: '[DOS LÍNEAS SOBRE CÓMO TRABAJAS — el hilo que une estos puestos, no un resumen de ellos.]',
      roles: [
        {
          company: '[EMPRESA UNO]',
          meta: '[PUESTO] · [INICIO] – actualidad',
          impacts: [
            { metric: '[N]×', text: '[IMPACTO: qué cambió y cuánto valió.]' },
            { metric: '[N] h', text: '[IMPACTO: trabajo manual eliminado, y para quién.]' },
            { metric: '[N]', text: '[IMPACTO: escala — cuentas, hallazgos, servicios cubiertos.]' },
          ],
          tags: ['[TECNOLOGÍA]', '[TECNOLOGÍA]', '[TECNOLOGÍA]', '[TECNOLOGÍA]'],
        },
        {
          company: '[EMPRESA DOS]',
          meta: '[PUESTO] · [INICIO] – [FIN]',
          impacts: [
            { metric: '[N]%', text: '[IMPACTO: un número que puedas defender en una entrevista.]' },
            { metric: '[N]', text: '[IMPACTO: algo que siguió vivo después de irte.]' },
          ],
          tags: ['[TECNOLOGÍA]', '[TECNOLOGÍA]', '[TECNOLOGÍA]'],
        },
      ],
      oss: [
        { k: '[PROYECTO]', v: '[QUÉ APORTASTE Y POR QUÉ IMPORTÓ]' },
        { k: '[PROYECTO]', v: '[QUÉ APORTASTE Y POR QUÉ IMPORTÓ]' },
      ],
      note: 'El diseño asume que cada línea de impacto empieza por un número. Si una línea no lo tiene, probablemente pertenece a «Sobre mí».',
    },
    projects: {
      eyebrow: 'Proyectos',
      title: 'Cosas que\nhe hecho',
      lede: '[UNA LÍNEA — qué los conecta, o por qué los construiste.]',
      items: [
        { k: '[PROYECTO]', v: '[QUÉ HACE Y QUÉ TE ENSEÑÓ]' },
        { k: '[PROYECTO]', v: '[QUÉ HACE Y QUÉ TE ENSEÑÓ]' },
        { k: '[PROYECTO]', v: '[QUÉ HACE Y QUÉ TE ENSEÑÓ]' },
      ],
      note: 'Esta página no estaba en las seis originales. Para un ingeniero de seguridad cloud suele pesar más que la formación.',
    },
    recommendations: {
      eyebrow: 'Recomendaciones',
      title: 'En palabras\nde otros',
      lede: '[UNA LÍNEA DE CONTEXTO — quiénes son estas personas para ti y en qué periodo.]',
      quotes: [
        {
          text: '[CITA UNO — lo más fuerte que un ingeniero sénior dijo sobre trabajar contigo. Dos o tres frases; más largo suena a relleno.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
        {
          text: '[CITA DOS — a ser posible sobre una cualidad distinta de la primera, para que no se solapen.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
        {
          text: '[CITA TRES — opcional. Con tres basta; más empieza a sonar defensivo.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
      ],
      note: 'Cada cita necesita el permiso de su autor antes de publicarse. Si la recomendación ya es pública en LinkedIn, enlázala.',
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      lede: '[UNA LÍNEA — para qué quieres y para qué no quieres que te escriban.]',
      channels: [
        { k: 'Email', v: '[EMAIL]' },
        { k: 'GitHub', v: '[URL DE GITHUB]' },
        { k: 'LinkedIn', v: '[URL DE LINKEDIN]' },
        { k: 'PGP', v: '[HUELLA] — clave en /pgp.txt' },
        { k: 'Seguridad', v: '/.well-known/security.txt' },
      ],
      note: 'La clave PGP y security.txt son el motivo de esta página. Cuestan casi nada y son una señal real en tu campo.',
    },
    footer: { rights: '© [AÑO] Daniel Barranquero', source: 'Código' },
  },
};
