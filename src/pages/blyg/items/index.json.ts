// Archive index (spec §6.2): every item ever published, withdrawn included.
import type { APIRoute } from 'astro';
import { getBlyg, json } from '../../../blyg/blyg';

export const GET: APIRoute = async () => {
  const blyg = await getBlyg();
  return json({
    ...(blyg.updated && { updated: blyg.updated }),
    items: blyg.items.map(({ id, kind, created, updated, version }) => ({
      id,
      kind,
      created,
      updated,
      version,
    })),
  });
};
