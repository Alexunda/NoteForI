// Pensumtjeklisten (projektplan afsnit 6.1) har to lag:
//
// 1. Det generiske lag: for hvert fag og niveau en liste over det, eleven
//    skal kunne ifølge læreplanen. Listerne skrives i fase 3 ud fra
//    læreplanernes faglige mål og står i GENERISK_PENSUM nederst i filen.
// 2. Det personlige lag: elevens egne forløb, som hver får de faste punkter
//    herunder. Elevens data gemmes kun i browseren (src/lib/pensum.ts).

import type { FagId } from './fag';

export const NIVEAUER = ['A', 'B', 'C'] as const;

export type Niveau = (typeof NIVEAUER)[number];

/** Id'erne gemmes hos eleven, så de må ikke ændres. */
export const PUNKT_IDER = ['forklare', 'begreber', 'noter', 'oevet', 'opgaver'] as const;

export type PunktId = (typeof PUNKT_IDER)[number];

export interface FastPunkt {
  id: PunktId;
  tekst: string;
  /** Punktet kan sættes til "ikke relevant", fordi det ikke passer til alle forløb */
  kanVaereIrrelevant?: boolean;
}

/** De faste punkter, hvert forløb får (projektplan afsnit 6.1) */
export const FASTE_PUNKTER: readonly FastPunkt[] = [
  { id: 'forklare', tekst: 'Kan forklare forløbets hovedpointer med egne ord' },
  { id: 'begreber', tekst: 'Kender de centrale begreber og formler' },
  { id: 'noter', tekst: 'Har noter eller mindmap' },
  { id: 'oevet', tekst: 'Har øvet en problemstilling højt' },
  { id: 'opgaver', tekst: 'Har lavet øvelsesopgaver', kanVaereIrrelevant: true },
];

export interface Kilde {
  navn: string;
  url: string;
}

export interface GeneriskPunkt {
  /**
   * Fast id med a–z, 0–9 og bindestreg, fx "tangentens-ligning". Elevens
   * afkrydsninger gemmes under id'et, så det må ikke ændres bagefter.
   */
  id: string;
  /** Det, eleven skal kunne, skrevet ud fra læreplanens faglige mål */
  tekst: string;
  /** Valgfrit link til en emneside: id'et fra src/content/emner, fx "matematik/eksempel" */
  emne?: string;
}

export interface GeneriskListe {
  fag: FagId;
  niveau: Niveau;
  /** Den læreplanversion, listen bygger på, fx "2024" */
  laereplan: string;
  /** Mindst én officiel kilde (CLAUDE.md, regel 1) */
  kilder: Kilde[];
  /** Sættes kun til true af et menneske, der har læst listen igennem */
  verificeret: boolean;
  punkter: GeneriskPunkt[];
}

/** En generisk liste, som siden viser den. Emnerne er lavet om til links. */
export interface GeneriskVisning extends Omit<GeneriskListe, 'punkter'> {
  punkter: { id: string; tekst: string; url?: string }[];
}

/**
 * Det generiske lag: én liste pr. fag, niveau og læreplan. Den er tom,
 * indtil listerne er skrevet ud fra læreplanerne (fase 3). Buildet stopper,
 * hvis en liste har fejl (src/lib/generisk-pensum.ts).
 *
 * Eksempel på en liste:
 *
 *   {
 *     fag: 'matematik',
 *     niveau: 'A',
 *     laereplan: '2024',
 *     kilder: [{ navn: 'Læreplan Matematik A – stx 2024', url: 'https://…' }],
 *     verificeret: false,
 *     punkter: [{ id: 'et-punkt', tekst: 'Det skal du kunne', emne: 'matematik/et-emne' }],
 *   }
 *
 * Har et fag lister til to læreplaner (fx dansk A 2017 og 2026), vises
 * begge med årstal. Et valg af læreplan kan tilføjes, når det sker.
 */
export const GENERISK_PENSUM: GeneriskListe[] = [
  {
    // De faglige mål står i læreplanen pkt. 2.1. Punkterne om kernestoffet
    // (pkt. 2.2) linker til emnesiderne.
    fag: 'matematik',
    niveau: 'A',
    laereplan: '2024',
    kilder: [
      {
        navn: 'Læreplan for matematik A, stx, august 2024, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/yleizedu/240613-matematik-a-stx-august-2024.pdf',
      },
    ],
    verificeret: false,
    punkter: [
      {
        id: 'begreber-teorier-og-metoder',
        tekst: 'Redegøre for et bredt udvalg af matematiske begreber, teorier og metoder og bruge dem til problemløsning og modellering',
      },
      { id: 'raesonnementer-og-beviser', tekst: 'Følge og gennemføre matematiske ræsonnementer og beviser' },
      { id: 'symbol-og-formelsprog', tekst: 'Forstå og bruge matematisk symbol- og formelsprog' },
      {
        id: 'repraesentationer',
        tekst: 'Vælge, bruge og oversætte mellem forskellige repræsentationer af matematiske objekter, fx forskrift, tabel og graf',
      },
      { id: 'digitale-vaerktoejer', tekst: 'Bruge digitale værktøjer til modellering og matematisk problemløsning' },
      {
        id: 'problemloesning',
        tekst: 'Bruge matematik til at formulere, analysere og løse problemer i matematik, i andre fag og i omverdenen',
      },
      {
        id: 'modeller',
        tekst: 'Opstille, bearbejde og fortolke matematiske modeller og diskutere, hvad de kan bruges til, og hvor langt de rækker',
      },
      { id: 'matematiske-tekster', tekst: 'Læse og bearbejde tekster med matematisk indhold' },
      { id: 'formidling', tekst: 'Formidle matematik mundtligt og skriftligt' },
      {
        id: 'perspektivering',
        tekst: 'Perspektivere matematik med eksempler fra matematikkens historie eller fra videnskab, teknologi, samfund eller kultur',
      },
      {
        id: 'undersoege-og-vurdere',
        tekst: 'Undersøge problemstillinger og udvikle og vurdere løsninger, hvor du bruger matematikkens viden og metoder',
      },
      { id: 'fagets-identitet', tekst: 'Vise, at du kender matematikkens identitet og metoder' },
    ],
  },
];
