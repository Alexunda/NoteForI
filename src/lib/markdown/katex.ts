// Formler i Markdown og MDX: $…$ og $$…$$ bliver til KaTeX-HTML ved build.
//
// Sätteri, Astros Markdown-motor, læser selv formlerne, når features.math er
// slået til (astro.config.mjs). Den laver dem til
//   <code class="language-math math-inline">          for $…$
//   <pre><code class="language-math math-display">    for $$…$$
// Pluginnet herunder erstatter dem med KaTeX-HTML. HTML'en sættes ind som
// rigtige HTML-noder og ikke som rå HTML, fordi MDX ikke kan indeholde rå HTML.
//
// Kodefremhævningen kører før hast-plugins, men Astro fremhæver aldrig sproget
// "math", så display-formlerne når frem hertil som kodeblokke. Bliver en formel
// alligevel til kode i den færdige side, stopper scripts/tjek-formler.mjs
// buildet.
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import { defineHastPlugin, htmlToHast, type HastNode } from 'satteri';
import { texTilHtml } from './tex.ts';

export { texTilHtml };

/** HTML til hast-noder. */
function tilNoder(html: string): HastNode[] {
  // HTML-parseren giver selv <math> og <svg> det rigtige navnerum. xmlns
  // fjernes, fordi htmlToHast ellers skriver det ud som ":xmlns".
  const rod = htmlToHast(html.replace(/ xmlns(?::\w+)?="[^"]*"/g, ''), { fragment: true });
  return 'children' in rod ? (rod.children as HastNode[]) : [];
}

function harKlasser(node: HastNode, ...klasser: string[]): boolean {
  if (node.type !== 'element') return false;
  const className = node.properties?.className;
  return Array.isArray(className) && klasser.every((klasse) => className.includes(klasse));
}

export const katexPlugin = defineHastPlugin({
  name: 'katex',
  element: {
    filter: ['pre', 'code'],
    visit(node, ctx) {
      if (node.tagName === 'pre') {
        const kode = node.children.find((barn) => harKlasser(barn, 'language-math', 'math-display'));
        if (kode) ctx.replaceNode(node, tilNoder(texTilHtml(ctx.textContent(kode), true)));
      } else if (harKlasser(node, 'language-math', 'math-inline')) {
        ctx.replaceNode(node, tilNoder(texTilHtml(ctx.textContent(node), false)));
      }
    },
  },
});
