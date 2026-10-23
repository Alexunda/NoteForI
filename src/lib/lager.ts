// Brugerens egne data gemmes kun i browseren (localStorage).
// Alle nøgler har præfikset gh: og et versionsnummer, så formatet kan
// migreres senere. Storage kan være tomt, fyldt eller blokeret, så alle
// læsninger og skrivninger er pakket ind i try/catch.

export const NOEGLER = {
  tema: 'gh:v1:tema',
  klassetrin: 'gh:v1:klassetrin',
  nedtaelling: 'gh:v1:nedtaelling',
  pensum: 'gh:v1:pensum',
} as const;

type Noegle = (typeof NOEGLER)[keyof typeof NOEGLER];

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

export function hent(noegle: Noegle): string | null {
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
export function hentJson(noegle: Noegle): unknown {
  const tekst = hent(noegle);
  if (tekst === null) return null;
  try {
    return JSON.parse(tekst);
  } catch {
    return null;
  }
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
