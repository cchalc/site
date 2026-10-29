// Schema.org JSON-LD for search engines and AI answer engines.
// BaseLayout serializes whatever a page passes as `jsonLd`.
import { SITE, SOCIAL } from './consts';

/** The author, linked to the same profiles as the rel="me" links. */
export function person(site: URL) {
  return {
    '@type': 'Person',
    '@id': new URL('/about/#person', site).href,
    name: SITE.author,
    url: new URL('/about/', site).href,
    description: SITE.bio,
    sameAs: SOCIAL.map((s) => s.href),
  };
}

export function website(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': new URL('/#website', site).href,
    name: SITE.title,
    description: SITE.description,
    url: site.href,
    inLanguage: SITE.lang,
    author: person(site),
  };
}

/** The About page: the canonical home of the person the other pages reference. */
export function profilePage(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: new URL('/about/', site).href,
    mainEntity: person(site),
  };
}

interface PostingInput {
  url: URL;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  image?: string;
}

export function blogPosting(site: URL, p: PostingInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: p.url.href,
    mainEntityOfPage: p.url.href,
    datePublished: p.pubDate.toISOString(),
    dateModified: (p.updatedDate ?? p.pubDate).toISOString(),
    keywords: p.tags,
    inLanguage: SITE.lang,
    ...(p.image && { image: new URL(p.image, site).href }),
    author: person(site),
    isPartOf: { '@id': new URL('/#website', site).href },
  };
}
