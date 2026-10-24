// Pensumtjeklisten (projektplan afsnit 6.1) har to lag:
//
// 1. Det generiske lag: for hvert fag og niveau en liste over det, eleven
//    skal kunne ifølge læreplanen. Listerne skrives i fase 3 ud fra
//    læreplanernes faglige mål og kernestof og står i GENERISK_PENSUM nederst i filen.
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
  /** Det, eleven skal kunne, skrevet ud fra læreplanens faglige mål (pkt. 2.1) eller kernestof (pkt. 2.2) */
  tekst: string;
  /** Valgfrit link til en emneside: id'et fra src/content/emner, fx "matematik/eksempel" */
  emne?: string;
}

export interface GeneriskListe {
  fag: FagId;
  niveau: Niveau;
  /** Den læreplanversion, listen bygger på, fx "2024" */
  laereplan: string;
  /**
   * Hvem listen gælder for. Skal stå, når faget og niveauet har lister til
   * flere læreplaner, så eleven kan vælge sin, fx "Hold, der begynder på
   * dansk A fra skoleåret 2026-27".
   */
  gaelder?: string;
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
 * Det generiske lag: én liste pr. fag, niveau og læreplan, skrevet ud fra
 * læreplanerne. Buildet stopper, hvis en liste har fejl
 * (src/lib/generisk-pensum.ts).
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
      { id: 'raesonnementer-og-beviser', tekst: 'Følge og gennemføre matematiske ræsonnementer og beviser og derigennem vise, at du ved, hvordan matematisk teori er bygget op' },
      { id: 'symbol-og-formelsprog', tekst: 'Forstå og bruge matematisk symbol- og formelsprog' },
      {
        id: 'repraesentationer',
        tekst: 'Vælge, bruge og oversætte mellem forskellige repræsentationer af matematiske objekter',
      },
      { id: 'digitale-vaerktoejer', tekst: 'Bruge digitale værktøjer til modellering og matematisk problemløsning' },
      {
        id: 'problemloesning',
        tekst: 'Bruge matematik til at formulere, analysere og løse problemer i matematik, i andre fag og i omverdenen',
      },
      {
        id: 'modeller',
        tekst: 'Opstille, bearbejde og fortolke matematiske modeller, der beskriver fænomener i forskellige fag, og diskutere, hvad de kan bruges til, og hvor langt de rækker',
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
        tekst: 'Kende mængder og talmængderne (hele, rationale og reelle tal) og regne med regningsarternes hierarki, algebraisk manipulation (bogstavregning), potenser og rødder og ligefrem og omvendt proportionalitet',
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
        tekst: 'Regne med vektorer i planen: koordinater, længde, vinkel, skalarprodukt, projektion, determinant og areal af parallelogram, linjens ligning ud fra et punkt og en normalvektor, vinkel mellem linjer og parameterfremstillinger for linje og cirkel',
        emne: 'matematik/vektorer-i-planen',
      },
      {
        id: 'kernestof-vektorer-i-rummet',
        tekst: 'Regne med vektorer i rummet: længde, vinkel, skalarprodukt, projektion og vektorprodukt, parameterfremstilling for linjer, planens ligning og parameterfremstilling, kugler og skæring, afstande og vinkler',
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
        tekst: 'Bestemme stamfunktioner og ubestemte og bestemte integraler, bruge regnereglerne for f + g, f − g og k · f og integration ved substitution og bruge integraler til arealer og volumen af omdrejningslegemer',
        emne: 'matematik/integralregning',
      },
      {
        id: 'kernestof-differentialligninger',
        tekst: 'Løse og analysere første ordens differentialligninger, herunder y′ = f(x), y′ = k · y, y′ = b − a · y og y′ = a · y · (M − y), også med separationsmetoden og Eulers metode, og opstille simple modeller',
        emne: 'matematik/differentialligninger',
      },
      {
        id: 'kernestof-deskriptiv-statistik',
        tekst: 'Beskrive og vise ugrupperet og grupperet observationsmateriale med statistiske deskriptorer',
        emne: 'matematik/deskriptiv-statistik',
      },
      {
        id: 'kernestof-kombinatorik-og-sandsynlighed',
        tekst: 'Regne med sandsynlighed, sandsynlighedsfelter (særligt symmetriske), hændelser og kombinatorik, herunder kombinationer',
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
  {
    // De faglige mål står i læreplanen pkt. 2.1.
    fag: 'samfundsfag',
    niveau: 'A',
    laereplan: '2017',
    kilder: [
      {
        navn: 'Læreplan for samfundsfag A, stx, august 2017, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/hebopjjn/samfundsfag-a-stx-august-2017-ua.pdf',
      },
    ],
    verificeret: false,
    punkter: [
      { id: 'undersoege-problemstillinger', tekst: 'Bruge og kombinere viden fra fagets discipliner til at undersøge aktuelle samfundsmæssige problemstillinger i Danmark og andre lande og diskutere løsninger, også dine egne' },
      { id: 'teorier-og-begreber', tekst: 'Bruge viden, begreber og sammenhænge fra kernestoffet og teorier fra fagets discipliner til at forklare og diskutere samfundsmæssige problemstillinger og udviklingstendenser' },
      { id: 'politikomraade', tekst: 'Undersøge og dokumentere et politikområde, også hvad EU og globale forhold betyder for det' },
      { id: 'samfundsforandringer', tekst: 'Forklare sammenhænge mellem samfundsforandringer og ændringer i sociale og kulturelle mønstre' },
      { id: 'oekonomiske-prioriteringer', tekst: 'Undersøge konkrete økonomiske prioriteringsproblemer nationalt, regionalt og globalt og diskutere løsninger' },
      { id: 'internationalt-system', tekst: 'Forklare begivenheder og udviklingstendenser i det internationale system og diskutere Danmarks handlemuligheder' },
      { id: 'samspil-med-andre-fag', tekst: 'Behandle problemstillinger i samspil med andre fag' },
      { id: 'fagets-identitet', tekst: 'Vise, at du kender fagets identitet og metoder' },
      { id: 'problemstillinger-og-hypoteser', tekst: 'Formulere præcise faglige problemstillinger og hypoteser og indsamle og bearbejde dansk og fremmedsproget materiale, også statistik, til at undersøge, diskutere og konkludere' },
      { id: 'kildekritik-og-undersoegelser', tekst: 'Forholde dig kritisk til materialer fra forskellige afsendere og bruge samfundsvidenskabelig metode til at lave mindre empiriske undersøgelser' },
      { id: 'beregninger-og-diagrammer', tekst: 'Vise faglige sammenhænge og udviklingstendenser med færdige og egne beregninger, tabeller, diagrammer og modeller og bruge digitale hjælpemidler til det' },
      { id: 'formidling', tekst: 'Analysere og formidle empiriske og teoretiske sammenhænge skriftligt og mundtligt, struktureret og nuanceret, på fagets taksonomiske niveauer og med fagets begreber' },
      { id: 'argumentation', tekst: 'Argumentere sammenhængende og nuanceret for dine egne synspunkter på et fagligt grundlag, placere dem i en teoretisk sammenhæng og indgå i en faglig dialog' },
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      { id: 'kernestof-identitet-og-socialisering', tekst: 'Kende identitetsdannelse og socialisering', emne: 'samfundsfag/identitet-og-socialisering' },
      { id: 'kernestof-social-ulighed-og-kultur', tekst: 'Kende social differentiering og kulturelle mønstre i forskellige lande, også Danmark', emne: 'samfundsfag/social-ulighed-og-kultur' },
      { id: 'kernestof-politisk-meningsdannelse-og-medier', tekst: 'Kende politisk meningsdannelse og medier, også adfærd på de sociale medier', emne: 'samfundsfag/politisk-meningsdannelse-og-medier' },
      { id: 'kernestof-aktoer-og-struktur', tekst: 'Kende samfundsforandringer og forholdet mellem aktør og struktur', emne: 'samfundsfag/aktoer-og-struktur' },
      { id: 'kernestof-ideologier-og-partier', tekst: 'Kende politiske ideologier, skillelinjer og partiadfærd', emne: 'samfundsfag/ideologier-og-partier' },
      { id: 'kernestof-vaelgeradfaerd', tekst: 'Kende vælgeradfærd', emne: 'samfundsfag/vaelgeradfaerd' },
      { id: 'kernestof-magt-og-demokrati', tekst: 'Kende magt- og demokratiopfattelser', emne: 'samfundsfag/magt-og-demokrati' },
      { id: 'kernestof-rettigheder-pligter-og-ligestilling', tekst: 'Kende rettigheder og pligter i et demokratisk samfund, også ligestilling mellem kønnene', emne: 'samfundsfag/rettigheder-pligter-og-ligestilling' },
      { id: 'kernestof-politiske-systemer-danmark-og-eu', tekst: 'Kende politiske beslutningsprocesser i Danmark i en global sammenhæng, også de politiske systemer i Danmark og EU', emne: 'samfundsfag/politiske-systemer-danmark-og-eu' },
      { id: 'kernestof-velfaerdsstat-og-marked', tekst: 'Kende velfærdsprincipper og forholdet mellem stat, civilsamfund og marked, også markedsmekanismen og politisk påvirkning af den', emne: 'samfundsfag/velfaerdsstat-og-marked' },
      { id: 'kernestof-globalisering-og-arbejdsmarked', tekst: 'Kende globaliseringens og EU\'s betydning for den økonomiske udvikling i Danmark, også konkurrenceevne og arbejdsmarkedsforhold', emne: 'samfundsfag/globalisering-og-arbejdsmarked' },
      { id: 'kernestof-makrooekonomi', tekst: 'Kende makroøkonomiske sammenhænge, bæredygtig udvikling, målkonflikter og styring nationalt, regionalt og globalt', emne: 'samfundsfag/makrooekonomi' },
      { id: 'kernestof-international-politik', tekst: 'Kende aktører, magt, sikkerhed, konflikter og integration i Europa og internationalt', emne: 'samfundsfag/international-politik' },
      { id: 'kernestof-danmarks-udenrigspolitik', tekst: 'Kende mål og muligheder i Danmarks udenrigspolitik', emne: 'samfundsfag/danmarks-udenrigspolitik' },
      { id: 'kernestof-globalisering-og-udvikling', tekst: 'Kende globalisering og samfundsudvikling i lande på forskellige udviklingstrin', emne: 'samfundsfag/globalisering-og-udvikling' },
      { id: 'kernestof-samfundsfaglig-metode', tekst: 'Kende kvalitativ og kvantitativ metode, også tilrettelæggelse og gennemførelse af undersøgelser og systematisk behandling af forskellige typer data, og komparativ metode og casestudier', emne: 'samfundsfag/samfundsfaglig-metode' },
      { id: 'kernestof-statistik-og-regression', tekst: 'Kende statistiske mål, også lineær regression og statistisk usikkerhed', emne: 'samfundsfag/statistik-og-regression' },
    ],
  },
  {
    // De faglige mål står i læreplanen pkt. 2.1. De er de samme i læreplanen fra 2026.
    // Kernestoffet (pkt. 2.2) er også det samme, bortset fra kanonen.
    fag: 'dansk',
    niveau: 'A',
    laereplan: '2017',
    gaelder: 'Hold, der begyndte på dansk A før skoleåret 2026-27',
    kilder: [
      {
        navn: 'Læreplan for dansk A, stx, august 2017, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/dg5hj512/dansk-a-stx-august-2017.pdf',
      },
      {
        navn: 'Bekendtgørelse om læreplaner for en række danskfag i de gymnasiale uddannelser, nr. 517 af 9. juni 2026, § 4, stk. 2 (retsinformation.dk)',
        url: 'https://www.retsinformation.dk/eli/lta/2026/517',
      },
    ],
    verificeret: false,
    punkter: [
      { id: 'udtrykke-dig', tekst: 'Udtrykke dig præcist, nuanceret og formidlingsbevidst mundtligt, skriftligt og multimodalt' },
      { id: 'sproglig-korrekthed', tekst: 'Beherske skriftsprogets normer for korrekthed og bruge grammatiske og stilistiske grundbegreber' },
      { id: 'sprogets-funktion', tekst: 'Vise indblik i sprogets funktion og variation, også dets samspil med kultur og samfund' },
      { id: 'mundtlige-fremstillingsformer', tekst: 'Bruge centrale mundtlige fremstillingsformer med formidlingsbevidsthed, fx holde faglige oplæg og argumentere for et synspunkt' },
      { id: 'skriftlige-fremstillingsformer', tekst: 'Bruge centrale skriftlige fremstillingsformer med formidlingsbevidsthed, fx redegøre, diskutere, analysere, fortolke og vurdere' },
      { id: 'analysere-tekster', tekst: 'Analysere, fortolke og perspektivere fiktive og ikke-fiktive tekster i alle medier' },
      { id: 'dansk-litteratur', tekst: 'Kende en bred repræsentation af dansk litteratur gennem tiderne med perspektiv til litteraturen i Norden, Europa og resten af verden' },
      { id: 'litteraturhistorie', tekst: 'Vise viden om træk af den danske litteraturs historie og perspektivere til den, også samspillet mellem tekst, kultur og samfund' },
      { id: 'mediebilledet', tekst: 'Kende mediebilledet i dag og forholde dig reflekteret til det' },
      { id: 'information-og-faellesskaber', tekst: 'Navigere, udvælge og forholde dig kritisk og analytisk til information i alle medier og deltage reflekteret i og bidrage til digitale fællesskaber' },
      { id: 'fagets-identitet', tekst: 'Vise viden om og reflektere over fagets identitet og metoder' },
      { id: 'undersoege-og-vurdere', tekst: 'Undersøge problemstillinger og udvikle og vurdere løsninger med fagets viden og metoder, også i samspil med andre fag' },
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      { id: 'kernestof-litteraer-analyse', tekst: 'Kende litteraturanalyse og -fortolkning, relevante litterære metoder, litteratur-, kultur- og bevidsthedshistorisk perspektivering og kreative arbejdsprocesser med tekster', emne: 'dansk/litteraer-analyse' },
      { id: 'kernestof-litteraturhistorie', tekst: 'Kende tekster fra før 1700, fra 1700- og 1800-tallet (også oplysningstid, romantik, romantisme og naturalisme), fra 1900-tallet (også realisme og modernisme) og fra 2000-tallet (også de seneste fem år) og have læst en afgrænset periode før 2000', emne: 'dansk/litteraturhistorie' },
      { id: 'kernestof-norden-og-verden', tekst: 'Kende norske og svenske tekster på originalsproget og verdenslitteratur i oversættelse', emne: 'dansk/litteraturhistorie' },
      { id: 'kernestof-kanon-2017', tekst: 'Kende kanonen: mindst én folkevise og mindst én tekst af hver af de 14 kanonforfattere i læreplanen fra 2017', emne: 'dansk/kanon' },
      { id: 'kernestof-vaerklaesning', tekst: 'Kende mindst seks værker med historisk og genremæssig spredning, herunder roman, digtsamling og dokumentarfilm', emne: 'dansk/vaerklaesning' },
      { id: 'kernestof-sproglig-analyse', tekst: 'Kende sproglig analyse, fortolkning og vurdering', emne: 'dansk/sproglig-analyse' },
      { id: 'kernestof-retorik-og-argumentation', tekst: 'Kende retorisk analyse af kommunikationssituationen, appelformer og argumentation', emne: 'dansk/retorik-og-argumentation' },
      { id: 'kernestof-medieanalyse', tekst: 'Kende kommunikationsanalyse, medieanalyse og -fortolkning, også basale filmiske virkemidler, og analyse og vurdering af mediers funktion i sociale, kulturelle og historiske sammenhænge', emne: 'dansk/medieanalyse' },
      { id: 'kernestof-medietekster', tekst: 'Kende nyhedsformidling, visuelle udtryksformer og tekster fra sociale medier', emne: 'dansk/medieanalyse' },
      { id: 'kernestof-dokumentar', tekst: 'Kende dokumentartekster og dokumentarfilm', emne: 'dansk/dokumentar' },
      { id: 'kernestof-medieproduktion-og-remediering', tekst: 'Arbejde produktivt med medieudtryk og kende til remediering', emne: 'dansk/medieproduktion-og-remediering' },
      { id: 'kernestof-skrivning', tekst: 'Udtrykke dig i dansk og andre fag, også i forløb med særligt fokus på skriftlighed i 1.g og 3.g', emne: 'dansk/skrivning' },
    ],
  },
  {
    // De faglige mål står i læreplanen pkt. 2.1. De er de samme som i læreplanen fra 2017.
    // Kernestoffet (pkt. 2.2) er også det samme, bortset fra kanonen.
    fag: 'dansk',
    niveau: 'A',
    laereplan: '2026',
    gaelder: 'Hold, der begynder på dansk A fra skoleåret 2026-27',
    kilder: [
      {
        navn: 'Læreplan for dansk A, stx, august 2026, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/ivspuuat/260611-laereplan-til-dansk-a-stx-2026.pdf',
      },
      {
        navn: 'Bekendtgørelse om læreplaner for en række danskfag i de gymnasiale uddannelser, nr. 517 af 9. juni 2026, § 4, stk. 2 (retsinformation.dk)',
        url: 'https://www.retsinformation.dk/eli/lta/2026/517',
      },
    ],
    verificeret: false,
    punkter: [
      { id: 'udtrykke-dig', tekst: 'Udtrykke dig præcist, nuanceret og formidlingsbevidst mundtligt, skriftligt og multimodalt' },
      { id: 'sproglig-korrekthed', tekst: 'Beherske skriftsprogets normer for korrekthed og bruge grammatiske og stilistiske grundbegreber' },
      { id: 'sprogets-funktion', tekst: 'Vise indblik i sprogets funktion og variation, også dets samspil med kultur og samfund' },
      { id: 'mundtlige-fremstillingsformer', tekst: 'Bruge centrale mundtlige fremstillingsformer med formidlingsbevidsthed, fx holde faglige oplæg og argumentere for et synspunkt' },
      { id: 'skriftlige-fremstillingsformer', tekst: 'Bruge centrale skriftlige fremstillingsformer med formidlingsbevidsthed, fx redegøre, diskutere, analysere, fortolke og vurdere' },
      { id: 'analysere-tekster', tekst: 'Analysere, fortolke og perspektivere fiktive og ikke-fiktive tekster i alle medier' },
      { id: 'dansk-litteratur', tekst: 'Kende en bred repræsentation af dansk litteratur gennem tiderne med perspektiv til litteraturen i Norden, Europa og resten af verden' },
      { id: 'litteraturhistorie', tekst: 'Vise viden om træk af den danske litteraturs historie og perspektivere til den, også samspillet mellem tekst, kultur og samfund' },
      { id: 'mediebilledet', tekst: 'Kende mediebilledet i dag og forholde dig reflekteret til det' },
      { id: 'information-og-faellesskaber', tekst: 'Navigere, udvælge og forholde dig kritisk og analytisk til information i alle medier og deltage reflekteret i og bidrage til digitale fællesskaber' },
      { id: 'fagets-identitet', tekst: 'Vise viden om og reflektere over fagets identitet og metoder' },
      { id: 'undersoege-og-vurdere', tekst: 'Undersøge problemstillinger og udvikle og vurdere løsninger med fagets viden og metoder, også i samspil med andre fag' },
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      { id: 'kernestof-litteraer-analyse', tekst: 'Kende litteraturanalyse og -fortolkning, relevante litterære metoder, litteratur-, kultur- og bevidsthedshistorisk perspektivering og kreative arbejdsprocesser med tekster', emne: 'dansk/litteraer-analyse' },
      { id: 'kernestof-litteraturhistorie', tekst: 'Kende tekster fra før 1700, fra 1700- og 1800-tallet (også oplysningstid, romantik, romantisme og naturalisme), fra 1900-tallet (også realisme og modernisme) og fra 2000-tallet (også de seneste fem år) og have læst en afgrænset periode før 2000', emne: 'dansk/litteraturhistorie' },
      { id: 'kernestof-norden-og-verden', tekst: 'Kende norske og svenske tekster på originalsproget og verdenslitteratur i oversættelse', emne: 'dansk/litteraturhistorie' },
      { id: 'kernestof-kanon-2026', tekst: 'Kende kanonen: mindst én tekst af hver af de 7 forfattere på den obligatoriske liste og fra 12 af forfatterne og genrerne på bruttolisten', emne: 'dansk/kanon' },
      { id: 'kernestof-vaerklaesning', tekst: 'Kende mindst seks værker med historisk og genremæssig spredning, herunder roman, digtsamling og dokumentarfilm', emne: 'dansk/vaerklaesning' },
      { id: 'kernestof-sproglig-analyse', tekst: 'Kende sproglig analyse, fortolkning og vurdering', emne: 'dansk/sproglig-analyse' },
      { id: 'kernestof-retorik-og-argumentation', tekst: 'Kende retorisk analyse af kommunikationssituationen, appelformer og argumentation', emne: 'dansk/retorik-og-argumentation' },
      { id: 'kernestof-medieanalyse', tekst: 'Kende kommunikationsanalyse, medieanalyse og -fortolkning, også basale filmiske virkemidler, og analyse og vurdering af mediers funktion i sociale, kulturelle og historiske sammenhænge', emne: 'dansk/medieanalyse' },
      { id: 'kernestof-medietekster', tekst: 'Kende nyhedsformidling, visuelle udtryksformer og tekster fra sociale medier', emne: 'dansk/medieanalyse' },
      { id: 'kernestof-dokumentar', tekst: 'Kende dokumentartekster og dokumentarfilm', emne: 'dansk/dokumentar' },
      { id: 'kernestof-medieproduktion-og-remediering', tekst: 'Arbejde produktivt med medieudtryk og kende til remediering', emne: 'dansk/medieproduktion-og-remediering' },
      { id: 'kernestof-skrivning', tekst: 'Udtrykke dig i dansk og andre fag, også i forløb med særligt fokus på skriftlighed i 1.g og 3.g', emne: 'dansk/skrivning' },
    ],
  },
  {
    // De faglige mål står i læreplanen pkt. 2.1.
    fag: 'bioteknologi',
    niveau: 'A',
    laereplan: '2017',
    kilder: [
      {
        navn: 'Læreplan for bioteknologi A, stx, august 2017, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/morjd5sk/bioteknologi-a-stx-august-2017.pdf',
      },
    ],
    verificeret: false,
    punkter: [
      { id: 'fagbegreber-og-modeller', tekst: 'Bruge fagbegreber, fagsprog, repræsentationer og modeller til at beskrive og forklare iagttagelser og analysere bioteknologiske problemstillinger' },
      { id: 'eksperimenter', tekst: 'Tilrettelægge og udføre eksperimenter og undersøgelser med hensyn til laboratoriesikkerhed og risici ved arbejde med biologisk materiale' },
      { id: 'data-og-dokumentation', tekst: 'Bearbejde data fra kvalitative og kvantitative eksperimenter og undersøgelser og dokumentere eksperimentelt arbejde' },
      { id: 'diskutere-data', tekst: 'Analysere og diskutere eksperimentelle data med faglig teori, fejlkilder, usikkerhed og biologisk variation' },
      { id: 'beregninger', tekst: 'Gennemføre, vurdere og dokumentere beregninger i problemstillinger med bioteknologisk indhold' },
      { id: 'matematiske-modeller', tekst: 'Bruge relevante matematiske repræsentationer, modeller og metoder til analyse og vurdering' },
      { id: 'digitale-vaerktoejer', tekst: 'Bruge digitale værktøjer, også fagspecifikke og matematiske, i en konkret faglig sammenhæng' },
      { id: 'tekster-og-kilder', tekst: 'Indsamle, vurdere og bruge faglige tekster og informationer fra forskellige kilder' },
      { id: 'formidling', tekst: 'Formulere dig struktureret mundtligt og skriftligt om bioteknologiske emner og give sammenhængende faglige forklaringer' },
      { id: 'delomraader', tekst: 'Vise forståelse af sammenhænge mellem fagets forskellige delområder' },
      { id: 'fagets-identitet', tekst: 'Vise viden om fagets identitet og metoder' },
      { id: 'perspektivering', tekst: 'Bruge fagets viden og metoder til at vurdere og perspektivere samfundsmæssige, teknologiske, miljømæssige og etiske problemstillinger med bioteknologisk indhold og til at udvikle og vurdere løsninger' },
      { id: 'samspil-med-andre-fag', tekst: 'Behandle problemstillinger i samspil med andre fag' },
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      { id: 'kernestof-kemiske-bindinger', tekst: 'Kende kemiske bindingstyper, tilstandsformer, opløselighedsforhold og struktur- og stereoisomeri', emne: 'bioteknologi/kemiske-bindinger' },
      { id: 'kernestof-uorganisk-kemi', tekst: 'Kende opbygning og egenskaber for udvalgte uorganiske forbindelser, herunder ionforbindelser', emne: 'bioteknologi/uorganisk-kemi' },
      { id: 'kernestof-organisk-kemi', tekst: 'Kende navngivning, opbygning, egenskaber, isomeri og anvendelse for alkoholer, carboxylsyrer og estere og opbygning og relevante egenskaber for carbonhydrider, aldehyder, ketoner, aminer, amider og aminosyrer', emne: 'bioteknologi/organisk-kemi' },
      { id: 'kernestof-maengdeberegninger', tekst: 'Lave mængdeberegninger i relation til reaktionsskemaer og opløsninger', emne: 'bioteknologi/maengdeberegninger' },
      { id: 'kernestof-kemisk-ligevaegt', tekst: 'Kende homogene kemiske ligevægte og fordelingsligevægte, herunder hvordan de forskydes, kvalitativt og simpelt kvantitativt', emne: 'bioteknologi/kemisk-ligevaegt' },
      { id: 'kernestof-syrer-og-baser', tekst: 'Kende syre-basereaktioner og bjerrumdiagrammer og beregne pH i vandige opløsninger af syrer, baser, blandinger af dem og puffersystemer', emne: 'bioteknologi/syrer-og-baser' },
      { id: 'kernestof-redoxreaktioner', tekst: 'Kende redoxreaktioner og bruge oxidationstal', emne: 'bioteknologi/redoxreaktioner' },
      { id: 'kernestof-kondensation-og-hydrolyse', tekst: 'Kende de organiske reaktionstyper kondensation og hydrolyse', emne: 'bioteknologi/kondensation-og-hydrolyse' },
      { id: 'kernestof-makromolekyler', tekst: 'Kende opbygning, egenskaber og biologisk funktion af carbohydrater, lipider, nucleinsyrer og proteiner, herunder enzymer, transportproteiner og receptorer', emne: 'bioteknologi/makromolekyler' },
      { id: 'kernestof-enzymer', tekst: 'Kende de enzymatiske hovedklasser og enzymkinetik', emne: 'bioteknologi/enzymer' },
      { id: 'kernestof-fotosyntese-og-respiration', tekst: 'Kende fotosyntesens overordnede delprocesser, respiration og gæring, herunder carbohydraternes intermediære stofskifte', emne: 'bioteknologi/fotosyntese-og-respiration' },
      { id: 'kernestof-virus', tekst: 'Kende virus, deres opbygning og formering', emne: 'bioteknologi/virus' },
      { id: 'kernestof-celler', tekst: 'Kende pro- og eucaryote celler, eucaryote celletyper, stamceller og membranprocesser', emne: 'bioteknologi/celler' },
      { id: 'kernestof-mikrobiologi', tekst: 'Kende mikrobiologi: vækst, vækstmodeller og vækstfaktorer', emne: 'bioteknologi/mikrobiologi' },
      { id: 'kernestof-nedarvning', tekst: 'Kende nedarvningsprincipper, mitose og meiose', emne: 'bioteknologi/nedarvning' },
      { id: 'kernestof-molekylaerbiologi', tekst: 'Kende replikation, proteinsyntese, genregulering, mutation, genteknologi og anvendt bioinformatik', emne: 'bioteknologi/molekylaerbiologi' },
      { id: 'kernestof-evolution', tekst: 'Kende evolutionsmekanismer', emne: 'bioteknologi/evolution' },
      { id: 'kernestof-fysiologi', tekst: 'Kende fysiologi på organismeniveau og biokemisk niveau: hormonel regulering, nervesystem, forplantning og immunsystem', emne: 'bioteknologi/fysiologi' },
      { id: 'kernestof-oekologi', tekst: 'Kende økologiske grundbegreber: energistrømme og produktion, eksempler på samspil mellem arter og mellem arter og miljøet, og biodiversitet', emne: 'bioteknologi/oekologi' },
      { id: 'kernestof-eksperimentelle-metoder', tekst: 'Kende de eksperimentelle metoder celledyrkning, kloning, transformation, PCR, elektroforese, DNA-sekventering, ELISA, separation, titrering, spektrofotometri og chromatografi', emne: 'bioteknologi/eksperimentelle-metoder' },
    ],
  },
  {
    // De faglige mål står i læreplanen pkt. 2.1 og kernestoffet i pkt. 2.2.
    // Otte emner deles med bioteknologi A og linker til siderne der.
    fag: 'kemi',
    niveau: 'B',
    laereplan: '2017',
    kilder: [
      {
        navn: 'Læreplan for kemi B, stx, august 2017, pkt. 2.1 og 2.2 (uvm.dk, PDF)',
        url: 'https://uvm.dk/media/qrbpki0v/kemi-b-stx-august-2017-ua.pdf',
      },
    ],
    verificeret: false,
    punkter: [
      { id: 'fagbegreber-og-modeller', tekst: 'Bruge fagbegreber, fagsprog, modeller og metoder til at beskrive, analysere og vurdere kemiske problemstillinger' },
      { id: 'iagttagelser-og-symbolsprog', tekst: 'Relatere iagttagelser, modeller og symbolsprog til hinanden med kemisk fagsprog' },
      { id: 'eksperimentelt-arbejde', tekst: 'Gennemføre kvalitativt og kvantitativt eksperimentelt arbejde med hensyn til laboratoriesikkerhed og tilrettelægge simple kemiske eksperimenter' },
      { id: 'resultater', tekst: 'Indsamle, efterbehandle, analysere og vurdere iagttagelser og resultater fra eksperimentelt arbejde' },
      { id: 'dokumentation', tekst: 'Dokumentere eksperimentelt arbejde mundtligt og skriftligt og knytte teori og eksperimenter sammen' },
      { id: 'beregninger', tekst: 'Gennemføre og vurdere beregninger, når du undersøger simple kemiske problemstillinger' },
      { id: 'digitale-vaerktoejer', tekst: 'Bruge digitale værktøjer, også fagspecifikke, i en konkret faglig sammenhæng' },
      { id: 'matematiske-modeller', tekst: 'Bruge relevante matematiske modeller, metoder og repræsentationsformer, når du behandler kemiske problemstillinger' },
      { id: 'tekster-og-kilder', tekst: 'Indsamle, vurdere og bruge kemifaglige tekster og informationer fra forskellige kilder' },
      { id: 'formidling', tekst: 'Formulere dig struktureret mundtligt og skriftligt om kemiske emner og give sammenhængende faglige forklaringer' },
      { id: 'fagets-identitet', tekst: 'Vise viden om kemis identitet og metoder' },
      { id: 'perspektivering', tekst: 'Bruge fagets viden og metoder til at analysere, vurdere og perspektivere samfundsmæssige, teknologiske eller miljømæssige problemstillinger med kemisk indhold og til at udvikle og vurdere løsninger' },
      { id: 'samspil-med-andre-fag', tekst: 'Behandle problemstillinger i samspil med andre fag' },
      // Kernestoffet (læreplanen pkt. 2.2). Hvert punkt linker til sin emneside.
      { id: 'kernestof-fagsprog', tekst: 'Kende kemisk fagsprog, herunder navngivning, kemiske formler og reaktionsskemaer', emne: 'kemi/formler-og-reaktionsskemaer' },
      { id: 'kernestof-periodesystemet', tekst: 'Kende grundstoffernes periodesystem, herunder atomets opbygning', emne: 'kemi/atomer-og-periodesystemet' },
      { id: 'kernestof-maengdeberegninger', tekst: 'Lave mængdeberegninger i relation til reaktionsskemaer og opløsninger', emne: 'bioteknologi/maengdeberegninger' },
      { id: 'kernestof-kemiske-bindinger', tekst: 'Kende kemiske bindingstyper, tilstandsformer, opløselighedsforhold og eksempler på struktur- og stereoisomeri', emne: 'bioteknologi/kemiske-bindinger' },
      { id: 'kernestof-uorganisk-kemi', tekst: 'Kende opbygning, egenskaber og anvendelse for udvalgte uorganiske stoffer, herunder ionforbindelser', emne: 'bioteknologi/uorganisk-kemi' },
      { id: 'kernestof-organisk-kemi', tekst: 'Kende opbygning, egenskaber, isomeri og anvendelse for carbonhydrider, alkoholer, carboxylsyrer og estere og opbygning og udvalgte relevante egenskaber for aldehyder, ketoner og aminer', emne: 'bioteknologi/organisk-kemi' },
      { id: 'kernestof-makromolekyler', tekst: 'Kende et eksempel på makromolekyler', emne: 'bioteknologi/makromolekyler' },
      { id: 'kernestof-kvalitativ-analyse', tekst: 'Identificere stoffer ved kvalitative analyser', emne: 'kemi/kvalitativ-analyse' },
      { id: 'kernestof-kemisk-ligevaegt', tekst: 'Kende homogene kemiske ligevægte, herunder hvordan de forskydes, på kvalitativt og simpelt kvantitativt grundlag', emne: 'bioteknologi/kemisk-ligevaegt' },
      { id: 'kernestof-syrer-og-baser', tekst: 'Kende syre-basereaktioner og beregne pH for vandige opløsninger af syrer og af baser', emne: 'bioteknologi/syrer-og-baser' },
      { id: 'kernestof-faeldningsreaktioner', tekst: 'Kende fældningsreaktioner', emne: 'kemi/faeldningsreaktioner' },
      { id: 'kernestof-redoxreaktioner', tekst: 'Kende redoxreaktioner og afstemme dem med oxidationstal', emne: 'bioteknologi/redoxreaktioner' },
      { id: 'kernestof-organiske-reaktionstyper', tekst: 'Kende de organiske reaktionstyper substitution, addition og elimination', emne: 'kemi/organiske-reaktionstyper' },
      { id: 'kernestof-kondensation-og-hydrolyse', tekst: 'Kende de organiske reaktionstyper kondensation og hydrolyse', emne: 'bioteknologi/kondensation-og-hydrolyse' },
      { id: 'kernestof-reaktionshastighed', tekst: 'Kende reaktionshastighed på kvalitativt grundlag, herunder katalyse', emne: 'kemi/reaktionshastighed' },
      { id: 'kernestof-eksperimentelle-metoder', tekst: 'Kende kvalitative og kvantitative eksperimentelle metoder, herunder separation, simpel syntese, forskellige typer af titrering, vejeanalyse, spektrofotometri og chromatografi', emne: 'kemi/eksperimentelle-metoder-kemi' },
      { id: 'kernestof-kemikaliemaerkning', tekst: 'Kende kemikaliemærkning og lave sikkerhedsvurderinger ved eksperimentelt arbejde', emne: 'kemi/kemikaliemaerkning' },
    ],
  },
];
