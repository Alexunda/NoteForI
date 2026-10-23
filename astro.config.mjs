// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/lib/markdown/katex.ts';
import { kildehenvisninger } from './src/lib/markdown/kilder.ts';

// Siden udgives på https://alexunda.github.io/NoteForI/
export default defineConfig({
  site: 'https://alexunda.github.io',
  base: '/NoteForI',
  trailingSlash: 'always',
  markdown: {
    // Sätteri læser $…$ og $$…$$, og KaTeX laver dem til formler ved build.
    // Pluginnerne gælder både Markdown og MDX.
    processor: satteri({
      features: { math: true },
      mdastPlugins: [kildehenvisninger],
      hastPlugins: [katexPlugin],
    }),
  },
  // Preact bruges kun til interaktive værktøjer (øer), fx pensumtjeklisten og
  // grafkomponenten. MDX bruges til emnesider med komponenter.
  integrations: [preact(), mdx()],
});
