// Forskrifter til grafer, skrevet med dansk skrivemåde, fx "f(x) = 2 · 1,05^x".
// Udtrykket fortolkes og regnes ud med math.js.
//
// - Decimalkomma og decimalpunktum virker begge: 1,05 og 1.05.
// - Funktioner med flere argumenter bruger semikolon: log(8; 2).
// - log er titalslogaritmen og ln den naturlige logaritme, som i
//   formelsamlingen. (I math.js er log den naturlige logaritme, så navnene
//   oversættes her.)
// - Gange kan skrives ·, ×, * eller udelades: 2x og 2·x er det samme.
// - Andre bogstaver end x bliver til parametre, fx a og b i b · a^x. På en
//   graf får de hver sin skyder.
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import {
  absDependencies,
  acosDependencies,
  addDependencies,
  asinDependencies,
  atanDependencies,
  compileDependencies,
  cosDependencies,
  create,
  divideDependencies,
  eDependencies,
  expDependencies,
  log10Dependencies,
  logDependencies,
  multiplyDependencies,
  nthRootDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  sinDependencies,
  sqrtDependencies,
  subtractDependencies,
  tanDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
  type MathNode,
} from 'mathjs/number';

// Kun de dele af math.js, grafen bruger, så JavaScript-filen bliver mindre
const math = create({
  absDependencies,
  acosDependencies,
  addDependencies,
  asinDependencies,
  atanDependencies,
  compileDependencies,
  cosDependencies,
  divideDependencies,
  eDependencies,
  expDependencies,
  log10Dependencies,
  logDependencies,
  multiplyDependencies,
  nthRootDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  sinDependencies,
  sqrtDependencies,
  subtractDependencies,
  tanDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
});
const { ConstantNode, FunctionNode, OperatorNode, SymbolNode, parse } = math;

/** Navne, der ikke er parametre */
const KONSTANTER = new Set(['e', 'pi']);

/** De funktioner, man kan bruge, og navnet i math.js */
const FUNKTIONER: Record<string, string> = {
  sqrt: 'sqrt',
  kvrod: 'sqrt',
  exp: 'exp',
  ln: 'log',
  log: 'log10',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  asin: 'asin',
  acos: 'acos',
  atan: 'atan',
  abs: 'abs',
  nroot: 'nthRoot',
};

/** Det, et regneudtryk kan bestå af. Fx er "a = 2" og "x > 1" ikke regneudtryk */
const REGNEUDTRYK = new Set(['OperatorNode', 'FunctionNode', 'SymbolNode', 'ConstantNode', 'ParenthesisNode']);
const REGNEARTER = new Set(['+', '-', '*', '/', '^']);

/** En parameter må hedde ét bogstav, eventuelt med et tal efter, fx a, k eller a1 */
const PARAMETERNAVN = /^[a-zA-Z][0-9]?$/;

export class UdtrykFejl extends Error {}

export interface Forskrift {
  /** Funktionens navn, fx "f", hvis forskriften startede med "f(x) =" */
  navn: string | null;
  /** Udtrykket uden "f(x) =", som det blev skrevet */
  tekst: string;
  /** Parametrene i den rækkefølge, de står i udtrykket, fx ["b", "a"] */
  parametre: string[];
  /** Funktionsværdien i x. Giver NaN, hvor funktionen ikke er defineret */
  vaerdi: (x: number, parametre?: Readonly<Record<string, number>>) => number;
  /** Udtrykket med dansk skrivemåde, hvor parametrene har fået deres værdier, fx "2 · 1,05 ^ x" */
  medVaerdier: (parametre?: Readonly<Record<string, number>>) => string;
}

/**
 * Laver dansk skrivemåde om til math.js' skrivemåde: decimalkomma bliver til
 * punktum, semikolon til komma og ·, × og − til *, * og -.
 */
export function normaliser(tekst: string): string {
  return tekst
    .normalize('NFKC')
    .replace(/[·×⋅∙]/g, '*')
    .replace(/[−–]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/;/g, ',')
    .trim();
}

