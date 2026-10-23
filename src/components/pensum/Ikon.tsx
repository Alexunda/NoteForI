// Ikoner i Preact-øer. Svarer til Ikon.astro og bruger de samme ikoner fra
// src/data/ikoner.ts.

import { IKONER, type IkonNavn } from '../../data/ikoner';
import type { Status } from '../../lib/pensum';

interface Props {
  navn: IkonNavn;
  klasse?: string;
}

export function Ikon({ navn, klasse }: Props) {
  return (
    <svg
      class={klasse ? `ikon ${klasse}` : 'ikon'}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: IKONER[navn] }}
    />
  );
}

/** Statusikonet i en rund mærkat med statusfarven. Står altid sammen med en tekst. */
export function StatusIkon({ status }: { status: Status }) {
  return (
    <span class={`pensum-statusikon pensum-statusikon-${status}`}>
      <Ikon navn={`status-${status}`} />
    </span>
  );
}
