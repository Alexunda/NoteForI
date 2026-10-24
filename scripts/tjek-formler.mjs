// Tjekker formlerne i dist/ efter buildet. Scriptet kører som en del af
// `npm run build`, så en formel, der ikke er blevet til KaTeX, stopper
// udgivelsen.
//
// Det tjekker, at
// - ingen formel står tilbage som kode (language-math, math-inline eller
//   math-display). Det sker, hvis kodefremhævningen eller et plugin har taget
//   formlen, før KaTeX nåede den
// - ingen formel har en KaTeX-fejl eller et forkert :xmlns, og der ikke står
//   $$ tilbage i teksten
// - buildet har mindst én inline-formel ($…$) og én display-formel ($$…$$),
//   så det er tjekket i et rigtigt build, at begge slags virker
// - hver side med formler har KaTeX' stylesheet, og at stylesheetet og
//   skrifttyperne ligger på siden selv og ikke på et CDN

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const BASE = (config.base ?? '/').replace(/\/+$/, '');

async function findFiler(mappe, endelse) {
  const filer = [];
  for (const indgang of await readdir(mappe, { withFileTypes: true })) {
    const fuld = path.join(mappe, indgang.name);
    if (indgang.isDirectory()) filer.push(...(await findFiler(fuld, endelse)));
    else if (indgang.name.endsWith(endelse)) filer.push(fuld);
  }
  return filer;
}

async function findes(fil) {
  try {
    return (await stat(fil)).isFile();
  } catch {
    return false;
  }
}

/** En sti under base-stien, fx /NoteForI/_astro/x.css, til en fil i dist/ */
function distFil(sti) {
  return path.join(DIST, decodeURIComponent(sti.slice(BASE.length)));
}

const fejl = [];
const relativ = (fil) => path.relative(DIST, fil);

// Stylesheets: skrifttyper og @import skal ligge lokalt
const katexStylesheets = new Set();
for (const fil of await findFiler(DIST, '.css')) {
  const css = await readFile(fil, 'utf8');
  if (css.includes('.katex')) katexStylesheets.add(`/${path.relative(DIST, fil).split(path.sep).join('/')}`);
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    const adresse = match[1];
    if (adresse.startsWith('data:')) continue;
    if (/^(https?:)?\/\//i.test(adresse)) {
      fejl.push(`${relativ(fil)}: "${adresse}" ligger ikke på siden selv`);
    } else if (adresse.startsWith(`${BASE}/`) && !(await findes(distFil(adresse)))) {
      fejl.push(`${relativ(fil)}: "${adresse}" findes ikke`);
    }
  }
}

let inline = 0;
let display = 0;
for (const fil of await findFiler(DIST, '.html')) {
  const html = await readFile(fil, 'utf8');
  const navn = relativ(fil);

  for (const klasse of ['language-math', 'math-inline', 'math-display']) {
    if (html.includes(klasse)) fejl.push(`${navn}: en formel står som kode (${klasse}), ikke som KaTeX`);
  }
  if (html.includes('katex-error')) fejl.push(`${navn}: en formel har en KaTeX-fejl`);
  if (html.includes(' :xmlns=')) fejl.push(`${navn}: en formel har et forkert :xmlns-attribut`);

  // Tekst uden scripts, styles og tags
  const tekst = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<annotation[\s\S]*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, '');
  if (tekst.includes('$$')) fejl.push(`${navn}: der står $$ i teksten, så en formel er ikke blevet læst`);

  for (const match of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)) {
    if (/href="(https?:)?\/\//i.test(match[0])) fejl.push(`${navn}: stylesheet fra en anden side: ${match[0]}`);
  }

  const antalDisplay = (html.match(/class="katex-display"/g) ?? []).length;
  const antalAlle = (html.match(/class="katex"/g) ?? []).length;
  display += antalDisplay;
  inline += antalAlle - antalDisplay;

  if (antalAlle > 0) {
    const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    const harKatex = stylesheets.some((href) => href.startsWith(`${BASE}/`) && katexStylesheets.has(href.slice(BASE.length)));
    if (!harKatex) fejl.push(`${navn}: siden har formler, men ikke KaTeX' stylesheet`);
  }
}

if (inline === 0) fejl.push('Buildet har ingen inline-formler ($…$), så det er ikke tjekket, at de virker');
if (display === 0) fejl.push('Buildet har ingen display-formler ($$…$$), så det er ikke tjekket, at de virker');

if (fejl.length > 0) {
  console.error(`Formel-tjek: ${fejl.length} fejl\n`);
  for (const linje of fejl) console.error(`  - ${linje}`);
  process.exit(1);
}

console.log(
  `Formel-tjek: ${inline} inline-formler og ${display} display-formler er KaTeX. ` +
    'Stylesheet og skrifttyper ligger på siden selv.',
);
