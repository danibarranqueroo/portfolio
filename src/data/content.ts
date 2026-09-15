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

export interface Links {
  github: string;
  linkedin: string;
  email: string;
}

/** One CV entry: a job, a degree or a project. */
export interface CvEntry {
  title: string;
  /** Italic subtitle under the title: role, location, stack. */
  meta?: string;
  /** Right-aligned on the same line as the title. */
  dates?: string;
  bullets?: string[];
}

/**
 * The CV is written separately from the site copy, not derived from it.
 * A CV bullet and a paragraph of prose have different jobs: the site says
 * "Commits merged into Prowler, the sixth-highest of 398 contributors on a
 * project with 14.8k stars", the CV says "528 commits, 6th of 398
 * contributors". The cost is two sets of copy to keep true; the benefit is
 * that neither is a compromise.
 */
export interface CvContent {
  role: string;
  location: string;
  summary: string;
  education: CvEntry[];
  experience: CvEntry[];
  projects: CvEntry[];
  skills: Row[];
  achievements: string[];
}

export interface SiteContent {
  landing: PageCopy & { statement: string; now: Row[]; cta: string; note: string };
  about: PageCopy & { body: string[]; education: Row[]; note: string };
  experience: PageCopy & { roles: Role[]; oss: Row[]; speaking: Row[]; note: string };
  projects: PageCopy & { items: Row[]; note: string };
  recommendations: PageCopy & { quotes: Quote[]; note: string };
  contact: PageCopy & { channels: Row[]; note: string };
  footer: { rights: string; source: string };
  links: Links;
  cv: CvContent;
}

/** Computed at build time so the footer never goes quietly stale. */
const YEAR = new Date().getFullYear();

