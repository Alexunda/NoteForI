import { getCollection, type CollectionEntry } from 'astro:content';
import type { FagId } from '../data/fag';

export type Emne = CollectionEntry<'emner'>;

/**
 * Den sidste del af emnets URL. Buildet fejler, hvis filen ikke ligger i
 * mappen for sit fag, eller hvis filnavnet har andet end a–z, 0–9 og
 * bindestreg (skriv ae, oe og aa i stedet for æ, ø og å).
 */
export function emneSlug(emne: Emne): string {
  const [mappe, slug, ...rest] = emne.id.split('/');
  if (mappe !== emne.data.fag || !slug || rest.length > 0) {
    throw new Error(`Emnet "${emne.id}" skal ligge direkte i src/content/emner/${emne.data.fag}/`);
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(
      `Filnavnet "${emne.id}" må kun have a–z, 0–9 og bindestreg. Skriv ae, oe og aa i stedet for æ, ø og å.`,
    );
  }
  return slug;
}

/** Stien til emnesiden uden base-sti, fx '/fag/matematik/eksempel/'. */
export function emneSti(emne: Emne): string {
  return `/fag/${emne.data.fag}/${emneSlug(emne)}/`;
}

/** Alle emner, eller kun ét fags emner, sorteret efter titel. */
export async function hentEmner(fag?: FagId): Promise<Emne[]> {
  const emner = await getCollection('emner', (emne) => fag === undefined || emne.data.fag === fag);
  return emner.sort((a, b) => a.data.titel.localeCompare(b.data.titel, 'da'));
}
