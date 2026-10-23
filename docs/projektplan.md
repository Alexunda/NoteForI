# Gymnasiehjælp — projektplan

> Arbejdstitel. En statisk hjemmeside til eksamensforberedelse og skolearbejde på STX. Den bygges med Claude Code.
> Denne fil er den fulde plan. `CLAUDE.md` i repoets rod indeholder de korte arbejdsregler.

---

## 1. Formål

Siden er en gratis, statisk hjemmeside for STX-elever i 1.–3.g. Den skal hjælpe dem med eksamensforberedelse og det daglige skolearbejde. Det skal være det sted, de åbner, når de læser op. Her får de:

- overblik over, hvordan eksamen foregår, og hvad de skal kunne
- tjeklister over deres eget pensum
- forklaringer af fagligt stof (formler, begreber, metoder) i et sprog, de forstår

**Succeskriterium:** de bruger siden af egen fri vilje i eksamensperioden.

---

## 2. Målgruppe

Siden er til STX-elever i alle tre klassetrin:

| Klassetrin | Det, der fylder |
|---|---|
| 1.g | Grundforløb og årsprøver |
| 2.g | Årsprøver og SRO |
| 3.g | SRP og studentereksamen |

- Siden skal dække **alle tre klassetrin**. Alt indhold mærkes med klassetrin og niveau (A/B/C), så man kan filtrere.

**De fag, siden dækker først** (læreplaner som de står på uvm.dk i oktober 2026):

| Fag | Læreplaner på uvm.dk | Bemærk |
|---|---|---|
| Matematik A | 2024 (vejledning november 2025 v2, formelsamling oktober 2025 v2) | 2024-læreplanen gælder for hold, der startede fra skoleåret 2024/25 (BEK nr. 711 af 12/06/2024). Den første årgang går til A-eksamen efter den i maj 2027. Ældre eksamenssæt i Prøvebanken følger 2017-læreplanen, så de vejledende sæt og enkeltopgaver til 2024-læreplanen bruges først. Formler på siden skal passe til 2024-formelsamlingen |
| Samfundsfag A | 2017 (vejledning 2024) | |
| Dansk A | 2017 og 2026 | Elever fra forskellige årgange kan være på hver sin version |
| Bioteknologi A | 2017 (vejledning 2025) | Findes kun på A-niveau på STX. Overlapper med kemi, så emnesiderne linker til hinanden |
| Kemi *[niveau ÅBENT]* | 2017 (vejledning 2025) | |

De øvrige obligatoriske fag (fx engelsk og historie) kommer bagefter.
- **Privatliv:** Repoet er offentligt. Der må ikke stå navne, skole, klasse eller andre personoplysninger om brugerne i koden eller indholdet.

---

## 3. Principper (gælder alle beslutninger)

1. **Mobil først.** Telefonen er den primære enhed (375 px bredde). Siden skal også fungere godt på computer.
2. **Højst to tryk** fra forsiden til ethvert værktøj eller emne.
3. **Simpelt, roligt design.** Én accentfarve, god luft, ingen pop-ups og ingen forstyrrende animationer.
4. **Alt på dansk**, skrevet til 16–19-årige. Korte afsnit og konkrete eksempler. Fagord forklares første gang, de bruges.
5. **Intet login, ingen tracking og ingen cookie-banner.** Brugerens egne data gemmes kun i browseren (localStorage).
6. **Hurtig.** Minimalt JavaScript, kun hvor der er interaktivitet.
7. **Fagligt korrekt før omfattende.** Ti rigtige sider er bedre end hundrede med fejl (se afsnit 7).
8. **Tilgængelig.** Kontrast efter WCAG AA, brødtekst mindst 16 px, trykflader mindst 44×44 px, og alt virker med tastatur.

---

## 4. Teknik

