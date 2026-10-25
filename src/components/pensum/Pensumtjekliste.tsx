// Pensumtjeklisten (projektplan afsnit 6.1). Øen holder elevens data, gemmer
// dem under gh:v2:pensum efter hver ændring og skifter mellem oversigten og
// det enkelte fag. Faget står i adressen (#fag=…), så browserens
// tilbage-knap virker.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { GeneriskVisning, PunktId } from '../../data/pensum';
import { laereplanValg } from '../../lib/generisk-pensum';
import { NOEGLER, gem, hentJson, hentPensum, kanGemme } from '../../lib/lager';
import {
  fagFejl,
  findFag,
  fjernForloeb,
  flytForloeb,
  forloebFejl,
  forloebStatus,
  genindsaetFag,
  genindsaetForloeb,
  laesPensum,
  omdoebForloeb,
  rensNavn,
  retFag,
  saetGeneriskPunkt,
  saetPunkt,
  sletFag,
  sletForloeb,
  tilfoejFag,
  tilfoejForloeb,
  vaelgLaereplan,
  type NytFag,
  type Pensum,
  type Svar,
} from '../../lib/pensum';
import FagVisning from './FagVisning';
import Fortryd, { type FortrydInfo } from './Fortryd';
import { Ikon } from './Ikon';
import Oversigt from './Oversigt';

interface Props {
  /** Det generiske lag. Det er tjekket ved build. */
  generisk: GeneriskVisning[];
}

/** Det fag, adressen peger på, eller null for oversigten */
function fagIAdressen(): string | null {
  return /^#fag=([0-9a-z]+)$/.exec(location.hash)?.[1] ?? null;
}

interface Fokus {
  /** data-fokus på de elementer, der kan få fokus. Det første, der findes, får det. */
  maal: string[];
  /** Rul op til toppen af tjeklisten først (ved skift af visning) */
  rul?: boolean;
}

