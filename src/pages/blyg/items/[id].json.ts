// Canonical item documents (spec §5). 200 forever once published.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getBlyg, itemDocument, json, type BlygItem } from '../../../blyg/blyg';

export const getStaticPaths = (async () => {
  const blyg = await getBlyg();
  return blyg.items.map((item) => ({ params: { id: item.id }, props: { item } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => json(itemDocument(props.item as BlygItem));
