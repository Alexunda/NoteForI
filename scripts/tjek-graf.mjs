// Tjekker i en rigtig browser, at grafkomponenten kan betjenes med fingrene,
// musen og tastaturet. Kør det efter et build:
//
//   npm run build && npm run tjek:graf
//   npm run tjek:graf -- /fag/matematik/et-emne/     (en anden side med en graf)
//
// Scriptet bruger en telefon i 375 px med touch og tjekker, at
// - et træk med én finger flytter grafen
// - et knib med to fingre zoomer ind, og at knib ind zoomer ud
// - en skyder ændrer parameteren
// - tastaturet kan flytte og zoome, og at Nulstil virker
// Det tjekker også, at der ikke kommer fejl i konsollen.
//
// Playwright er installeret på forhånd i Claude Code i skyen. Lokalt skal det
// installeres først: npm i -D playwright && npx playwright install chromium

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('Playwright er ikke installeret. Se kommentaren øverst i scripts/tjek-graf.mjs.');
  process.exit(1);
}

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const BASE = (config.base ?? '/').replace(/\/+$/, '');
const SIDE = process.argv[2] ?? '/fag/matematik/eksempel/';
const TYPER = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };

function startServer() {
  const server = createServer(async (anmodning, svar) => {
    const sti = decodeURIComponent(new URL(anmodning.url, 'http://localhost').pathname);
    let fil = path.join(DIST, sti.startsWith(`${BASE}/`) ? sti.slice(BASE.length) : sti);
    if (sti.endsWith('/')) fil = path.join(fil, 'index.html');
    const findes = await stat(fil).then((s) => s.isFile(), () => false);
    svar.writeHead(findes ? 200 : 404, { 'content-type': TYPER[path.extname(fil)] ?? 'application/octet-stream' });
    if (findes) createReadStream(fil).pipe(svar);
    else svar.end();
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/** Læser udsnittet fra lærredets beskrivelse: "x fra A til B og y fra C til D" */
function udsnit(beskrivelse) {
  const tal = (t) => Number(t.replace('−', '-').replace(',', '.'));
  const m = /x fra (\S+) til (\S+) og y fra (\S+) til (\S+?)\.$/.exec(beskrivelse ?? '');
  if (!m) throw new Error(`Kan ikke læse udsnittet i "${beskrivelse}"`);
  const [xMin, xMax, yMin, yMax] = m.slice(1).map(tal);
  return { xMin, xMax, yMin, yMax, bredde: xMax - xMin };
}

const server = await startServer();
const browser = await chromium.launch();
const kontekst = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
});
const fane = await kontekst.newPage();
const fejl = [];
fane.on('pageerror', (e) => fejl.push(e.message));
fane.on('console', (besked) => besked.type() === 'error' && fejl.push(besked.text()));

const resultater = [];
function tjek(navn, ok, detaljer = '') {
  resultater.push(ok);
  console.log(`${ok ? 'ok  ' : 'FEJL'}  ${navn}${detaljer ? `  (${detaljer})` : ''}`);
}

await fane.goto(`http://127.0.0.1:${server.address().port}${BASE}${SIDE}`, { waitUntil: 'networkidle' });
const laerred = fane.locator('.graf-laerred').first();
await laerred.scrollIntoViewIfNeeded();
await fane.waitForFunction(() => {
  const oe = document.querySelector('astro-island');
  return oe && !oe.hasAttribute('ssr');
});
await fane.waitForTimeout(300);

const kasse = await laerred.boundingBox();
const cx = kasse.x + kasse.width / 2;
const cy = kasse.y + kasse.height / 2;
const cdp = await kontekst.newCDPSession(fane);
const beskrivelse = () => laerred.getAttribute('aria-label');

async function beroer(type, punkter) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punkter.map(([x, y], id) => ({ x, y, id })) });
}

