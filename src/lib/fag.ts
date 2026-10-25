import { getCollection, type CollectionEntry } from 'astro:content';
import type { FagId } from '../data/fag';

export type Fagside = CollectionEntry<'fag'>;

/**
 * Overbliksiden for et fag, eller undefined, hvis den ikke er skrevet endnu.
 * Buildet fejler, hvis filnavnet ikke passer til faget.
 */
export async function hentFagside(fag: FagId): Promise<Fagside | undefined> {
  const sider = await getCollection('fag');
  for (const side of sider) {
    if (side.id !== side.data.fag) {
      throw new Error(`src/content/fag/${side.id}: filen skal hedde ${side.data.fag}.mdx, fordi fag er "${side.data.fag}".`);
    }
  }
  return sider.find((side) => side.data.fag === fag);
}
