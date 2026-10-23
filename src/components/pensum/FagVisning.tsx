// Ét fag: fremdrift, forløbene og feltet til at tilføje nye forløb.

import type { TargetedMouseEvent } from 'preact';
import type { PunktId } from '../../data/pensum';
import { optael, type Fag, type Svar, type Tilfoejet } from '../../lib/pensum';
import ForloebRaekke from './ForloebRaekke';
import { Fremdrift } from './Fremdrift';
import HurtigIndtastning from './HurtigIndtastning';
import { Ikon } from './Ikon';

interface Props {
  fag: Fag;
  onVisOversigt: () => void;
  onTilfoejForloeb: (navne: string[]) => Tilfoejet;
  onPunkt: (forloebId: string, punkt: PunktId, svar: Svar | null) => void;
}

export default function FagVisning({ fag, onVisOversigt, onTilfoejForloeb, onPunkt }: Props) {
  function tilbage(haendelse: TargetedMouseEvent<HTMLAnchorElement>) {
    haendelse.preventDefault();
    onVisOversigt();
  }

  return (
    <section class="pensum-fag" aria-labelledby="pensum-fag-navn">
      <a class="pensum-tilbage" href="#" onClick={tilbage}>
        <Ikon navn="pil-venstre" />
        Alle fag
      </a>
      <h2 id="pensum-fag-navn" tabIndex={-1} data-fokus="fag-overskrift">
        {fag.navn} {fag.niveau}
      </h2>

      {fag.forloeb.length > 0 && (
        <div class="pensum-kort">
          <Fremdrift optaelling={optael(fag.forloeb)} />
        </div>
      )}

      <h3>Forløb</h3>
      {fag.forloeb.length === 0 ? (
        <p class="pensum-svag">Ingen forløb endnu.</p>
      ) : (
        <ul class="pensum-forloebsliste">
          {fag.forloeb.map((forloeb) => (
            <ForloebRaekke
              key={forloeb.id}
              forloeb={forloeb}
              onPunkt={(punkt, svar) => onPunkt(forloeb.id, punkt, svar)}
            />
          ))}
        </ul>
      )}

      <HurtigIndtastning onTilfoej={onTilfoejForloeb} />
    </section>
  );
}
