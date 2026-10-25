// Oversigten: samlet fremdrift, ét kort pr. fag og formularen til at
// tilføje et fag. Har eleven ingen fag endnu, vises en kort vejledning og
// formularen med det samme.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedMouseEvent } from 'preact';
import type { GeneriskVisning } from '../../data/pensum';
import { optael, optaelAlt, type Fag, type NytFag, type Pensum } from '../../lib/pensum';
import FagFormular from './FagFormular';
import { Fremdrift } from './Fremdrift';
import { Ikon } from './Ikon';

interface Props {
  pensum: Pensum;
  /** Læreplanerne, man kan vælge imellem, for hvert "fag/niveau" */
  laereplaner: Record<string, GeneriskVisning[]>;
  onTilfoejFag: (nyt: NytFag) => string | null;
  onVisFag: (fagId: string) => void;
}

/** Et almindeligt klik. Med ctrl, cmd eller skift skal browseren selv åbne linket. */
function almindeligtKlik(haendelse: TargetedMouseEvent<HTMLAnchorElement>): boolean {
  return (
    haendelse.button === 0 && !haendelse.ctrlKey && !haendelse.metaKey && !haendelse.shiftKey && !haendelse.altKey
  );
}

function FagKort({ fag, onVis }: { fag: Fag; onVis: (fagId: string) => void }) {
  return (
    <a
      class="pensum-kort pensum-fagkort"
      href={`#fag=${fag.id}`}
      data-fokus={`fag-${fag.id}`}
      onClick={(haendelse) => {
        if (!almindeligtKlik(haendelse)) return;
        haendelse.preventDefault();
        onVis(fag.id);
      }}
    >
      <span class="pensum-fagkort-hoved">
        <span class="pensum-fagkort-navn">
          {fag.navn} {fag.niveau}
        </span>
        <Ikon navn="pil-hoejre" />
      </span>
      {fag.forloeb.length > 0 ? (
        <Fremdrift optaelling={optael(fag.forloeb)} />
      ) : (
        <span class="pensum-svag">Ingen forløb endnu</span>
      )}
    </a>
  );
}

export default function Oversigt({ pensum, laereplaner, onTilfoejFag, onVisFag }: Props) {
  const [formularAaben, saetFormularAaben] = useState(false);
  const tilfoejKnap = useRef<HTMLButtonElement>(null);
  const lukketNu = useRef(false);

  // Lukker man formularen, kommer fokus tilbage til knappen, der åbnede den
  useEffect(() => {
    if (!formularAaben && lukketNu.current) tilfoejKnap.current?.focus();
    lukketNu.current = false;
  }, [formularAaben]);

  if (pensum.fag.length === 0) {
    return (
      <>
        <section class="pensum-kom-i-gang" aria-labelledby="pensum-kom-i-gang">
          <h2 id="pensum-kom-i-gang" tabIndex={-1} data-fokus="oversigt">
            Kom i gang
          </h2>
          <ol>
            <li>Vælg et fag og dit niveau.</li>
            <li>Skriv eller indsæt dine forløb fra undervisningsbeskrivelsen.</li>
            <li>Kryds af, efterhånden som du kan dem.</li>
          </ol>
        </section>
        <FagFormular
          overskrift="Tilføj dit første fag"
          knaptekst="Tilføj faget"
          laereplaner={laereplaner}
          onGem={onTilfoejFag}
        />
      </>
    );
  }

  const samlet = optaelAlt(pensum);

  return (
    <>
      {samlet.muligePunkter > 0 && (
        <section class="pensum-kort pensum-samlet" aria-labelledby="pensum-samlet">
          <h2 id="pensum-samlet">Samlet</h2>
          <Fremdrift optaelling={samlet} />
        </section>
      )}

      <h2 tabIndex={-1} data-fokus="oversigt">
        Dine fag
      </h2>
      <ul class="pensum-fagliste">
        {pensum.fag.map((fag) => (
          <li key={fag.id}>
            <FagKort fag={fag} onVis={onVisFag} />
          </li>
        ))}
      </ul>

      {formularAaben ? (
        <FagFormular
          overskrift="Tilføj et fag"
          knaptekst="Tilføj faget"
          laereplaner={laereplaner}
          onGem={onTilfoejFag}
          onAnnuller={() => {
            lukketNu.current = true;
            saetFormularAaben(false);
          }}
          autofokus
        />
      ) : (
        <button type="button" class="pensum-knap" ref={tilfoejKnap} onClick={() => saetFormularAaben(true)}>
          <Ikon navn="plus" />
          Tilføj fag
        </button>
      )}
    </>
  );
}
