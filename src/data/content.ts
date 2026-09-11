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
      lede: 'I build the providers and checks that let anyone audit the cloud they actually run on.',
      cta: 'Read the CV',
      now: [
        { k: 'Role', v: 'Cloud Security Engineer at Prowler' },
        { k: 'Focus', v: 'Multi-cloud security checks, and new providers end to end' },
        { k: 'Open source', v: 'Prowler — 269 merged pull requests' },
        { k: 'Based in', v: 'Granada, Spain' },
      ],
      note: 'Experience, Projects and Recommendations are still placeholder. Bracketed text marks a fact yet to be supplied — nothing here is invented.',
    },
    about: {
      eyebrow: 'About',
      title: 'Who I am',
      lede: 'I came to the cloud almost by accident, and stayed because every new provider is a whole system to take apart.',
      body: [
        'Security interested me long before the cloud did. I took a Google Cloud course mostly out of curiosity, and it pulled me in. The offer from Prowler arrived just as I was finishing my degree, and that was when I found out this work genuinely excites me.',
        'I started by going deep on AWS, then opened out. Today I write new checks for AWS, Azure and GCP, and I have added whole providers — MongoDB Atlas, Microsoft 365, Vercel, Linode, OpenStack — so that anyone running on them can scan and secure them. 269 merged pull requests into Prowler so far.',
        'I studied a dual degree in Computer Engineering and Business Administration. The business half gave me a different way of looking at the work: understanding what a client actually needs, weighing a feature against a SWOT analysis, being able to synthesise an argument and explain it. It means I am not only the person who writes the code.',
        'What I want next is to go deeper into cloud architecture. It is where I have the most room to grow, compared with the programming and the security — and naming that is more useful than pretending otherwise.',
      ],
      education: [
        {
          k: '[YEARS]',
          v: 'Dual degree, Computer Engineering and Business Administration — [UNIVERSITY]',
        },
        { k: '2023', v: 'Google Cloud — Digital Leader learning path, four badges' },
      ],
      note: 'Education sits here rather than on its own page: a dual degree and a course make a section, not a page. Stated once, plainly.',
    },
    experience: {
      eyebrow: 'Experience',
      title: 'What I’ve\nshipped',
      lede: 'I work on the detection side of an open-source cloud security scanner: the checks that find misconfigurations, and the providers that let people run them against whatever cloud they are actually on.',
      roles: [
        {
          company: 'Prowler',
          meta: 'Cloud Security Engineer · Jan 2025 – present · Remote',
          impacts: [
            {
              metric: '528',
              text: 'Commits merged into Prowler — the sixth-highest of 398 contributors on a project with 14.8k stars, and 294,573 lines added.',
            },
            {
              metric: '15',
              text: 'Cloud providers touched across 269 merged pull requests: AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud, Alibaba Cloud, GitHub, Vercel and Linode among them.',
            },
            {
              metric: '2',
              text: 'Providers built end to end — OpenStack and Okta — from the core SDK through the checks, the API, the web UI and the documentation.',
            },
            {
              metric: '144',
              text: 'Pull requests touching security checks and fixers: the detection logic organisations run against their own infrastructure.',
            },
            {
              metric: 'Now',
              text: 'Leading the detection and remediation team, after a year of community issue triage, pull request review and Slack support.',
            },
          ],
          tags: ['Python', 'AWS', 'Azure', 'Google Cloud', 'OpenStack', 'Okta', 'Microsoft 365'],
        },
        {
          company: 'Prowler',
          meta: 'Intern Cloud Security Engineer · Jun 2024 – Dec 2024 · Remote',
          impacts: [
            {
              metric: '80',
              text: 'Pull requests merged during the internship, starting with test coverage for Google Cloud checks and moving quickly into new detections.',
            },
            {
              metric: '7',
              text: 'Months from first commit to a full-time offer.',
            },
          ],
          tags: ['Python', 'Google Cloud', 'AWS', 'pytest'],
        },
      ],
      oss: [
        {
          k: 'Prowler',
          v: 'The open-source cloud security platform. Sixth by commit count of 398 contributors — 528 commits across 15 providers.',
        },
        {
          k: 'Attack Paths',
          v: 'Contributed to and extended Prowler’s Attack Paths: the graph showing how an attacker could chain misconfigurations to reach critical resources. Worked on the graph UI, the query layer, the API and the docs.',
        },
        {
          k: 'Provider coverage',
          v: 'Brought OpenStack and Okta into Prowler end to end, and MongoDB Atlas through the API and UI — so teams on those platforms can scan them like any other cloud.',
        },
      ],
      note: 'Every number here comes from the public repository and can be checked. Some of the work is not public — features that came from enterprise customer requests, plus internal support — so these figures are a floor, not a total.',
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
      lede: 'Happy to hear about cloud security work, open source, or anything you think I would find interesting.',
      channels: [
        { k: 'Email', v: 'josedanielbarranqueroortigosa@gmail.com' },
        { k: 'GitHub', v: 'github.com/danibarranqueroo' },
        { k: 'LinkedIn', v: 'linkedin.com/in/danibarranquero' },
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
      lede: 'Construyo los proveedores y los checks con los que cualquiera puede auditar la nube en la que trabaja.',
      cta: 'Ver el CV',
      now: [
        { k: 'Puesto', v: 'Cloud Security Engineer en Prowler' },
        {
          k: 'Enfoque',
          v: 'Checks de seguridad multinube y proveedores nuevos de principio a fin',
        },
        { k: 'Open source', v: 'Prowler — 269 pull requests mergeadas' },
        { k: 'Ubicación', v: 'Granada, España' },
      ],
      note: 'Experiencia, Proyectos y Recomendaciones siguen siendo marcadores. El texto entre corchetes marca un dato pendiente — aquí no hay nada inventado.',
    },
    about: {
      eyebrow: 'Sobre mí',
      title: 'Quién soy',
      lede: 'Llegué a la nube casi por casualidad y me quedé porque cada proveedor nuevo es un sistema entero que desmontar.',
      body: [
        'La seguridad me interesaba mucho antes que la nube. Hice un curso de Google Cloud casi por curiosidad y me fue enganchando. Justo al terminar la carrera me llegó la oportunidad de entrar en Prowler, y ahí descubrí que esto me entusiasma de verdad.',
        'Empecé profundizando en AWS y poco a poco me fui abriendo. Hoy escribo checks nuevos para AWS, Azure y GCP, y he añadido proveedores completos — MongoDB Atlas, Microsoft 365, Vercel, Linode, OpenStack — para que cualquiera que trabaje sobre ellos pueda escanearlos y securizarlos. 269 pull requests mergeadas en Prowler hasta ahora.',
        'Estudié un doble grado en Ingeniería Informática y Administración de Empresas. La parte de negocio me dio otra forma de mirar el trabajo: entender qué necesita de verdad un cliente, valorar una feature con un análisis DAFO, sintetizar un argumento y saber explicarlo. Hace que no sea solo el que programa.',
        'Lo siguiente que quiero es profundizar en arquitectura cloud. Es donde más recorrido me queda, comparado con la parte de programación y de seguridad, y decirlo es más útil que disimularlo.',
      ],
      education: [
        {
          k: '[AÑOS]',
          v: 'Doble Grado en Ingeniería Informática y Administración de Empresas — [UNIVERSIDAD]',
        },
        { k: '2023', v: 'Google Cloud — ruta de formación Digital Leader, cuatro insignias' },
      ],
      note: 'La formación va aquí y no en su propia página: un doble grado y un curso son una sección, no una página. Dicho una vez, sin más.',
    },
    experience: {
      eyebrow: 'Experiencia',
      title: 'Lo que he\nconstruido',
      lede: 'Trabajo en la parte de detección de un escáner de seguridad cloud open source: los checks que encuentran malas configuraciones y los proveedores que permiten ejecutarlos sobre la nube en la que cada uno trabaja.',
      roles: [
        {
          company: 'Prowler',
          meta: 'Cloud Security Engineer · ene. 2025 – actualidad · En remoto',
          impacts: [
            {
              metric: '528',
              text: 'Commits mergeados en Prowler — el sexto de 398 contribuidores en un proyecto con 14.800 estrellas, y 294.573 líneas añadidas.',
            },
            {
              metric: '15',
              text: 'Proveedores cloud tocados en 269 pull requests mergeadas: AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud, Alibaba Cloud, GitHub, Vercel y Linode, entre otros.',
            },
            {
              metric: '2',
              text: 'Proveedores construidos de principio a fin — OpenStack y Okta — desde el SDK hasta los checks, la API, la interfaz web y la documentación.',
            },
            {
              metric: '144',
              text: 'Pull requests sobre checks y fixers de seguridad: la lógica de detección que las organizaciones ejecutan contra su propia infraestructura.',
            },
            {
              metric: 'Hoy',
              text: 'Liderando el equipo de detección y remediación, después de un año atendiendo issues de la comunidad, revisando pull requests y dando soporte en Slack.',
            },
          ],
          tags: ['Python', 'AWS', 'Azure', 'Google Cloud', 'OpenStack', 'Okta', 'Microsoft 365'],
        },
        {
          company: 'Prowler',
          meta: 'Intern Cloud Security Engineer · jun. 2024 – dic. 2024 · En remoto',
          impacts: [
            {
              metric: '80',
              text: 'Pull requests mergeadas durante las prácticas, empezando por cobertura de tests para los checks de Google Cloud y pasando pronto a detecciones nuevas.',
            },
            {
              metric: '7',
              text: 'Meses desde el primer commit hasta la oferta a jornada completa.',
            },
          ],
          tags: ['Python', 'Google Cloud', 'AWS', 'pytest'],
        },
      ],
      oss: [
        {
          k: 'Prowler',
          v: 'La plataforma open source de seguridad cloud. Sexto por número de commits de 398 contribuidores — 528 commits en 15 proveedores.',
        },
        {
          k: 'Attack Paths',
          v: 'He contribuido y ampliado los Attack Paths de Prowler: el grafo que muestra cómo un atacante podría encadenar malas configuraciones hasta llegar a recursos críticos. He trabajado en la interfaz del grafo, la capa de consultas, la API y la documentación.',
        },
        {
          k: 'Cobertura de proveedores',
          v: 'He traído OpenStack y Okta a Prowler de principio a fin, y MongoDB Atlas a través de la API y la interfaz — para que quien trabaje sobre esas plataformas pueda escanearlas como cualquier otra nube.',
        },
      ],
      note: 'Todos los números salen del repositorio público y se pueden comprobar. Parte del trabajo no es público — features que vinieron de peticiones de clientes enterprise, además del soporte interno — así que estas cifras son un suelo, no un total.',
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
      lede: 'Escríbeme sobre seguridad cloud, open source o cualquier cosa que creas que me puede interesar.',
      channels: [
        { k: 'Email', v: 'josedanielbarranqueroortigosa@gmail.com' },
        { k: 'GitHub', v: 'github.com/danibarranqueroo' },
        { k: 'LinkedIn', v: 'linkedin.com/in/danibarranquero' },
        { k: 'PGP', v: '[HUELLA] — clave en /pgp.txt' },
        { k: 'Seguridad', v: '/.well-known/security.txt' },
      ],
      note: 'La clave PGP y security.txt son el motivo de esta página. Cuestan casi nada y son una señal real en tu campo.',
    },
    footer: { rights: '© [AÑO] Daniel Barranquero', source: 'Código' },
  },
};
