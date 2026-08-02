export type NavLink = {
  href: string;
  label: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type Metric = {
  label: string;
  value: string;
  detail?: string;
};

export const siteConfig = {
  name: 'Ryan Rumana',
  shortName: 'RR',
  domain: 'https://rcrumana.xyz',
  jobTitle: 'Senior AI/ML Engineer',
  employer: 'Dais',
  role: 'Senior AI/ML Engineer at Dais',
  meta: {
    title: 'Ryan Rumana | Senior AI/ML Engineer',
    description:
      'Portfolio and research by Ryan Rumana, a Senior AI/ML Engineer at Dais working across Rust, AI systems, and Kubernetes infrastructure.',
    image: '/images/portfolio_light.png',
  },
  hero: {
    eyebrow: 'Systems, platform, and ML engineering',
    title: 'I build software in Rust, Kubernetes, and applied ML.',
    description:
      'This portfolio collects the work I want to show publicly: production services, self-hosted infrastructure, WebAssembly demos, and technical writing that explains the tradeoffs clearly.',
    primaryCta: { label: 'View projects', href: '/projects/' },
    secondaryCta: { label: 'Download resume', href: '/assets/resume.pdf' },
  },
  contact: {
    email: 'ryan.rumana@gmail.com',
    resumeUrl: '/assets/resume.pdf',
  },
  navigation: {
    primary: [
      { href: '/', label: 'Home' },
      { href: '/projects/', label: 'Projects' },
      { href: '/research/', label: 'Research' },
      { href: '/about/', label: 'About' },
    ],
  },
  focusAreas: [
    'Rust services and APIs',
    'Kubernetes and self-hosted infrastructure',
    'ML systems and deployment',
    'Technical research and browser demos',
  ],
  homeMetrics: [
    {
      label: 'Current role',
      value: 'Senior AI/ML Engineer',
      detail: 'Leading AI/ML research and platform work at Dais.',
    },
    {
      label: 'Flagship stack',
      value: 'Rust + Kubernetes + WASM',
      detail: 'Tools I use for backend systems, infrastructure, and interactive demos.',
    },
    {
      label: 'Writing focus',
      value: 'Research + case studies',
      detail: 'Formal reports, reproducible artifacts, and practical engineering write-ups.',
    },
  ] satisfies Metric[],
  social: [
    { label: 'GitHub', href: 'https://github.com/rrumana' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ryanrumana' },
  ] satisfies SocialLink[],
} as const;

export const defaultNavLinks = siteConfig.navigation.primary;
export type SiteConfig = typeof siteConfig;
