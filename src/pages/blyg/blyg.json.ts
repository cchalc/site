// Blyg manifest (spec §6.1). Readers discover the blyg by fetching this.
import type { APIRoute } from 'astro';
import { SITE } from '../../consts';
import {
  AUTHOR,
  BLYG_LEVEL,
  BLYG_VERSION,
  GENERATOR,
  GENERATOR_URL,
  ORIGIN,
  getBlyg,
  json,
} from '../../blyg/blyg';

export const GET: APIRoute = async () => {
  const blyg = await getBlyg();
  return json({
    blyg: BLYG_VERSION,
    level: BLYG_LEVEL,
    generator: GENERATOR,
    generator_url: GENERATOR_URL,
    site: ORIGIN,
    title: SITE.title,
    author: AUTHOR,
    feed: 'feed.xml',
    items: 'items/index.json',
    ...(blyg.updated && { updated: blyg.updated }),
  });
};
