// Fagenes overbliksside (projektplan afsnit 6.3). Indholdet står i
// src/content/fag/<fag>.mdx med disse ## afsnit. Emnelisten, links til
// læreplan, vejledning og emu.dk og kilderne laves af siden selv.
//
// Funktionerne er rene, så de kan testes med `npm test`. Importerne slutter
// på .ts, så testene kan køre filen direkte i Node.

import type { Overskrift } from './emneside.ts';

export const FAG_AFSNIT = ['Det handler faget om', 'Prøverne'] as const;

/** Giver en liste over fejl i overbliksidens afsnit. Den er tom, hvis alt er i orden. */
export function tjekFagAfsnit(overskrifter: readonly Overskrift[]): string[] {
  const titler = overskrifter.filter((o) => o.depth === 2).map((o) => o.text);
  if (titler.join('|') === FAG_AFSNIT.join('|')) return [];
  return [`Siden skal have præcis disse ## afsnit i denne rækkefølge: ${FAG_AFSNIT.join(', ')}. Brug ### til underafsnit.`];
}

export interface Gruppe<T> {
  /** Områdets navn, eller null for emner uden område */
  omraade: string | null;
  emner: T[];
}

/**
 * Deler emnerne op efter område i den rækkefølge, områderne først optræder.
 * Emnerne skal allerede være sorteret efter nummer.
 */
export function grupperEfterOmraade<T extends { data: { omraade?: string } }>(emner: readonly T[]): Gruppe<T>[] {
  const grupper: Gruppe<T>[] = [];
  for (const emne of emner) {
    const omraade = emne.data.omraade ?? null;
    let gruppe = grupper.find((g) => g.omraade === omraade);
    if (!gruppe) {
      gruppe = { omraade, emner: [] };
      grupper.push(gruppe);
    }
    gruppe.emner.push(emne);
  }
  return grupper;
}
