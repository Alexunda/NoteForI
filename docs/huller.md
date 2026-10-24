# Huller

Begreber, som eleven skal kende, men som siden ikke forklarer, fordi ingen tilladt kilde forklarer dem (CLAUDE.md, regel 1). På siden står hvert hul i en `<Hul navn="…" />`-boks med den faste tekst "Det her forklarer siden ikke endnu. Brug dine noter, eller spørg din lærer."

`npm test` tjekker, at tabellen og boksene passer sammen (`tests/huller.test.mjs`). Kolonnen "Fil" er relativ til `src/content/emner/`. Når et hul bliver lukket, så fjern både boksen og rækken.

## Huller på siderne

| Fil | Hul | Hvorfor | Tjekket |
|---|---|---|---|
| `bioteknologi/mikrobiologi.mdx` | Hvad læreplanen mener med vækstfaktorer | Læreplanen (pkt. 2.2) nævner vækstfaktorer, men vejledningen (s. 12) siger ikke, hvad der menes. lex.dk: Vækstfaktorer handler om signalmolekyler i flercellede organismer. lex.dk: Levnedsmiddelmikrobiologi beskriver de faktorer, der styrer mikroorganismers vækst i fødevarer, men bruger ikke ordet, så det er ikke sikkert, at læreplanen mener det samme. Fødevarestyrelsen beskriver enkelte faktorer som temperatur, ilt og pH. | 24. oktober 2026 |
| `dansk/dokumentar.mdx` | Forløbsstruktur | Vejledningen (s. 16) nævner forløbsstruktur blandt de basale filmiske virkemidler uden at forklare det. lex.dk forklarer ikke ordet. Gyldendals Teaterleksikon på lex.dk forklarer berettermodellen (begrebet står på siden om medieanalyse), men det er kun én model for et forløb. Lys er forklaret med lex.dk: Lyssætning. dfi.dk er blokeret i miljøet. | 24. oktober 2026 |
| `dansk/dokumentar.mdx` | Faktakontrakt og fakta- og fiktionskoder | Vejledningen (s. 17) bruger begreberne uden at forklare dem. Hverken de officielle kilder eller lex.dk forklarer dem. | 24. oktober 2026 |
| `dansk/medieanalyse.mdx` | Forløbsstruktur, farver, linjeføring, motiver og kommunikationsforhold | Vejledningen (s. 16) nævner dem blandt de filmiske og visuelle virkemidler uden at forklare dem. lex.dk: Filmiske virkemidler nævner kun farver. lex.dk forklarer ikke forløbsstruktur, linjeføring, motiver eller kommunikationsforhold (lex.dk: Deiksis handler om kommunikationsforhold i sproget), og lex.dk: Billedanalyse forklarer ingen af de enkelte visuelle virkemidler. Gyldendals Teaterleksikon forklarer berettermodellen, som kun er én model for et forløb. Lys er forklaret med lex.dk: Lyssætning. dfi.dk er blokeret i miljøet. | 24. oktober 2026 |
| `dansk/retorik-og-argumentation.mdx` | Toulmins model, hjemmel, nodalpunkt og skræmmeargument | De tre eksamensgenrer (s. 6 og 22) nævner Toulmin som eksempel og hjemmel, nodalpunkt og skræmmeargument som analysebegreber. Hverken de officielle kilder eller lex.dk forklarer dem. lex.dk har kun en artikel om Stephen Toulmin. | 24. oktober 2026 |
| `kemi/kvalitativ-analyse.mdx` | Tollens' reagens | Et af eksemplerne på prøveopgaver til kemi B på emu.dk har Tollens' reagens som stikord. Hverken de officielle kilder eller lex.dk forklarer det. | 24. oktober 2026 |
| `samfundsfag/aktoer-og-struktur.mdx` | Subjekt–objekt og voluntarisme–determinisme brugt om aktør og struktur | Vejledningen (s. 13) nævner begrebsparrene uden at forklare dem. lex.dk forklarer subjekt, objekt, voluntarisme og determinisme i filosofisk betydning, men ikke hvordan parrene bruges om aktør og struktur. | 24. oktober 2026 |
| `samfundsfag/danmarks-udenrigspolitik.mdx` | Determinanter og tilpasningspolitik som generelt begreb | Vejledningen (s. 17) nævner determinanter og forskellige former for tilpasningspolitik uden at forklare dem. lex.dk har ingen artikel om determinanter i udenrigspolitik (søgningen giver næsten kun matematik og immunologi). Gyldendal og Politikens Danmarkshistorie på lex.dk forklarer passiv og aktiv tilpasningspolitik under besættelsen i 1940, og det bruges på siden som eksempel, men værket giver ingen generel definition. | 24. oktober 2026 |
| `samfundsfag/identitet-og-socialisering.mdx` | Dobbeltsocialisering | Vejledningen (s. 12) nævner dobbeltsocialisering uden at forklare det. lex.dk har ingen artikel om det. | 24. oktober 2026 |
| `samfundsfag/ideologier-og-partier.mdx` | Lipsets bidrag til teorien om skillelinjer | Vejledningen (s. 14) nævner Lipset og Rokkan uden at forklare teorien. lex.dk forklarer Rokkans bidrag, men artiklen om Seymour Martin Lipset nævner ikke skillelinjer. | 24. oktober 2026 |
| `samfundsfag/ideologier-og-partier.mdx` | Kaare Strøms teori om partistrategier | Vejledningen (s. 14) nævner teorien uden at forklare den. lex.dk har ingen artikel om Kaare Strøm eller teorien. | 24. oktober 2026 |
| `samfundsfag/international-politik.mdx` | Mellemstore stater | Vejledningen (s. 17) nævner mellemstore stater uden at forklare det. lex.dk har ingen artikel om mellemstore stater eller mellemmagter. (Sikkerhedspolitiske løsninger er nu forklaret med lex.dk: Sikkerhedspolitik.) | 24. oktober 2026 |
| `samfundsfag/international-politik.mdx` | Konstruktivisme som teori om international politik | Vejledningen (s. 17) nævner konstruktivisme som en teori, man kan inddrage. lex.dk forklarer konstruktivisme i den generelle betydning og giver med sikkerhedsliggørelse (københavnerskolen) et eksempel på konstruktivistisk tænkning om sikkerhed, men forklarer ikke konstruktivisme som en samlet teori om international politik. | 24. oktober 2026 |
| `samfundsfag/magt-og-demokrati.mdx` | Magt som struktur | Vejledningen (s. 14) nævner magt som struktur uden at forklare det. lex.dk forklarer det ikke. Artiklen om Steven M. Lukes dækker kun synlig og ikke synlig magt. | 24. oktober 2026 |
| `samfundsfag/magt-og-demokrati.mdx` | Konkurrencedemokrati | Vejledningen (s. 14) nævner konkurrencedemokrati uden at forklare det. lex.dk har ingen artikel om det, og artiklen om demokrati forklarer det ikke. | 24. oktober 2026 |
| `samfundsfag/social-ulighed-og-kultur.mdx` | Monokulturelt samfund og pluralistisk integration | Vejledningen (s. 12) nævner begge uden at forklare dem. lex.dk har ingen artikel om monokulturelt samfund (artiklen om kultur nævner kun et kulturelt ensartet samfund) og forklarer ikke pluralistisk integration. | 24. oktober 2026 |
| `samfundsfag/vaelgeradfaerd.mdx` | Retningsmodellen | Vejledningen (s. 14) nævner nærheds- og retningsmodellen uden at forklare dem. lex.dk: Vælgeradfærd beskriver tanken om nærhed, men ikke retningsmodellen. | 24. oktober 2026 |
| `samfundsfag/vaelgeradfaerd.mdx` | Klasseanalyse som teori om vælgeradfærd | Vejledningen (s. 14) nævner klasseanalyse som teori om den socialiserede vælger uden at forklare den. lex.dk forklarer klasser, og at klasse betyder mindre for partivalget end før, men ikke klasseanalyse som teori. | 24. oktober 2026 |

