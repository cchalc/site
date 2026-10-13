// Site-wide metadata. Edit these to make the site yours.
export const SITE = {
  title: 'Feather & Wire',
  // Short tagline used on the home page and in meta descriptions.
  description: 'Writing on software, systems, and the things I build.',
  author: 'Christopher Chalcraft',
  // Used for the RSS feed and copyright line.
  lang: 'en',
} as const;

// Top-level navigation.
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/articles/', label: 'Articles' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
  // Short-form posts live on Blygger Studio (separate Worker).
  { href: 'https://blyg.featherandwire.dev/', label: 'Fragments' },
] as const;

// Profiles elsewhere: footer icons, the About page, rel="me" links, and the
// blyg manifest's author.links. `icon` names a glyph in SocialIcon.astro.
export const SOCIAL = [
  { label: 'X', href: 'https://x.com/cchalc', icon: 'x' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/cchalc/', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/cchalc', icon: 'github' },
] as const;
