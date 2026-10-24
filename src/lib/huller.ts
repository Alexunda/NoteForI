// Huller: begreber, som eleven skal kende, men som ingen tilladt kilde
// forklarer. På siden står de i en <Hul>-boks, og alle står i docs/huller.md.
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

/** Den faste tekst i alle <Hul>-bokse */
export const HUL_TEKST = 'Det her forklarer siden ikke endnu. Brug dine noter, eller spørg din lærer.';

/** Kildens navn, når redaktionen selv har skrevet forklaringen. Den eneste slags kilde uden url */
export const EGEN_FORKLARING = 'Egen forklaring, godkendt af redaktionen';

export interface HulIBoks {
  /** Filen relativt til src/content/emner/, fx "matematik/vektorer-i-planen.mdx" */
  fil: string;
  navn: string;
}

/** Alle <Hul navn="…" /> i en MDX-tekst */
export function udtraekHuller(tekst: string): string[] {
  return [...tekst.matchAll(/<Hul\s+navn="([^"]+)"\s*\/>/g)].map((m) => m[1]);
}

/**
 * Hullerne i afsnittet "## Huller på siderne" i docs/huller.md. Hver række i
 * tabellen starter med filen i backticks og begrebet i næste kolonne:
 * | `samfundsfag/magt-og-demokrati.mdx` | Konkurrencedemokrati | … |
 */
export function laesHulliste(md: string): HulIBoks[] {
  const huller: HulIBoks[] = [];
  let iAfsnit = false;
  for (const linje of md.split('\n')) {
    if (linje.startsWith('## ')) iAfsnit = linje.startsWith('## Huller på siderne');
    const m = iAfsnit && linje.match(/^\|\s*`([^`]+\.mdx)`\s*\|\s*([^|]+?)\s*\|/);
    if (m) huller.push({ fil: m[1], navn: m[2] });
  }
  return huller;
}

/** Forskellen mellem boksene på siderne og listen i docs/huller.md */
export function sammenlignHuller(bokse: HulIBoks[], liste: HulIBoks[]): string[] {
  const noegle = (h: HulIBoks) => `${h.fil}|${h.navn}`;
  const iListe = new Set(liste.map(noegle));
  const iBokse = new Set(bokse.map(noegle));
  return [
    ...bokse.filter((h) => !iListe.has(noegle(h))).map((h) => `"${h.navn}" i ${h.fil} mangler i docs/huller.md`),
    ...liste.filter((h) => !iBokse.has(noegle(h))).map((h) => `"${h.navn}" står i docs/huller.md, men ikke i en <Hul> i ${h.fil}`),
  ];
}
