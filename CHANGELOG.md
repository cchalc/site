# Changelog

Notable, reader-visible changes to the site and its public surfaces (pages,
`/rss.xml`, and the `/blyg/` Blygger documents). The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- The articles are now also published as a Blygger 0.3 blyg at `/blyg/`
  (`blyg.json`, `feed.xml`, `items/index.json`, `items/{id}.json`,
  `blogroll.opml`), discoverable from every page via `<link rel="blyg">`.
- A "Fragments" nav link to the Blygger Studio instance at
  <https://blyg.featherandwire.dev>.
- MDX components for posts: `Admonition`, `Badge`, `Figure`.
- A skip link, and older/newer navigation at the end of each article.

### Changed
- The site's canonical address is now `https://featherandwire.dev`
  (previously `site-66t.pages.dev`, which still serves the same build).
  Canonical URLs, RSS links, and the sitemap use the new domain; feed readers
  should move to `https://featherandwire.dev/rss.xml`.
- The design now follows xess (design.within.website): Gruvbox palette,
  Podkova / Schibsted Grotesk / Iosevka, self-hosted fonts.

### Fixed
- Article dates no longer display one day early in timezones west of UTC.
