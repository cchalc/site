// Site-wide metadata. Edit these to make the site yours.
export const SITE = {
  title: 'Christopher Chalcraft',
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
] as const;
