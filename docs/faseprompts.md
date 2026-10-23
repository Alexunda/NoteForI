# Prompts til Claude Code: Gymnasiehjælp

## Sådan bruger du dem

- `CLAUDE.md` ligger i repoets rod og `projektplan.md` i `docs/`. Claude Code læser selv `CLAUDE.md` ved hver session, og prompterne nedenfor henviser til afsnit i projektplanen.
- Brug én prompt ad gangen, og start en ny session til hver: Claude-appen → **Code** → vælg repoet og branchen `main` → indsæt prompten. En ny session har ingen gammel kontekst med.
- Når en delopgave er færdig, pusher Claude Code sin branch og opretter en pull request. Se ændringerne i sessionen, og merge PR'en (eller skriv "merge PR'en"). Så går siden live.
- Hver prompt beder Claude Code om at vise en plan og vente. Læs planen og ret den, hvis noget er galt. Skriv først "OK, kør", når du er tilfreds.
- Fase 3 og 4 er delt i flere prompts, fordi de er for store til én session.
- Sidst i filen står nogle korte prompts, du kan bruge løbende: status, faglige fejl, feedback og gennemlæsning.

---

## Fase 1: Fundament

```
Vi starter fase 1 i docs/projektplan.md (Fundament). Læs afsnit 3, 4, 5 og 10 først.

Mål: et skelet af siden, der er færdigt og live på GitHub Pages, men uden indhold endnu.

1. Tjek, at den installerede Node-version passer til den nyeste Astro-version. Passer den ikke, så sig det, og stop.
2. Find repoets ejer og navn, fx med `git remote -v`. Er du i tvivl, så spørg mig. Opret et Astro-projekt med statisk output i roden af repoet, og sæt `site` og `base` i astro.config, så siden virker på den rigtige github.io-adresse. Alle interne links skal tage højde for base-stien.
3. Lav design tokens som CSS custom properties: farver (én accentfarve), typografi, afstande og radius. Lys og mørk tilstand skal følge systemets indstilling og have en knap til at skifte. Valget huskes i localStorage under `gh:v1:tema`, med try/catch.
4. Lav layoutet. Bundmenu på mobil og topmenu på computer med Eksamen · Fag · Værktøjer · Studieteknik. Gør plads til et søgefelt; selve søgningen kommer i fase 5.
5. Lav forsiden som beskrevet i afsnit 5:
   - "Hvad skal du i dag?" med fire kort
   - pladsen til "Næste eksamen om X dage", som kun vises, når der er datoer
   - valget af klassetrin, som gemmes lokalt
6. Lav pladsholdersider for alle ruter i afsnit 5, så navigationen virker, og der ikke er døde links.
7. Opsæt content collections med frontmatter-skemaet fra afsnit 4. Læg én eksempelfil ind, der viser mærkaten "Ikke gennemlæst endnu".
8. Opsæt udgivelse til GitHub Pages:
   - Workflowen ligger klar i docs/deploy.yml. Flyt den til .github/workflows/deploy.yml, og tjek versionerne mod README'en for withastro/action.
   - Skriv en kort liste over det, jeg selv skal gøre på github.com, fx at slå Pages til med GitHub Actions som kilde.

Før du koder, skal du vise mig en plan med filstruktur og de afhængigheder, du vil installere. Vent derefter på mit OK.
Foreslå også, hvordan du selv kan tjekke siden i 375 px og 1280 px og i lys og mørk tilstand, fx med screenshots fra Playwright som dev-afhængighed. Spørg, før du installerer noget, der ikke står i CLAUDE.md.

Fasen er færdig, når:
- `npm run build` kører uden fejl og advarsler
- du har tjekket forsiden i 375 px i lys og mørk tilstand og fortalt mig, hvad du så
- PR'en er oprettet, så jeg kan merge den og se siden live på min telefon
```

---

## Fase 2a: Pensumtjekliste

```
Vi er i fase 2 i docs/projektplan.md. Vi starter med pensumtjeklisten (afsnit 6.1), som er sidens vigtigste funktion.

Byg /vaerktoejer/pensum/ med to lag:
- Det generiske lag fyldes ud senere fra fagsiderne. Lav datastrukturen nu, så et fag kan have en liste med "det skal du kunne"-punkter, men lad den være tom.
- Det personlige lag: eleven vælger fag og niveau, opretter sine forløb og krydser de faste punkter fra afsnit 6.1 af.

Krav:
- Hurtig indtastning: eleven kan indsætte en liste, hvor hver linje bliver ét forløb.
- Forløb kan omdøbes, flyttes og slettes. Sletning kan fortrydes i nogle sekunder i stedet for at kræve en bekræftelsesdialog.
- Hvert forløb har status rød, gul eller grøn, og der vises fremdrift pr. fag og samlet. Farven må ikke være det eneste signal, så brug også tekst eller ikon.
- Alt gemmes i localStorage under `gh:v1:pensum`, og al læsning og skrivning sker i try/catch. Er storage blokeret, skal siden stadig virke uden at gemme og vise en kort besked om det.
- Siden skal kunne bruges med én hånd på en telefon, og trykflader skal være mindst 44×44 px.

Vis mig først en plan med datamodellen og skitser af skærmene beskrevet i tekst. Vent derefter på mit OK.

Fasen er færdig, når:
- jeg kan oprette fag og forløb og krydse af
- alt er der stadig efter genindlæsning
- buildet kører rent
```

