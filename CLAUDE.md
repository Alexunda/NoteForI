# Gymnasiehjælp

Statisk hjemmeside (Astro) til eksamensforberedelse og skolearbejde for STX-elever i 1.–3.g.
Den fulde plan står i `docs/projektplan.md`. Læs den, før du starter en ny fase.

## Stack
- Astro med statisk output. Indholdet ligger i content collections (Markdown/MDX) med et frontmatter-skema.
- KaTeX (`remark-math` + `rehype-katex`) til formler, Pagefind til søgning.
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
1. **Intet fagligt indhold fra hukommelsen.** Formler, faglige påstande og eksamensregler slås op i officielle kilder (uvm.dk-læreplaner og -vejledninger, emu.dk, prøvebanken.dk, retsinformation.dk) før de skrives. Kilden angives i frontmatter.
2. **Læreplanversion.** Mærk alt indhold med `laereplan`. Flere fag har nye læreplaner (fx matematik 2024 og dansk A 2026), og brugerne kan være på forskellige versioner.
3. **Nyt indhold får `verificeret: false`.** Kun et menneske sætter `true`.
4. **Ingen kopi af lærebøger.** Officielle PDF'er linkes og genudgives ikke.
5. **Ingen modelbesvarelser af eksamenssæt.** Siden er til forberedelse, ikke et hjælpemiddel under eksamen.
6. **Ingen personoplysninger** om brugerne (navn, skole, klasse). Repoet er offentligt.
7. **Spørg før nye afhængigheder** ud over dem, der står under Stack.

## Konventioner
- Al tekst på siden skrives på dansk, i en kort, konkret og venlig tone til 16–19-årige.
- URL'er skrives uden æ, ø og å (`ae`, `oe`, `aa`).
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
- I skyen kan du kun nå de domæner, der står på miljøets netværksliste. Bliver en side blokeret, så prøv ikke at komme uden om det med andre værktøjer eller spejlsider. Stop, og skriv, hvilket domæne jeg skal tilføje.

## Arbejdsgang
- Lav en kort plan før hver fase og vis den, før du koder.
- Tjek dit arbejde, før du kalder noget færdigt:
  - buildet kører uden fejl
  - siden er set i 375 px og 1280 px, i lys og mørk tilstand
  - der er ingen døde links
  - formlerne renderes
  - localStorage virker efter genindlæsning
