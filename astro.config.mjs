// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { satteri } from '@astrojs/markdown-satteri';
import { emneAfsnit, emneTjek } from './src/lib/markdown/emneside.ts';
import { katexPlugin } from './src/lib/markdown/katex.ts';
import { kildehenvisninger } from './src/lib/markdown/kilder.ts';
import { interneLinks } from './src/lib/markdown/links.ts';

const BASE = '/NoteForI';

// Siden udgives på https://alexunda.github.io/NoteForI/
export default defineConfig({
  site: 'https://alexunda.github.io',
  base: BASE,
  trailingSlash: 'always',
  markdown: {
    // Sätteri læser $…$ og $$…$$, og KaTeX laver dem til formler ved build.
    // Pluginnerne gælder både Markdown og MDX. Kildehenvisningerne og
    // emnesidernes tjek og afsnit gælder kun src/content/emner/ og fag/.
    processor: satteri({
      features: { math: true },
      mdastPlugins: [kildehenvisninger, emneTjek, interneLinks(BASE)],
      // KaTeX skal stå før emneAfsnit, som pakker afsnittene ind
      hastPlugins: [katexPlugin, emneAfsnit],
    }),
  },
  // Preact bruges kun til interaktive værktøjer (øer), fx pensumtjeklisten og
  // grafkomponenten. MDX bruges til emnesider med komponenter.
  integrations: [preact(), mdx()],
});
