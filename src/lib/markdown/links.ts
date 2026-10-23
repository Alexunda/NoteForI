// Interne links på emnesider og fagsider, fx [skriftlige prøver](/eksamen/skriftlig/),
// får base-stien foran, så de også virker på GitHub Pages (/NoteForI/…).
// Eksamensguiderne gør det samme på deres egen måde (src/lib/eksamensguide.ts).
//
// Importerne slutter på .ts, så testene kan køre filen direkte i Node.

import { defineMdastPlugin, type PluginFactoryContext } from 'satteri';

const MAPPER = ['/src/content/emner/', '/src/content/fag/'];

/** Laver pluginnet til en base-sti, fx '/NoteForI'. */
export function interneLinks(base: string) {
  const rod = base.replace(/\/+$/, '');
  const plugin = defineMdastPlugin({
    name: 'interne-links',
    link(node, ctx) {
      if (!node.url.startsWith('/') || node.url.startsWith('//') || node.url.startsWith(`${rod}/`)) return;
      ctx.setProperty(node, 'url', `${rod}${node.url}`);
    },
  });
  return (ctx: PluginFactoryContext) => {
    const sti = ctx.fileURL?.pathname ?? '';
    return MAPPER.some((mappe) => sti.includes(mappe)) ? plugin : null;
  };
}
