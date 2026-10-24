// Tjekker to ting ved afhængighederne (CLAUDE.md, Stack):
// - satteri står i package.json med samme version som den,
//   @astrojs/markdown-satteri bruger, så der kun installeres én kopi
// - katex er låst til en bestemt version med vilje

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const pakke = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const laas = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));

test('satteri har samme version som i @astrojs/markdown-satteri', () => {
  const markdown = laas.packages['node_modules/@astrojs/markdown-satteri'];
  assert.ok(markdown, '@astrojs/markdown-satteri mangler i package-lock.json');
  assert.equal(pakke.dependencies.satteri, markdown.dependencies.satteri);
});

test('der er kun én kopi af satteri', () => {
  const kopier = Object.keys(laas.packages).filter((sti) => sti.endsWith('node_modules/satteri'));
  assert.deepEqual(kopier, ['node_modules/satteri']);
});

test('katex er låst til en bestemt version', () => {
  assert.match(pakke.dependencies.katex, /^\d+\.\d+\.\d+$/);
  assert.equal(laas.packages['node_modules/katex'].version, pakke.dependencies.katex);
});