async function gestus(fra, til, trin = 8) {
  await beroer('touchStart', fra);
  for (let i = 1; i <= trin; i++) {
    const t = i / trin;
    await beroer('touchMove', fra.map(([x, y], j) => [x + (til[j][0] - x) * t, y + (til[j][1] - y) * t]));
  }
  await beroer('touchEnd', []);
  await fane.waitForTimeout(100);
}

// Træk til højre med én finger: udsnittet flytter sig mod venstre
let foer = udsnit(await beskrivelse());
await gestus([[cx, cy]], [[cx + 80, cy]]);
let efter = udsnit(await beskrivelse());
tjek('Træk med én finger flytter grafen', efter.xMin < foer.xMin && Math.abs(efter.bredde - foer.bredde) < 1e-6,
  `x fra ${foer.xMin} til ${efter.xMin}`);

// Knib ud med to fingre: udsnittet bliver mindre (zoom ind)
foer = efter;
await gestus([[cx - 30, cy], [cx + 30, cy]], [[cx - 90, cy], [cx + 90, cy]]);
efter = udsnit(await beskrivelse());
tjek('Knib ud med to fingre zoomer ind', efter.bredde < foer.bredde * 0.6, `bredde ${foer.bredde} → ${efter.bredde}`);

// Knib ind: udsnittet bliver større (zoom ud)
foer = efter;
await gestus([[cx - 90, cy], [cx + 90, cy]], [[cx - 30, cy], [cx + 30, cy]]);
efter = udsnit(await beskrivelse());
tjek('Knib ind med to fingre zoomer ud', efter.bredde > foer.bredde * 1.6, `bredde ${foer.bredde} → ${efter.bredde}`);

// Siden må ikke være rullet eller zoomet af gestusserne
const sideZoom = await fane.evaluate(() => window.visualViewport?.scale ?? 1);
tjek('Siden zoomer ikke med, når man kniber i grafen', Math.abs(sideZoom - 1) < 0.01, `skala ${sideZoom}`);

// Skyderen ændrer parameteren
const skyder = fane.locator('.graf-parameter input[type="range"]').first();
const foerTekst = await fane.locator('.graf-parameter output').first().textContent();
const foerKurve = await beskrivelse();
await skyder.focus();
for (let i = 0; i < 5; i++) await fane.keyboard.press('ArrowRight');
const efterTekst = await fane.locator('.graf-parameter output').first().textContent();
tjek('Skyderen ændrer parameteren og forskriften', efterTekst !== foerTekst && (await beskrivelse()) !== foerKurve,
  `${foerTekst} → ${efterTekst}`);

// Tastaturet zoomer og flytter, og Nulstil virker
await laerred.focus();
foer = udsnit(await beskrivelse());
await fane.keyboard.press('+');
await fane.keyboard.press('ArrowLeft');
await fane.waitForTimeout(100);
efter = udsnit(await beskrivelse());
tjek('Tastaturet zoomer og flytter', efter.bredde < foer.bredde && efter.xMin !== foer.xMin);
await fane.getByRole('button', { name: 'Nulstil' }).first().click();
await fane.waitForTimeout(100);
const nulstillet = udsnit(await beskrivelse());
tjek('Nulstil giver startudsnittet igen', nulstillet.bredde > efter.bredde, `bredde ${nulstillet.bredde}`);

// Kurverne er tegnet: lærredet har andre farver end baggrunden
const farver = await laerred.evaluate((el) => {
  const ctx = el.getContext('2d');
  const data = ctx.getImageData(0, 0, el.width, el.height).data;
  const set = new Set();
  for (let i = 0; i < data.length; i += 4 * 97) set.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
  return set.size;
});
tjek('Grafen er tegnet', farver > 5, `${farver} farver`);
tjek('Ingen fejl i konsollen', fejl.length === 0, fejl.join(' | '));

await browser.close();
server.close();
if (resultater.some((ok) => !ok)) process.exitCode = 1;
