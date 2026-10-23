// Det generiske lag for et fag: det, eleven skal kunne ifølge læreplanen.
// Listen vises kun, når der findes en til fagets fag og niveau
// (src/data/pensum.ts). Har faget lister til flere læreplaner, står
// årstallet i overskriften.

import type { GeneriskVisning } from '../../data/pensum';
import { Afkrydsning } from './Afkrydsning';

interface Props {
  liste: GeneriskVisning;
  /** Vis læreplanens årstal i overskriften, fordi faget har flere lister */
  medAarstal: boolean;
  /** Id'er på de punkter, eleven har krydset af */
  afkrydsede: string[];
  onKryds: (punktId: string, krydset: boolean) => void;
}

export default function GeneriskListe({ liste, medAarstal, afkrydsede, onKryds }: Props) {
  const krydset = new Set(afkrydsede);
  const antal = liste.punkter.filter((punkt) => krydset.has(punkt.id)).length;
  const overskriftId = `pensum-generisk-${liste.laereplan}`;

  return (
    <section class="pensum-generisk" aria-labelledby={overskriftId}>
      <h3 id={overskriftId}>Det skal du kunne{medAarstal ? ` (læreplan ${liste.laereplan})` : ''}</h3>
      {!liste.verificeret && <p class="pensum-maerkat">Ikke gennemlæst endnu</p>}
      <p class="pensum-svag">
        Bygger på læreplanen fra {liste.laereplan}. {antal} af {liste.punkter.length} er krydset af.
      </p>
      <ul class="pensum-punkter pensum-kort">
        {liste.punkter.map((punkt) => (
          <li class="pensum-punkt" key={punkt.id}>
            <Afkrydsning
              tekst={punkt.tekst}
              markeret={krydset.has(punkt.id)}
              onSkift={(markeret) => onKryds(punkt.id, markeret)}
            />
            {punkt.url && (
              <a class="pensum-laes-mere" href={punkt.url}>
                Læs om det<span class="skjult-visuelt">: {punkt.tekst}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
      <p class="pensum-kilder">
        {liste.kilder.length === 1 ? 'Kilde: ' : 'Kilder: '}
        {liste.kilder.map((kilde, i) => (
          <span key={i}>
            {i > 0 && ', '}
            <a href={kilde.url}>{kilde.navn}</a>
          </span>
        ))}
      </p>
    </section>
  );
}
