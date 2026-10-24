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
  /** Det generiske lag til fagets fag, niveau og læreplan */
  generisk: GeneriskVisning[];
  /**
   * Alle lister til fagets fag og niveau, når der er flere læreplaner at
   * vælge imellem (fx dansk A). Ellers tom.
   */
  laereplanValg: GeneriskVisning[];
  /** Læreplanerne til formularen, når faget rettes */
  laereplaner: Record<string, GeneriskVisning[]>;
  onVaelgLaereplan: (laereplan: string) => void;
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
  laereplanValg,
  laereplaner,
  onVaelgLaereplan,
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

      {laereplanValg.length > 0 && generisk.length === 0 && (
        <section class="pensum-kort pensum-vaelg-laereplan" aria-labelledby="pensum-vaelg-laereplan">
          <h3 id="pensum-vaelg-laereplan">Hvilken læreplan følger dit hold?</h3>
          <p>Vælg den, så du får den rigtige liste over det, du skal kunne. Dine krydser bliver, hvor de er.</p>
          <ul class="pensum-laereplan-hjaelp">
            {laereplanValg.map((liste) => (
              <li key={liste.laereplan}>
                <strong>{liste.laereplan}:</strong> {liste.gaelder}
              </li>
            ))}
            <li>Spørg din lærer, hvis du er i tvivl.</li>
          </ul>
          <div class="pensum-knapper">
            {laereplanValg.map((liste) => (
              <button
                type="button"
                class="pensum-knap"
                key={liste.laereplan}
                onClick={() => onVaelgLaereplan(liste.laereplan)}
              >
                Læreplan {liste.laereplan}
              </button>
            ))}
          </div>
        </section>
      )}

      {generisk.map((liste) => (
        <GeneriskListe
          key={liste.laereplan}
          liste={liste}
          medAarstal={laereplanValg.length > 0}
          afkrydsede={fag.generisk}
          onKryds={onGeneriskPunkt}
        />
      ))}

      <div class="pensum-fag-handlinger">
        {retter ? (
          <FagFormular
            overskrift="Ret faget"
            knaptekst="Gem"
            start={{ fagside: fag.fagside, navn: fag.navn, niveau: fag.niveau, laereplan: fag.laereplan }}
            laereplaner={laereplaner}
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