## Egne forklaringer

Redaktionen har skrevet disse forklaringer selv, fordi ingen tilladt kilde forklarer dem. Kilden hedder "Egen forklaring, godkendt af redaktionen". En ny forklaring står øverst på gennemlæsningslisten, til ejeren har godkendt den.

| Fil | Begreb | Status |
|---|---|---|
| `bioteknologi/syrer-og-baser.mdx` | Pufferligningen (udledt af formlerne for pH og styrkekonstanten) | Godkendt 24. oktober 2026 |
| `kemi/faeldningsreaktioner.mdx` | Ionligningerne for fældningen af bariumsulfat og sølvchlorid | Godkendt 24. oktober 2026 |
| `kemi/organiske-reaktionstyper.mdx` | Elimination (Eliminationsreaktion) | Godkendt 24. oktober 2026 |
| `matematik/differentialligninger.mdx` | Eulers metode (bygget på formel (254) og (313)) | Godkendt 24. oktober 2026 |
| `matematik/vektorer-i-planen.mdx` | Stedvektor | Godkendt 24. oktober 2026 |
| `matematik/vektorer-i-planen.mdx` | Vinklen mellem to linjer (bygget på formel (192)) | Godkendt 24. oktober 2026 |
| `matematik/vektorer-i-rummet.mdx` | Vinklen mellem en linje og en plan (bygget på formel (232)) | Godkendt 24. oktober 2026 |
| `matematik/vektorer-i-rummet.mdx` | Vinklen mellem to planer (bygget på formel (232)) | Godkendt 24. oktober 2026 |
