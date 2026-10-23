import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { FAG_IDER } from './data/fag';
import { KLASSETRIN } from './data/klassetrin';

const aarstal = z.string().regex(/^\d{4}$/);

/** En læreplanversion, fx "2024", eller flere, fx ["2017", "2026"]. Giver altid en liste. */
const laereplaner = z.union([aarstal, z.array(aarstal).min(1)]).transform((v) => (Array.isArray(v) ? v : [v]));

/**
 * Officielle kilder (CLAUDE.md, regel 1). En påstand får sin kilde med et link
 * til kilde:<id>, fx [formelsamlingen, s. 12](kilde:formelsamling). Se
 * src/lib/markdown/kilder.ts.
 */
const kildeliste = z
  .array(
    z.object({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      navn: z.string().min(1),
      url: z.url(),
    }),
  )
  .min(1)
  .refine((kilder) => new Set(kilder.map((k) => k.id)).size === kilder.length, {
    message: 'To kilder har samme id.',
  });

// Emnesider. Filen src/content/emner/<fag>/<emne>.mdx bliver til
// /fag/<fag>/<emne>/. Skemaet følger projektplan afsnit 4, og fejl i
// frontmatter stopper buildet. Afsnittene står i src/lib/emneside.ts.
const emner = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/emner' }),
  schema: z.object({
    titel: z.string().min(1),
    /** Én sætning om emnet. Vises i fagets emneliste og til søgemaskiner */
    beskrivelse: z.string().min(1),
    fag: z.enum(FAG_IDER),
    /** Andre fag, emnet også hører til, fx kemi for et emne fra bioteknologi. Emnet står også på deres side */
    ogsaaFag: z.array(z.enum(FAG_IDER)).default([]),
    /** Pladsen i fagets emneliste. 1 står først */
    nummer: z.number().int().positive(),
    /** Gruppen i fagets emneliste, fx et af kernestoffets områder */
    omraade: z.string().min(1).optional(),
    niveau: z.array(z.enum(['A', 'B', 'C'])).min(1),
    /** "ukendt", hvis kilderne ikke siger, hvilket klassetrin emnet typisk hører til */
    klassetrin: z.union([z.array(z.enum(KLASSETRIN)).min(1), z.literal('ukendt')]),
    /** Den læreplanversion, indholdet bygger på, fx "2024", eller flere, fx ["2017", "2026"] */
    laereplan: laereplaner,
    /** Siden er kun et eksempel med pladsholdertekst og ikke rigtigt fagligt indhold */
    pladsholder: z.boolean().default(false),
    kilder: kildeliste,
    /** Sættes kun til true af repoets ejer, når siden er gennemlæst (CLAUDE.md, regel 3) */
    verificeret: z.boolean(),
  }),
});

// Fagenes overbliksside. Filen src/content/fag/<fag>.mdx bliver til
// /fag/<fag>/. Emnelisten laves ud fra emnesiderne.
const fag = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/fag' }),
  schema: z.object({
    fag: z.enum(FAG_IDER),
    /** Én sætning om faget. Vises på /fag/ og til søgemaskiner */
    beskrivelse: z.string().min(1),
    /** De niveauer, siden dækker indtil videre */
    niveauer: z.array(z.enum(['A', 'B', 'C'])).min(1),
    laereplan: laereplaner,
    /** Læreplan, vejledning og emu.dk (projektplan afsnit 6.3) */
    links: z.array(z.object({ navn: z.string().min(1), url: z.url() })).min(1),
    /** Den dag, siden sidst blev tjekket mod kilderne */
    tjekket: z.coerce.date(),
    kilder: kildeliste,
    /** Sættes kun til true af repoets ejer, når siden er gennemlæst (CLAUDE.md, regel 3) */
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
    /** Læreplanens version, hvis guiden bygger på en læreplan, fx "2017" for SRP eller ["2017", "2020"] */
    laereplan: laereplaner.optional(),
    /** Vises på siden: "Bygger på …", fx "læreplanen fra 2017 og prøvebekendtgørelsen fra 2026" */
    grundlag: z.string().min(1),
    /** Den dag, reglerne sidst blev tjekket mod kilderne */
    tjekket: z.coerce.date(),
    kilder: kildeliste,
    /** Sættes kun til true af et menneske, der har læst siden igennem */
    verificeret: z.boolean(),
  }),
});

export const collections = { emner, fag, eksamen };
