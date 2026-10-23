// Elevens pensumtjekliste (det personlige lag): datamodellen, der gemmes
// under gh:v1:pensum, og de funktioner, siden bruger til at ændre og tælle
// den op. Funktionerne ændrer aldrig de data, de får, men giver nye data
// tilbage. Status og fremdrift gemmes ikke. De regnes ud fra punkterne.
//
// Importerne slutter på .ts, så testene (tests/pensum.test.mjs) kan køre
// filen direkte i Node.

import { FAG_IDER, type FagId } from '../data/fag.ts';
import { FASTE_PUNKTER, NIVEAUER, type Niveau, type PunktId } from '../data/pensum.ts';

/** Det, der gemmes under gh:v1:pensum */
export interface Pensum {
  /** I den rækkefølge, eleven har oprettet dem */
  fag: Fag[];
}

export interface Fag {
  /** Tilfældigt id, fx "k3j9x2ab" */
  id: string;
  /** Sidens fag (bruges til det generiske lag), eller null ved "Andet fag" */
  fagside: FagId | null;
  /** "Matematik" eller elevens eget navn, fx "Historie" */
  navn: string;
  niveau: Niveau;
  /** I elevens egen rækkefølge */
  forloeb: Forloeb[];
  /** Id'er på de punkter fra det generiske lag, eleven har krydset af */
  generisk: string[];
}

export interface Forloeb {
  id: string;
  navn: string;
  /** Står et punkt ikke her, er det ikke krydset af */
  punkter: Punkter;
}

export type Svar = 'ja' | 'irrelevant';

export type Punkter = Partial<Record<PunktId, Svar>>;

export type Status = 'roed' | 'gul' | 'groen';

export const STATUS_TEKST: Record<Status, string> = {
  roed: 'Ikke i gang',
  gul: 'I gang',
  groen: 'Klar',
};

/** Det længste navn på et fag eller et forløb, i tegn */
export const MAKS_NAVN = 120;

/** Så mange forløb kan man højst tilføje ad gangen fra en indsat liste */
export const MAKS_LINJER = 100;

export type LavId = (brugte: ReadonlySet<string>) => string;

/** Et kort, tilfældigt id, der ikke er brugt i forvejen */
export const nytId: LavId = (brugte) => {
  for (;;) {
    const id = Math.random().toString(36).slice(2, 10);
    if (id.length === 8 && !brugte.has(id)) return id;
  }
};

/** Samler mellemrum til ét, fjerner dem i enderne og forkorter meget lange navne. */
export function rensNavn(tekst: string): string {
  const renset = tekst.normalize('NFC').replace(/\s+/g, ' ').trim();
  const tegn = Array.from(renset);
  return tegn.length > MAKS_NAVN ? tegn.slice(0, MAKS_NAVN).join('').trimEnd() : renset;
}

/** To navne er ens, hvis de kun er forskellige i store og små bogstaver. */
function sammenligning(navn: string): string {
  return navn.toLocaleLowerCase('da');
}

// Punkttegn i starten af en linje. Bindestreg og stjerne tæller kun med
// mellemrum efter, så fx "-isme" bliver stående.
const PUNKTTEGN = /^(?:[•·▪▫◦‣⁃●○■□►▸➢✓✔]\s*|[-–—*]\s+)/;

// Numre, der tydeligt er listenumre: "1) ", "(1) " og "1." med tabulator
// efter. "1. " med mellemrum bliver stående, fordi det kan være en del af
// navnet, fx "2. verdenskrig".
const LISTENUMMER = /^(?:\(?\d{1,3}\)\s+|\d{1,3}\.\t\s*)/;

/**
 * Deler en indtastet eller indsat tekst op i navne på forløb: én linje er ét
 * forløb. Tomme linjer springes over, og punkttegn og listenumre i starten
 * af linjen fjernes.
 */
export function delLinjer(tekst: string): string[] {
  return tekst
    .split(/\r\n|\r|\n/)
    .map((linje) => rensNavn(linje.trimStart().replace(PUNKTTEGN, '').replace(LISTENUMMER, '')))
    .filter((navn) => navn !== '');
}

/** Alle id'er på fag og forløb */
export function alleIder(pensum: Pensum): Set<string> {
  const ider = new Set<string>();
  for (const fag of pensum.fag) {
    ider.add(fag.id);
    for (const forloeb of fag.forloeb) ider.add(forloeb.id);
  }
  return ider;
}

export function findFag(pensum: Pensum, fagId: string): Fag | undefined {
  return pensum.fag.find((fag) => fag.id === fagId);
}

