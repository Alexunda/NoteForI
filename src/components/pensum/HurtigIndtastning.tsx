// Hurtig indtastning af forløb. Enter tilføjer det, der står i feltet, og
// en indsat liste bliver til ét forløb pr. linje.

import { useId, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent, TargetedSubmitEvent } from 'preact';
import { MAKS_LINJER, delLinjer, type Tilfoejet } from '../../lib/pensum';

interface Props {
  onTilfoej: (navne: string[]) => Tilfoejet;
}

interface Besked {
  tekst: string;
  fejl: boolean;
}

/** Hvad der skete med de linjer, der ikke kom med */
function sprungetOver({ dubletter, forMange }: Tilfoejet): string[] {
  const dele: string[] = [];
  if (dubletter === 1) dele.push('Ét forløb stod der allerede, så det kom ikke med igen.');
  if (dubletter > 1) dele.push(`${dubletter} forløb stod der allerede, så de kom ikke med igen.`);
  if (forMange > 0) dele.push(`Du kan højst tilføje ${MAKS_LINJER} ad gangen, så ${forMange} kom ikke med.`);
  return dele;
}

export default function HurtigIndtastning({ onTilfoej }: Props) {
  const id = useId();
  const [tekst, saetTekst] = useState('');
  const [besked, saetBesked] = useState<Besked | null>(null);
  const felt = useRef<HTMLTextAreaElement>(null);
  const knap = useRef<HTMLButtonElement>(null);
  const navne = delLinjer(tekst);
  const linjer = tekst.split('\n').length;

  function tilfoej() {
    if (navne.length === 0) {
      saetBesked({ tekst: 'Skriv navnet på et forløb.', fejl: true });
      felt.current?.focus();
      return;
    }

    const resultat = onTilfoej(navne);
    if (resultat.nye.length === 0) {
      const fejltekst = navne.length === 1 ? 'Det forløb står der allerede.' : 'Alle forløbene står der allerede.';
      saetBesked({ tekst: fejltekst, fejl: true });
      felt.current?.focus();
      return;
    }

    saetTekst('');
    const foerst =
      resultat.nye.length === 1 ? `${resultat.nye[0].navn} er tilføjet.` : `${resultat.nye.length} forløb er tilføjet.`;
    saetBesked({ tekst: [foerst, ...sprungetOver(resultat)].join(' '), fejl: false });
    // Efter en hel liste lukkes tastaturet på telefonen, så man kan se forløbene.
    // Efter ét forløb står markøren klar til det næste.
    if (resultat.nye.length > 1) knap.current?.focus();
    else felt.current?.focus();
  }

  function indsend(haendelse: TargetedSubmitEvent<HTMLFormElement>) {
    haendelse.preventDefault();
    tilfoej();
  }

  function tast(haendelse: TargetedKeyboardEvent<HTMLTextAreaElement>) {
    // Enter tilføjer. Skift+Enter giver en ny linje.
    if (haendelse.key === 'Enter' && !haendelse.shiftKey && !haendelse.isComposing) {
      haendelse.preventDefault();
      tilfoej();
    }
  }

  return (
    <form class="pensum-hurtig" onSubmit={indsend}>
      <h3>
        <label for={`${id}-tekst`}>Tilføj forløb</label>
      </h3>
      <p class="pensum-svag" id={`${id}-hjaelp`}>
        Skriv ét forløb, eller indsæt en liste fra undervisningsbeskrivelsen. Hver linje bliver ét forløb.
      </p>
      <textarea
        id={`${id}-tekst`}
        ref={felt}
        class="pensum-input pensum-hurtig-felt"
        rows={Math.min(8, Math.max(2, linjer))}
        value={tekst}
        placeholder="Fx Eksponentielle funktioner"
        aria-describedby={`${id}-hjaelp`}
        data-fokus="hurtig-tekst"
        onInput={(haendelse) => {
          saetTekst(haendelse.currentTarget.value);
          saetBesked(null);
        }}
        onKeyDown={tast}
      />
      <button type="submit" class="pensum-knap pensum-knap-primaer pensum-hurtig-knap" ref={knap} data-fokus="hurtig-knap">
        {navne.length > 1 ? `Tilføj ${Math.min(navne.length, MAKS_LINJER)} forløb` : 'Tilføj forløb'}
      </button>
      <p class={besked?.fejl ? 'pensum-besked pensum-fejl' : 'pensum-besked'} role="status">
        {besked?.tekst}
      </p>
    </form>
  );
}