/** Deler "f(x) = 2x" op i navnet "f" og udtrykket "2x". "y = 2x" giver ikke noget navn. */
function delOp(tekst: string): { navn: string | null; udtryk: string } {
  const funktion = /^\s*([a-zA-Z][a-zA-Z0-9]*)\s*\(\s*x\s*\)\s*=(.*)$/s.exec(tekst);
  if (funktion) return { navn: funktion[1], udtryk: funktion[2] };
  const y = /^\s*y\s*=(.*)$/s.exec(tekst);
  if (y) return { navn: null, udtryk: y[1] };
  return { navn: null, udtryk: tekst };
}

/**
 * Fortolker en forskrift. Kaster en UdtrykFejl med en dansk forklaring, hvis
 * den ikke kan læses.
 */
export function fortolk(tekst: string): Forskrift {
  const { navn, udtryk } = delOp(tekst);
  if (udtryk.trim() === '') throw new UdtrykFejl('Skriv en forskrift, fx 2x + 1.');

  let knude: MathNode;
  try {
    knude = parse(normaliser(udtryk));
  } catch {
    throw new UdtrykFejl(`Forskriften "${udtryk.trim()}" kan ikke læses. Tjek parenteser og tegn.`);
  }

  // transform går ikke ned i en node, der er erstattet, så argumenterne
  // oversættes for sig, fx ln inde i log(ln(x))
  const oversaet = (node: MathNode): MathNode => {
    if (!(node instanceof FunctionNode)) return node;
    const funktion = node.fn instanceof SymbolNode ? node.fn.name : '';
    const mathjsNavn = FUNKTIONER[funktion];
    if (!mathjsNavn) throw new UdtrykFejl(`Funktionen "${funktion}" kendes ikke.`);
    // log med to argumenter er logaritmen med et andet grundtal, fx log(8; 2)
    const nyt = funktion === 'log' && node.args.length === 2 ? 'log' : mathjsNavn;
    return new FunctionNode(new SymbolNode(nyt), node.args.map((arg) => arg.transform(oversaet)));
  };
  const oversat = knude.transform(oversaet);

  const parametre: string[] = [];
  oversat.traverse((node, _sti, foraelder) => {
    if (!REGNEUDTRYK.has(node.type) || (node instanceof OperatorNode && !REGNEARTER.has(node.op))) {
      throw new UdtrykFejl(`Forskriften "${udtryk.trim()}" er ikke et regneudtryk.`);
    }
    if (!(node instanceof SymbolNode)) return;
    if (foraelder instanceof FunctionNode && foraelder.fn === node) return;
    const symbol = node.name;
    if (symbol === 'x' || KONSTANTER.has(symbol)) return;
    if (!PARAMETERNAVN.test(symbol)) {
      throw new UdtrykFejl(`"${symbol}" kendes ikke. Skriv gange mellem bogstaver, fx a·x i stedet for ax.`);
    }
    if (!parametre.includes(symbol)) parametre.push(symbol);
  });

  const kode = oversat.compile();
  const scope = new Map<string, number>();
  return {
    navn,
    tekst: udtryk.trim(),
    parametre,
    medVaerdier(vaerdier = {}) {
      const udfyldt = knude.transform((node) =>
        node instanceof SymbolNode && parametre.includes(node.name)
          ? new ConstantNode(Number((vaerdier[node.name] ?? 1).toPrecision(6)))
          : node,
      );
      return udfyldt
        .toString({ implicit: 'show' })
        .replace(/(\d)\.(\d)/g, '$1,$2')
        .replace(/ \* /g, ' · ')
        .replace(/-/g, '−');
    },
    vaerdi(x, vaerdier = {}) {
      scope.clear();
      for (const p of parametre) scope.set(p, vaerdier[p] ?? 1);
      scope.set('x', x);
      try {
        const resultat: unknown = kode.evaluate(scope);
        return typeof resultat === 'number' ? resultat : Number.NaN;
      } catch {
        return Number.NaN;
      }
    },
  };
}