| Del | Valg | Hvorfor |
|---|---|---|
| Framework | **Astro** (statisk output) | Indhold i Markdown, intet JavaScript som standard, interaktive "øer" kun hvor der er brug for dem |
| Indhold | Astro content collections (Markdown/MDX) med frontmatter-skema | Ensartet struktur, og fejl i frontmatter fanges ved build |
| Formler | KaTeX via `remark-math` + `rehype-katex` | Pæne formler, der renderes ved build |
| Søgning | Pagefind | Statisk fuldtekstsøgning uden server |
| Værktøjer | Vanilla TypeScript eller små Preact-øer | Små og hurtige |
| Styling | Almindelig CSS med custom properties (design tokens) | Ingen tung UI-ramme |
| Data | localStorage med nøglepræfiks `gh:` og et versionsnummer | Klar til migrering; skal tåle tom eller blokeret storage |
| Lommeregner og grafer | math.js (fortolkning af udtryk, beregning, differentiering) + en egen let grafkomponent på canvas eller SVG | Starter med det samme på telefonen og kræver ingen server |
| Python (valgfrit, fase 5) | Pyodide, som kun indlæses på Python-siden | Python i browseren uden server. Tungt at hente, så det må ikke bremse resten af siden |
| Hosting | GitHub Pages via GitHub Actions (Astros officielle action) | Gratis. Kræver offentligt repo på gratis-kontoen. Alternativ: Cloudflare Pages |

**URL'er** bruger ikke æ, ø og å (`ae`, `oe`, `aa`). Sidetitler og tekst skrives med normale danske bogstaver.

**Frontmatter-skema for indhold** (udgangspunkt):

```yaml
---
titel: "Differentialregning"
fag: matematik
niveau: [A, B]
klassetrin: [2g, 3g]
laereplan: "2024"            # hvilken læreplanversion indholdet bygger på
kilder:
  - navn: "Læreplan Matematik A – stx 2024"
    url: "https://..."
verificeret: false           # sættes til true, når et menneske har læst siden igennem
---
```

---

## 5. Sidestruktur

**Navigation:** fire hovedområder, **Eksamen · Fag · Værktøjer · Studieteknik**, plus et søgefelt. På mobil vises de som bundmenu.

```
/                         Forside
/eksamen/                 Sådan fungerer eksamen på STX
/eksamen/mundtlig/        Mundtlige prøver
/eksamen/skriftlig/       Skriftlige prøver
/eksamen/srp/             Studieretningsprojektet (3.g)
/eksamen/sro/             Studieretningsopgaven (2.g)
/eksamen/aarsproever/     Årsprøver og grundforløbet (1.g og 2.g)
/eksamen/eksamensdagen/   Praktisk: før, under og efter, sygdom
/fag/                     Oversigt over fag og niveauer
/fag/[fag]/               Fagets overblik
/fag/[fag]/[emne]/        Emneside
/vaerktoejer/pensum/      Pensumtjekliste
/vaerktoejer/flashcards/
/vaerktoejer/timer/
/vaerktoejer/nedtaelling/
/vaerktoejer/gennemsnit/
/vaerktoejer/laeseplan/
/vaerktoejer/lommeregner/
/vaerktoejer/graf/        Grafer, aflæsning og regression
/studieteknik/            Opgaveverber, læse- og noteteknik, kildehenvisning, mundtlig fremlæggelse
/kilder/                  Alle officielle kilder samlet ét sted
/om/
```

**Forside:**
- Spørgsmålet "Hvad skal du i dag?" med fire store kort: *Læs op til eksamen*, *Slå noget op*, *Øv med flashcards*, *Start en læsesession*.
- Feltet "Næste eksamen om X dage", hvis brugeren har lagt datoer ind.
- Et valg: "Jeg går i 1.g / 2.g / 3.g". Valget gemmes lokalt og bruges til at fremhæve relevant indhold. Andet indhold skjules ikke.

---

## 6. Funktioner, prioriteret

### 6.1 Pensumtjekliste (højeste prioritet)

Det konkrete pensum til en mundtlig eksamen er klassens eget. Det står i fagets **undervisningsbeskrivelse** på Lectio, så siden kan ikke kende det på forhånd. Tjeklisten har derfor to lag:

1. **Generisk lag:** For hvert fag og niveau en tjekliste bygget på læreplanens kernestof og faglige mål ("det her skal du kunne").
2. **Personligt lag:** Eleven opretter sine egne forløb, fx "Romantikken" eller "Eksponentielle funktioner", ud fra undervisningsbeskrivelsen. Hvert forløb får faste punkter:
   - Kan forklare forløbets hovedpointer med egne ord
   - Kender de centrale begreber og formler
   - Har noter eller mindmap
   - Har øvet en problemstilling højt
   - Har lavet øvelsesopgaver (hvis relevant)

- Status vises som rød, gul eller grøn, med fremdrift pr. fag og samlet.
- **Hurtig indtastning:** eleven kan indsætte en liste, hvor hver linje bliver ét forløb.
- Data gemmes i localStorage.

### 6.2 Eksamensguides

Der laves en guide for hver prøveform. Hver guide beskriver:

- hvad der sker (forløbet trin for trin)
- hvad der bedømmes
- hvordan man forbereder sig
- typiske fejl
- en tjekliste

Guiderne bygger på den gældende prøvebekendtgørelse samt læreplanernes prøveformer og vejledninger. Ingen regler må skrives ud fra hukommelsen. Alle guides mærkes med klassetrin.

### 6.3 Fagopslag

Hvert fag får en **overbliksside** med:

- hvad faget handler om
- hvordan det eksamineres på hvert niveau
- links til læreplan, vejledning og emu.dk

**Emneside-skabelon:**
- **Kort fortalt** (3–5 linjer)
- **Vigtige pointer**
- **Formler** (hvis relevant). Hver formel vises med en komponent, der indeholder:
  - hvad hvert symbol betyder
  - hvornår formlen bruges
  - et gennemregnet eksempel
  - typiske fejl
  - en henvisning til den officielle formelsamling
- **Centrale begreber.** De genbruges automatisk som flashcards.
- **Eksamenshjørnet:** hvordan emnet typisk kommer til eksamen, med eksempler på problemstillinger.
- **Kilder**

### 6.4 Studieværktøjer

- **Flashcards:** Leitner-system med 5 bokse, som er let at forstå. Der er indbyggede dæk lavet ud fra emnesidernes begreber, og eleven kan oprette egne dæk.
- **Pomodoro-timer:** 25/5 minutter som standard og justerbar. Lyd er valgfri, og timeren virker, når fanen ligger i baggrunden.
- **Nedtælling:** eleven indtaster selv sine eksamensdatoer fra Lectio. Den næste vises på forsiden.
- **Karaktergennemsnit:** 7-trinsskalaen.
  - Find og citér den gældende vægtningsregel før implementering.
  - Markér resultatet som vejledende.
- **Læseplan:** eleven vælger en eksamensdato og forløb fra pensumtjeklisten. Siden fordeler repetitionen over dagene frem mod eksamen.
- **Lommeregner:**
  - Videnskabelig lommeregner med ln, log, eksponenter, rødder og trigonometri.
  - Grader og radianer kan vælges, og det skal tydeligt fremgå, hvilken tilstand der er slået til.
  - Den accepterer decimalkomma (2,5) og decimalpunktum og viser resultater med decimalkomma.
  - Funktioner med flere argumenter bruger semikolon, så kommaet er frit til decimaler.
  - Historikken gemmes lokalt.
- **Grafværktøj:**
  - Man skriver en eller flere forskrifter, fx `f(x) = 2 · 1,05^x`, og ser graferne.
  - Man kan zoome og flytte med to fingre på telefonen og med mus på computeren.
  - Man kan aflæse funktionsværdi, nulpunkter, skæringspunkter, maksimum og minimum og tangenten i et punkt.
  - Indeholder forskriften andre bogstaver end x (fx a og b), får de automatisk skydere, så man kan se, hvad parameteren gør ved grafen.
  - **Regression:** man indsætter datapunkter (fx kopieret fra et regneark) og vælger en model, fx lineær, eksponentiel eller potens. Tjek i læreplanen og formelsamlingen, hvilke modeller der er kernestof. Siden viser forskriften og grafen sammen med punkterne. Værktøjet er også nyttigt i samfundsfag, kemi og bioteknologi.
  - Hvert resultat linker til den emneside, der forklarer det, fx "Hvad er et nulpunkt?".