## Fase 2b: Eksamensguides

```
Vi fortsætter fase 2 i docs/projektplan.md med eksamensguiderne (afsnit 6.2). Læs afsnit 7 og 8 først. Reglerne i afsnit 7 er vigtigere end at blive færdig.

Lav guiderne i denne rækkefølge:
1. /eksamen/srp/
2. /eksamen/mundtlig/
3. /eksamen/skriftlig/
4. /eksamen/eksamensdagen/
5. /eksamen/ (overblik)
6. /eksamen/sro/ og /eksamen/aarsproever/

Sådan laver du hver guide:
1. Find kilderne først:
   - prøvebekendtgørelsen på retsinformation.dk (tjek, at det er den gældende version)
   - læreplanen og vejledningen for studieretningsprojektet på uvm.dk
   - borger.dk
   Hent PDF'erne til mappen `_kilder/`, som står i .gitignore.
2. Skriv guiden efter skabelonen i 6.2: hvad der sker, hvad der bedømmes, hvordan man forbereder sig, typiske fejl og en tjekliste.
3. Hver regel får en kildehenvisning med dokument og paragraf eller side. Står noget ikke i kilderne, så skriv det ikke. Markér det i stedet som et åbent spørgsmål til mig.
4. Regler, der afhænger af den enkelte skole, fx hjælpemidler og afleveringsdatoer, skal henvise til skolens eksamensreglement og Lectio. Du må ikke gætte.
5. Sæt `verificeret: false` på alle sider.

Lav én guide ad gangen, og commit efter hver. Vis mig planen for den første guide, før du skriver.
Til sidst skal du give mig en gennemlæsningsliste: for hver side de 3–5 påstande, som er vigtigst for mig at tjekke, med kilde.
```

---

## Fase 3a: Skabelon og komponenter

```
Vi starter fase 3 i docs/projektplan.md. Først skal skabelonen og komponenterne fra afsnit 6.3 bygges. Indholdet kommer bagefter.

Byg:
1. Et layout til emnesider med sektionerne fra 6.3: Kort fortalt, Vigtige pointer, Formler, Centrale begreber, Eksamenshjørnet og Kilder.
   - Øverst vises fag, niveau, klassetrin og læreplanversion.
   - Mærkaten "Ikke gennemlæst endnu" vises, når `verificeret: false`.
2. En formelkomponent (MDX). Den viser:
   - formlen i KaTeX
   - hvad symbolerne betyder
   - hvornår formlen bruges
   - et gennemregnet eksempel
   - typiske fejl
   - en henvisning til formelsamlingen (side eller afsnit)
   Detaljerne skal kunne foldes ud og ind, så siden er til at overskue på mobilen.
3. En begrebskomponent med begreb og forklaring. Begreberne samles ved build, så de kan bruges som flashcards i fase 4.
4. En grafkomponent med skydere til emnesiderne (se "Om lommeregner og grafværktøj" i 6.4).
   - Den kan vise én eller flere forskrifter med skydere til parametrene.
   - Man kan zoome og flytte med fingre og mus.
   - Den bygges med math.js og egen canvas eller SVG, så den samme komponent kan genbruges i grafværktøjet i fase 4.
5. Fagenes overbliksside (/fag/[fag]/) og oversigten over alle fag (/fag/).

Lav én eksempelside, der tester det hele. Brug pladsholdertekst og markér den tydeligt som pladsholder, for der skal ikke rigtigt fagligt indhold på endnu.
Vis mig planen først, og vent på mit OK.

Fasen er færdig, når:
- eksempelsiden ser godt ud i 375 og 1280 px, i lys og mørk tilstand
- formlerne renderes
- grafen kan betjenes med fingrene
```

## Fase 3b: Matematik A

