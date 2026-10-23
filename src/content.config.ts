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

// Eksamensguider. Filen src/content/eksamen/<id>.md vises af siden
// src/pages/eksamen/<id>.astro. En regel får sin kilde med et link til
// kilde:<id>, se src/lib/eksamensguide.ts.
const eksamen = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/eksamen' }),
  schema: z.object({
    titel: z.string().min(1),
    beskrivelse: z.string().min(1),
    klassetrin: z.array(z.enum(KLASSETRIN)).min(1),
    /**
     * Guider om en prøveform skal have alle afsnittene fra projektplan afsnit
     * 6.2. Andre guider, fx om eksamensdagen, sætter den til false.
     */
    proeveform: z.boolean().default(true),
    /** Læreplanens version, hvis guiden bygger på en læreplan, fx "2017" for SRP */
    laereplan: z
      .string()
      .regex(/^\d{4}$/)
      .optional(),
    /** Vises på siden: "Bygger på …", fx "læreplanen fra 2017 og prøvebekendtgørelsen fra 2026" */
    grundlag: z.string().min(1),
    /** Den dag, reglerne sidst blev tjekket mod kilderne */
    tjekket: z.coerce.date(),
    kilder: z
      .array(
        z.object({
          /** Bruges i kildehenvisningerne: [læreplanen, pkt. 4.4](kilde:laereplan) */
          id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          navn: z.string().min(1),
          url: z.url(),
        }),
      )
      .min(1)
      .refine((kilder) => new Set(kilder.map((k) => k.id)).size === kilder.length, {
        message: 'To kilder har samme id.',
      }),
    /** Sættes kun til true af et menneske, der har læst siden igennem */
    verificeret: z.boolean(),
  }),
});

export const collections = { emner, eksamen };
