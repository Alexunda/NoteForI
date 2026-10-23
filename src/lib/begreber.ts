// Centrale begreber fra emnesiderne. Hvert
//
//   <Begreb navn="Fremskrivningsfaktor">Forklaringen i Markdown</Begreb>
//
// bliver vist på emnesiden (src/components/emne/Begreb.astro) og samles
// desuden ved build, så det kan bruges som flashcard i fase 4. Den samlede
// liste ligger i /data/begreber.json (src/pages/data/begreber.json.ts).
//
// Funktionerne er rene, så de kan testes med `npm test`. Importerne slutter
// på .ts, så testene kan køre filen direkte i Node.

import { markdownToHtml, mdxToMdast, type MarkdownToHtmlResult, type MdastNode } from 'satteri';
import { begrebId } from './emneside.ts';
import { katexPlugin } from './markdown/katex.ts';
import { kildehenvisninger } from './markdown/kilder.ts';

export interface RaatBegreb {
  navn: string;
  /** Id'et på begrebet på emnesiden, fx "begreb-fremskrivningsfaktor" */
  id: string;
  /** Forklaringen, som den står i filen (Markdown) */
  markdown: string;
}

function attribut(node: MdastNode, navn: string): string | undefined {
  if (node.type !== 'mdxJsxFlowElement') return undefined;
  for (const a of node.attributes) {
    if (a.type === 'mdxJsxAttribute' && a.name === navn && typeof a.value === 'string') return a.value;
  }
  return undefined;
}

function* alleNoder(node: MdastNode): Generator<MdastNode> {
  yield node;
  if ('children' in node) for (const barn of node.children as MdastNode[]) yield* alleNoder(barn);
}

/** Fjerner det fælles indryk, hvis forklaringen er rykket ind i filen. */
function udenIndryk(tekst: string): string {
  const linjer = tekst.split('\n');
  const indryk = Math.min(...linjer.filter((l) => l.trim() !== '').map((l) => /^ */.exec(l)![0].length));
  return linjer.map((l) => l.slice(Number.isFinite(indryk) ? indryk : 0)).join('\n').trim();
}

/**
 * Finder alle <Begreb> i en emnesides MDX (uden frontmatter). Buildet stopper,
 * hvis to begreber på samme side har samme navn.
 */
export function udtraekBegreber(mdx: string): RaatBegreb[] {
  const begreber: RaatBegreb[] = [];
  for (const node of alleNoder(mdxToMdast(mdx, { features: { math: true } }))) {
    if (node.type !== 'mdxJsxFlowElement' || node.name !== 'Begreb') continue;
    const navn = attribut(node, 'navn') ?? '';
    const boern = node.children as MdastNode[];
    const start = boern[0]?.position?.start.offset;
    const slut = boern.at(-1)?.position?.end.offset;
    const markdown = start !== undefined && slut !== undefined ? udenIndryk(mdx.slice(start, slut)) : '';
    const id = begrebId(navn);
    if (begreber.some((b) => b.id === id)) throw new Error(`Begrebet "${navn}" står to gange på samme side.`);
    begreber.push({ navn, id, markdown });
  }
  return begreber;
}

/**
 * Laver en forklaring om til HTML med formler og kildehenvisninger, ligesom
 * på emnesiden. `fil` er emnesidens fil, og `kilder` er kilderne fra dens
 * frontmatter.
 */
export function forklaringTilHtml(markdown: string, fil: URL, kilder: readonly unknown[]): string {
  const resultat = markdownToHtml(markdown, {
    features: { math: true },
    mdastPlugins: [kildehenvisninger],
    hastPlugins: [katexPlugin],
    fileURL: fil,
    data: { astro: { frontmatter: { kilder }, headings: [], localImagePaths: new Set(), remoteImagePaths: new Set() } },
  });
  // Pluginnerne er synkrone, så resultatet kommer med det samme
  if (resultat instanceof Promise) throw new Error('Et plugin til begreberne er blevet asynkront.');
  return (resultat as MarkdownToHtmlResult).html.trim();
}
