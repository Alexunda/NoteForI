// Pensumtjeklisten (projektplan afsnit 6.1). Øen holder elevens data, gemmer
// dem under gh:v1:pensum efter hver ændring og skifter mellem oversigten og
// det enkelte fag. Faget står i adressen (#fag=…), så browserens
// tilbage-knap virker.

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { PunktId } from '../../data/pensum';
import { NOEGLER, gem, hentJson, kanGemme } from '../../lib/lager';
import {
  fagFejl,
  findFag,
  forloebStatus,
  laesPensum,
  saetPunkt,
  tilfoejFag,
  tilfoejForloeb,
  type NytFag,
  type Pensum,
  type Svar,
} from '../../lib/pensum';
import FagVisning from './FagVisning';
import Oversigt from './Oversigt';

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

export default function Pensumtjekliste() {
  const [pensum, saetPensum] = useState(() => laesPensum(hentJson(NOEGLER.pensum)));
  const [gemmer, saetGemmer] = useState(kanGemme);
  const [visning, saetVisning] = useState(fagIAdressen);
  const [besked, saetBesked] = useState({ tekst: '', nr: 0 });

  // De nyeste værdier, så en handling aldrig bygger på en gammel udgave
  const nu = useRef(pensum);
  const visningNu = useRef(visning);
  const fokus = useRef<Fokus | null>(null);
  const rod = useRef<HTMLDivElement>(null);
  const grundtitel = useRef(document.title);

  const aktivtFag = visning === null ? undefined : findFag(pensum, visning);

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
    // Kom man fra oversigten, går man tilbage dertil, så historikken ikke vokser
    if ((history.state as { pensumFraOversigt?: boolean } | null)?.pensumFraOversigt) {
      history.back();
    } else {
      history.pushState(null, '', location.pathname + location.search);
      skiftVisning(null);
    }
  }

  /** Gemmer nye data. Vil browseren ikke gemme, virker siden videre uden. */
  function aendr(ny: Pensum) {
    if (ny === nu.current) return;
    nu.current = ny;
    saetPensum(ny);
    if (!gem(NOEGLER.pensum, JSON.stringify(ny))) saetGemmer(false);
  }

  /** En kort besked til skærmlæsere */
  function meddel(tekst: string) {
    saetBesked((forrige) => ({ tekst, nr: forrige.nr + 1 }));
  }

  function haandterTilfoejFag(nyt: NytFag): string | null {
    const fejl = fagFejl(nu.current, nyt);
    if (fejl) return fejl;
    const { pensum: ny, fag } = tilfoejFag(nu.current, nyt);
    aendr(ny);
    visFag(fag.id);
    fokus.current = { maal: ['hurtig-tekst', 'fag-overskrift'], rul: true };
    meddel(`${fag.navn} ${fag.niveau} er tilføjet.`);
    return null;
  }

  function haandterTilfoejForloeb(fagId: string, navne: string[]) {
    const resultat = tilfoejForloeb(nu.current, fagId, navne);
    aendr(resultat.pensum);
    return resultat;
  }

  function haandterPunkt(fagId: string, forloebId: string, punkt: PunktId, svar: Svar | null) {
    const foer = findFag(nu.current, fagId)?.forloeb.find((f) => f.id === forloebId);
    aendr(saetPunkt(nu.current, fagId, forloebId, punkt, svar));
    const efter = findFag(nu.current, fagId)?.forloeb.find((f) => f.id === forloebId);
    if (foer && efter && forloebStatus(foer).status !== 'groen' && forloebStatus(efter).status === 'groen') {
      meddel(`${efter.navn} er klar.`);
    }
  }

  return (
    <div class="pensum" ref={rod}>
      {!gemmer && <p class="pensum-advarsel">Din browser gemmer ikke data fra siden.</p>}

      {aktivtFag ? (
        <FagVisning
          key={aktivtFag.id}
          fag={aktivtFag}
          onVisOversigt={visOversigt}
          onTilfoejForloeb={(navne) => haandterTilfoejForloeb(aktivtFag.id, navne)}
          onPunkt={(forloebId, punkt, svar) => haandterPunkt(aktivtFag.id, forloebId, punkt, svar)}
        />
      ) : (
        <Oversigt pensum={pensum} onTilfoejFag={haandterTilfoejFag} onVisFag={visFag} />
      )}

      <p class="skjult-visuelt" role="status">
        <span key={besked.nr}>{besked.tekst}</span>
      </p>
    </div>
  );
}
