// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// Siden udgives på https://alexunda.github.io/NoteForI/
export default defineConfig({
  site: 'https://alexunda.github.io',
  base: '/NoteForI',
  trailingSlash: 'always',
  // Preact bruges kun til interaktive værktøjer (øer), fx pensumtjeklisten
  integrations: [preact()],
});
