// Punkterne på en funktions graf inden for det udsnit, der vises. Grafen
// deles op i stykker, hvor funktionen ikke er defineret (fx ln(x) for x ≤ 0)
// og ved lodrette asymptoter (fx 1/x og tan(x)), så der ikke tegnes en
// lodret streg hen over dem.

import type { Visning } from './visning.ts';

/**
 * Regner funktionen ud i `antal` + 1 jævnt fordelte x-værdier. Giver en liste
 * af stykker, hvor hvert stykke er en liste af [x, y].
 */
export function sampel(f: (x: number) => number, v: Visning, antal: number): [number, number][][] {
  const stykker: [number, number][][] = [];
  let stykke: [number, number][] = [];
  const hoejde = v.yMax - v.yMin;
  let forrige: [number, number] | null = null;

  const afslut = () => {
    if (stykke.length > 0) stykker.push(stykke);
    stykke = [];
  };

  for (let i = 0; i <= antal; i++) {
    const x = v.xMin + (i / antal) * (v.xMax - v.xMin);
    const y = f(x);
    if (!Number.isFinite(y)) {
      afslut();
      forrige = null;
      continue;
    }
    if (forrige && erSpring(f, forrige, [x, y], hoejde)) afslut();
    stykke.push([x, y]);
    forrige = [x, y];
  }
  afslut();
  return stykker;
}

/**
 * Et stort hop mellem to naboværdier er en asymptote, hvis funktionen ikke
 * ligger imellem dem på midten, fx når 1/x springer fra −∞ til ∞ i x = 0.
 * Et stejlt, men sammenhængende stykke (fx 10^x) har værdien på midten
 * imellem de to.
 */
function erSpring(
  f: (x: number) => number,
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
  hoejde: number,
): boolean {
  if (Math.abs(y1 - y0) < hoejde * 2) return false;
  const ym = f((x0 + x1) / 2);
  if (!Number.isFinite(ym)) return true;
  return ym < Math.min(y0, y1) || ym > Math.max(y0, y1);
}
