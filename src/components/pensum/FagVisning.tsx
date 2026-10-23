// Ét fag: fremdrift, forløbene, feltet til nye forløb og knapperne til at
// rette eller slette faget.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedMouseEvent } from 'preact';
import type { GeneriskVisning, PunktId } from '../../data/pensum';
import { optael, type Fag, type NytFag, type Svar, type Tilfoejet } from '../../lib/pensum';
import FagFormular from './FagFormular';
import ForloebRaekke from './ForloebRaekke';
import { Fremdrift } from './Fremdrift';
import GeneriskListe from './GeneriskListe';
import HurtigIndtastning from './HurtigIndtastning';
import { Ikon } from './Ikon';

interface Props {
  fag: Fag;
  /** Det generiske lag til fagets fag og niveau. Tomt, indtil listerne er skrevet. */
  generisk: GeneriskVisning[];
  onVisOversigt: () => void;
  onTilfoejForloeb: (navne: string[]) => Tilfoejet;
  onPunkt: (forloebId: string, punkt: PunktId, svar: Svar | null) => void;
  onOmdoeb: (forloebId: string, navn: string) => string | null;
  onFlyt: (forloebId: string, retning: -1 | 1) => void;
  onSletForloeb: (forloebId: string) => void;
  onGeneriskPunkt: (punktId: string, krydset: boolean) => void;
  onRetFag: (nyt: NytFag) => string | null;
  onSletFag: () => void;
}

export default function FagVisning({
  fag,
  generisk,
  onVisOversigt,
  onTilfoejForloeb,
  onPunkt,
  onOmdoeb,
  onFlyt,
  onSletForloeb,
  onGeneriskPunkt,
  onRetFag,
  onSletFag,
}: Props) {
  const [retter, saetRetter] = useState(false);
  const retKnap = useRef<HTMLButtonElement>(null);
  const lukketNu = useRef(false);

  // Lukker man formularen, kommer fokus tilbage til knappen, der åbnede den
  useEffect(() => {
    if (!retter && lukketNu.current) retKnap.current?.focus();
    lukketNu.current = false;
  }, [retter]);

  function lukFormular() {
    lukketNu.current = true;
    saetRetter(false);
  }

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
          {fag.forloeb.map((forloeb, nummer) => (
            <ForloebRaekke
              key={forloeb.id}
              forloeb={forloeb}
              nummer={nummer}
              antal={fag.forloeb.length}
              onPunkt={(punkt, svar) => onPunkt(forloeb.id, punkt, svar)}
              onOmdoeb={(navn) => onOmdoeb(forloeb.id, navn)}
              onFlyt={(retning) => onFlyt(forloeb.id, retning)}
              onSlet={() => onSletForloeb(forloeb.id)}
            />
          ))}
        </ul>
      )}

      <HurtigIndtastning onTilfoej={onTilfoejForloeb} />

      {generisk.map((liste) => (
        <GeneriskListe
          key={liste.laereplan}
          liste={liste}
          medAarstal={generisk.length > 1}
          afkrydsede={fag.generisk}
          onKryds={onGeneriskPunkt}
        />
      ))}

      <div class="pensum-fag-handlinger">
        {retter ? (
          <FagFormular
            overskrift="Ret faget"
            knaptekst="Gem"
            start={{ fagside: fag.fagside, navn: fag.navn, niveau: fag.niveau }}
            onGem={(nyt) => {
              const besked = onRetFag(nyt);
              if (!besked) lukFormular();
              return besked;
            }}
            onAnnuller={lukFormular}
            autofokus
          />
        ) : (
          <div class="pensum-knapper">
            <button type="button" class="pensum-knap" ref={retKnap} onClick={() => saetRetter(true)}>
              <Ikon navn="blyant" />
              Ret faget
            </button>
            <button type="button" class="pensum-knap" onClick={onSletFag}>
              <Ikon navn="skraldespand" />
              Slet faget
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
