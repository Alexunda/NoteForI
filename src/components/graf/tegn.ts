// Tegner koordinatsystemet og kurverne på grafens lærred (canvas). Bruges af
// Graf.tsx. Farverne kommer fra design tokens, så grafen følger lys og mørk
// tilstand.

import { decimalerTil, formaterTal, inddeling, streger } from '../../lib/graf/tal';
import { tilSkaerm, type Visning } from '../../lib/graf/visning';

export interface Farver {
  flade: string;
  tekst: string;
  gitter: string;
  akse: string;
}

export interface Kurve {
  stykker: [number, number][][];
  farve: string;
  /** Stregmønster til setLineDash, så kurverne kan skelnes uden farver */
  streg: number[];
}

/** Ca. så mange pixels mellem stregerne på akserne */
const AFSTAND_X = 56;
const AFSTAND_Y = 40;

function begraensTil(tal: number, min: number, max: number): number {
  return Math.min(Math.max(tal, min), max);
}

/** Tekst med en kant i baggrundsfarven, så den kan læses oven på gitter og kurver */
function skriv(ctx: CanvasRenderingContext2D, tekst: string, x: number, y: number, farver: Farver) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = farver.flade;
  ctx.strokeText(tekst, x, y);
  ctx.fillStyle = farver.tekst;
  ctx.fillText(tekst, x, y);
}

export function tegn(
  ctx: CanvasRenderingContext2D,
  bredde: number,
  hoejde: number,
  v: Visning,
  kurver: readonly Kurve[],
  farver: Farver,
  skrift: string,
) {
  ctx.clearRect(0, 0, bredde, hoejde);
  ctx.fillStyle = farver.flade;
  ctx.fillRect(0, 0, bredde, hoejde);

  const trinX = inddeling(v.xMin, v.xMax, Math.max(2, Math.floor(bredde / AFSTAND_X)));
  const trinY = inddeling(v.yMin, v.yMax, Math.max(2, Math.floor(hoejde / AFSTAND_Y)));
  const xStreger = streger(v.xMin, v.xMax, trinX);
  const yStreger = streger(v.yMin, v.yMax, trinY);
  const origo = tilSkaerm(v, bredde, hoejde, { x: 0, y: 0 });

  // Gitter
  ctx.lineWidth = 1;
  ctx.strokeStyle = farver.gitter;
  ctx.setLineDash([]);
  ctx.beginPath();
  for (const x of xStreger) {
    const px = Math.round(tilSkaerm(v, bredde, hoejde, { x, y: 0 }).x) + 0.5;
    ctx.moveTo(px, 0);
    ctx.lineTo(px, hoejde);
  }
  for (const y of yStreger) {
    const py = Math.round(tilSkaerm(v, bredde, hoejde, { x: 0, y }).y) + 0.5;
    ctx.moveTo(0, py);
    ctx.lineTo(bredde, py);
  }
  ctx.stroke();

  // Akser. Ligger en akse uden for udsnittet, står tallene langs kanten
  const xAkseSynlig = origo.y >= 0 && origo.y <= hoejde;
  const yAkseSynlig = origo.x >= 0 && origo.x <= bredde;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = farver.akse;
  ctx.beginPath();
  if (xAkseSynlig) {
    ctx.moveTo(0, Math.round(origo.y) + 0.5);
    ctx.lineTo(bredde, Math.round(origo.y) + 0.5);
  }
  if (yAkseSynlig) {
    ctx.moveTo(Math.round(origo.x) + 0.5, 0);
    ctx.lineTo(Math.round(origo.x) + 0.5, hoejde);
  }
  ctx.stroke();

  ctx.font = `13px ${skrift}`;
  ctx.lineJoin = 'round';
  const decX = decimalerTil(trinX);
  const decY = decimalerTil(trinY);

  // Tallene på x-aksen
  const tekstY = begraensTil(origo.y + 4, 4, hoejde - 18);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const x of xStreger) {
    if (x === 0 && yAkseSynlig) continue;
    const px = tilSkaerm(v, bredde, hoejde, { x, y: 0 }).x;
    if (px < 12 || px > bredde - 12) continue;
    skriv(ctx, formaterTal(x, decX), px, tekstY, farver);
  }

  // Tallene på y-aksen
  const venstre = origo.x > 40;
  const tekstX = venstre ? begraensTil(origo.x - 6, 40, bredde - 6) : begraensTil(origo.x + 6, 6, bredde - 40);
  ctx.textAlign = venstre ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  for (const y of yStreger) {
    if (y === 0 && xAkseSynlig) continue;
    const py = tilSkaerm(v, bredde, hoejde, { x: 0, y }).y;
    if (py < 10 || py > hoejde - 10) continue;
    skriv(ctx, formaterTal(y, decY), tekstX, py, farver);
  }

  // 0 ved origo og navnene på akserne
  if (xAkseSynlig && yAkseSynlig) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    skriv(ctx, '0', origo.x - 5, origo.y + 4, farver);
  }
  ctx.font = `italic 15px ${skrift}`;
  if (xAkseSynlig) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    skriv(ctx, 'x', bredde - 6, origo.y - 4, farver);
  }
  if (yAkseSynlig) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    skriv(ctx, 'y', origo.x + 6, 4, farver);
  }

  // Kurverne. Meget store værdier holdes inden for et stykke uden for
  // lærredet, så lærredet ikke skal regne med enorme tal.
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const kurve of kurver) {
    ctx.strokeStyle = kurve.farve;
    ctx.setLineDash(kurve.streg);
    ctx.beginPath();
    for (const stykke of kurve.stykker) {
      stykke.forEach(([x, y], i) => {
        const p = tilSkaerm(v, bredde, hoejde, { x, y });
        const py = begraensTil(p.y, -10 * hoejde, 11 * hoejde);
        if (i === 0) ctx.moveTo(p.x, py);
        else ctx.lineTo(p.x, py);
      });
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
