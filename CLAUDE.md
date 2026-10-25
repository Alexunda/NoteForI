# Gymnasiehjælp

Statisk hjemmeside (Astro) til eksamensforberedelse og skolearbejde for STX-elever i 1.–3.g.
Den fulde plan står i `docs/projektplan.md`. Læs den, før du starter en ny fase.

## Stack
- Astro med statisk output. Indholdet ligger i content collections (Markdown/MDX) med et frontmatter-skema.
- Formler: `@astrojs/markdown-satteri` (Astros Markdown-motor) læser `$…$` og `$$…$$`, og `katex` laver dem til HTML ved build (`src/lib/markdown/katex.ts`). Ingen `remark-math` eller `rehype-katex`. KaTeX' CSS og skrifttyper kommer fra katex-pakken og ligger på siden selv. `scripts/tjek-formler.mjs` stopper buildet, hvis en formel ender som kode.
  - `katex` er låst til en bestemt version med vilje, så formlerne ikke ændrer sig uden et tjek. Tjek for opdateringer i fase 5.
  - `satteri` står som direkte afhængighed med samme version som den, `@astrojs/markdown-satteri` bruger, så der kun installeres én kopi. `tests/afhaengigheder.test.mjs` tjekker det.
- Pagefind til søgning.
- math.js til lommeregner og grafværktøj. Graferne tegnes med en egen let komponent (canvas eller SVG).
- Pyodide kun til det valgfrie Python-værksted i fase 5. Det indlæses kun på den side.
- Interaktive værktøjer laves i vanilla TypeScript eller små Preact-øer. Ellers ingen JavaScript.
- Almindelig CSS med design tokens (custom properties). Lys og mørk tilstand.
- Brugerdata ligger kun i localStorage med nøglepræfiks `gh:` og et versionsnummer. Wrap alle læsninger og skrivninger i try/catch.
- Deploy sker til GitHub Pages via GitHub Actions.

## Kommandoer
- `npm run dev`: lokal udvikling
- `npm run build`: produktionsbuild (skal køre uden fejl og advarsler)
- `npm test`: tests af logikken i `tests/` med Nodes indbyggede testkører. De kører også i `npm run build`
- `npm run preview`: se buildet lokalt

## Regler, der ikke må brydes
1. **Intet fagligt indhold fra hukommelsen.** Formler, faglige påstande og eksamensregler slås op i officielle kilder, før de skrives. Kilden angives i frontmatter.
   - Officielle kilder er uvm.dk-læreplaner og -vejledninger, emu.dk (også fagkonsulenternes materiale), prøvebanken.dk, retsinformation.dk og de myndigheder og officielle organisationer, der står i projektplanens afsnit 8.
   - **lex.dk** (også de andre værker på lex.dk, fx Trap Danmark og Gyldendal og Politikens Danmarkshistorie) må kun bruges til begrebsforklaringer, når de officielle kilder ikke forklarer begrebet. Omskriv altid, citér ikke, og angiv artiklen som kilde. Grænsen er:
     - Forklaringer og baggrund (hvad, hvem, hvornår): lex.dk alene er nok.
     - Formler, konstanter og tal: brug helst en officiel kilde. Fysiske konstanter tages fra NIST (CODATA). Står noget kun på lex.dk, må det blive, men det markeres "kun lex.dk" på gennemlæsningslisten.
     - Har lex.dk en fejl, bruges artiklen ikke til det punkt.
     - Tal, som kilderne er uenige om (fx ATP-udbyttet), kommer ikke på siden.
     - Opløselighed beskrives kvalitativt og ikke med tal.
   - **Huller:** Forklarer ingen tilladt kilde et begreb, som eleven skal kende, så står det i en `<Hul navn="…" />`-boks på siden og i `docs/huller.md`. Boksen har altid teksten "Det her forklarer siden ikke endnu. Brug dine noter, eller spørg din lærer." `npm test` tjekker, at de to passer sammen.
   - **Egne forklaringer:** Matematiske huller (fx stedvektor og elimination) må redaktionen forklare selv. Kilden hedder "Egen forklaring, godkendt af redaktionen" (uden navn og url), og forklaringen står øverst på gennemlæsningslisten, til ejeren har godkendt den.
   - **Lærebøger er ikke tilladt** som kilde.