- **Om lommeregner og grafværktøj:**
  - Begge er øveværktøjer, der skal give forståelse. De erstatter ikke skolens CAS-værktøj, og det står tydeligt på siderne.
  - Til eksamen bruger eleven det værktøj, skolen har valgt, så siden linker til det og opfordrer til at øve i det.
  - Den samme grafkomponent med skydere bruges inde på matematikkens emnesider, fx ved eksponentielle funktioner.
- **Python-værksted (valgfrit, fase 5):** en side med en lille Python-editor og matplotlib via Pyodide. Den indlæses kun, når man åbner siden.

### 6.5 Studieteknik

- Opgaveverberne (taksonomiske niveauer: redegør, analysér, diskutér, vurdér) med eksempler fra forskellige fag
- Læseteknik og noteteknik
- Citat- og kildehenvisning
- Mundtlig fremlæggelse
- Gruppearbejde
- Nervøsitet før eksamen: praktiske råd og en henvisning til studievejlederen

---

## 7. Indholdsregler (vigtigst)

1. **Intet fra hukommelsen.** Faglige påstande, formler og eksamensregler slås op i officielle kilder (afsnit 8), før de skrives. Kilden angives i frontmatter.
2. **Læreplanversioner.** Flere STX-fag har fået nye læreplaner:
   - Matematik A, B og C har 2024-læreplaner med nye formelsamlinger.
   - Fysik, engelsk og naturgeografi har bl.a. 2024-versioner.
   - Dansk A har en 2026-læreplan.
   
   Tjek hvilken læreplan der gælder for hvilken årgang, og mærk alt indhold med `laereplan`. Elever fra forskellige årgange kan være på forskellige versioner i samme fag.
3. **`verificeret: false`** står på alt nyt indhold, indtil et menneske har læst det igennem. Ikke-gennemlæste sider viser en diskret mærkat: "Ikke gennemlæst endnu".
4. **Ophavsret.** Siden må ikke kopiere lærebøger eller andre beskyttede tekster. Officielle PDF'er (formelsamlinger, læreplaner, eksamenssæt) linkes og genudgives ikke.
5. **Forberedelse, ikke hjælpemiddel.** Siden er til at læse op, ikke til brug under eksamen.
   - Den må ikke indeholde modelbesvarelser af eksamenssæt.
   - Henvis til skolens eksamensreglement om tilladte hjælpemidler.
6. **Tone.** Kort, konkret og venlig. Brug eksempler, og forklar fagord første gang.
7. **Ingen personoplysninger** om brugerne i repoet.

---

## 8. Officielle kilder

| Kilde | Hvad | Link |
|---|---|---|
| Undervisningsministeriet | Læreplaner, vejledninger og formelsamlinger for STX (alle fag og niveauer) | https://uvm.dk/uddannelse-til-unge/gymnasiale-uddannelser/fag-og-laereplaner/stx-laereplaner/ |
| emu.dk | Temaer og vejledningsmateriale pr. fag | https://emu.dk/stx |
| Prøvebanken | Tidligere skriftlige eksamenssæt og vejledende sæt (kræver UNI-login) | https://www.prøvebanken.dk/ |
| Formelsamling Matematik A, stx (2024-læreplan) | Den formelsamling, der hører til 2024-læreplanen | https://uvm.dk/media/jcpfecb2/251201-matematisk-formelsamling-stx-a-niveau-oktober-2025-2024-laereplan-v2.pdf |
| Vejledning Matematik A, stx (2024-læreplan) | Hvad der kræves med og uden CAS | https://uvm.dk/media/umtizhv0/251124-vejledning-til-laereplan-i-matematik-a-stx-november-2025-v2.pdf |
| Retsinformation | Bekendtgørelse om gymnasiale prøver (nævnt i skolers eksamensreglementer fra 2026; tjek at det er den gældende version) | https://www.retsinformation.dk/eli/lta/2026/3 |
| borger.dk | Overblik over STX: antal prøver, beståelseskrav | https://www.borger.dk/skole-og-uddannelse/ungdomsuddannelser/gymnasiet |

