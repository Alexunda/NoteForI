// Et punkt, der kan krydses af. Hele rækken er en trykflade: den rigtige
// afkrydsningsboks ligger usynligt over rækken, og en tegnet boks viser
// valget.

import { Ikon } from './Ikon';

interface Props {
  tekst: string;
  markeret: boolean;
  /** Punktet tæller ikke med i dette forløb og kan ikke krydses af */
  irrelevant?: boolean;
  onSkift: (markeret: boolean) => void;
}

export function Afkrydsning({ tekst, markeret, irrelevant = false, onSkift }: Props) {
  return (
    <label class={irrelevant ? 'pensum-afkrydsning pensum-afkrydsning-irrelevant' : 'pensum-afkrydsning'}>
      <input
        type="checkbox"
        checked={markeret}
        disabled={irrelevant}
        onChange={(haendelse) => onSkift(haendelse.currentTarget.checked)}
      />
      <span class="pensum-boks" aria-hidden="true">
        <Ikon navn="flueben" />
      </span>
      <span class="pensum-afkrydsning-tekst">
        {tekst}
        {irrelevant && <span class="pensum-svag"> (ikke relevant)</span>}
      </span>
    </label>
  );
}