2. **Læreplanversion.** Mærk alt indhold med `laereplan`. Flere fag har nye læreplaner (fx matematik 2024 og dansk A 2026), og brugerne kan være på forskellige versioner.
3. **Nyt indhold får `verificeret: false`.** Kun repoets ejer sætter `true`, og først når siden er gennemlæst. "Gennemlæst" betyder, at hver formel og regel på sidens gennemlæsningsliste er tjekket mod sin kilde.
   - Før ejeren læser en side, tjekker en separat agent, som ikke har skrevet siden, hver kildehenvisning mod kilde-PDF'en og lister afvigelserne. Afvigelserne rettes, og så får ejeren gennemlæsningslisten: de vigtigste formler og påstande med kilde.
4. **Ingen kopi af lærebøger.** Officielle PDF'er linkes og genudgives ikke.
5. **Ingen modelbesvarelser af eksamenssæt.** Siden er til forberedelse, ikke et hjælpemiddel under eksamen.
6. **Ingen personoplysninger** om brugerne (navn, skole, klasse). Repoet er offentligt.
7. **Spørg før nye afhængigheder** ud over dem, der står under Stack.

## Konventioner
- Al tekst på siden skrives på dansk, i en kort, konkret og venlig tone til 16–19-årige.
- URL'er skrives uden æ, ø og å (`ae`, `oe`, `aa`).
- Navne staves rigtigt (fx Brønsted og Sennett), også når kilden staver dem forkert.
- Hvert begreb står ét sted med én definition, og andre sider linker til det. Betyder et begreb noget forskelligt i to fag, står det i begge med faget angivet. Buildet stopper ved dubletter.
- Tal har årstal og den dato, de er hentet, og lige efter står en note om, at de kan være forældede, med link til den kilde, tallene kommer fra.
- Prøvebanken omtales som "(kun lærere har adgang, så spørg din lærer)".
- Matematiksiderne skriver "GeoGebra" om CAS-værktøjet og linker til https://www.geogebra.org/.
- Ting, der skal tjekkes igen på et bestemt tidspunkt, står i `docs/vedligeholdelse.md`.
- Officielle kilde-PDF'er (læreplaner, vejledninger, formelsamlinger) hentes til `_kilder/`. Mappen står i .gitignore, så PDF'erne aldrig kommer med i repoet.
- Siden laves til mobil først (375 px). Brødtekst er mindst 16 px, trykflader mindst 44×44 px, og kontrasten følger WCAG AA.
- Man skal kunne nå ethvert værktøj eller emne med højst to tryk fra forsiden.
- Commit-beskeder skrives på dansk. Lav små commits, én delopgave ad gangen.

## Udgivelse
- Hvert nyt commit på `main` bygger og udgiver siden automatisk via `.github/workflows/deploy.yml`.
- Arbejd på din egen branch, ikke direkte på `main`. Når en delopgave er færdig, og `npm run build` kører uden fejl, så commit, push branchen og opret en pull request mod `main` med en kort dansk beskrivelse af ændringen.
- Merge kun, når jeg beder om det. Siden opdateres, når PR'en er merget.
- `package-lock.json` skal committes. Workflowen bruger den til at vælge pakkehåndtering.
- Fejler et build på GitHub, bliver den gamle version liggende. Tjek fanen Actions og ret fejlen, før du laver noget andet.

## Netværk
- Prøvebanken (www.xn--prvebanken-1cb.dk) må kun bruges til det, der er offentligt. Prøv aldrig at logge ind, og bed ikke om et UNI-login. Kan noget ikke nås, så skriv, hvad det er, og link til det i stedet.
- I skyen kan du kun nå de domæner, der står på miljøets netværksliste. Bliver en side blokeret, så prøv ikke at komme uden om det med andre værktøjer eller spejlsider. Stop, og skriv, hvilket domæne jeg skal tilføje.

## Arbejdsgang
- Lav en kort plan før hver fase og vis den, før du koder.
- Tjek dit arbejde, før du kalder noget færdigt:
  - buildet kører uden fejl
  - siden er set i 375 px og 1280 px, i lys og mørk tilstand
  - der er ingen døde links
  - formlerne renderes
  - localStorage virker efter genindlæsning
