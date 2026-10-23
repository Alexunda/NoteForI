// Eksamensguiderne (src/content/eksamen/) skrives i Markdown. En regel får
// sin kilde som et link sidst i punktet:
//
//   - Projektperioden er på 10 skoledage. [læreplanen, pkt. 4.2.1](kilde:laereplan)
//
// "laereplan" er id'et på en af kilderne i guidens frontmatter. Funktionerne
// her laver den færdige HTML om, før den vises. De tjekker også guiden, så
// buildet stopper, hvis en henvisning eller et afsnit mangler.
//
// Funktionerne er rene, så de kan testes med `npm test`.

export interface Kilde {
  id: string;
  navn: string;
  url: string;
}

export interface Overskrift {
  depth: number;
  text: string;
}

/** De afsnit, en guide skal have (projektplan afsnit 6.2). Står der flere navne, er ét af dem nok. */
export const FASTE_AFSNIT: readonly (readonly string[])[] = [
  ['Det sker der'],
  ['Det bliver du bedømt på'],
  ['Sådan forbereder du dig'],
  ['Typiske fejl', 'Fejl, du kan undgå'],
];
export const FOERSTE_AFSNIT = 'Kort fortalt';
export const SIDSTE_AFSNIT = 'Tjekliste';

const KILDELINK = /<a href="kilde:([^"]*)"([^>]*)>(.*?)<\/a>/gs;

function tilAttribut(tekst: string): string {
  return tekst.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

/**
 * Laver links til `kilde:<id>` om til små kildehenvisninger i parentes, der
 * linker direkte til kilden. Står to henvisninger lige efter hinanden, kommer
 * de i samme parentes. Et id, der ikke står blandt kilderne, giver en fejl.
 */
export function indsaetKildehenvisninger(
  html: string,
  kilder: readonly Kilde[],
): { html: string; fejl: string[] } {
  const fejl: string[] = [];
  const ny = html
    .replace(KILDELINK, (link, id: string, resten: string, tekst: string) => {
      const kilde = kilder.find((k) => k.id === id);
      if (!kilde) {
        fejl.push(`Henvisningen "kilde:${id}" peger ikke på en kilde i frontmatter.`);
        return link;
      }
      return (
        `<span class="kilde">(<a href="${tilAttribut(kilde.url)}"${resten}>` +
        `<span class="skjult-visuelt">Kilde: </span>${tekst}</a>)</span>`
      );
    })
    .replace(/\)<\/span>\s*<span class="kilde">\(/g, '; ');
  return { html: ny, fejl };
}

/**
 * Pakker hvert afsnit (fra en h2 til den næste) ind i et <section> med
 * overskriftens id i data-afsnit, så siden kan give fx "Kort fortalt" sit
 * eget udseende.
 */
export function delIAfsnit(html: string): string {
  return html
    .split(/(?=<h2[\s>])/)
    .map((del) => {
      const id = /^<h2 id="([^"]+)"/.exec(del)?.[1];
      return id === undefined ? del : `<section class="guide-afsnit" data-afsnit="${id}">${del}</section>`;
    })
    .join('');
}

/** Giver en liste over de afsnit, der mangler eller står forkert. Den er tom, hvis alt er i orden. */
export function tjekAfsnit(overskrifter: readonly Overskrift[]): string[] {
  const afsnit = overskrifter.filter((o) => o.depth === 2).map((o) => o.text);
  const fejl: string[] = [];
  if (afsnit[0] !== FOERSTE_AFSNIT) fejl.push(`Det første afsnit skal hedde "${FOERSTE_AFSNIT}".`);
  if (afsnit.at(-1) !== SIDSTE_AFSNIT) fejl.push(`Det sidste afsnit skal hedde "${SIDSTE_AFSNIT}".`);
  for (const navne of FASTE_AFSNIT) {
    if (!navne.some((navn) => afsnit.includes(navn))) fejl.push(`Afsnittet "${navne.join('" eller "')}" mangler.`);
  }
  return fejl;
}
