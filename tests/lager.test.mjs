// Tests af flytningen af pensumtjeklisten fra gh:v1:pensum til gh:v2:pensum
// (src/lib/lager.ts). localStorage er lavet om til et simpelt Map.

import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { GAMLE_NOEGLER, NOEGLER, hentPensum } from '../src/lib/lager.ts';
import { laesPensum } from '../src/lib/pensum.ts';

let lager;
let blokeret;

beforeEach(() => {
  lager = new Map();
  blokeret = false;
  globalThis.localStorage = {
    getItem: (n) => (lager.has(n) ? lager.get(n) : null),
    setItem: (n, v) => {
      if (blokeret) throw new Error('QuotaExceededError');
      lager.set(n, String(v));
    },
    removeItem: (n) => lager.delete(n),
  };
});

const v1 = {
  fag: [{ id: 'a1', fagside: 'dansk', navn: 'Dansk', niveau: 'A', forloeb: [{ id: 'b1', navn: 'Romantikken' }], generisk: ['x'] }],
};

describe('hentPensum', () => {
  test('data fra version 1 flyttes til version 2 og får læreplanen null', () => {
    lager.set(GAMLE_NOEGLER.pensum, JSON.stringify(v1));
    const data = hentPensum((raa) => laesPensum(raa));
    assert.equal(data.fag[0].laereplan, null);
    assert.equal(data.fag[0].forloeb[0].navn, 'Romantikken');
    assert.deepEqual(JSON.parse(lager.get(NOEGLER.pensum)), data);
    assert.equal(lager.has(GAMLE_NOEGLER.pensum), false);
  });

  test('findes version 2, bruges den, og version 1 bliver ikke rørt', () => {
    const v2 = { fag: [] };
    lager.set(NOEGLER.pensum, JSON.stringify(v2));
    lager.set(GAMLE_NOEGLER.pensum, JSON.stringify(v1));
    assert.deepEqual(hentPensum((raa) => laesPensum(raa)), v2);
    assert.equal(lager.has(GAMLE_NOEGLER.pensum), true);
  });

  test('vil browseren ikke gemme, bruges de gamle data, og de bliver liggende', () => {
    lager.set(GAMLE_NOEGLER.pensum, JSON.stringify(v1));
    blokeret = true;
    const data = hentPensum((raa) => laesPensum(raa));
    assert.equal(data.fag[0].navn, 'Dansk');
    assert.equal(lager.has(GAMLE_NOEGLER.pensum), true);
    assert.equal(lager.has(NOEGLER.pensum), false);
  });

  test('ingen data giver null', () => {
    assert.equal(hentPensum((raa) => laesPensum(raa)), null);
  });
});
