export const KLASSETRIN = ['1g', '2g', '3g'] as const;

export type Klassetrin = (typeof KLASSETRIN)[number];

/** '2g' giver '2.g'. */
export function klassetrinNavn(trin: Klassetrin): string {
  return `${trin[0]}.g`;
}

export function erKlassetrin(vaerdi: unknown): vaerdi is Klassetrin {
  return typeof vaerdi === 'string' && (KLASSETRIN as readonly string[]).includes(vaerdi);
}