```
Nu skriver vi indhold til matematik A (fase 3 i docs/projektplan.md). Læs først afsnit 2 (rækken om matematik), 7 og 8.

Hold, der startede fra skoleåret 2024/25, følger 2024-læreplanen i matematik A. Alt indhold skal derfor passe til:
- læreplanen fra 2024
- vejledningen fra november 2025 (v2)
- formelsamlingen fra oktober 2025 (v2)
Hent dem fra uvm.dk til `_kilder/`.

1. Lav først en emneliste ud fra læreplanens kernestof. Den skal vise, hvilke emnesider der skal laves, i hvilken rækkefølge, og hvilket klassetrin de typisk hører til. Kan klassetrinnet ikke findes i kilderne, så skriv "ukendt". Vis mig listen, og vent på mit OK.
2. Skriv derefter én emneside ad gangen efter skabelonen. Formler skrives med formelkomponenten og henviser til siden i formelsamlingen. Brug grafkomponenten, hvor den hjælper forståelsen, fx ved eksponentiel vækst.
3. Læg mærke til, hvad vejledningen siger, at eleven skal kunne uden CAS. Skriv det i Eksamenshjørnet.
4. Alle eksempler skal være dine egne. Kopiér aldrig opgaver eller tekst fra eksamenssæt, formelsamlingen eller lærebøger. Prøvebanken kræver UNI-login, så link til den i stedet.
5. Udfyld det generiske lag i pensumtjeklisten for matematik A ud fra læreplanens faglige mål.
6. Sæt `verificeret: false` overalt, og commit efter hver emneside.

Efter hver tredje emneside skal du stoppe og give mig en gennemlæsningsliste med de vigtigste formler og påstande og deres kilde.
```

## Fase 3c: De øvrige fag (genbrugelig)

Kopiér prompten, og udfyld felterne i [klammer]. Tilføj det afsnit under "Særligt for faget", der passer til faget.

```
Nu skriver vi indhold til [FAG OG NIVEAU] (fase 3 i docs/projektplan.md). Læs først afsnit 2, 7 og 8.

1. Find læreplanen og vejledningen på uvm.dk. Tabellen i afsnit 2 viser, hvilke versioner der findes. Hent dem til `_kilder/`. Find ud af, hvilken læreplanversion der gælder for en elev, der startede i [ÅR], og skriv kilden til det ned. Er det uklart, så spørg mig.
2. Lav fagets overbliksside:
   - hvad faget handler om
   - prøveformerne på niveauet (fra læreplanen)
   - links til læreplan, vejledning og emu.dk
3. Lav en emneliste ud fra kernestoffet, vis mig den, og vent på mit OK.
4. Skriv én emneside ad gangen efter skabelonen, med kilder og `verificeret: false`. Commit efter hver.
5. Udfyld det generiske lag i pensumtjeklisten for faget ud fra de faglige mål.
6. Efter hver tredje emneside skal du stoppe og give mig en gennemlæsningsliste.

Særligt for faget:
[INDSÆT AFSNIT HERUNDER]
```

**Samfundsfag A**:
```
- Tal og statistik skal have kilde og årstal, og siden skal sige, at tallene kan være forældede. Brug officielle kilder som Danmarks Statistik.
- Politiske emner skal fremstilles neutralt. Partiers holdninger hentes fra partiernes egne programmer eller hjemmesider og skal have en dato.
- Metodeemner, fx kvantitativ metode, skal linke til grafværktøjets regression, når det bliver bygget.
```

**Dansk A**:
```
- Der findes både en læreplan fra 2017 og en fra 2026. Find ud af, hvilke årgange hver af dem gælder for, og mærk siderne med den rigtige.
- Hvor de to læreplaner er forskellige, skal siden vise det tydeligt.
- Analysemetoder og begreber forklares med dine egne eksempler. Citater fra ophavsretligt beskyttede værker skal være meget korte.
```

**Kemi og bioteknologi A**:
```
- Står kemi-niveauet stadig som ÅBENT i afsnit 2, så spørg mig, før du går i gang.
- Emner, der findes i begge fag, skrives kun én gang, og begge fag linker til dem.
- Skriv ingen forsøgsvejledninger. Om sikkerhed i laboratoriet henviser du til skolens regler og læreren.
```

---

## Fase 4a: Lommeregner og grafværktøj

```
Vi er i fase 4 i docs/projektplan.md. Vi starter med lommeregneren (/vaerktoejer/lommeregner/) og grafværktøjet (/vaerktoejer/graf/). Kravene står i afsnit 6.4.

- Genbrug grafkomponenten fra fase 3.
- Lommeregneren skal bruge decimalkomma og semikolon mellem argumenter, og det skal tydeligt fremgå, om den regner i grader eller radianer. Står skolens CAS-værktøj stadig under åbne spørgsmål i afsnit 12, så spørg mig, før du vælger skrivemåden for fx log og rødder.
- Nulpunkter, skæringspunkter, maksimum og minimum og tangent findes numerisk. Vis resultaterne med et fornuftigt antal decimaler, og markér punkterne på grafen.
- Regression: find i formelsamlingen og vejledningen til matematik A, hvilke regressionsmodeller der er kernestof, og byg præcis dem. Dataindtastningen skal kunne klare tekst indsat fra et regneark, med tabulator, semikolon og decimalkomma.
- Hvert resultat linker til den emneside, der forklarer det, hvis siden findes.
- Begge sider skal tydeligt sige, at de er øveværktøjer, og linke til skolens CAS-værktøj.

Skriv tests af fortolkningen af udtryk, fx decimalkomma, semikolon og underforstået gange som i 2x. Skriv også tests af regressionen mod tal, du har regnet ud på en anden måde. Spørg, før du tilføjer en testafhængighed.
Vis mig planen først, og vent på mit OK.

Fasen er færdig, når:
- alle tests er grønne
- begge værktøjer kan bruges med én hånd på en telefon i 375 px
```

