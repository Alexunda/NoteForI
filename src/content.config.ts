import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { FAG_IDER } from './data/fag';
import { KLASSETRIN } from './data/klassetrin';

// Emnesider. Filen src/content/emner/<fag>/<emne>.md bliver til
// /fag/<fag>/<emne>/. Skemaet følger projektplan afsnit 4, og fejl i
// frontmatter stopper buildet.
const emner = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/emner' }),
  schema: z.object({
    titel: z.string().min(1),
    fag: z.enum(FAG_IDER),
    niveau: z.array(z.enum(['A', 'B', 'C'])).min(1),
    klassetrin: z.array(z.enum(KLASSETRIN)).min(1),
    /** Den læreplanversion, indholdet bygger på, fx "2024" */
    laereplan: z.string().regex(/^\d{4}$/),
    /** Mindst én officiel kilde (CLAUDE.md, regel 1) */
    kilder: z.array(z.object({ navn: z.string().min(1), url: z.url() })).min(1),
    /** Sættes kun til true af et menneske, der har læst siden igennem */
    verificeret: z.boolean(),
  }),
});

export const collections = { emner };
