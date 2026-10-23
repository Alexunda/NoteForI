// Tjekker én eller flere emnesider uden at bygge hele siden. Nyttigt, mens
// man skriver en emneside, og når flere arbejder samtidig. Buildet tjekker
// det samme og mere til.
//
//   npm run tjek:emne -- src/content/emner/matematik/eksponentielle-funktioner.mdx
//   npm run tjek:emne                    (alle emnesider)
//
// Scriptet tjekker
// - frontmatter (felter, klassetrin, kilder med unikke id'er)
// - at MDX'en kan læses, at formlerne virker, og at alle kilde:-henvisninger
//   og <Formel>-kilder findes i frontmatter (med de samme plugins som buildet)
// - afsnittene og rækkefølgen (src/lib/emneside.ts) og at der er begreber
// - at forskrifterne i <Graf> kan læses

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mdxToJs, mdxToMdast } from 'satteri';
import { parse as laesYaml } from 'yaml';
import { FAG_IDER } from '../src/data/fag.ts';
import { udtraekBegreber } from '../src/lib/begreber.ts';
import { tjekEmneAfsnit } from '../src/lib/emneside.ts';
import { fortolk } from '../src/lib/graf/udtryk.ts';
import { emneAfsnit, emneTjek } from '../src/lib/markdown/emneside.ts';
import { katexPlugin } from '../src/lib/markdown/katex.ts';
import { kildehenvisninger } from '../src/lib/markdown/kilder.ts';
import { interneLinks } from '../src/lib/markdown/links.ts';

const ROD = fileURLToPath(new URL('../', import.meta.url));
const EMNER = path.join(ROD, 'src/content/emner');

async function alleEmner(mappe = EMNER) {
  const filer = [];
  for (const indgang of await readdir(mappe, { withFileTypes: true })) {
    const fuld = path.join(mappe, indgang.name);
    if (indgang.isDirectory()) filer.push(...(await alleEmner(fuld)));
    else if (/\.mdx?$/.test(indgang.name)) filer.push(fuld);
  }
  return filer;
}

function tjekFrontmatter(data, fil) {
  const fejl = [];
  const mangler = (felt) => data[felt] === undefined && fejl.push(`frontmatter mangler "${felt}"`);
  for (const felt of ['titel', 'beskrivelse', 'fag', 'nummer', 'niveau', 'klassetrin', 'laereplan', 'kilder', 'verificeret']) {
    mangler(felt);
  }
  if (data.fag && !FAG_IDER.includes(data.fag)) fejl.push(`fag skal være et af: ${FAG_IDER.join(', ')}`);
  if (data.fag && path.basename(path.dirname(fil)) !== data.fag) fejl.push(`filen skal ligge i src/content/emner/${data.fag}/`);
  if (!/^[a-z0-9-]+\.mdx?$/.test(path.basename(fil))) fejl.push('filnavnet må kun have a–z, 0–9 og bindestreg');
  if (data.nummer !== undefined && !(Number.isInteger(data.nummer) && data.nummer > 0)) fejl.push('nummer skal være et positivt heltal');
  if (data.niveau && !(Array.isArray(data.niveau) && data.niveau.every((n) => ['A', 'B', 'C'].includes(n)))) {
    fejl.push('niveau skal være en liste med A, B og/eller C');
  }
  const trin = data.klassetrin;
  if (trin !== undefined && trin !== 'ukendt' && !(Array.isArray(trin) && trin.length > 0 && trin.every((t) => ['1g', '2g', '3g'].includes(t)))) {
    fejl.push('klassetrin skal være "ukendt" eller en liste med 1g, 2g og/eller 3g');
  }
  const planer = Array.isArray(data.laereplan) ? data.laereplan : [data.laereplan];
  if (data.laereplan !== undefined && !planer.every((p) => /^\d{4}$/.test(String(p)))) fejl.push('laereplan skal være et årstal i anførselstegn, fx "2024"');
  if (data.verificeret !== undefined && typeof data.verificeret !== 'boolean') fejl.push('verificeret skal være true eller false');
  if (Array.isArray(data.kilder)) {
    const ider = new Set();
    for (const k of data.kilder) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(k?.id ?? '')) fejl.push(`kilden "${k?.navn}" mangler et gyldigt id`);
      if (ider.has(k?.id)) fejl.push(`to kilder har id'et "${k?.id}"`);
      ider.add(k?.id);
      if (!k?.navn) fejl.push(`kilden "${k?.id}" mangler et navn`);
      if (!/^https?:\/\//.test(k?.url ?? '')) fejl.push(`kilden "${k?.id}" mangler en url`);
    }
  } else if (data.kilder !== undefined) {
    fejl.push('kilder skal være en liste');
  }
  return fejl;
}

function overskrifter(mdx) {
  const ud = [];
  const besoeg = (node) => {
    if (node.type === 'heading') {
      const tekst = (function tekstAf(n) {
        return 'value' in n && typeof n.value === 'string' ? n.value : (n.children ?? []).map(tekstAf).join('');
      })(node);
      ud.push({ depth: node.depth, text: tekst.trim() });
    }
    for (const barn of node.children ?? []) besoeg(barn);
  };
  besoeg(mdxToMdast(mdx, { features: { math: true } }));
  return ud;
}

async function tjek(fil) {
  const kilde = await readFile(fil, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(kilde);
  if (!match) return ['filen skal starte med frontmatter mellem --- og ---'];
  let data;
  try {
    data = laesYaml(match[1]) ?? {};
  } catch (e) {
    return [`frontmatter kan ikke læses: ${e.message}`];
  }
  const krop = kilde.slice(match[0].length);
  const fejl = tjekFrontmatter(data, fil);

  try {
    mdxToJs(krop, {
      features: { math: true },
      mdastPlugins: [kildehenvisninger, emneTjek, interneLinks('/NoteForI')],
      hastPlugins: [katexPlugin, emneAfsnit],
      fileURL: pathToFileURL(fil),
      data: { astro: { frontmatter: data, headings: [], localImagePaths: new Set(), remoteImagePaths: new Set() } },
      jsxImportSource: 'astro',
      elementAttributeNameCase: 'html',
    });
  } catch (e) {
    fejl.push(e.message.split('\n')[0]);
  }

  try {
    fejl.push(...tjekEmneAfsnit(overskrifter(krop)));
  } catch {
    // MDX-fejlen er allerede meldt ovenfor
  }
  try {
    if (udtraekBegreber(krop).length === 0) fejl.push('afsnittet "Centrale begreber" skal have mindst ét <Begreb>');
  } catch (e) {
    fejl.push(e.message);
  }

  for (const [, , forskrift] of krop.matchAll(/forskrift:\s*(['"])(.*?)\1/g)) {
    try {
      fortolk(forskrift);
    } catch (e) {
      fejl.push(`<Graf>: ${e.message}`);
    }
  }
  return fejl;
}

const filer = process.argv.slice(2).length > 0 ? process.argv.slice(2).map((f) => path.resolve(f)) : await alleEmner();
let antalFejl = 0;
for (const fil of filer) {
  const fejl = await tjek(fil);
  antalFejl += fejl.length;
  const navn = path.relative(ROD, fil);
  if (fejl.length === 0) console.log(`ok    ${navn}`);
  else {
    console.log(`FEJL  ${navn}`);
    for (const f of fejl) console.log(`        - ${f}`);
  }
}
if (antalFejl > 0) process.exitCode = 1;
