// Ét fag: fremdrift og forløb.

import type { TargetedMouseEvent } from 'preact';
import { optael, type Fag } from '../../lib/pensum';
import { Fremdrift } from './Fremdrift';
import { Ikon } from './Ikon';

interface Props {
  fag: Fag;
  onVisOversigt: () => void;
}

export default function FagVisning({ fag, onVisOversigt }: Props) {
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
      {fag.forloeb.length > 0 ? (
        <div class="pensum-kort">
          <Fremdrift optaelling={optael(fag.forloeb)} />
        </div>
      ) : (
        <p class="pensum-svag">Ingen forløb endnu.</p>
      )}
    </section>
  );
}
