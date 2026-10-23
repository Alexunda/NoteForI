import { getCollection, type CollectionEntry } from 'astro:content';
import type { FagId } from '../data/fag';
import { forklaringTilHtml, udtraekBegreber } from './begreber';
import { url } from './sti';

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

/**
 * Alle emner, eller kun ét fags emner, i emnelistens rækkefølge. Et fags
 * emner er også dem, der står med faget under ogsaaFag.
 */
export async function hentEmner(fag?: FagId): Promise<Emne[]> {
  const emner = await getCollection(
    'emner',
    (emne) => fag === undefined || emne.data.fag === fag || emne.data.ogsaaFag.includes(fag),
  );
  return emner.sort(
    (a, b) =>
      a.data.fag.localeCompare(b.data.fag) ||
      a.data.nummer - b.data.nummer ||
      a.data.titel.localeCompare(b.data.titel, 'da'),
  );
}

/** Et begreb fra en emneside, klar til flashcards (fase 4) */
export interface Flashcard {
  /** Fast id, fx "matematik/eksponentielle-funktioner#begreb-fremskrivningsfaktor" */
  id: string;
  begreb: string;
  /** Forklaringen som HTML med formler og kildehenvisninger */
  forklaring: string;
  fag: FagId;
  niveau: ('A' | 'B' | 'C')[];
  laereplan: string[];
  emne: string;
  /** Link til begrebet på emnesiden, med base-sti */
  url: string;
  verificeret: boolean;
}

/** Alle begreber fra emnesiderne. Sider med pladsholdertekst er ikke med. */
export async function hentFlashcards(): Promise<Flashcard[]> {
  const emner = (await hentEmner()).filter((emne) => !emne.data.pladsholder);
  return emner.flatMap((emne) => {
    const fil = new URL(emne.filePath ?? emne.id, 'file:///projekt/');
    return udtraekBegreber(emne.body ?? '').map((begreb) => ({
      id: `${emne.id}#${begreb.id}`,
      begreb: begreb.navn,
      forklaring: forklaringTilHtml(begreb.markdown, fil, emne.data.kilder),
      fag: emne.data.fag,
      niveau: emne.data.niveau,
      laereplan: emne.data.laereplan,
      emne: emne.data.titel,
      url: url(`${emneSti(emne)}#${begreb.id}`),
      verificeret: emne.data.verificeret,
    }));
  });
}