export default function Pensumtjekliste({ generisk }: Props) {
  // Data fra gh:v1:pensum flyttes til gh:v2:pensum første gang (src/lib/lager.ts)
  const [pensum, saetPensum] = useState(() => laesPensum(hentPensum((raa) => laesPensum(raa))));
  const [gemmer, saetGemmer] = useState(kanGemme);
  const [visning, saetVisning] = useState(fagIAdressen);
  const [fortryd, saetFortryd] = useState<FortrydInfo | null>(null);
  const [besked, saetBesked] = useState({ tekst: '', nr: 0 });

  // De nyeste værdier, så en handling aldrig bygger på en gammel udgave
  const nu = useRef(pensum);
  const visningNu = useRef(visning);
  const fokus = useRef<Fokus | null>(null);
  const fortrydNr = useRef(0);
  const rod = useRef<HTMLDivElement>(null);
  const grundtitel = useRef(document.title);

  const aktivtFag = visning === null ? undefined : findFag(pensum, visning);
  const laereplaner = useMemo(() => laereplanValg(generisk), [generisk]);
  // Har faget lister til flere læreplaner, vises kun den, eleven har valgt.
  // Har eleven ikke valgt endnu (fx data fra version 1), vælger eleven først.
  const valgmuligheder = aktivtFag ? (laereplaner[`${aktivtFag.fagside}/${aktivtFag.niveau}`] ?? []) : [];
  const aktiveLister =
    valgmuligheder.length > 0
      ? valgmuligheder.filter((liste) => liste.laereplan === aktivtFag?.laereplan)
      : generisk.filter((liste) => liste.fag === aktivtFag?.fagside && liste.niveau === aktivtFag.niveau);

  // Flytter fokus efter en ændring, fx til overskriften, når et fag åbnes
  useLayoutEffect(() => {
    const opgave = fokus.current;
    if (!opgave || !rod.current) return;
    fokus.current = null;
    for (const maal of opgave.maal) {
      const element = rod.current.querySelector<HTMLElement>(`[data-fokus="${maal}"]`);
      if (!element) continue;
      if (opgave.rul) rod.current.scrollIntoView({ block: 'start' });
      element.focus({ preventScroll: opgave.rul });
      return;
    }
  });

  // Ændrer eleven tjeklisten i en anden fane, opdateres denne fane også
  useEffect(() => {
    function opdater(haendelse: StorageEvent) {
      if (haendelse.key !== NOEGLER.pensum && haendelse.key !== null) return;
      const ny = laesPensum(hentJson(NOEGLER.pensum));
      nu.current = ny;
      saetPensum(ny);
    }
    addEventListener('storage', opdater);
    return () => removeEventListener('storage', opdater);
  }, []);

  // Tilbage- og frem-knappen i browseren
  useEffect(() => {
    function opdater() {
      // Andre adresser i siden, fx #indhold fra "Spring til indhold", skifter ikke visning
      if (location.hash !== '' && !location.hash.startsWith('#fag=')) return;
      skiftVisning(fagIAdressen());
    }
    addEventListener('popstate', opdater);
    addEventListener('hashchange', opdater);
    return () => {
      removeEventListener('popstate', opdater);
      removeEventListener('hashchange', opdater);
    };
  }, []);

  // Peger adressen på et fag, der ikke findes (mere), vises oversigten
  useEffect(() => {
    if (visning !== null && !aktivtFag) {
      history.replaceState(null, '', location.pathname + location.search);
      visningNu.current = null;
      saetVisning(null);
    }
  }, [visning, aktivtFag]);

  useEffect(() => {
    document.title = aktivtFag ? `${aktivtFag.navn} ${aktivtFag.niveau} · ${grundtitel.current}` : grundtitel.current;
  }, [aktivtFag?.navn, aktivtFag?.niveau]);

  /* ---------- Visning ---------- */

  function skiftVisning(ny: string | null) {
    const forrige = visningNu.current;
    if (ny === forrige) return;
    visningNu.current = ny;
    saetVisning(ny);
    fokus.current =
      ny === null
        ? { maal: forrige === null ? ['oversigt'] : [`fag-${forrige}`, 'oversigt'] }
        : { maal: ['fag-overskrift'], rul: true };
  }

  function visFag(fagId: string) {
    history.pushState({ pensumFraOversigt: true }, '', `#fag=${fagId}`);
    skiftVisning(fagId);
  }

  function visOversigt() {
    const fraOversigt = (history.state as { pensumFraOversigt?: boolean } | null)?.pensumFraOversigt;
    skiftVisning(null);
    // Kom man fra oversigten, går man tilbage dertil, så historikken ikke vokser
    if (fraOversigt) history.back();
    else history.pushState(null, '', location.pathname + location.search);
  }

  /* ---------- Data ---------- */

  /**
   * Gemmer nye data. Vil browseren ikke gemme, virker siden videre uden, og
   * beskeden øverst vises. Lykkes det senere, forsvinder beskeden igen.
   */
  function aendr(ny: Pensum) {
    if (ny === nu.current) return;
    nu.current = ny;
    saetPensum(ny);
    saetGemmer(gem(NOEGLER.pensum, JSON.stringify(ny)));
  }

  /** En kort besked til skærmlæsere */
  function meddel(tekst: string) {
    saetBesked((forrige) => ({ tekst, nr: forrige.nr + 1 }));
  }

  /** Viser bjælken, så handlingen kan fortrydes. En ny handling erstatter den forrige. */
  function kanFortrydes(tekst: string, handling: () => void) {
    fortrydNr.current++;
    saetFortryd({ nr: fortrydNr.current, besked: tekst, fortryd: handling });
  }

  function forloebINu(fagId: string, forloebId: string) {
    return findFag(nu.current, fagId)?.forloeb.find((forloeb) => forloeb.id === forloebId);
  }

  /* ---------- Fag ---------- */

  function tilfoejNytFag(nyt: NytFag): string | null {
    const fejl = fagFejl(nu.current, nyt);
    if (fejl) return fejl;
    const { pensum: ny, fag } = tilfoejFag(nu.current, nyt);
    aendr(ny);
    visFag(fag.id);
    fokus.current = { maal: ['hurtig-tekst', 'fag-overskrift'], rul: true };
    meddel(`${fag.navn} ${fag.niveau} er tilføjet.`);
    return null;
  }

  function retAktivtFag(fagId: string, nyt: NytFag): string | null {
    const fejl = fagFejl(nu.current, nyt, fagId);
    if (fejl) return fejl;
    aendr(retFag(nu.current, fagId, nyt));
    meddel('Ændringerne er gemt.');
    return null;
  }

  function sletAktivtFag(fagId: string) {
    const { pensum: ny, slettet } = sletFag(nu.current, fagId);
    if (!slettet) return;
    aendr(ny);
    visOversigt();

    const { fag } = slettet;
    const antal = fag.forloeb.length;
    const navn = `${fag.navn} ${fag.niveau}`;
    kanFortrydes(antal > 0 ? `${navn} og ${antal} forløb er slettet.` : `${navn} er slettet.`, () => {
      aendr(genindsaetFag(nu.current, slettet));
      fokus.current = { maal: [`fag-${fag.id}`] };
      meddel(`${navn} er tilbage.`);
    });
  }

  /* ---------- Forløb ---------- */

  function tilfoejNyeForloeb(fagId: string, navne: string[]) {
    const resultat = tilfoejForloeb(nu.current, fagId, navne);
    aendr(resultat.pensum);
    if (resultat.nye.length > 1) {
      const ider = resultat.nye.map((forloeb) => forloeb.id);
      kanFortrydes(`${resultat.nye.length} forløb er tilføjet.`, () => {
        aendr(fjernForloeb(nu.current, fagId, ider));
        fokus.current = { maal: ['hurtig-tekst'] };
        meddel('De nye forløb er fjernet igen.');
      });
    }
    return resultat;
  }

  function saetForloebPunkt(fagId: string, forloebId: string, punkt: PunktId, svar: Svar | null) {
    const foer = forloebINu(fagId, forloebId);
    aendr(saetPunkt(nu.current, fagId, forloebId, punkt, svar));
    const efter = forloebINu(fagId, forloebId);
    if (foer && efter && forloebStatus(foer).status !== 'groen' && forloebStatus(efter).status === 'groen') {
      meddel(`${efter.navn} er klar.`);
    }
  }

  function omdoeb(fagId: string, forloebId: string, navn: string): string | null {
    const fag = findFag(nu.current, fagId);
    if (!fag) return null;
    const fejl = forloebFejl(fag, navn, forloebId);
    if (fejl) return fejl;
    aendr(omdoebForloeb(nu.current, fagId, forloebId, navn));
    meddel(`Omdøbt til ${rensNavn(navn)}.`);
    return null;
  }

  function flyt(fagId: string, forloebId: string, retning: -1 | 1) {
    const ny = flytForloeb(nu.current, fagId, forloebId, retning);
    if (ny === nu.current) {
      meddel(retning < 0 ? 'Forløbet står allerede øverst.' : 'Forløbet står allerede nederst.');
      return;
    }
    aendr(ny);
    const liste = findFag(ny, fagId)?.forloeb ?? [];
    const plads = liste.findIndex((forloeb) => forloeb.id === forloebId) + 1;
    // Fokus bliver på knappen, så man kan trykke flere gange i træk
    fokus.current = { maal: [`forloeb-${forloebId}-${retning < 0 ? 'op' : 'ned'}`] };
    meddel(`Flyttet ${retning < 0 ? 'op' : 'ned'}. Nu nummer ${plads} af ${liste.length}.`);
  }

  function sletEtForloeb(fagId: string, forloebId: string) {
    const liste = findFag(nu.current, fagId)?.forloeb ?? [];
    const plads = liste.findIndex((forloeb) => forloeb.id === forloebId);
    const { pensum: ny, slettet } = sletForloeb(nu.current, fagId, forloebId);
    if (!slettet) return;
    aendr(ny);
    // Fokus går til det næste forløb, ellers det forrige, ellers feltet til nye forløb
    const naboer = [liste[plads + 1], liste[plads - 1]].filter((forloeb) => forloeb !== undefined);
    fokus.current = { maal: [...naboer.map((forloeb) => `forloeb-${forloeb.id}`), 'hurtig-tekst'] };

    const { forloeb } = slettet;
    kanFortrydes(`${forloeb.navn} er slettet.`, () => {
      aendr(genindsaetForloeb(nu.current, slettet));
      fokus.current = { maal: [`forloeb-${forloeb.id}`] };
      meddel(`${forloeb.navn} er tilbage.`);
    });
  }

  return (
    <div class="pensum" ref={rod}>
      {!gemmer && (
        <p class="pensum-advarsel" role="alert">
          <Ikon navn="advarsel" />
          <span>
            Din browser vil ikke gemme lige nu. Du kan godt bruge tjeklisten, men dine ændringer er væk, næste gang du
            åbner siden.
          </span>
        </p>
      )}

      {aktivtFag ? (
        <FagVisning
          key={aktivtFag.id}
          fag={aktivtFag}
          generisk={aktiveLister}
          laereplanValg={valgmuligheder}
          laereplaner={laereplaner}
          onVaelgLaereplan={(laereplan) => {
            aendr(vaelgLaereplan(nu.current, aktivtFag.id, laereplan));
            meddel(`Læreplanen fra ${laereplan} er valgt.`);
          }}
          onVisOversigt={visOversigt}
          onTilfoejForloeb={(navne) => tilfoejNyeForloeb(aktivtFag.id, navne)}
          onPunkt={(forloebId, punkt, svar) => saetForloebPunkt(aktivtFag.id, forloebId, punkt, svar)}
          onOmdoeb={(forloebId, navn) => omdoeb(aktivtFag.id, forloebId, navn)}
          onFlyt={(forloebId, retning) => flyt(aktivtFag.id, forloebId, retning)}
          onSletForloeb={(forloebId) => sletEtForloeb(aktivtFag.id, forloebId)}
          onGeneriskPunkt={(punktId, krydset) => aendr(saetGeneriskPunkt(nu.current, aktivtFag.id, punktId, krydset))}
          onRetFag={(nyt) => retAktivtFag(aktivtFag.id, nyt)}
          onSletFag={() => sletAktivtFag(aktivtFag.id)}
        />
      ) : (
        <Oversigt pensum={pensum} laereplaner={laereplaner} onTilfoejFag={tilfoejNytFag} onVisFag={visFag} />
      )}

      <p class="skjult-visuelt" role="status">
        <span key={besked.nr}>{besked.tekst}</span>
      </p>

      <Fortryd
        info={fortryd}
        onFortryd={() => {
          fortryd?.fortryd();
          saetFortryd(null);
        }}
        onLuk={() => saetFortryd(null)}
      />
    </div>
  );
}
