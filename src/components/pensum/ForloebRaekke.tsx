// Ét forløb i et fag. Rækken viser status og kan foldes ud, så de faste
// punkter kan krydses af.

import { useState } from 'preact/hooks';
import { FASTE_PUNKTER, type PunktId } from '../../data/pensum';
import { STATUS_TEKST, forloebStatus, type Forloeb, type Svar } from '../../lib/pensum';
import { Afkrydsning } from './Afkrydsning';
import { Ikon, StatusIkon } from './Ikon';

interface Props {
  forloeb: Forloeb;
  onPunkt: (punkt: PunktId, svar: Svar | null) => void;
}

export default function ForloebRaekke({ forloeb, onPunkt }: Props) {
  const [aaben, saetAaben] = useState(false);
  const { status, klar, ialt } = forloebStatus(forloeb);
  const detaljerId = `pensum-forloeb-${forloeb.id}`;

  return (
    <li class="pensum-forloeb">
      <button
        type="button"
        class="pensum-forloeb-knap"
        aria-expanded={aaben}
        aria-controls={aaben ? detaljerId : undefined}
        data-fokus={`forloeb-${forloeb.id}`}
        onClick={() => saetAaben(!aaben)}
      >
        <StatusIkon status={status} />
        <span class="pensum-forloeb-tekst">
          <span class="pensum-forloeb-navn">{forloeb.navn}</span>
          <span class="pensum-svag">
            {STATUS_TEKST[status]}
            <span aria-hidden="true"> · </span>
            <span class="skjult-visuelt">, </span>
            {klar} af {ialt}
          </span>
        </span>
        <Ikon navn="pil-ned" klasse="pensum-pil" />
      </button>

      {aaben && (
        <div class="pensum-forloeb-detaljer" id={detaljerId}>
          <ul class="pensum-punkter">
            {FASTE_PUNKTER.map((punkt) => {
              const svar = forloeb.punkter[punkt.id];
              return (
                <li class="pensum-punkt" key={punkt.id}>
                  <Afkrydsning
                    tekst={punkt.tekst}
                    markeret={svar === 'ja'}
                    irrelevant={svar === 'irrelevant'}
                    onSkift={(markeret) => onPunkt(punkt.id, markeret ? 'ja' : null)}
                  />
                  {punkt.kanVaereIrrelevant && (
                    <button
                      type="button"
                      class="pensum-knap pensum-knap-lille pensum-irrelevant-knap"
                      aria-pressed={svar === 'irrelevant'}
                      onClick={() => onPunkt(punkt.id, svar === 'irrelevant' ? null : 'irrelevant')}
                    >
                      Ikke relevant
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
