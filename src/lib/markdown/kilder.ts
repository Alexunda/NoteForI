// Kildehenvisninger på emnesider og fagsider (src/content/emner/ og
// src/content/fag/). En påstand får sin kilde som et link sidst i punktet,
// ligesom i eksamensguiderne:
//
//   - Vækstraten skrives som decimaltal. [formelsamlingen, s. 12](kilde:formelsamling)
//
// "formelsamling" er id'et på en af kilderne i filens frontmatter. Pluginnet
// laver linket om til en lille kildehenvisning i parentes, der linker direkte
// til kilden. Står to henvisninger lige efter hinanden, kommer de i samme
// parentes. Formel-komponenten får sin kilde på samme måde:
//
//   <Formel ... kilde="formelsamling" henvisning="s. 12, formel (34)">
//
// Buildet stopper, hvis et id ikke står i frontmatter.
//
// Eksamensguiderne bruger stadig deres egen udgave (src/lib/eksamensguide.ts).
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import {
  defineMdastPlugin,
  type Custom,
  type MdastNode,
  type MdxJsxFlowElement,
  type PluginFactoryContext,
} from 'satteri';

export interface Kilde {
  id: string;
  navn: string;
  url: string;
}

/** De mapper, hvis filer bruger kildehenvisningerne, og testsiden til komponenterne */
const MAPPER = ['/src/content/emner/', '/src/content/fag/', '/tests/komponenter.mdx'];

/** Holder fx "s. 15", "pkt. 4.2.1" og "§ 27" samlet på én linje. */
export function holdSammen(tekst: string): string {
  return tekst.replace(/(^|\s)(§§?|pkt\.|s\.|stk\.|nr\.|formel) /g, '$1$2\u00a0');
}

/** Filens sti, fx "/…/src/content/emner/matematik/emne.mdx" */
function filnavn(ctx: { fileURL: URL | undefined }): string {
  return ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : 'en fil';
}

function kilderFra(data: unknown): Kilde[] {
  const kilder = (data as { astro?: { frontmatter?: { kilder?: unknown } } })?.astro?.frontmatter?.kilder;
  return Array.isArray(kilder) ? (kilder as Kilde[]) : [];
}

function findKilde(kilder: Kilde[], id: string, fil: string): Kilde {
  const kilde = kilder.find((k) => k.id === id);
  if (!kilde) throw new Error(`Henvisningen "kilde:${id}" i ${fil} peger ikke på en kilde i frontmatter.`);
  return kilde;
}

function erKildelink(node: MdastNode | undefined): boolean {
  return node?.type === 'link' && node.url.startsWith('kilde:');
}

function erMellemrum(node: MdastNode | undefined): boolean {
  return node?.type === 'text' && node.value.trim() === '';
}

/** Teksten i linket, hvor fx "s. 15" holdes samlet. */
function linkTekst(node: MdastNode): MdastNode[] {
  if (!('children' in node)) return [];
  return (node.children as MdastNode[]).map((barn) =>
    barn.type === 'text' ? { type: 'text', value: holdSammen(barn.value) } : barn,
  );
}

/** Et element til siden, fx <span class="kilde">, der kan indeholde andre noder */
function element(type: string, tag: string, klasse: string, children: (MdastNode | Custom)[]): Custom {
  return { type, data: { hName: tag, hProperties: { className: [klasse] } } as Custom['data'], children };
}

function attribut(node: MdxJsxFlowElement, navn: string): string | undefined {
  for (const a of node.attributes) {
    if (a.type === 'mdxJsxAttribute' && a.name === navn && typeof a.value === 'string') return a.value;
  }
  return undefined;
}

const kildePlugin = defineMdastPlugin({
  name: 'kildehenvisninger',
  link(node, ctx) {
    if (!node.url.startsWith('kilde:')) return;
    const kilde = findKilde(kilderFra(ctx.data), node.url.slice('kilde:'.length), filnavn(ctx));

    // Henvisninger lige efter hinanden (kun adskilt af mellemrum) deler parentes
    const foraelder = ctx.parent(node);
    const i = ctx.indexOf(node) ?? -1;
    const soeskende = (foraelder?.children ?? []) as MdastNode[];
    const efterAnden =
      erKildelink(soeskende[i - 1]) || (erMellemrum(soeskende[i - 1]) && erKildelink(soeskende[i - 2]));
    const foerAnden =
      erKildelink(soeskende[i + 1]) || (erMellemrum(soeskende[i + 1]) && erKildelink(soeskende[i + 2]));

    const link = {
      type: 'link',
      url: kilde.url,
      children: [element('skjult', 'span', 'skjult-visuelt', [{ type: 'text', value: 'Kilde: ' }]), ...linkTekst(node)],
    } as MdastNode;
    ctx.replaceNode(
      node,
      element('kildehenvisning', 'span', 'kilde', [
        ...(efterAnden ? [] : [{ type: 'text', value: '(' } as const]),
        link,
        { type: 'text', value: foerAnden ? ';' : ')' },
      ]),
    );
  },
  mdxJsxFlowElement(node, ctx) {
    // <Formel kilde="formelsamling" henvisning="s. 12"> får kildens navn og adresse med
    if (node.name !== 'Formel') return;
    const fil = filnavn(ctx);
    const id = attribut(node, 'kilde');
    const henvisning = attribut(node, 'henvisning');
    if (!id || !henvisning) {
      throw new Error(`<Formel> i ${fil} skal have kilde="…" og henvisning="…", fx kilde="formelsamling" henvisning="s. 12".`);
    }
    const kilde = findKilde(kilderFra(ctx.data), id, fil);
    ctx.replaceNode(node, {
      ...node,
      attributes: [
        ...node.attributes,
        { type: 'mdxJsxAttribute', name: 'kildenavn', value: kilde.navn },
        { type: 'mdxJsxAttribute', name: 'kildeurl', value: kilde.url },
      ],
    });
  },
});

/** Pluginnet bruges kun på filer i src/content/emner/ og src/content/fag/. */
export function kildehenvisninger(ctx: PluginFactoryContext) {
  const sti = ctx.fileURL?.pathname ?? '';
  return MAPPER.some((mappe) => sti.includes(mappe)) ? kildePlugin : null;
}
