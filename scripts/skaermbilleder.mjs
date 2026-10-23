// Tager skærmbilleder af siden i 375 px og 1280 px, i lys og mørk tilstand,
// og tjekker samtidig for vandret scroll, for små trykflader og for fejl i
// konsollen. Kør det efter et build:
//
//   npm run build && npm run skaermbilleder
//   npm run skaermbilleder -- /fag/ /om/      (andre sider)
//
// Billederne lægges i skaermbilleder/, som står i .gitignore.
//
// Playwright er installeret på forhånd i Claude Code i skyen. Lokalt skal det
// installeres først: npm i -D playwright && npx playwright install chromium

import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('Playwright er ikke installeret. Se kommentaren øverst i scripts/skaermbilleder.mjs.');
  process.exit(1);
}

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const MAPPE = fileURLToPath(new URL('../skaermbilleder/', import.meta.url));
const BASE = (config.base ?? '/').replace(/\/+$/, '');
const SIDER = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['/', '/eksamen/', '/fag/matematik/eksempel/'];
const BREDDER = [
  { bredde: 375, hoejde: 812 },
  { bredde: 1280, hoejde: 800 },
];
const TEMAER = [
  { navn: 'lys', colorScheme: 'light' },
  { navn: 'moerk', colorScheme: 'dark' },
];
const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

/** En lille statisk server, der viser dist/ under base-stien ligesom GitHub Pages. */
function startServer() {
  const server = createServer(async (anmodning, svar) => {
    const sti = decodeURIComponent(new URL(anmodning.url, 'http://localhost').pathname);
    let fil = path.join(DIST, sti.startsWith(`${BASE}/`) ? sti.slice(BASE.length) : sti);
    if (sti.endsWith('/')) fil = path.join(fil, 'index.html');
    const findes = await stat(fil).then((s) => s.isFile(), () => false);
    if (!findes) {
      svar.writeHead(404, { 'content-type': TYPER['.html'] });
      createReadStream(path.join(DIST, '404.html')).pipe(svar);
      return;
    }
    svar.writeHead(200, { 'content-type': TYPER[path.extname(fil)] ?? 'application/octet-stream' });
    createReadStream(fil).pipe(svar);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/** Synlige knapper, links og felter under 44×44 px. Links inde i brødtekst tæller ikke med. */
function findSmaaTrykflader() {
  const smaa = [];
  for (const el of document.querySelectorAll('a, button, input, select, textarea, summary')) {
    if (el.closest('p, .emne-indhold') && el.tagName === 'A') continue;
    const boks = el.getBoundingClientRect();
    if (boks.width === 0 && boks.height === 0) continue;
    if (getComputedStyle(el).visibility === 'hidden') continue;
    if (boks.width < 44 || boks.height < 44) {
      const tekst = (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40);
      smaa.push(`${tekst} (${Math.round(boks.width)}×${Math.round(boks.height)})`);
    }
  }
  return smaa;
}

const server = await startServer();
const adresse = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
await mkdir(MAPPE, { recursive: true });
let problemer = 0;

for (const side of SIDER) {
  for (const { bredde, hoejde } of BREDDER) {
    for (const tema of TEMAER) {
      const kontekst = await browser.newContext({
        viewport: { width: bredde, height: hoejde },
        colorScheme: tema.colorScheme,
        deviceScaleFactor: bredde < 600 ? 2 : 1,
      });
      const fane = await kontekst.newPage();
      const sideUrl = `${adresse}${BASE}${side}`;
      const konsolfejl = [];
      fane.on('console', (besked) => {
        if (besked.type() !== 'error') return;
        // 404-siden får status 404 med vilje, og det logger browseren som en fejl
        if (besked.location().url === sideUrl && besked.text().includes('404')) return;
        konsolfejl.push(besked.text());
      });
      fane.on('pageerror', (fejl) => konsolfejl.push(fejl.message));

      await fane.goto(sideUrl, { waitUntil: 'networkidle' });
      const vandretScroll = await fane.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const smaa = await fane.evaluate(findSmaaTrykflader);

      // Ét billede af det, man ser først, og ét af hele siden. På billedet af
      // hele siden flyttes faste elementer (bundmenuen) ned i bunden, ellers
      // tegnes de midt på billedet ud for den første skærmhøjde.
      const navn = side.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'forside';
      const fil = path.join(MAPPE, `${navn}-${bredde}-${tema.navn}`);
      await fane.screenshot({ path: `${fil}-top.png` });
      await fane.evaluate(() => {
        document.body.style.position = 'relative';
        for (const el of document.querySelectorAll('body *')) {
          if (getComputedStyle(el).position === 'fixed') el.style.position = 'absolute';
        }
      });
      await fane.screenshot({ path: `${fil}-hel.png`, fullPage: true });
      const noter = [];
      if (vandretScroll) noter.push('vandret scroll');
      if (smaa.length > 0) noter.push(`små trykflader: ${smaa.join(', ')}`);
      if (konsolfejl.length > 0) noter.push(`konsolfejl: ${konsolfejl.join(' | ')}`);
      problemer += noter.length;

      console.log(`${noter.length === 0 ? 'ok  ' : 'OBS '}  ${path.relative(process.cwd(), fil)}-{top,hel}.png`);
      for (const note of noter) console.log(`        ${note}`);
      await kontekst.close();
    }
  }
}

await browser.close();
server.close();
if (problemer > 0) process.exitCode = 1;
