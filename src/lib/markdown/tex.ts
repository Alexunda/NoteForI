// Laver en formel (TeX) om til KaTeX-HTML ved build. Bruges af KaTeX-pluginnet
// (src/lib/markdown/katex.ts) og af komponenter som <Formel>.

import katex from 'katex';

/**
 * Laver en formel om til KaTeX-HTML. En fejl i formlen stopper buildet, så
 * en formel aldrig vises forkert. Det gør et decimalkomma uden krøllede
 * parenteser også: skriv 2{,}5, ellers sætter KaTeX et mellemrum efter kommaet.
 */
export function texTilHtml(tex: string, display: boolean): string {
  const komma = /\d,\d/.exec(tex);
  if (komma) {
    throw new Error(
      `Formlen "${tex}" har "${komma[0]}". Skriv decimalkomma som {,}, fx 2{,}5, og adskil tal i en liste med semikolon.`,
    );
  }
  // strict: 'error' gør advarsler (fx æ, ø og å uden \text{}) til fejl, så buildet ikke giver advarsler
  return katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'error' });
}