function opdaterFag(pensum: Pensum, fagId: string, aendring: (fag: Fag) => Fag): Pensum {
  if (!findFag(pensum, fagId)) return pensum;
  return { ...pensum, fag: pensum.fag.map((fag) => (fag.id === fagId ? aendring(fag) : fag)) };
}

function opdaterForloeb(
  pensum: Pensum,
  fagId: string,
  forloebId: string,
  aendring: (forloeb: Forloeb) => Forloeb,
): Pensum {
  return opdaterFag(pensum, fagId, (fag) => ({
    ...fag,
    forloeb: fag.forloeb.map((forloeb) => (forloeb.id === forloebId ? aendring(forloeb) : forloeb)),
  }));
}

/* ---------- Fag ---------- */

export interface NytFag {
  fagside: FagId | null;
  navn: string;
  niveau: Niveau;
}

/** Giver en besked, hvis faget ikke kan oprettes (eller rettes) sådan. Ellers null. */
export function fagFejl(pensum: Pensum, nyt: NytFag, undtagFagId?: string): string | null {
  const navn = rensNavn(nyt.navn);
  if (navn === '') return 'Skriv navnet på faget.';
  const findes = pensum.fag.find(
    (fag) => fag.id !== undtagFagId && fag.niveau === nyt.niveau && sammenligning(fag.navn) === sammenligning(navn),
  );
  return findes ? `Du har allerede ${findes.navn} ${findes.niveau}.` : null;
}

export function tilfoejFag(pensum: Pensum, nyt: NytFag, lavId: LavId = nytId): { pensum: Pensum; fag: Fag } {
  const fag: Fag = {
    id: lavId(alleIder(pensum)),
    fagside: nyt.fagside,
    navn: rensNavn(nyt.navn),
    niveau: nyt.niveau,
    forloeb: [],
    generisk: [],
  };
  return { pensum: { ...pensum, fag: [...pensum.fag, fag] }, fag };
}

/** Ændrer fagets navn og niveau. Forløb og afkrydsninger bliver, hvor de er. */
export function retFag(pensum: Pensum, fagId: string, rettet: NytFag): Pensum {
  return opdaterFag(pensum, fagId, (fag) => ({
    ...fag,
    fagside: rettet.fagside,
    navn: rensNavn(rettet.navn),
    niveau: rettet.niveau,
  }));
}

export interface SlettetFag {
  fag: Fag;
  indeks: number;
}

export function sletFag(pensum: Pensum, fagId: string): { pensum: Pensum; slettet: SlettetFag | null } {
  const indeks = pensum.fag.findIndex((fag) => fag.id === fagId);
  const fag = pensum.fag[indeks];
  if (!fag) return { pensum, slettet: null };
  return { pensum: { ...pensum, fag: pensum.fag.filter((f) => f.id !== fagId) }, slettet: { fag, indeks } };
}

/** Sætter et slettet fag ind igen på sin gamle plads (fortryd). */
export function genindsaetFag(pensum: Pensum, { fag, indeks }: SlettetFag): Pensum {
  if (findFag(pensum, fag.id)) return pensum;
  const liste = [...pensum.fag];
  liste.splice(Math.min(indeks, liste.length), 0, fag);
  return { ...pensum, fag: liste };
}

/* ---------- Forløb ---------- */

/** Giver en besked, hvis forløbet ikke kan hedde sådan i faget. Ellers null. */
export function forloebFejl(fag: Fag, navn: string, undtagForloebId?: string): string | null {
  const renset = rensNavn(navn);
  if (renset === '') return 'Skriv navnet på forløbet.';
  const findes = fag.forloeb.some(
    (forloeb) => forloeb.id !== undtagForloebId && sammenligning(forloeb.navn) === sammenligning(renset),
  );
  return findes ? 'Der er allerede et forløb, der hedder sådan.' : null;
}

export interface Tilfoejet {
  pensum: Pensum;
  nye: Forloeb[];
  /** Navne, der blev sprunget over, fordi forløbet fandtes i forvejen */
  dubletter: number;
  /** Navne, der blev sprunget over, fordi der var flere end MAKS_LINJER */
  forMange: number;
}

/** Tilføjer forløb sidst i faget. Navne, der findes i forvejen, springes over. */
export function tilfoejForloeb(pensum: Pensum, fagId: string, navne: string[], lavId: LavId = nytId): Tilfoejet {
  const fag = findFag(pensum, fagId);
  if (!fag) return { pensum, nye: [], dubletter: 0, forMange: 0 };

  const brugte = alleIder(pensum);
  const kendte = new Set(fag.forloeb.map((forloeb) => sammenligning(forloeb.navn)));
  const nye: Forloeb[] = [];
  let dubletter = 0;
  let forMange = 0;

  for (const raat of navne) {
    const navn = rensNavn(raat);
    if (navn === '') continue;
    if (kendte.has(sammenligning(navn))) {
      dubletter++;
    } else if (nye.length >= MAKS_LINJER) {
      forMange++;
    } else {
      const id = lavId(brugte);
      brugte.add(id);
      kendte.add(sammenligning(navn));
      nye.push({ id, navn, punkter: {} });
    }
  }

  if (nye.length === 0) return { pensum, nye, dubletter, forMange };
  return {
    pensum: opdaterFag(pensum, fagId, (f) => ({ ...f, forloeb: [...f.forloeb, ...nye] })),
    nye,
    dubletter,
    forMange,
  };
}

