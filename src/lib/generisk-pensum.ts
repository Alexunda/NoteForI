// Det generiske lag i pensumtjeklisten (src/data/pensum.ts) tjekkes ved
// build. Pensumsiden stopper buildet med en liste over fejlene, hvis en
// liste ikke kan bruges.
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import type { GeneriskListe, GeneriskVisning } from '../data/pensum.ts';

const PUNKT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function erWebadresse(tekst: string): boolean {
  try {
    const { protocol } = new URL(tekst);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Giver en liste over fejl i de generiske lister. Den er tom, hvis alt er i
 * orden. `emner` er id'erne på alle emnesider, fx "matematik/eksempel".
 */
export function tjekGeneriskPensum(lister: readonly GeneriskListe[], emner: ReadonlySet<string>): string[] {
  const fejl: string[] = [];
  const set = new Set<string>();

  for (const liste of lister) {
    const navn = `${liste.fag} ${liste.niveau} (${liste.laereplan})`;
    const noegle = `${liste.fag}/${liste.niveau}/${liste.laereplan}`;
    if (set.has(noegle)) fejl.push(`${navn}: listen findes to gange.`);
    set.add(noegle);

    if (!/^\d{4}$/.test(liste.laereplan)) fejl.push(`${navn}: laereplan skal være et årstal, fx "2024".`);
    if (liste.kilder.length === 0) fejl.push(`${navn}: listen skal have mindst én kilde.`);
    for (const kilde of liste.kilder) {
      if (kilde.navn.trim() === '') fejl.push(`${navn}: en kilde mangler et navn.`);
      if (!erWebadresse(kilde.url)) fejl.push(`${navn}: kilden "${kilde.navn}" har ikke en gyldig url.`);
    }

    if (liste.punkter.length === 0) fejl.push(`${navn}: listen har ingen punkter.`);
    const ider = new Set<string>();
    for (const punkt of liste.punkter) {
      if (!PUNKT_ID.test(punkt.id)) fejl.push(`${navn}: id'et "${punkt.id}" må kun have a–z, 0–9 og bindestreg.`);
      if (ider.has(punkt.id)) fejl.push(`${navn}: id'et "${punkt.id}" findes to gange.`);
      ider.add(punkt.id);
      if (punkt.tekst.trim() === '') fejl.push(`${navn}: punktet "${punkt.id}" mangler tekst.`);
      if (punkt.emne !== undefined && !emner.has(punkt.emne)) {
        fejl.push(`${navn}: emnet "${punkt.emne}" findes ikke i src/content/emner.`);
      }
    }
  }

  // Har et fag og niveau lister til flere læreplaner, vælger eleven sin, og
  // så skal hver liste sige, hvem den gælder for
  for (const valg of Object.values(laereplanValg(lister))) {
    for (const liste of valg) {
      if (!liste.gaelder?.trim()) {
        fejl.push(`${liste.fag} ${liste.niveau} (${liste.laereplan}): skriv i gaelder, hvem listen gælder for.`);
      }
    }
  }

  return fejl;
}

/**
 * Læreplanerne, eleven kan vælge imellem for hvert fag og niveau med lister
 * til mere end én læreplan, fx { "dansk/A": [dansk 2026, dansk 2017] }.
 * Den nyeste står først.
 */
export function laereplanValg<T extends { fag: string; niveau: string; laereplan: string }>(
  lister: readonly T[],
): Record<string, T[]> {
  const valg: Record<string, T[]> = {};
  for (const liste of lister) (valg[`${liste.fag}/${liste.niveau}`] ??= []).push(liste);
  for (const noegle of Object.keys(valg)) {
    if (valg[noegle].length < 2) delete valg[noegle];
    else valg[noegle].sort((a, b) => b.laereplan.localeCompare(a.laereplan));
  }
  return valg;
}

/** Gør listerne klar til siden. `emneUrl` giver linket til hver emneside ud fra dens id. */
export function tilVisning(
  lister: readonly GeneriskListe[],
  emneUrl: ReadonlyMap<string, string>,
): GeneriskVisning[] {
  return lister.map(({ punkter, ...liste }) => ({
    ...liste,
    punkter: punkter.map(({ id, tekst, emne }) => {
      const url = emne === undefined ? undefined : emneUrl.get(emne);
      return url === undefined ? { id, tekst } : { id, tekst, url };
    }),
  }));
}
