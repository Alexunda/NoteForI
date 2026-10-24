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
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      {
        id: 'kernestof-tal-og-algebra',
        tekst: 'Kende mængder og talmængder og regne sikkert med regningsarternes hierarki, potenser, rødder og proportionalitet',
        emne: 'matematik/tal-og-algebra',
      },
      { id: 'kernestof-ligninger', tekst: 'Løse ligninger analytisk, grafisk og med digitale værktøjer', emne: 'matematik/ligninger' },
      {
        id: 'kernestof-procent-og-rentesregning',
        tekst: 'Regne med procent, relativ vækst, vækstrate, fremskrivningsfaktor og renteformlen',
        emne: 'matematik/procent-og-rentesregning',
      },
      {
        id: 'kernestof-retvinklede-trekanter',
        tekst: "Bruge ensvinklede trekanter, Pythagoras' sætning og sinus, cosinus og tangens i retvinklede trekanter",
        emne: 'matematik/retvinklede-trekanter',
      },
      {
        id: 'kernestof-vilkaarlige-trekanter',
        tekst: 'Bruge sinus- og cosinusrelationerne til at beregne sider, vinkler og areal i vilkårlige trekanter',
        emne: 'matematik/vilkaarlige-trekanter',
      },
      {
        id: 'kernestof-analytisk-plangeometri',
        tekst: 'Arbejde med afstande, linjens ligning, skæring, ortogonale linjer, hældningsvinkel, cirklens ligning og tangenter i et koordinatsystem',
        emne: 'matematik/analytisk-plangeometri',
      },
      {
        id: 'kernestof-vektorer-i-planen',
        tekst: 'Regne med vektorer i planen: længde, vinkel, skalarprodukt, projektion, determinant og parameterfremstillinger for linje og cirkel',
        emne: 'matematik/vektorer-i-planen',
      },
      {
        id: 'kernestof-vektorer-i-rummet',
        tekst: 'Regne med vektorer i rummet: vektorprodukt, linjer, planer, kugler og skæring, afstande og vinkler',
        emne: 'matematik/vektorer-i-rummet',
      },
      {
        id: 'kernestof-funktioner',
        tekst: 'Forstå funktionsbegrebet, sammensatte funktioner og parallelforskydning af grafer',
        emne: 'matematik/funktioner',
      },
      {
        id: 'kernestof-lineaere-funktioner',
        tekst: 'Kende lineære funktioner og deres grafer og modellere med dem',
        emne: 'matematik/lineaere-funktioner',
      },
      {
        id: 'kernestof-andengradspolynomier',
        tekst: 'Kende polynomier, særligt andengradspolynomier, og deres grafer',
        emne: 'matematik/andengradspolynomier',
      },
      {
        id: 'kernestof-eksponentielle-funktioner',
        tekst: 'Kende eksponentialfunktioner og deres grafer og modellere med dem',
        emne: 'matematik/eksponentielle-funktioner',
      },
      {
        id: 'kernestof-potensfunktioner',
        tekst: 'Kende potensfunktioner og deres grafer og modellere med dem',
        emne: 'matematik/potensfunktioner',
      },
      {
        id: 'kernestof-logaritmefunktioner',
        tekst: 'Kende titalslogaritmen og den naturlige logaritme og deres grafer',
        emne: 'matematik/logaritmefunktioner',
      },
      {
        id: 'kernestof-trigonometriske-funktioner',
        tekst: 'Kende cosinus og sinus som funktioner og deres grafer',
        emne: 'matematik/trigonometriske-funktioner',
      },
      {
        id: 'kernestof-regression-og-modeller',
        tekst: 'Lave matematiske modeller med funktionstyperne, også med regression',
        emne: 'matematik/regression-og-modeller',
      },
      {
        id: 'kernestof-differentialkvotient',
        tekst: 'Kende grænseværdi og kontinuitet og definere og fortolke differentialkvotienten, også som væksthastighed',
        emne: 'matematik/differentialkvotient',
      },
      {
        id: 'kernestof-regneregler-for-differentiation',
        tekst: 'Differentiere f + g, f − g, k · f, f · g og sammensatte funktioner og kende de afledede funktioner for funktionstyperne',
        emne: 'matematik/regneregler-for-differentiation',
      },
      {
        id: 'kernestof-tangenter-og-newtons-metode',
        tekst: "Bestemme en tangents ligning og finde nulpunkter numerisk med Newtons metode",
        emne: 'matematik/tangenter-og-newtons-metode',
      },
      {
        id: 'kernestof-monotoniforhold-og-optimering',
        tekst: 'Bestemme monotoniforhold og ekstrema og løse optimeringsproblemer med differentialregning',
        emne: 'matematik/monotoniforhold-og-optimering',
      },
      {
        id: 'kernestof-integralregning',
        tekst: 'Bestemme stamfunktioner og ubestemte og bestemte integraler, også arealer, integration ved substitution og volumen af omdrejningslegemer',
        emne: 'matematik/integralregning',
      },
      {
        id: 'kernestof-differentialligninger',
        tekst: 'Løse og analysere første ordens differentialligninger, også med separationsmetoden og Eulers metode, og opstille simple modeller',
        emne: 'matematik/differentialligninger',
      },
      {
        id: 'kernestof-deskriptiv-statistik',
        tekst: 'Beskrive og vise ugrupperet og grupperet observationsmateriale med statistiske deskriptorer',
        emne: 'matematik/deskriptiv-statistik',
      },
      {
        id: 'kernestof-kombinatorik-og-sandsynlighed',
        tekst: 'Regne med sandsynlighed, sandsynlighedsfelter, hændelser og kombinatorik, herunder kombinationer',
        emne: 'matematik/kombinatorik-og-sandsynlighed',
      },
      {
        id: 'kernestof-binomialfordelingen',
        tekst: 'Regne med stokastiske variable og binomialfordelingen og lave estimation og hypotesetest i binomialfordelingen',
        emne: 'matematik/binomialfordelingen',
      },
      {
        id: 'kernestof-normalfordelingen',
        tekst: 'Regne sandsynligheder, middelværdi og spredning i normalfordelingen',
        emne: 'matematik/normalfordelingen',
      },
    ],
  },
];
