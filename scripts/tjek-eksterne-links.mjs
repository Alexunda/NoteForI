// Tjekker de eksterne links (fx uvm.dk) på siden. Kør det selv efter et build:
//
//   npm run build && npm run tjek:eksterne-links
//
// Scriptet er ikke en del af buildet, så et eksternt link, der er nede, ikke
// kan stoppe en udgivelse. I Claude Code i skyen kan et domæne være blokeret
// af netværkslisten. Så står der "kunne ikke nås", og domænet skal tilføjes.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SAMTIDIGE = 4;
const VENTETID_MS = 15_000;

async function findHtmlFiler(mappe) {
  const filer = [];
  for (const indgang of await readdir(mappe, { withFileTypes: true })) {
    const fuld = path.join(mappe, indgang.name);
    if (indgang.isDirectory()) filer.push(...(await findHtmlFiler(fuld)));
    else if (indgang.name.endsWith('.html')) filer.push(fuld);
  }
  return filer;
}

async function hent(url, metode) {
  return fetch(url, { method: metode, redirect: 'follow', signal: AbortSignal.timeout(VENTETID_MS) });
}

/** Prøver HEAD først. Nogle servere afviser HEAD, og så prøves GET. */
async function tjek(url) {
  try {
    let svar = await hent(url, 'HEAD');
    if (svar.status >= 400) svar = await hent(url, 'GET');
    return svar.ok ? { ok: true } : { ok: false, grund: `svarede ${svar.status}` };
  } catch (fejl) {
    return { ok: false, grund: `kunne ikke nås (${fejl.cause?.code ?? fejl.name})` };
  }
}

let filer;
try {
  filer = await findHtmlFiler(DIST);
} catch {
  console.error('Fandt ikke dist/. Kør `npm run build` først.');
  process.exit(1);
}

// Eksternt link → de sider, det står på
const links = new Map();
for (const fil of filer) {
  const side = '/' + path.relative(DIST, fil).split(path.sep).join('/');
  const html = await readFile(fil, 'utf8');
  for (const match of html.matchAll(/\shref\s*=\s*"(https?:\/\/[^"]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(side);
  }
}

const koe = [...links.keys()];
const doede = [];
async function arbejder() {
  while (koe.length > 0) {
    const url = koe.shift();
    const resultat = await tjek(url);
    console.log(`${resultat.ok ? 'ok  ' : 'FEJL'}  ${url}${resultat.ok ? '' : `  (${resultat.grund})`}`);
    if (!resultat.ok) doede.push({ url, ...resultat });
  }
}
await Promise.all(Array.from({ length: SAMTIDIGE }, arbejder));

console.log('');
if (doede.length === 0) {
  console.log(`Alle ${links.size} eksterne links virker.`);
} else {
  console.log(`${doede.length} af ${links.size} eksterne links virker ikke:`);
  for (const { url, grund } of doede) {
    console.log(`  - ${url} (${grund}), står på: ${[...links.get(url)].join(', ')}`);
  }
  process.exitCode = 1;
}
