// Emnesidens skabelon (projektplan afsnit 6.3). En emneside i
// src/content/emner/ har disse afsnit som ## overskrifter, i denne rækkefølge.
// "Kilder" laves af siden selv ud fra frontmatter.
//
// Funktionerne er rene, så de kan testes med `npm test`. Importerne slutter
// på .ts, så testene kan køre filen direkte i Node.

export interface Afsnit {
  titel: string;
  /** Bruges i data-afsnit, så CSS kan give afsnittet sit eget udseende */
  noegle: string;
  /** Et afsnit, der ikke er relevant for alle emner, fx Formler */
  valgfrit?: boolean;
}

export const AFSNIT: readonly Afsnit[] = [
  { titel: 'Kort fortalt', noegle: 'kort-fortalt' },
  { titel: 'Vigtige pointer', noegle: 'vigtige-pointer' },
  { titel: 'Formler', noegle: 'formler', valgfrit: true },
  { titel: 'Centrale begreber', noegle: 'centrale-begreber' },
  { titel: 'Eksamenshjørnet', noegle: 'eksamenshjoernet' },
];

export interface Overskrift {
  depth: number;
  text: string;
}

/**
 * Laver en tekst om til en del af en URL eller et id: små bogstaver, æ, ø og
 * å som ae, oe og aa, og bindestreg mellem ordene. "Første grad" giver
 * "foerste-grad".
 */
export function slug(tekst: string): string {
  return tekst
    .toLocaleLowerCase('da')
    .replaceAll('æ', 'ae')
    .replaceAll('ø', 'oe')
    .replaceAll('å', 'aa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Giver en liste over fejl i emnesidens afsnit. Den er tom, hvis alt er i
 * orden. Afsnittene skal stå i rækkefølgen fra AFSNIT, og der må ikke være
 * andre ## overskrifter. Underafsnit (###) må man gerne lave.
 */
export function tjekEmneAfsnit(overskrifter: readonly Overskrift[]): string[] {
  const titler = overskrifter.filter((o) => o.depth === 2).map((o) => o.text);
  const kendte = new Set(AFSNIT.map((a) => a.titel));
  const fejl: string[] = [];

  for (const titel of titler) {
    if (!kendte.has(titel)) {
      fejl.push(`Afsnittet "${titel}" hører ikke til skabelonen. Brug ### til underafsnit.`);
    }
  }
  for (const afsnit of AFSNIT) {
    const antal = titler.filter((t) => t === afsnit.titel).length;
    if (antal === 0 && !afsnit.valgfrit) fejl.push(`Afsnittet "${afsnit.titel}" mangler.`);
    if (antal > 1) fejl.push(`Afsnittet "${afsnit.titel}" står ${antal} gange.`);
  }

  const forventet = AFSNIT.map((a) => a.titel).filter((t) => titler.includes(t));
  const faktisk = titler.filter((t) => kendte.has(t));
  if (fejl.length === 0 && forventet.join('|') !== faktisk.join('|')) {
    fejl.push(`Afsnittene skal stå i denne rækkefølge: ${forventet.join(', ')}.`);
  }
  return fejl;
}

/** Id'et, et begreb får på emnesiden, så der kan linkes direkte til det */
export function begrebId(navn: string): string {
  return `begreb-${slug(navn)}`;
}

/** Nøglen til et afsnit ud fra overskriften, eller null for andre overskrifter. */
export function afsnitNoegle(titel: string): string | null {
  return AFSNIT.find((a) => a.titel === titel)?.noegle ?? null;
}