## Fase 4b: De øvrige værktøjer

```
Vi fortsætter fase 4 i docs/projektplan.md med de øvrige værktøjer fra afsnit 6.4, i denne rækkefølge: nedtælling, timer, flashcards, karaktergennemsnit og læseplan.

- Nedtælling: eleven indtaster sine egne eksamensdatoer. Den næste vises på forsiden, i pladsen fra fase 1.
- Timer: 25/5 minutter som standard, justerbar og med valgfri lyd. Den skal tælle rigtigt, også når fanen ligger i baggrunden. Beregn derfor tiden ud fra tidsstempler og ikke ved at tælle setInterval-ticks.
- Flashcards: Leitner-system med 5 bokse. De indbyggede dæk bygges ud fra begrebskomponenterne på emnesiderne, og eleven kan lave sine egne dæk.
- Karaktergennemsnit: find i officielle kilder den gældende regel for, hvordan eksamensresultatet på STX beregnes og vægtes. Citér reglen på siden med et link, og markér resultatet som vejledende. Finder du ikke en entydig kilde, så stop og spørg mig.
- Læseplan: bygger på forløbene i pensumtjeklisten og en eksamensdato.

Alle data gemmes i localStorage under `gh:v1:...`, med try/catch overalt. Siderne skal virke, selvom storage er blokeret.
Lav ét værktøj ad gangen, og commit efter hvert. Vis mig planen for det første, og vent på mit OK.

Fasen er færdig, når:
- alle værktøjer virker efter genindlæsning
- buildet kører rent
- du har testet dem i 375 px
```

---

## Fase 5: Finpudsning

```
Vi er i fase 5 i docs/projektplan.md (Finpudsning). Tag punkterne i denne rækkefølge, og spørg mig efter hvert punkt, om vi skal fortsætte:

1. Søgning med Pagefind. Søgefeltet i menuen skal søge i alt indhold, og resultaterne skal vise fag, niveau og klassetrin.
2. Studieteknik (afsnit 6.5). Her gælder de samme regler som for andet indhold: kilder, egne eksempler og `verificeret: false`. Opgaveverberne skal bygge på, hvordan fagenes læreplaner og vejledninger bruger dem.
3. Samlet gennemgang. Kør alle tjek fra afsnit 10 på hele siden: build, 375 og 1280 px, lys og mørk tilstand, Lighthouse, døde links, formler og localStorage. Lav en liste over fundene sorteret efter, hvor alvorlige de er, før du retter noget.
4. Eksport og import. Én knap gemmer alle `gh:`-data som en JSON-fil, og én knap læser filen ind igen med tjek af versionsnummeret.
5. Offline (PWA). Kun hvis jeg siger ja. Forklar mig først kort fordele og ulemper.
6. Python-værksted (/vaerktoejer/python/). Kun hvis jeg siger ja. Pyodide og matplotlib må kun indlæses på den side, og siden skal tydeligt vise, når den er ved at indlæse.
```

---

## Løbende prompts

**Ny session, hvor står vi?**
```
Læs docs/projektplan.md og git log. Fortæl mig kort, hvilken fase vi er i, hvad der er lavet, hvad der mangler, og hvad næste skridt er. Lav ikke ændringer endnu.
```

**Faglig fejl fundet**
```
Der er en faglig fejl på [SIDE]: [BESKRIVELSE].
Find den korrekte formulering i den officielle kilde, ret siden, opdater kilden i frontmatter, og sæt `verificeret: false` igen, så jeg kan læse den igen.
Tjek også, om den samme fejl findes andre steder, fx i flashcards eller på andre emnesider.
```

**Feedback fra brugerne**
```
Her er feedback fra brugerne: [INDSÆT].
Sortér den i tre grupper: faglige fejl, brugervenlighed og ønsker. Faglige fejl rettes først, og commit-beskeden skal sige, hvad der var forkert.
Vis mig listen og din plan, før du retter noget.
```

**Gennemlæst af mig**
```
Jeg har læst disse sider igennem og godkendt dem: [SIDER]. Sæt `verificeret: true` på dem, og commit.
```