/** Fjerner forløb igen, fx når en indsat liste fortrydes. */
export function fjernForloeb(pensum: Pensum, fagId: string, forloebIder: readonly string[]): Pensum {
  const fjern = new Set(forloebIder);
  return opdaterFag(pensum, fagId, (fag) => ({
    ...fag,
    forloeb: fag.forloeb.filter((forloeb) => !fjern.has(forloeb.id)),
  }));
}

export function omdoebForloeb(pensum: Pensum, fagId: string, forloebId: string, navn: string): Pensum {
  return opdaterForloeb(pensum, fagId, forloebId, (forloeb) => ({ ...forloeb, navn: rensNavn(navn) }));
}

/** Flytter et forløb én plads op (-1) eller ned (1). Øverst og nederst sker der ingenting. */
export function flytForloeb(pensum: Pensum, fagId: string, forloebId: string, retning: -1 | 1): Pensum {
  const fag = findFag(pensum, fagId);
  const fra = fag ? fag.forloeb.findIndex((forloeb) => forloeb.id === forloebId) : -1;
  const til = fra + retning;
  if (!fag || fra < 0 || til < 0 || til >= fag.forloeb.length) return pensum;

  const forloeb = [...fag.forloeb];
  [forloeb[fra], forloeb[til]] = [forloeb[til], forloeb[fra]];
  return opdaterFag(pensum, fagId, (f) => ({ ...f, forloeb }));
}

export interface SlettetForloeb {
  fagId: string;
  forloeb: Forloeb;
  indeks: number;
}

export function sletForloeb(
  pensum: Pensum,
  fagId: string,
  forloebId: string,
): { pensum: Pensum; slettet: SlettetForloeb | null } {
  const fag = findFag(pensum, fagId);
  const indeks = fag ? fag.forloeb.findIndex((forloeb) => forloeb.id === forloebId) : -1;
  const forloeb = fag?.forloeb[indeks];
  if (!forloeb) return { pensum, slettet: null };
  return {
    pensum: fjernForloeb(pensum, fagId, [forloebId]),
    slettet: { fagId, forloeb, indeks },
  };
}

/** Sætter et slettet forløb ind igen på sin gamle plads (fortryd). */
export function genindsaetForloeb(pensum: Pensum, { fagId, forloeb, indeks }: SlettetForloeb): Pensum {
  return opdaterFag(pensum, fagId, (fag) => {
    if (fag.forloeb.some((f) => f.id === forloeb.id)) return fag;
    const liste = [...fag.forloeb];
    liste.splice(Math.min(indeks, liste.length), 0, forloeb);
    return { ...fag, forloeb: liste };
  });
}

/* ---------- Punkter ---------- */

/** Krydser et fast punkt af ("ja"), sætter det til "irrelevant" eller fjerner krydset (null). */
export function saetPunkt(
  pensum: Pensum,
  fagId: string,
  forloebId: string,
  punktId: PunktId,
  svar: Svar | null,
): Pensum {
  const punkt = FASTE_PUNKTER.find((p) => p.id === punktId);
  if (!punkt || (svar === 'irrelevant' && !punkt.kanVaereIrrelevant)) return pensum;
  return opdaterForloeb(pensum, fagId, forloebId, (forloeb) => {
    const punkter = { ...forloeb.punkter };
    if (svar === null) delete punkter[punktId];
    else punkter[punktId] = svar;
    return { ...forloeb, punkter };
  });
}

/** Krydser et punkt fra det generiske lag af eller fjerner krydset. */
export function saetGeneriskPunkt(pensum: Pensum, fagId: string, punktId: string, krydset: boolean): Pensum {
  return opdaterFag(pensum, fagId, (fag) => {
    const uden = fag.generisk.filter((id) => id !== punktId);
    return { ...fag, generisk: krydset ? [...uden, punktId] : uden };
  });
}

/* ---------- Status og fremdrift ---------- */

export interface ForloebStatus {
  status: Status;
  /** Afkrydsede punkter */
  klar: number;
  /** Relevante punkter i alt */
  ialt: number;
}

