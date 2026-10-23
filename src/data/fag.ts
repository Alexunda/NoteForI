// De fag, siden dækker først (projektplan afsnit 2). Niveauer og indhold
// kommer i fase 3, når de er slået op i læreplanerne.

export const FAG_IDER = ['bioteknologi', 'dansk', 'kemi', 'matematik', 'samfundsfag'] as const;

export type FagId = (typeof FAG_IDER)[number];

export const FAG_NAVNE: Record<FagId, string> = {
  bioteknologi: 'Bioteknologi',
  dansk: 'Dansk',
  kemi: 'Kemi',
  matematik: 'Matematik',
  samfundsfag: 'Samfundsfag',
};
