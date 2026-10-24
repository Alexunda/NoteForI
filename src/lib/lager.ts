// Brugerens egne data gemmes kun i browseren (localStorage).
// Alle nøgler har præfikset gh: og et versionsnummer, så formatet kan
// migreres senere. Storage kan være tomt, fyldt eller blokeret, så alle
// læsninger og skrivninger er pakket ind i try/catch.

export const NOEGLER = {
  tema: 'gh:v1:tema',
  klassetrin: 'gh:v1:klassetrin',
  nedtaelling: 'gh:v1:nedtaelling',
  pensum: 'gh:v2:pensum',
} as const;

/** Nøgler fra tidligere versioner. Data flyttes derfra til de nye nøgler. */
export const GAMLE_NOEGLER = {
  pensum: 'gh:v1:pensum',
} as const;

type Noegle = (typeof NOEGLER)[keyof typeof NOEGLER];
type GammelNoegle = (typeof GAMLE_NOEGLER)[keyof typeof GAMLE_NOEGLER];

/** Tjekker, om browseren vil gemme. Giver false, hvis storage er blokeret eller fuldt. */
export function kanGemme(): boolean {
  const proeve = 'gh:v1:proeve';
  try {
    localStorage.setItem(proeve, '1');
    localStorage.removeItem(proeve);
    return true;
  } catch {
    return false;
  }
}

export function hent(noegle: Noegle | GammelNoegle): string | null {
  try {
    return localStorage.getItem(noegle);
  } catch {
    return null;
  }
}

/** Gemmer en værdi. Giver false, hvis browseren ikke vil gemme den. */
export function gem(noegle: Noegle, vaerdi: string): boolean {
  try {
    localStorage.setItem(noegle, vaerdi);
    return true;
  } catch {
    return false;
  }
}

/** Læser JSON. Giver null, hvis der ikke er noget, eller hvis det er ugyldigt. */
export function hentJson(noegle: Noegle | GammelNoegle): unknown {
  const tekst = hent(noegle);
  if (tekst === null) return null;
  try {
    return JSON.parse(tekst);
  } catch {
    return null;
  }
}

/**
 * Henter pensumtjeklisten. Findes der kun data under gh:v1:pensum, laves de
 * om med `omdan` (laesPensum, som giver hvert fag læreplanen null) og gemmes
 * under gh:v2:pensum. Den gamle nøgle slettes kun, hvis de nye data blev
 * gemt. Vil browseren ikke gemme, bruges de gamle data alligevel.
 */
export function hentPensum(omdan: (raa: unknown) => unknown): unknown {
  const nye = hentJson(NOEGLER.pensum);
  if (nye !== null) return nye;
  const gamle = hentJson(GAMLE_NOEGLER.pensum);
  if (gamle === null) return null;
  const omdannet = omdan(gamle);
  if (gem(NOEGLER.pensum, JSON.stringify(omdannet))) {
    try {
      localStorage.removeItem(GAMLE_NOEGLER.pensum);
    } catch {
      // Så bliver den gamle nøgle bare liggende
    }
  }
  return omdannet;
}

/**
 * Formatet for nedtællingen under gh:v1:nedtaelling. Værktøjet i fase 4
 * skriver det, og forsiden læser det. Datoer skrives som ÅÅÅÅ-MM-DD.
 *
 * { "eksamener": [{ "navn": "Matematik A, skriftlig", "dato": "2027-05-20" }] }
 */
export interface Nedtaelling {
  eksamener: { navn: string; dato: string }[];
}