export const content: Record<Lang, SiteContent> = {
  en: {
    landing: {
      eyebrow: 'Cloud Security Engineer',
      title: 'Daniel\nBarranquero',
      lede: 'I build the providers and checks that let anyone audit the cloud they actually run on.',
      statement: 'Software engineering that secures the whole stack. SDK to UI, cloud to AI.',
      cta: 'Read the CV',
      now: [
        { k: 'Role', v: 'Cloud Security Engineer at Prowler' },
        { k: 'Focus', v: 'Multi-cloud security checks, and new providers end to end' },
        { k: 'Open source', v: 'Prowler, 528 commits' },
        { k: 'Based in', v: 'Granada, Spain' },
      ],
      note: '',
    },
    about: {
      eyebrow: 'About',
      title: 'Who I am',
      lede: 'I came to the cloud almost by accident, and stayed because every new provider is a whole system to take apart.',
      body: [
        'Hey there, I’m Dani. Cloud security engineer at Prowler, and a graduate of the Universidad de Granada in Computer Engineering and Business Administration. Away from the screen: sport, coffee, watching football, video games, and the geekier end of film and television, from Marvel to Game of Thrones.',
        'Security interested me long before the cloud did. I took a Google Cloud course mostly out of curiosity, and it pulled me in. The offer from Prowler arrived just as I was finishing my degree, and that was when I found out this work genuinely excites me.',
        'I started by going deep on AWS, then opened out. Today I write new checks for AWS, Azure and GCP, and I have added whole providers like MongoDB Atlas, Microsoft 365, Vercel, Linode and OpenStack, so that anyone running on them can scan and secure them. 528 commits into Prowler so far.',
        'The degree gave me the foundations I still use every day: Docker, cloud computing, web development, networking, and enough of the underlying systems to reason about what a service is really doing. The business half gave me something else entirely. It taught me to understand what a client actually needs, to weigh a feature against a SWOT analysis, to read a project as a business decision and not only a technical one, and to synthesise an argument and explain it. It means I am not only the person who writes the code, and I can be useful in rooms where that matters.',
        'I have also lived and studied in Annecy, in France, and Shrewsbury, in England. Being dropped somewhere you do not speak the language fluently teaches you to work things out and to get on with people quickly, which turns out to be most of what remote work in an international team asks of you.',
        'What I want next is to go deeper into cloud architecture. It is where I have the most room to grow, more than in the programming or the security, and saying so is more useful than pretending otherwise.',
      ],
      education: [
        {
          k: '2019–2025',
          v: 'Dual degree in Computer Engineering and Business Administration, Universidad de Granada',
        },
        { k: '2023', v: 'Google Cloud Digital Leader learning path, four badges' },
      ],
      note: '',
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
              text: 'Commits merged into Prowler, the sixth-highest of 398 contributors on a project with 14.8k stars, and 294,573 lines added.',
            },
            {
              metric: '15',
              text: 'Cloud providers worked on: AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud, Alibaba Cloud, GitHub, Vercel and Linode among them.',
            },
            {
              metric: '2',
              text: 'OpenStack and Okta, both taken end to end from the core SDK through the checks, the API, the web UI and the documentation.',
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
          v: 'The open-source cloud security platform. Sixth by commit count of 398 contributors, with 528 commits across 15 providers, from the core SDK through the checks, the API, the web UI and the documentation.',
        },
        {
          k: 'pathfinding.cloud',
          v: 'Brought pathfinding.cloud’s AWS privilege-escalation research into Prowler as Attack Paths coverage, and linked every query back to its Prowler Hub page so a finding leads to an explanation.',
        },
        {
          k: 'okta-sdk-python',
          v: 'Two bugs found and reported upstream in Okta’s own Python SDK while building Prowler’s Okta provider: a validation error on lowercase policy constraint types, and a regex missing a quantifier that broke log stream listing. One is fixed.',
        },
      ],
      speaking: [
        {
          k: 'Hackén, Jaén',
          v: 'Speaker, two consecutive years.',
        },
        {
          k: 'fwd:cloudsec',
          v: 'Attended, Berlin.',
        },
        {
          k: 'AWS re:Invent',
          v: 'Attended, Las Vegas.',
        },
        {
          k: 'RootedCON',
          v: 'Attended, Madrid.',
        },
      ],
      note: 'Every number here comes from the public repository and can be checked. Some of the work is not public, including features that came from enterprise customer requests and the internal support side, so these figures are a floor rather than a total.',
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Things I\nbuilt',
      lede: 'Mostly things that started as a problem I had myself, and turned out not to be only mine.',
      items: [
        {
          k: 'Nubify',
          v: 'My final degree project: a Python CLI that lets someone start on AWS without the two fears that stop people, the fear of breaking something and the fear of the bill. It estimates real cost through the AWS Pricing API before anything is created. I wrote it because I had exactly that fear in my first months at Prowler.',
        },
        {
          k: 'Detection proposals',
          v: '28 new-check proposals opened against Prowler, covering secrets left in Lambda layers, ECR images, Glue connections, CodePipeline definitions and SageMaker notebooks, plus Kubernetes hardening. Deciding what is worth detecting, not only implementing it.',
        },
        {
          k: 'This site',
          v: 'Built in the open: pinned dependencies with a seven-day release quarantine, a strict CSP, signed commits, and a security page that runs Prowler against its own repository and publishes what fails. More projects are coming; this page will grow.',
        },
      ],
      note: '',
    },
    recommendations: {
      eyebrow: 'Recommendations',
      title: 'In other\npeople’s words',
      lede: '[ONE LINE OF FRAMING: who these people are to you, and over what period.]',
      quotes: [
        {
          text: '[QUOTE ONE: the strongest thing a senior engineer said about working with you. Two or three sentences; longer reads as padding.]',
          name: '[NAME]',
          role: '[ROLE] · [COMPANY]',
        },
        {
          text: '[QUOTE TWO: ideally about a different quality than the first, so the two do not overlap.]',
          name: '[NAME]',
          role: '[ROLE] · [COMPANY]',
        },
        {
          text: '[QUOTE THREE: optional. Three is plenty; more starts to read defensive.]',
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
      ],
      note: '',
    },
    footer: { rights: `© ${YEAR} Daniel Barranquero`, source: 'Source' },
    links: {
      github: 'https://github.com/danibarranqueroo',
      linkedin: 'https://www.linkedin.com/in/danibarranquero',
      email: 'mailto:josedanielbarranqueroortigosa@gmail.com',
    },
    cv: {
      role: 'Cloud Security Engineer',
      location: 'Granada, Spain',
      summary:
        'Cloud security engineer on the detection side of Prowler, the open-source cloud security platform. I write the checks that find misconfigurations and build the providers that let teams run them on any cloud.',
      education: [
        {
          title: 'Universidad de Granada',
          meta: 'Dual Degree in Computer Engineering and Business Administration',
          dates: '2019 – 2025',
        },
        {
          title: 'Google Cloud',
          meta: 'Digital Leader learning path, four badges',
          dates: '2023',
        },
      ],
      experience: [
        {
          title: 'Prowler',
          meta: 'Cloud Security Engineer · Remote',
          dates: 'Jan 2025 – Present',
          bullets: [
            '528 commits merged since January 2025.',
            'Built the OpenStack and Okta providers end to end: SDK, checks, API, web UI, docs.',
            'Security checks across 15 cloud providers, from AWS and Azure to Okta and OpenStack.',
            'Extended Attack Paths, the graph chaining misconfigurations to critical resources.',
          ],
        },
        {
          title: 'Prowler',
          meta: 'Intern Cloud Security Engineer · Remote',
          dates: 'Jun 2024 – Dec 2024',
          bullets: [
            '80 pull requests merged, from Google Cloud test coverage into new detections.',
            'Converted to a full-time offer after seven months.',
          ],
        },
      ],
      projects: [
        {
          title: 'Nubify',
          meta: 'Python, AWS Pricing API',
          bullets: [
            'Final degree project. A CLI to start on AWS with real cost estimates before anything is created.',
          ],
        },
        {
          title: 'Personal site',
          meta: 'Astro, TypeScript, Cloudflare',
          bullets: [
            'Pinned dependencies behind a seven-day quarantine, strict CSP, signed commits, and Prowler scanning its own repository.',
          ],
        },
      ],
      skills: [
        { k: 'Languages', v: 'Python, TypeScript, Java, C/C++, SQL, Bash' },
        {
          k: 'Cloud',
          v: 'AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud',
        },
        { k: 'Infrastructure', v: 'Docker, Kubernetes, Terraform, Linux, networking' },
        {
          k: 'Security',
          v: 'Cloud posture management, detection engineering, IAM, attack paths, CIS Benchmarks, DISA STIG',
        },
        { k: 'AI', v: 'AI-assisted development, LLM workflows, agents and skills' },
        { k: 'Tools', v: 'Git, GitHub Actions, pytest' },
      ],
      achievements: [
        'Sixth of 398 contributors to Prowler by commit count, on a project with 14.8k stars.',
        'Lead the detection and remediation team.',
        'Maintain the open-source community: issue triage, pull request review and Slack support.',
        'Speaker at Hackén, Jaén, two consecutive years. Attended AWS re:Invent, fwd:cloudsec and RootedCON.',
      ],
    },
  },

  es: {
    landing: {
      eyebrow: 'Cloud Security Engineer',
      title: 'Daniel\nBarranquero',
      lede: 'Construyo los providers y los checks que permiten auditar y securizar cualquier cloud.',
      statement:
        'Ingeniero de software especializado en seguridad, desarrollando full-stack, IA y cloud.',
      cta: 'Ver el CV',
      now: [
        { k: 'Puesto', v: 'Cloud Security Engineer en Prowler' },
        { k: 'Enfoque', v: 'Checks de seguridad multicloud y providers nuevos end to end' },
        { k: 'Open source', v: 'Prowler, 528 commits' },
        { k: 'Ubicación', v: 'Granada, España' },
      ],
      note: '',
    },
    about: {
      eyebrow: 'Sobre mí',
      title: 'Quién soy',
      lede: 'Llegué al cloud casi de casualidad y me quedé porque cada provider nuevo es un sistema entero que desmontar.',
      body: [
        'Hola, soy Dani. Cloud Security Engineer en Prowler y graduado en el Doble Grado de Ingeniería Informática y ADE por la Universidad de Granada. Fuera de la pantalla: deporte, café, fútbol, videojuegos y la parte más friki del cine y las series, de Marvel a Juego de Tronos.',
        'La seguridad me interesaba mucho antes que el cloud. Hice un curso de Google Cloud casi por curiosidad y me fue enganchando. Justo al terminar la carrera me llegó la oportunidad de entrar en Prowler, y ahí me di cuenta de que esto me gusta de verdad.',
        'Empecé a fondo con AWS y poco a poco me fui abriendo. Hoy escribo checks nuevos para AWS, Azure y GCP, y he añadido providers enteros como MongoDB Atlas, Microsoft 365, Vercel, Linode y OpenStack, para que cualquiera que trabaje sobre ellos pueda escanearlos y securizarlos. 528 commits en Prowler.',
        'La carrera me dio las bases que sigo usando a diario: Docker, cloud computing, desarrollo web, redes y lo suficiente de sistemas para entender qué hace de verdad un servicio por debajo. La parte de ADE me dio otra cosa distinta: entender qué necesita de verdad un cliente, valorar una feature con un DAFO, leer un proyecto como una decisión de negocio y no solo técnica, y saber resumir un argumento y defenderlo. Hace que no sea solo el que programa.',
        'También he vivido y estudiado en Annecy (Francia) y en Shrewsbury (Inglaterra). Que te suelten en un sitio donde no dominas el idioma te enseña a buscarte la vida y a entenderte rápido con la gente, que al final es buena parte de lo que pide trabajar en remoto en un equipo internacional.',
        'Lo siguiente que quiero es meterme a fondo en arquitectura cloud. Es donde más recorrido me queda, más que en programación o en seguridad, y prefiero decirlo a disimularlo.',
      ],
      education: [
        {
          k: '2019–2025',
          v: 'Doble Grado en Ingeniería Informática y ADE, Universidad de Granada',
        },
        { k: '2023', v: 'Google Cloud Digital Leader, cuatro badges' },
      ],
      note: '',
    },
    experience: {
      eyebrow: 'Experiencia',
      title: 'Lo que he\nconstruido',
      lede: 'Trabajo en la parte de detección de un scanner de seguridad cloud open source: los checks que detectan malas configuraciones y los providers que permiten ejecutarlos en cualquier cloud.',
      roles: [
        {
          company: 'Prowler',
          meta: 'Cloud Security Engineer · ene. 2025 – actualidad · En remoto',
          impacts: [
            {
              metric: '528',
              text: 'Commits mergeados en Prowler: el sexto de 398 contribuidores en un proyecto con 14.800 estrellas y 294.573 líneas añadidas.',
            },
            {
              metric: '15',
              text: 'Providers cloud en los que he trabajado: AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud, Alibaba Cloud, GitHub, Vercel y Linode, entre otros.',
            },
            {
              metric: '2',
              text: 'OpenStack y Okta, los dos montados end to end: del SDK a los checks, la API, la web y la documentación.',
            },
            {
              metric: '144',
              text: 'Pull requests sobre checks y fixers: la lógica de detección que las organizaciones lanzan contra su propia infraestructura.',
            },
            {
              metric: 'Hoy',
              text: 'Lidero el equipo de detección y remediación, después de un año atendiendo issues de la comunidad, revisando pull requests y dando soporte en Slack.',
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
              text: 'Pull requests mergeadas durante las prácticas, empezando por los tests de los checks de Google Cloud y pasando pronto a detecciones nuevas.',
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
          v: 'La plataforma open source de seguridad cloud. Sexto por número de commits de 398 contribuidores, con 528 commits en 15 providers: del SDK a los checks, la API, la web y la documentación.',
        },
        {
          k: 'pathfinding.cloud',
          v: 'Llevé la investigación de escalada de privilegios en AWS de pathfinding.cloud a Prowler como cobertura de Attack Paths, y enlacé cada query con su página en Prowler Hub para que un hallazgo lleve a su explicación.',
        },
        {
          k: 'okta-sdk-python',
          v: 'Dos bugs encontrados y reportados en el SDK oficial de Python de Okta mientras montaba su provider en Prowler: un error de validación con tipos de constraint en minúscula y una regex sin cuantificador que rompía el listado de log streams. Uno ya está arreglado.',
        },
      ],
      speaking: [
        { k: 'Hackén, Jaén', v: 'Ponente, dos años consecutivos.' },
        { k: 'fwd:cloudsec', v: 'Asistente, Berlín.' },
        { k: 'AWS re:Invent', v: 'Asistente, Las Vegas.' },
        { k: 'RootedCON', v: 'Asistente, Madrid.' },
      ],
      note: 'Todos los números salen del repositorio público y se pueden comprobar. Parte del trabajo no es pública, como features que salieron de peticiones de clientes enterprise o el soporte interno, así que estas cifras son un mínimo y no un total.',
    },
    projects: {
      eyebrow: 'Proyectos',
      title: 'Cosas que\nhe hecho',
      lede: 'Casi todo empezó siendo un problema mío, y resultó no ser solo mío.',
      items: [
        {
          k: 'Nubify',
          v: 'Mi TFG: una CLI en Python para empezar en AWS sin los dos miedos que frenan a todo el mundo, romper algo y la factura. Estima el coste real con la AWS Pricing API antes de crear nada. Lo hice porque yo tenía justo ese miedo en mis primeros meses en Prowler.',
        },
        {
          k: 'Propuestas de detección',
          v: '28 propuestas de checks nuevos abiertas en Prowler: secretos olvidados en capas de Lambda, imágenes de ECR, conexiones de Glue, definiciones de CodePipeline y notebooks de SageMaker, además de hardening de Kubernetes. Decidir qué merece la pena detectar, no solo implementarlo.',
        },
        {
          k: 'Esta web',
          v: 'Hecha en abierto: dependencias fijadas con cuarentena de siete días, CSP estricta, commits firmados y una página de seguridad que ejecuta Prowler contra su propio repo y publica lo que falla. Irán cayendo más proyectos y esta página irá creciendo.',
        },
      ],
      note: '',
    },
    recommendations: {
      eyebrow: 'Recomendaciones',
      title: 'En palabras\nde otros',
      lede: '[UNA LÍNEA DE CONTEXTO: quiénes son estas personas para ti y en qué periodo.]',
      quotes: [
        {
          text: '[CITA UNO: lo más fuerte que un ingeniero sénior dijo sobre trabajar contigo. Dos o tres frases; más largo suena a relleno.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
        {
          text: '[CITA DOS: a ser posible sobre una cualidad distinta de la primera, para que no se solapen.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
        {
          text: '[CITA TRES: opcional. Con tres basta; más empieza a sonar defensivo.]',
          name: '[NOMBRE]',
          role: '[PUESTO] · [EMPRESA]',
        },
      ],
      note: 'Cada cita necesita el permiso de su autor antes de publicarse. Si la recomendación ya es pública en LinkedIn, enlázala.',
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      lede: 'Escríbeme sobre cloud security, open source o cualquier cosa que creas que me puede interesar.',
      channels: [
        { k: 'Email', v: 'josedanielbarranqueroortigosa@gmail.com' },
        { k: 'GitHub', v: 'github.com/danibarranqueroo' },
        { k: 'LinkedIn', v: 'linkedin.com/in/danibarranquero' },
      ],
      note: '',
    },
    footer: { rights: `© ${YEAR} Daniel Barranquero`, source: 'Código' },
    links: {
      github: 'https://github.com/danibarranqueroo',
      linkedin: 'https://www.linkedin.com/in/danibarranquero',
      email: 'mailto:josedanielbarranqueroortigosa@gmail.com',
    },
    cv: {
      role: 'Cloud Security Engineer',
      location: 'Granada, España',
      summary:
        'Cloud Security Engineer en la parte de detección de Prowler, la plataforma open source de seguridad cloud. Escribo los checks que detectan malas configuraciones y monto los providers que permiten ejecutarlos en cualquier cloud.',
      education: [
        {
          title: 'Universidad de Granada',
          meta: 'Doble Grado en Ingeniería Informática y ADE',
          dates: '2019 – 2025',
        },
        {
          title: 'Google Cloud',
          meta: 'Digital Leader, cuatro badges',
          dates: '2023',
        },
      ],
      experience: [
        {
          title: 'Prowler',
          meta: 'Cloud Security Engineer · En remoto',
          dates: 'ene. 2025 – Actualidad',
          bullets: [
            '528 commits mergeados desde enero de 2025.',
            'Monté los providers de OpenStack y Okta end to end: SDK, checks, API, web y documentación.',
            'Checks de seguridad en 15 providers cloud, de AWS y Azure a Okta y OpenStack.',
            'Amplié Attack Paths, el grafo que encadena malas configuraciones hasta recursos críticos.',
          ],
        },
        {
          title: 'Prowler',
          meta: 'Intern Cloud Security Engineer · En remoto',
          dates: 'jun. 2024 – dic. 2024',
          bullets: [
            '80 pull requests mergeadas, de los tests de Google Cloud a detecciones nuevas.',
            'Contrato a jornada completa a los siete meses.',
          ],
        },
      ],
      projects: [
        {
          title: 'Nubify',
          meta: 'Python, AWS Pricing API',
          bullets: [
            'TFG. Una CLI para empezar en AWS con estimación de coste real antes de crear nada.',
          ],
        },
        {
          title: 'Web personal',
          meta: 'Astro, TypeScript, Cloudflare',
          bullets: [
            'Dependencias fijadas con cuarentena de siete días, CSP estricta, commits firmados y Prowler escaneando su propio repo.',
          ],
        },
      ],
      skills: [
        { k: 'Lenguajes', v: 'Python, TypeScript, Java, C/C++, SQL, Bash' },
        {
          k: 'Cloud',
          v: 'AWS, Azure, Google Cloud, Microsoft 365, OpenStack, Okta, MongoDB Atlas, Oracle Cloud',
        },
        { k: 'Infraestructura', v: 'Docker, Kubernetes, Terraform, Linux, networking' },
        {
          k: 'Seguridad',
          v: 'Cloud security posture, detection engineering, IAM, attack paths, CIS Benchmarks, DISA STIG',
        },
        { k: 'IA', v: 'Desarrollo asistido por IA, workflows con LLM, agentes y skills' },
        { k: 'Herramientas', v: 'Git, GitHub Actions, pytest' },
      ],
      achievements: [
        'Sexto de 398 contribuidores de Prowler por número de commits, en un proyecto con 14.800 estrellas.',
        'Lidero el equipo de detección y remediación.',
        'Mantengo la comunidad open source: issues, revisión de pull requests y soporte en Slack.',
        'Ponente en Hackén (Jaén) dos años consecutivos. Asistente a AWS re:Invent, fwd:cloudsec y RootedCON.',
      ],
    },
  },
};
