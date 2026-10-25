// Plugins til emnesiderne i src/content/emner/ (projektplan afsnit 6.3).
//
// - emneTjek stopper buildet, hvis en <Formel> eller et <Begreb> mangler
//   noget, fx et gennemregnet eksempel.
// - emneAfsnit pakker hvert afsnit (fra en ## overskrift til den næste) ind i
//   <section data-afsnit="…">, så siden kan give fx "Kort fortalt" sin egen
//   boks. Rækkefølgen af afsnittene tjekkes af siden (src/lib/emneside.ts).
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import {
  defineHastPlugin,
  defineMdastPlugin,
  type HastNode,
  type MdastNode,
  type MdxJsxFlowElement,
  type PluginFactoryContext,
} from 'satteri';
import { afsnitNoegle } from '../emneside.ts';

/** De dele, en <Formel> skal have (projektplan afsnit 6.3) */
export const FORMEL_DELE = ['Symboler', 'Bruges', 'Eksempel', 'Fejl'] as const;

function erEmne(ctx: PluginFactoryContext): boolean {
  const sti = ctx.fileURL?.pathname ?? '';
  return sti.includes('/src/content/emner/') || sti.endsWith('/tests/komponenter.mdx');
}

function filnavn(ctx: { fileURL: URL | undefined }): string {
  return ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : 'en fil';
}

function attribut(node: MdxJsxFlowElement, navn: string): string | undefined {
  for (const a of node.attributes) {
    if (a.type === 'mdxJsxAttribute' && a.name === navn && typeof a.value === 'string') return a.value;
  }
  return undefined;
}

function boernNavne(node: MdxJsxFlowElement): string[] {
  return (node.children as MdastNode[]).flatMap((barn) =>
    barn.type === 'mdxJsxFlowElement' && barn.name ? [barn.name] : [],
  );
}

const tjek = defineMdastPlugin({
  name: 'emne-tjek',
  mdxJsxFlowElement(node, ctx) {
    const fil = filnavn(ctx);
    if (node.name === 'Formel') {
      const navn = attribut(node, 'navn');
      if (!navn || !attribut(node, 'tex')) {
        throw new Error(`En <Formel> i ${fil} skal have navn="…" og tex="…".`);
      }
      const dele = boernNavne(node);
      const mangler = FORMEL_DELE.filter((del) => !dele.includes(del));
      if (mangler.length > 0) {
        throw new Error(`Formlen "${navn}" i ${fil} mangler ${mangler.map((m) => `<${m}>`).join(', ')}.`);
      }
    } else if (node.name === 'Begreb') {
      const navn = attribut(node, 'navn');
      if (!navn) throw new Error(`Et <Begreb> i ${fil} skal have navn="…".`);
      if (ctx.textContent(node).trim() === '') throw new Error(`Begrebet "${navn}" i ${fil} har ingen forklaring.`);
    }
  },
});

const afsnit = defineHastPlugin({
  name: 'emne-afsnit',
  before(root, ctx) {
    const nye: HastNode[] = [];
    let sektion: { children: HastNode[] } | null = null;
    for (const barn of root.children as HastNode[]) {
      if (barn.type === 'element' && barn.tagName === 'h2') {
        const noegle = afsnitNoegle(ctx.textContent(barn).trim());
        sektion = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['emne-afsnit'], ...(noegle ? { dataAfsnit: noegle } : {}) },
          children: [barn],
        } as HastNode & { children: HastNode[] };
        nye.push(sektion as HastNode);
      } else if (sektion) {
        sektion.children.push(barn);
      } else {
        nye.push(barn);
      }
    }
    ctx.replaceNode(root, { type: 'root', children: nye } as HastNode);
  },
});

/** Tjekker <Formel> og <Begreb> på emnesiderne. */
export function emneTjek(ctx: PluginFactoryContext) {
  return erEmne(ctx) ? tjek : null;
}

/** Pakker emnesidens afsnit ind i <section>. Skal stå efter KaTeX-pluginnet. */
export function emneAfsnit(ctx: PluginFactoryContext) {
  return erEmne(ctx) ? afsnit : null;
}