/** Rød: intet krydset af. Gul: noget krydset af. Grøn: alle relevante punkter krydset af. */
export function forloebStatus(forloeb: Forloeb): ForloebStatus {
  let klar = 0;
  let ialt = 0;
  for (const punkt of FASTE_PUNKTER) {
    const svar = forloeb.punkter[punkt.id];
    if (svar === 'irrelevant') continue;
    ialt++;
    if (svar === 'ja') klar++;
  }
  const status: Status = klar === 0 ? 'roed' : klar < ialt ? 'gul' : 'groen';
  return { status, klar, ialt };
}

export interface Optaelling {
  /** Antal forløb med hver status */
  roed: number;
  gul: number;
  groen: number;
  /** Afkrydsede punkter */
  punkter: number;
  /** Relevante punkter i alt */
  muligePunkter: number;
}

export function optael(forloeb: readonly Forloeb[]): Optaelling {
  const optaelling: Optaelling = { roed: 0, gul: 0, groen: 0, punkter: 0, muligePunkter: 0 };
  for (const f of forloeb) {
    const { status, klar, ialt } = forloebStatus(f);
    optaelling[status]++;
    optaelling.punkter += klar;
    optaelling.muligePunkter += ialt;
  }
  return optaelling;
}

/** Fremdriften for alle fag samlet */
export function optaelAlt(pensum: Pensum): Optaelling {
  return optael(pensum.fag.flatMap((fag) => fag.forloeb));
}

/** Den del af punkterne, der er krydset af, i hele procent. Der står kun 100, når alt er krydset af. */
export function procent(optaelling: Optaelling): number {
  if (optaelling.muligePunkter === 0) return 0;
  return Math.floor((optaelling.punkter / optaelling.muligePunkter) * 100);
}

/* ---------- Indlæsning ---------- */

const GYLDIGT_ID = /^[0-9a-z]{1,40}$/;

function erObjekt(vaerdi: unknown): vaerdi is Record<string, unknown> {
  return typeof vaerdi === 'object' && vaerdi !== null && !Array.isArray(vaerdi);
}

/** Bruger det gemte id, hvis det er gyldigt og ikke brugt. Ellers laves et nyt. */
function brugId(id: unknown, brugte: Set<string>, lavId: LavId): string {
  const valgt = typeof id === 'string' && GYLDIGT_ID.test(id) && !brugte.has(id) ? id : lavId(brugte);
  brugte.add(valgt);
  return valgt;
}

function laesForloeb(raa: unknown, brugte: Set<string>, lavId: LavId): Forloeb | null {
  if (!erObjekt(raa)) return null;
  const navn = typeof raa.navn === 'string' ? rensNavn(raa.navn) : '';
  if (navn === '') return null;

  const punkter: Punkter = {};
  if (erObjekt(raa.punkter)) {
    for (const punkt of FASTE_PUNKTER) {
      const svar = raa.punkter[punkt.id];
      if (svar === 'ja' || (svar === 'irrelevant' && punkt.kanVaereIrrelevant)) punkter[punkt.id] = svar;
    }
  }
  return { id: brugId(raa.id, brugte, lavId), navn, punkter };
}

function laesFag(raa: unknown, brugte: Set<string>, lavId: LavId): Fag | null {
  if (!erObjekt(raa)) return null;
  const navn = typeof raa.navn === 'string' ? rensNavn(raa.navn) : '';
  const niveau = NIVEAUER.find((n) => n === raa.niveau);
  if (navn === '' || !niveau) return null;

  const id = brugId(raa.id, brugte, lavId);
  const forloeb: Forloeb[] = [];
  for (const r of Array.isArray(raa.forloeb) ? raa.forloeb : []) {
    const renset = laesForloeb(r, brugte, lavId);
    if (renset) forloeb.push(renset);
  }
  const generisk = Array.isArray(raa.generisk)
    ? [...new Set(raa.generisk.filter((g): g is string => typeof g === 'string' && g !== ''))]
    : [];

  return { id, fagside: FAG_IDER.find((f) => f === raa.fagside) ?? null, navn, niveau, forloeb, generisk };
}

/**
 * Læser de gemte data og rydder op i dem: ukendte felter forsvinder, og fag
 * og forløb, der ikke kan bruges, springes over. Siden går derfor ikke i
 * stå, selv om data er tomme, gamle eller ødelagte.
 */
export function laesPensum(raa: unknown, lavId: LavId = nytId): Pensum {
  const brugte = new Set<string>();
  const fag: Fag[] = [];
  for (const r of erObjekt(raa) && Array.isArray(raa.fag) ? raa.fag : []) {
    const renset = laesFag(r, brugte, lavId);
    if (renset) fag.push(renset);
  }
  return { fag };
}
