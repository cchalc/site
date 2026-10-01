import rss from '@astrojs/rss';
import { SITE } from '../consts';
import { getPublishedArticles } from '../utils';

export async function GET(context) {
  const articles = await getPublishedArticles();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.pubDate,
      link: `/articles/${a.id}/`,
    })),
  });
}
