// Formularen til at tilføje et fag eller rette navn, niveau og læreplan. Fag,
// niveau og læreplan vælges med store knapper, så det er let at ramme med
// tommelfingeren. Læreplanen skal kun vælges, når faget og niveauet har
// lister til flere læreplaner, fx dansk A.

import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { TargetedSubmitEvent } from 'preact';
import { FAG_IDER, FAG_NAVNE, type FagId } from '../../data/fag';
import { NIVEAUER, type GeneriskVisning, type Niveau } from '../../data/pensum';
import { MAKS_NAVN, rensNavn, type NytFag } from '../../lib/pensum';

type Valg = FagId | 'andet';

const VALG: Valg[] = [...FAG_IDER, 'andet'];

interface Props {
  overskrift: string;
  knaptekst: string;
  /** Fagets nuværende data, når faget rettes */
  start?: NytFag;
  /** Læreplanerne, man kan vælge imellem, for hvert "fag/niveau" (laereplanValg) */
  laereplaner: Record<string, GeneriskVisning[]>;
  /** Giver en fejlbesked tilbage, hvis faget ikke kunne gemmes */
  onGem: (nyt: NytFag) => string | null;
  onAnnuller?: () => void;
  /** Flyt fokus til formularen, når den vises (når eleven selv har åbnet den) */
  autofokus?: boolean;
}

/** Skriver eleven navnet på et af sidens fag under "Andet fag", bruges sidens fag. */
function findKendtFag(navn: string): FagId | null {
  const soeg = rensNavn(navn).toLocaleLowerCase('da');
  return FAG_IDER.find((fag) => FAG_NAVNE[fag].toLocaleLowerCase('da') === soeg) ?? null;
}

export default function FagFormular({ overskrift, knaptekst, start, laereplaner, onGem, onAnnuller, autofokus }: Props) {
  const id = useId();
  const [valg, saetValg] = useState<Valg | null>(start ? (start.fagside ?? 'andet') : null);
  const [andetNavn, saetAndetNavn] = useState(start && start.fagside === null ? start.navn : '');
  const [niveau, saetNiveau] = useState<Niveau | null>(start?.niveau ?? null);
  const [laereplan, saetLaereplan] = useState<string | null>(start?.laereplan ?? null);
  const [fejl, saetFejl] = useState<string | null>(null);
  const formular = useRef<HTMLFormElement>(null);
  const navnefelt = useRef<HTMLInputElement>(null);
  const valgtAndetNu = useRef(false);

  useEffect(() => {
    if (!autofokus) return;
    const valgt = formular.current?.querySelector<HTMLElement>(`input[name="${id}-fag"]:checked`);
    (valgt ?? formular.current?.querySelector<HTMLElement>(`input[name="${id}-fag"]`))?.focus();
  }, []);

  // Vælger man "Andet fag", står markøren klar i feltet til navnet
  useEffect(() => {
    if (valg === 'andet' && valgtAndetNu.current) navnefelt.current?.focus();
    valgtAndetNu.current = false;
  }, [valg]);

  function vis(besked: string, felt: string) {
    saetFejl(besked);
    formular.current?.querySelector<HTMLElement>(felt)?.focus();
  }

  function gem(haendelse: TargetedSubmitEvent<HTMLFormElement>) {
    haendelse.preventDefault();
    if (valg === null) return vis('Vælg et fag.', `input[name="${id}-fag"]`);
    if (valg === 'andet' && rensNavn(andetNavn) === '') return vis('Skriv navnet på faget.', `#${CSS.escape(id)}-navn`);
    if (niveau === null) return vis('Vælg et niveau.', `input[name="${id}-niveau"]`);

    const fagside = valg === 'andet' ? findKendtFag(andetNavn) : valg;
    const navn = fagside ? FAG_NAVNE[fagside] : andetNavn;
    const muligheder = fagside ? laereplaner[`${fagside}/${niveau}`] : undefined;
    const valgtPlan = muligheder?.some((liste) => liste.laereplan === laereplan) ? laereplan : null;
    if (muligheder && valgtPlan === null) return vis('Vælg din læreplan.', `input[name="${id}-laereplan"]`);
    const besked = onGem({ fagside, navn, niveau, laereplan: valgtPlan });
    if (besked) vis(besked, `input[name="${id}-fag"]:checked`);
  }

  return (
    <form class="pensum-kort pensum-formular" ref={formular} onSubmit={gem} noValidate>
      <h3 class="pensum-formular-overskrift">{overskrift}</h3>

      <fieldset class="pensum-felt">
        <legend>Fag</legend>
        <div class="pensum-chips">
          {VALG.map((v) => (
            <label class="pensum-chip" key={v}>
              <input
                type="radio"
                name={`${id}-fag`}
                value={v}
                checked={valg === v}
                onChange={() => {
                  valgtAndetNu.current = v === 'andet';
                  saetValg(v);
                  saetFejl(null);
                }}
              />
              <span>{v === 'andet' ? 'Andet fag' : FAG_NAVNE[v]}</span>
            </label>
          ))}
        </div>
        {valg === 'andet' && (
          <div class="pensum-tekstfelt">
            <label for={`${id}-navn`}>Hvilket fag?</label>
            <input
              id={`${id}-navn`}
              ref={navnefelt}
              class="pensum-input"
              type="text"
              value={andetNavn}
              maxLength={MAKS_NAVN}
              placeholder="Fx Historie"
              autocomplete="off"
              onInput={(e) => {
                saetAndetNavn(e.currentTarget.value);
                saetFejl(null);
              }}
            />
          </div>
        )}
      </fieldset>

      <fieldset class="pensum-felt">
        <legend>Niveau</legend>
        <div class="pensum-chips pensum-chips-niveau">
          {NIVEAUER.map((n) => (
            <label class="pensum-chip" key={n}>
              <input
                type="radio"
                name={`${id}-niveau`}
                value={n}
                checked={niveau === n}
                onChange={() => {
                  saetNiveau(n);
                  saetFejl(null);
                }}
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {valg !== null && valg !== 'andet' && niveau !== null && laereplaner[`${valg}/${niveau}`] && (
        <fieldset class="pensum-felt">
          <legend>Læreplan</legend>
          <div class="pensum-chips pensum-chips-niveau">
            {laereplaner[`${valg}/${niveau}`].map((liste) => (
              <label class="pensum-chip" key={liste.laereplan}>
                <input
                  type="radio"
                  name={`${id}-laereplan`}
                  value={liste.laereplan}
                  checked={laereplan === liste.laereplan}
                  onChange={() => {
                    saetLaereplan(liste.laereplan);
                    saetFejl(null);
                  }}
                />
                <span>{liste.laereplan}</span>
              </label>
            ))}
          </div>
          <ul class="pensum-laereplan-hjaelp">
            {laereplaner[`${valg}/${niveau}`].map((liste) => (
              <li key={liste.laereplan}>
                <strong>{liste.laereplan}:</strong> {liste.gaelder}
              </li>
            ))}
            <li>Spørg din lærer, hvis du er i tvivl.</li>
          </ul>
        </fieldset>
      )}

      <p class="pensum-fejl" role="alert">
        {fejl}
      </p>

      <div class="pensum-knapper">
        <button type="submit" class="pensum-knap pensum-knap-primaer">
          {knaptekst}
        </button>
        {onAnnuller && (
          <button type="button" class="pensum-knap" onClick={onAnnuller}>
            Annullér
          </button>
        )}
      </div>
    </form>
  );
}
