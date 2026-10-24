// Tjekker de interne links i dist/ efter buildet. Scriptet kører som en del
// af `npm run build`, så et dødt internt link stopper udgivelsen.
//
// Det tjekker, at
// - hvert internt link (href og src) peger på en fil, der findes
// - et link til et sted på en side (fx #begreb-vaekstrate) peger på et id,
//   der findes på siden
// - interne links har base-stien og skråstreg til sidst
// - alle sider kan nås med højst to tryk fra forsiden (CLAUDE.md)
//
// Eksterne links tjekkes ikke her, så et eksternt link, der er nede, ikke kan
// stoppe en udgivelse. Brug `npm run tjek:eksterne-links` til dem.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const BASE = (config.base ?? '/').replace(/\/+$/, '');
const SITE = (config.site ?? '').replace(/\/+$/, '');
const MAKS_TRYK = 2;
// Sider, der ikke skal kunne nås via links fra forsiden
const UDEN_FOR_MENUEN = new Set([`${BASE}/404.html`]);

async function findHtmlFiler(mappe) {
  const filer = [];
  for (const indgang of await readdir(mappe, { withFileTypes: true })) {
    const fuld = path.join(mappe, indgang.name);
    if (indgang.isDirectory()) filer.push(...(await findHtmlFiler(fuld)));
    else if (indgang.name.endsWith('.html')) filer.push(fuld);
  }
  return filer;
}

/** dist/fag/index.html giver /NoteForI/fag/ */
function sideUrl(fil) {
  const relativ = path.relative(DIST, fil).split(path.sep).join('/');
  return `${BASE}/${relativ.replace(/(^|\/)index\.html$/, '$1')}`;
}

async function findes(fil) {
  try {
    return (await stat(fil)).isFile();
  } catch {
    return false;
  }
}

async function erMappeMedIndex(mappe) {
  return findes(path.join(mappe, 'index.html'));
}

function idsI(html) {
  return new Set([...html.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => m[1] ?? m[2]));
}

function linksI(html) {
  const links = [];
  for (const match of html.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    links.push((match[1] ?? match[2]).replaceAll('&amp;', '&').trim());
  }
  return links;
}

/** Giver den interne sti (med base) eller null for eksterne links og lignende. */
function internSti(link, fraSide) {
  if (link === '' || link.startsWith('#') || /^(mailto|tel|javascript|data):/i.test(link)) return null;
  if (/^(https?:)?\/\//i.test(link)) {
    if (SITE && link.startsWith(`${SITE}${BASE}/`)) return new URL(link).pathname;
    return null;
  }
  return new URL(link, `http://side${fraSide}`).pathname;
}

const fejl = [];
const sider = new Map(); // side-url → links til andre sider
const idsPaaSide = new Map(); // side-url → id'erne på siden
const ankre = []; // { fra, link, side, id } for links med #
let antalLinks = 0;

for (const fil of await findHtmlFiler(DIST)) {
  const fra = sideUrl(fil);
  const tilSider = new Set();
  sider.set(fra, tilSider);

  const html = await readFile(fil, 'utf8');
  idsPaaSide.set(fra, idsI(html));
  for (const link of linksI(html)) {
    if (link.length > 1 && link.startsWith('#')) ankre.push({ fra, link, side: fra, id: link.slice(1) });
    const sti = internSti(link, fra);
    if (sti === null) continue;
    antalLinks++;
    const anker = new URL(link, `http://side${fra}`).hash;
    if (anker.length > 1) ankre.push({ fra, link, side: sti, id: anker.slice(1) });

    if (!sti.startsWith(`${BASE}/`)) {
      fejl.push(`${fra}: "${link}" mangler base-stien ${BASE}/`);
      continue;
    }

    const maal = path.join(DIST, decodeURIComponent(sti.slice(BASE.length)));
    if (sti.endsWith('/')) {
      if (await erMappeMedIndex(maal)) tilSider.add(sti);
      else fejl.push(`${fra}: "${link}" findes ikke`);
    } else if (await findes(maal)) {
      if (maal.endsWith('.html')) tilSider.add(sti);
    } else if (await erMappeMedIndex(maal)) {
      fejl.push(`${fra}: "${link}" mangler skråstreg til sidst`);
    } else {
      fejl.push(`${fra}: "${link}" findes ikke`);
    }
  }
}

for (const { fra, link, side, id } of ankre) {
  const ids = idsPaaSide.get(side);
  if (ids && !ids.has(decodeURIComponent(id))) fejl.push(`${fra}: "${link}" peger på et id, der ikke findes på siden`);
}

// Antal tryk fra forsiden til hver side (bredde-først-søgning)
const forside = `${BASE}/`;
const tryk = new Map([[forside, 0]]);
const koe = [forside];
while (koe.length > 0) {
  const side = koe.shift();
  for (const naeste of sider.get(side) ?? []) {
    if (!tryk.has(naeste)) {
      tryk.set(naeste, tryk.get(side) + 1);
      koe.push(naeste);
    }
  }
}

for (const side of sider.keys()) {
  if (UDEN_FOR_MENUEN.has(side)) continue;
  if (!tryk.has(side)) fejl.push(`${side} kan ikke nås fra forsiden`);
  else if (tryk.get(side) > MAKS_TRYK) {
    fejl.push(`${side} kræver ${tryk.get(side)} tryk fra forsiden (højst ${MAKS_TRYK})`);
  }
}

if (fejl.length > 0) {
  console.error(`Link-tjek: ${fejl.length} fejl\n`);
  for (const linje of fejl) console.error(`  - ${linje}`);
  process.exit(1);
}

console.log(
  `Link-tjek: ${sider.size} sider og ${antalLinks} interne links er i orden. ` +
    `Alle sider kan nås med højst ${MAKS_TRYK} tryk fra forsiden.`,
);
