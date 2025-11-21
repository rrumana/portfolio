export type NavLink = {
  href: string;
  label: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: 'Ryan Rumana',
  meta: {
    title: 'Ryan Rumana | Portfolio',
    description:
      'Software engineer and platform builder focused on Rust, Kubernetes, and resilient homelab infrastructure.',
  },
  contact: {
    email: 'ryan.rumana@gmail.com',
    resumeUrl: '/assets/resume.pdf',
  },
  navigation: {
    primary: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/#projects', label: 'Projects' },
      { href: '/#contact', label: 'Contacts' },
    ],
    home: [
      { href: '#about', label: 'About' },
      { href: '#projects', label: 'Projects' },
      { href: '#contact', label: 'Contact' },
    ],
    about: [
      { href: '/', label: 'Home' },
      { href: '#journey', label: 'Journey' },
      { href: '#stack', label: 'Tooling' },
      { href: '#site', label: 'About this site' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  social: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ryanrumana' },
    { label: 'GitHub', href: 'https://github.com/rrumana' },
  ],
} as const;

export const defaultNavLinks = siteConfig.navigation.primary;
export type SiteConfig = typeof siteConfig;
