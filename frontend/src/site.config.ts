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
      'Projects, research, and writing by Ryan Rumana, a Senior AI/ML Engineer at Dais who leads AI/ML implementation.',
    image: '/images/social-card.png',
  },
  hero: {
    eyebrow: 'AI/ML engineer, systems builder, curious human',
    title: 'I build useful AI systems—and the software that keeps them working.',
    description:
      'I’m Ryan, a Senior AI/ML Engineer at Dais, where I lead AI/ML implementation. Away from work I explore Rust, Kubernetes, the Game of Life, and whatever problem is interesting enough to keep pulling at the thread.',
    primaryCta: { label: 'Explore my work', href: '/projects/' },
    secondaryCta: { label: 'View resume', href: '/resume/' },
  },
  contact: {
    email: 'ryan.rumana@gmail.com',
    resumeUrl: '/resume/',
    resumeDownloadUrl: '/assets/resume.pdf',
  },
  navigation: {
    primary: [
      { href: '/', label: 'Home' },
      { href: '/projects/', label: 'Projects' },
      { href: '/research/', label: 'Research & writing' },
      { href: '/about/', label: 'About' },
    ],
  },
  homeFeatured: ['game-of-life', 'kubernetes-homelab', 'multi-camera-reid'],
  social: [
    { label: 'GitHub', href: 'https://github.com/rrumana' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ryanrumana' },
  ] satisfies SocialLink[],
} as const;

export const defaultNavLinks = siteConfig.navigation.primary;
export type SiteConfig = typeof siteConfig;
