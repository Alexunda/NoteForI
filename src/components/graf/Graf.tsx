// Grafkomponent med skydere (projektplan afsnit 6.4). Tegner en eller flere
// forskrifter på et lærred (canvas) med math.js. Andre bogstaver end x får
// hver sin skyder, så man kan se, hvad parameteren gør ved grafen.
//
// Man flytter grafen ved at trække med en finger eller musen og zoomer ved
// at knibe med to fingre, med knapperne eller med musehjulet, når grafen har
// fokus (eller Ctrl er nede, fx ved knib på en touchpad). Med tastaturet
// flytter piletasterne, + og − zoomer, og 0 nulstiller.
//
// Komponenten bruges på emnesiderne via src/components/emne/Graf.astro og
// skal genbruges i grafværktøjet i fase 4. Logikken ligger i src/lib/graf/.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { sampel } from '../../lib/graf/sampling';
import { decimalerTil, formaterTal } from '../../lib/graf/tal';
import { fortolk, type Forskrift } from '../../lib/graf/udtryk';
import { flyt, knib, tilData, traek, zoom, zoomMidt, type Punkt, type Visning } from '../../lib/graf/visning';
import { Ikon } from '../pensum/Ikon';
import { tegn, type Farver, type Kurve } from './tegn';

export interface GrafFunktion {
  /** Forskriften med dansk skrivemåde, fx "f(x) = b · a^x" */
  forskrift: string;
  /** Forskriften som KaTeX-HTML til forklaringen under grafen. Laves ved build */
  html?: string;
}

export interface GrafParameter {
  min: number;
  max: number;
  /** Afstanden mellem værdierne på skyderen. Standard: ca. en hundrededel af spændet */
  trin?: number;
  /** Værdien, skyderen starter på. Standard: 1, hvis det er muligt, ellers midten */
  start?: number;
}

export interface GrafProps {
  /** Unikt id på siden. Bruges til skydernes id'er */
  id: string;
  /** Kort beskrivelse til skærmlæsere, fx "Eksponentiel vækst" */
  titel: string;
  funktioner: GrafFunktion[];
  parametre?: Record<string, GrafParameter>;
  /** Udsnittet, grafen starter med: [mindste, største] */
  x?: [number, number];
  y?: [number, number];
}

/** Kurvernes farver (design tokens) og stregmønstre, så de kan skelnes uden farver */
const FARVER = ['--farve-graf-1', '--farve-graf-2', '--farve-graf-3', '--farve-graf-4'];
const STREGER = [[], [9, 6], [2, 5], [12, 5, 2, 5]];

interface Skyder {
  min: number;
  max: number;
  trin: number;
  start: number;
}

/** Skyderens indstillinger med standardværdier for det, der ikke er angivet */
export function skyder(p: GrafParameter | undefined): Skyder {
  const min = p?.min ?? -5;
  const max = p?.max ?? 5;
  const trin = p?.trin ?? (p ? 10 ** Math.floor(Math.log10((max - min) / 100)) : 0.1);
  const start = p?.start ?? (min <= 1 && max >= 1 ? 1 : (min + max) / 2);
  return { min, max, trin, start };
}

type Fortolket = { forskrift: Forskrift; fejl: null } | { forskrift: null; fejl: string };