Konteksten for tidsplanen er, at den store ungdomsuddannelsesreform (epx, skærpede adgangskrav) først træder i kraft i 2030. Den påvirker ikke de nuværende elever.

---

## 9. Faser

| Fase | Indhold | Færdig, når |
|---|---|---|
| **1. Fundament** | Astro-projekt, design tokens, layout, navigation, forside, mørk tilstand, deploy til GitHub Pages | Siden er live på github.io-adressen og ser godt ud i 375 px |
| **2. Eksamen** | Pensumtjekliste og eksamensguides. Mundtlig, skriftlig og SRP kommer først, fordi 3.g har mest travlt. Derefter eksamensdagen | Brugerne kan oprette deres forløb og bruge tjeklisten |
| **3. Fagopslag** | Emneside-skabelon, formelkomponent og grafkomponent med skydere først. Derefter indhold i denne rækkefølge: 1) matematik (formelkomponenten bliver testet her), 2) samfundsfag A, 3) dansk A, 4) kemi og bioteknologi A | Matematik er komplet og gennemlæst |
| **4. Værktøjer** | Lommeregner og grafværktøj (med regression), flashcards, timer, nedtælling, gennemsnit, læseplan | Alle værktøjer virker efter genindlæsning, og grafværktøjet kan bruges med én hånd på en telefon |
| **5. Finpudsning** | Søgning (Pagefind), studieteknik, rettelser ud fra brugernes feedback. Evt. offline-understøttelse (PWA), eksport/import af data og Python-værksted | Brugerne har brugt siden i en uge og givet feedback |

---

## 10. Kvalitet: sådan tjekkes arbejdet

- `npm run build` kører uden fejl eller advarsler.
- Hver ny side tjekkes i 375 px og 1280 px bredde, i både lys og mørk tilstand.
- Lighthouse giver mindst 95 i tilgængelighed og ydeevne.
- Der er ingen døde links (kør et link-check).
- Alle formler renderes korrekt.
- Funktioner med localStorage:
  - virker efter genindlæsning
  - går ikke i stykker, hvis storage er tom eller blokeret

---

## 11. Arbejdsmåde for Claude Code

- Lav en kort plan før hver fase, og vis den, før du koder.
- Lav små, afgrænsede ændringer, og commit efter hver delopgave med en dansk commit-besked.
- Når en delopgave er færdig, og buildet kører rent: push branchen, og opret en pull request mod `main`. Siden udgives, når PR'en er merget.
- Spørg, før du tilføjer afhængigheder ud over dem i afsnit 4.
- Fagligt indhold skrives i denne rækkefølge: slå op, skriv, angiv kilde, sæt `verificeret: false`.

---

## 12. Åbne spørgsmål

- [x] De første fag: matematik A, samfundsfag A, dansk A, bioteknologi A og kemi
- [ ] Niveauet i kemi
- [ ] Hvilket CAS-værktøj bruger skolen (fx GeoGebra, WordMat, TI-Nspire eller Maple)? Siden linker til det, og lommeregnerens skrivemåde bør ligne det
- [ ] Sidens navn
- [ ] Hvem læser indhold igennem og sætter `verificeret: true`? Forslag: ejeren af repoet, og brugerne melder fejl, de finder
- [ ] Eksamensdatoer kendes først fra Lectio i foråret. Nedtællingen lader brugerne selv indtaste datoerne
