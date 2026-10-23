// Fremdriften for et fag eller for alle fag: en måler med den del af
// punkterne, der er krydset af, og antal forløb med hver status. Måleren er
// kun pynt for øjnene. Tallene står altid som tekst ved siden af.

import { procent, type Optaelling, type Status } from '../../lib/pensum';
import { StatusIkon } from './Ikon';

const STATUS_RAEKKEFOELGE: Status[] = ['groen', 'gul', 'roed'];

const ANTAL_TEKST: Record<Status, string> = {
  groen: 'klar',
  gul: 'i gang',
  roed: 'ikke i gang',
};

export function Fremdrift({ optaelling }: { optaelling: Optaelling }) {
  const andel = procent(optaelling);
  const statusser = STATUS_RAEKKEFOELGE.filter((status) => optaelling[status] > 0);

  return (
    <span class="pensum-fremdrift">
      <span class="pensum-fremdrift-tal">
        <strong class="pensum-procent">{andel}&nbsp;%</strong>
        <span class="pensum-svag">
          {optaelling.punkter} af {optaelling.muligePunkter} punkter
        </span>
      </span>
      <span class="pensum-maaler" aria-hidden="true">
        <span class="pensum-maaler-fyld" style={{ width: `${andel}%` }} />
      </span>
      <span class="pensum-statustal">
        {statusser.map((status, i) => (
          <span class="pensum-statustal-del" key={status}>
            {i > 0 && <span class="skjult-visuelt">, </span>}
            <StatusIkon status={status} />
            {optaelling[status]} {ANTAL_TEKST[status]}
          </span>
        ))}
      </span>
    </span>
  );
}