export default function Graf({ id, titel, funktioner, parametre = {}, x = [-10, 10], y = [-10, 10] }: GrafProps) {
  const start: Visning = { xMin: x[0], xMax: x[1], yMin: y[0], yMax: y[1] };
  const fortolkede = useMemo<Fortolket[]>(
    () =>
      funktioner.map((f) => {
        try {
          return { forskrift: fortolk(f.forskrift), fejl: null };
        } catch (fejl) {
          return { forskrift: null, fejl: fejl instanceof Error ? fejl.message : String(fejl) };
        }
      }),
    [funktioner],
  );
  const navne = useMemo(
    () => [...new Set(fortolkede.flatMap((f) => f.forskrift?.parametre ?? []))],
    [fortolkede],
  );
  const skydere = useMemo(
    () => Object.fromEntries(navne.map((navn) => [navn, skyder(parametre[navn])])),
    [navne, parametre],
  );

  const [vaerdier, saetVaerdier] = useState<Record<string, number>>(() =>
    Object.fromEntries(navne.map((navn) => [navn, skydere[navn].start])),
  );
  const [visning, saetVisning] = useState(start);
  const [stoerrelse, saetStoerrelse] = useState({ bredde: 0, hoejde: 0 });
  // Tælles op, når temaet skifter, så grafen tegnes igen med de nye farver
  const [tema, saetTema] = useState(0);

  const laerred = useRef<HTMLCanvasElement>(null);
  // Den nyeste visning, så håndteringen af fingre og hjul ikke bruger en gammel
  const visningNu = useRef(visning);
  const fingre = useRef(new Map<number, Punkt>());
  const gestus = useRef<{ visning: Visning; punkter: Map<number, Punkt> } | null>(null);

  function skift(ny: Visning) {
    visningNu.current = ny;
    saetVisning(ny);
  }

  useEffect(() => {
    const el = laerred.current;
    if (!el) return;
    const observer = new ResizeObserver(([indgang]) => {
      const { width, height } = indgang.contentRect;
      saetStoerrelse({ bredde: Math.round(width), hoejde: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => saetTema((t) => t + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
    return () => observer.disconnect();
  }, []);

  // Musehjulet zoomer kun, når grafen har fokus, eller når Ctrl er nede. Ellers
  // ruller siden som normalt, når musen kommer forbi grafen.
  useEffect(() => {
    const el = laerred.current;
    if (!el) return;
    const hjul = (haendelse: WheelEvent) => {
      if (!haendelse.ctrlKey && document.activeElement !== el) return;
      haendelse.preventDefault();
      const kasse = el.getBoundingClientRect();
      const v = visningNu.current;
      const midt = tilData(v, kasse.width, kasse.height, {
        x: haendelse.clientX - kasse.left,
        y: haendelse.clientY - kasse.top,
      });
      const delta = haendelse.deltaMode === 1 ? haendelse.deltaY * 16 : haendelse.deltaY;
      skift(zoom(v, Math.exp(Math.max(-1, Math.min(1, delta * 0.002))), midt.x, midt.y));
    };
    el.addEventListener('wheel', hjul, { passive: false });
    return () => el.removeEventListener('wheel', hjul);
  }, []);

  useEffect(() => {
    const el = laerred.current;
    if (!el || stoerrelse.bredde === 0) return;
    const ramme = requestAnimationFrame(() => {
      const { bredde, hoejde } = stoerrelse;
      const dpr = window.devicePixelRatio || 1;
      if (el.width !== Math.round(bredde * dpr) || el.height !== Math.round(hoejde * dpr)) {
        el.width = Math.round(bredde * dpr);
        el.height = Math.round(hoejde * dpr);
      }
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const stil = getComputedStyle(el);
      const token = (navn: string) => stil.getPropertyValue(navn).trim();
      const farver: Farver = {
        flade: token('--farve-flade'),
        tekst: token('--farve-tekst-svag'),
        gitter: token('--farve-kant'),
        akse: token('--farve-kant-staerk'),
      };
      const antal = Math.max(200, Math.round(bredde * 1.5));
      const kurver: Kurve[] = fortolkede.flatMap((f, i) =>
        f.forskrift
          ? [
              {
                stykker: sampel((t) => f.forskrift.vaerdi(t, vaerdier), visning, antal),
                farve: token(FARVER[i % FARVER.length]),
                streg: STREGER[i % STREGER.length],
              },
            ]
          : [],
      );
      tegn(ctx, bredde, hoejde, visning, kurver, farver, stil.fontFamily);
    });
    return () => cancelAnimationFrame(ramme);
  }, [visning, vaerdier, stoerrelse, fortolkede, tema]);

  function punkt(haendelse: PointerEvent): Punkt {
    const kasse = laerred.current!.getBoundingClientRect();
    return { x: haendelse.clientX - kasse.left, y: haendelse.clientY - kasse.top };
  }

  /** En ny gestus starter, hver gang en finger kommer på eller går af */
  function nyGestus() {
    gestus.current = { visning: visningNu.current, punkter: new Map(fingre.current) };
  }

  function ned(haendelse: PointerEvent) {
    if (haendelse.pointerType === 'mouse' && haendelse.button !== 0) return;
    laerred.current?.setPointerCapture(haendelse.pointerId);
    fingre.current.set(haendelse.pointerId, punkt(haendelse));
    nyGestus();
  }

  function bevaeg(haendelse: PointerEvent) {
    if (!fingre.current.has(haendelse.pointerId) || !gestus.current) return;
    fingre.current.set(haendelse.pointerId, punkt(haendelse));
    const { visning: fra, punkter } = gestus.current;
    const { bredde, hoejde } = stoerrelse;
    const [a, b] = [...fingre.current.keys()];
    const a0 = punkter.get(a);
    const a1 = fingre.current.get(a);
    if (!a0 || !a1) return;
    if (b === undefined) {
      skift(traek(fra, bredde, hoejde, a0, a1));
      return;
    }
    const b0 = punkter.get(b);
    const b1 = fingre.current.get(b);
    if (b0 && b1) skift(knib(fra, bredde, hoejde, a0, b0, a1, b1));
  }

  function op(haendelse: PointerEvent) {
    fingre.current.delete(haendelse.pointerId);
    nyGestus();
  }

  function tast(haendelse: KeyboardEvent) {
    const v = visningNu.current;
    const dx = (v.xMax - v.xMin) / 10;
    const dy = (v.yMax - v.yMin) / 10;
    const handlinger: Record<string, () => Visning> = {
      ArrowLeft: () => flyt(v, -dx, 0),
      ArrowRight: () => flyt(v, dx, 0),
      ArrowUp: () => flyt(v, 0, dy),
      ArrowDown: () => flyt(v, 0, -dy),
      '+': () => zoomMidt(v, 0.8),
      '=': () => zoomMidt(v, 0.8),
      '-': () => zoomMidt(v, 1.25),
      '0': () => start,
    };
    const handling = handlinger[haendelse.key];
    if (!handling) return;
    haendelse.preventDefault();
    skift(handling());
  }

  const forskrifterTekst = fortolkede
    .map((f, i) => (f.forskrift ? `${f.forskrift.navn ?? 'y'}(x) = ${f.forskrift.medVaerdier(vaerdier)}` : funktioner[i].forskrift))
    .join('; ');
  const beskrivelse =
    `${titel}. ${forskrifterTekst}. Udsnittet viser x fra ${formaterTal(visning.xMin)} til ` +
    `${formaterTal(visning.xMax)} og y fra ${formaterTal(visning.yMin)} til ${formaterTal(visning.yMax)}.`;

  return (
    <div class="graf">
      <canvas
        ref={laerred}
        class="graf-laerred"
        role="img"
        aria-label={beskrivelse}
        aria-describedby={`${id}-tastatur`}
        tabIndex={0}
        onPointerDown={ned}
        onPointerMove={bevaeg}
        onPointerUp={op}
        onPointerCancel={op}
        onKeyDown={tast}
      />
      <p class="skjult-visuelt" id={`${id}-tastatur`}>
        Piletasterne flytter grafen, plus og minus zoomer, og 0 nulstiller.
      </p>
      <div class="graf-knapper">
        <button type="button" class="graf-knap" aria-label="Zoom ud" onClick={() => skift(zoomMidt(visningNu.current, 1.25))}>
          <Ikon navn="minus" />
        </button>
        <button type="button" class="graf-knap" aria-label="Zoom ind" onClick={() => skift(zoomMidt(visningNu.current, 0.8))}>
          <Ikon navn="plus" />
        </button>
        <button type="button" class="graf-knap" onClick={() => skift(start)}>
          <Ikon navn="nulstil" />
          Nulstil
        </button>
        <p class="graf-hjaelp">Træk for at flytte. Knib for at zoome.</p>
      </div>
      <ul class="graf-forklaring">
        {funktioner.map((f, i) => (
          <li>
            <svg class="graf-streg" width="32" height="12" viewBox="0 0 32 12" aria-hidden="true" focusable="false">
              <line
                x1="3"
                y1="6"
                x2="29"
                y2="6"
                style={{ stroke: `var(${FARVER[i % FARVER.length]})` }}
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray={STREGER[i % STREGER.length].join(' ') || undefined}
              />
            </svg>
            {f.html ? <span dangerouslySetInnerHTML={{ __html: f.html }} /> : <span>{f.forskrift}</span>}
            {fortolkede[i].fejl && <span class="graf-fejl">{fortolkede[i].fejl}</span>}
          </li>
        ))}
      </ul>
      {navne.length > 0 && (
        <div class="graf-parametre">
          {navne.map((navn) => {
            const s = skydere[navn];
            const tekst = formaterTal(vaerdier[navn], decimalerTil(s.trin));
            return (
              <div class="graf-parameter">
                <label for={`${id}-${navn}`}>
                  <span class="graf-parameter-navn">{navn}</span> = <output for={`${id}-${navn}`}>{tekst}</output>
                </label>
                <input
                  type="range"
                  id={`${id}-${navn}`}
                  min={s.min}
                  max={s.max}
                  step={s.trin}
                  value={vaerdier[navn]}
                  aria-valuetext={tekst}
                  onInput={(haendelse) =>
                    saetVaerdier({ ...vaerdier, [navn]: Number(haendelse.currentTarget.value) })
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
