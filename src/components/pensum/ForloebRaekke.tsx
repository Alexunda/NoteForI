// Ét forløb i et fag. Rækken viser status og kan foldes ud, så de faste
// punkter kan krydses af, og forløbet kan omdøbes, flyttes og slettes.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent, TargetedSubmitEvent } from 'preact';
import { FASTE_PUNKTER, type PunktId } from '../../data/pensum';
import { MAKS_NAVN, STATUS_TEKST, forloebStatus, type Forloeb, type Svar } from '../../lib/pensum';
import { Afkrydsning } from './Afkrydsning';
import { Ikon, StatusIkon } from './Ikon';

interface Props {
  forloeb: Forloeb;
  /** Forløbets plads i faget, fra 0 */
  nummer: number;
  antal: number;
  onPunkt: (punkt: PunktId, svar: Svar | null) => void;
  /** Giver en fejlbesked tilbage, hvis navnet ikke kan bruges */
  onOmdoeb: (navn: string) => string | null;
  onFlyt: (retning: -1 | 1) => void;
  onSlet: () => void;
}

export default function ForloebRaekke({ forloeb, nummer, antal, onPunkt, onOmdoeb, onFlyt, onSlet }: Props) {
  const [aaben, saetAaben] = useState(false);
  const [omdoeber, saetOmdoeber] = useState(false);
  const [udkast, saetUdkast] = useState('');
  const [fejl, saetFejl] = useState<string | null>(null);
  const navnefelt = useRef<HTMLInputElement>(null);
  const omdoebKnap = useRef<HTMLButtonElement>(null);
  const tilbageTilKnap = useRef(false);
  const { status, klar, ialt } = forloebStatus(forloeb);
  const id = `pensum-forloeb-${forloeb.id}`;
  const oeverst = nummer === 0;
  const nederst = nummer === antal - 1;

  // Feltet til det nye navn får fokus, og når det lukkes, får knappen det igen
  useEffect(() => {
    if (omdoeber) {
      navnefelt.current?.focus();
      navnefelt.current?.select();
    } else if (tilbageTilKnap.current) {
      omdoebKnap.current?.focus();
    }
    tilbageTilKnap.current = false;
  }, [omdoeber]);

  function startOmdoeb() {
    saetUdkast(forloeb.navn);
    saetFejl(null);
    saetOmdoeber(true);
  }

  function lukOmdoeb() {
    tilbageTilKnap.current = true;
    saetOmdoeber(false);
  }

  function gemNavn(haendelse: TargetedSubmitEvent<HTMLFormElement>) {
    haendelse.preventDefault();
    const besked = onOmdoeb(udkast);
    if (besked) {
      saetFejl(besked);
      navnefelt.current?.focus();
    } else {
      lukOmdoeb();
    }
  }

  function tast(haendelse: TargetedKeyboardEvent<HTMLInputElement>) {
    if (haendelse.key === 'Escape') {
      haendelse.preventDefault();
      lukOmdoeb();
    }
  }

  return (
    <li class="pensum-forloeb">
      <button
        type="button"
        class="pensum-forloeb-knap"
        aria-expanded={aaben}
        aria-controls={aaben ? id : undefined}
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
        <div class="pensum-forloeb-detaljer" id={id}>
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

          {omdoeber ? (
            <form class="pensum-omdoeb" onSubmit={gemNavn}>
              <label for={`${id}-navn`}>Nyt navn</label>
              <input
                id={`${id}-navn`}
                ref={navnefelt}
                class="pensum-input"
                type="text"
                value={udkast}
                maxLength={MAKS_NAVN}
                autocomplete="off"
                enterkeyhint="done"
                onInput={(haendelse) => {
                  saetUdkast(haendelse.currentTarget.value);
                  saetFejl(null);
                }}
                onKeyDown={tast}
              />
              <p class="pensum-fejl" role="alert">
                {fejl}
              </p>
              <div class="pensum-knapper">
                <button type="submit" class="pensum-knap pensum-knap-primaer">
                  Gem
                </button>
                <button type="button" class="pensum-knap" onClick={lukOmdoeb}>
                  Annullér
                </button>
              </div>
            </form>
          ) : (
            <div class="pensum-handlinger">
              <button
                type="button"
                class="pensum-knap"
                aria-disabled={oeverst}
                data-fokus={`forloeb-${forloeb.id}-op`}
                onClick={() => onFlyt(-1)}
              >
                <Ikon navn="op" />
                Flyt op
              </button>
              <button
                type="button"
                class="pensum-knap"
                aria-disabled={nederst}
                data-fokus={`forloeb-${forloeb.id}-ned`}
                onClick={() => onFlyt(1)}
              >
                <Ikon navn="ned" />
                Flyt ned
              </button>
              <button type="button" class="pensum-knap" ref={omdoebKnap} onClick={startOmdoeb}>
                <Ikon navn="blyant" />
                Omdøb
              </button>
              <button type="button" class="pensum-knap" onClick={onSlet}>
                <Ikon navn="skraldespand" />
                Slet
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
