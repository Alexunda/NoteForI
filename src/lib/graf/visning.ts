// Det udsnit af koordinatsystemet, en graf viser, og hvordan det ændres, når
// man flytter og zoomer med fingre, mus eller tastatur.

export interface Visning {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Et punkt på skærmen i CSS-pixels, målt fra grafens øverste venstre hjørne */
export interface Punkt {
  x: number;
  y: number;
}

/** Det mindste og største spænd på en akse, så man ikke kan zoome uendeligt */
const MIN_SPAEND = 1e-6;
const MAKS_SPAEND = 1e9;

/** Fra skærmen til koordinatsystemet */
export function tilData(v: Visning, bredde: number, hoejde: number, p: Punkt): Punkt {
  return {
    x: v.xMin + (p.x / bredde) * (v.xMax - v.xMin),
    y: v.yMax - (p.y / hoejde) * (v.yMax - v.yMin),
  };
}

/** Fra koordinatsystemet til skærmen */
export function tilSkaerm(v: Visning, bredde: number, hoejde: number, p: Punkt): Punkt {
  return {
    x: ((p.x - v.xMin) / (v.xMax - v.xMin)) * bredde,
    y: ((v.yMax - p.y) / (v.yMax - v.yMin)) * hoejde,
  };
}

/** Holder spændet på begge akser inden for grænserne og fjerner ugyldige tal. */
export function begraens(v: Visning, forrige: Visning = v): Visning {
  const bredde = v.xMax - v.xMin;
  const hoejde = v.yMax - v.yMin;
  const tal = [v.xMin, v.xMax, v.yMin, v.yMax];
  if (!tal.every(Number.isFinite) || bredde <= 0 || hoejde <= 0) return forrige;
  if (Math.min(bredde, hoejde) < MIN_SPAEND || Math.max(bredde, hoejde) > MAKS_SPAEND) return forrige;
  return v;
}

/**
 * Zoomer om punktet (cx; cy) i koordinatsystemet, som bliver liggende samme
 * sted på skærmen. En faktor over 1 zoomer ud, og under 1 zoomer ind.
 */
export function zoom(v: Visning, faktor: number, cx: number, cy: number): Visning {
  return begraens(
    {
      xMin: cx - (cx - v.xMin) * faktor,
      xMax: cx + (v.xMax - cx) * faktor,
      yMin: cy - (cy - v.yMin) * faktor,
      yMax: cy + (v.yMax - cy) * faktor,
    },
    v,
  );
}

/** Zoomer om midten af visningen. */
export function zoomMidt(v: Visning, faktor: number): Visning {
  return zoom(v, faktor, (v.xMin + v.xMax) / 2, (v.yMin + v.yMax) / 2);
}

/** Flytter visningen dx og dy enheder i koordinatsystemet. */
export function flyt(v: Visning, dx: number, dy: number): Visning {
  return begraens({ xMin: v.xMin + dx, xMax: v.xMax + dx, yMin: v.yMin + dy, yMax: v.yMax + dy }, v);
}

/** Flytter visningen, så det, der lå under fingeren i `fra`, nu ligger under `til`. */
export function traek(v: Visning, bredde: number, hoejde: number, fra: Punkt, til: Punkt): Visning {
  const dx = ((til.x - fra.x) / bredde) * (v.xMax - v.xMin);
  const dy = ((til.y - fra.y) / hoejde) * (v.yMax - v.yMin);
  return flyt(v, -dx, dy);
}

/**
 * Knib med to fingre. `start` er visningen, da fingrene ramte skærmen i a0 og
 * b0. Nu er de i a1 og b1. Punktet midt mellem fingrene følger med, og
 * afstanden mellem dem bestemmer zoomet.
 */
export function knib(
  start: Visning,
  bredde: number,
  hoejde: number,
  a0: Punkt,
  b0: Punkt,
  a1: Punkt,
  b1: Punkt,
): Visning {
  const afstand0 = Math.hypot(b0.x - a0.x, b0.y - a0.y);
  const afstand1 = Math.hypot(b1.x - a1.x, b1.y - a1.y);
  if (afstand0 < 1 || afstand1 < 1) return start;
  const faktor = afstand0 / afstand1;
  const midt0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
  const midt1 = { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 };
  const fast = tilData(start, bredde, hoejde, midt0);
  const nyBredde = (start.xMax - start.xMin) * faktor;
  const nyHoejde = (start.yMax - start.yMin) * faktor;
  const xMin = fast.x - (midt1.x / bredde) * nyBredde;
  const yMax = fast.y + (midt1.y / hoejde) * nyHoejde;
  return begraens({ xMin, xMax: xMin + nyBredde, yMin: yMax - nyHoejde, yMax }, start);
}
