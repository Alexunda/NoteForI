// Tests af grafkomponentens logik (src/lib/graf/): tal på dansk,
// fortolkning af forskrifter, flyt og zoom og punkterne på kurverne.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { sampel } from '../src/lib/graf/sampling.ts';
import { decimalerTil, formaterTal, inddeling, streger } from '../src/lib/graf/tal.ts';
import { fortolk, normaliser, UdtrykFejl } from '../src/lib/graf/udtryk.ts';
import { begraens, flyt, knib, tilData, tilSkaerm, traek, zoom } from '../src/lib/graf/visning.ts';

const naesten = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} er ikke ${b}`);

describe('tal på dansk', () => {
  test('decimalkomma, minustegn og ingen tusindtalsseparator', () => {
    assert.equal(formaterTal(-1.5), '−1,5');
    assert.equal(formaterTal(1234.5), '1234,5');
    assert.equal(formaterTal(0.1 + 0.2), '0,3');
    assert.equal(formaterTal(-0.0001), '0');
    assert.equal(formaterTal(2 / 3, 3), '0,667');
    assert.equal(formaterTal(Number.NaN), 'ikke defineret');
    assert.equal(formaterTal(-Infinity), '−∞');
  });

  test('inddelingen på en akse er 1, 2 eller 5 gange en potens af 10', () => {
    assert.equal(inddeling(0, 10, 10), 1);
    assert.equal(inddeling(0, 100, 10), 10);
    assert.equal(inddeling(0, 7, 5), 2);
    assert.equal(inddeling(-20, 30, 8), 10);
    naesten(inddeling(-0.003, 0.003, 6), 0.001);
  });

  test('stregerne ligger på hele multipla af inddelingen uden afrundingsfejl', () => {
    assert.deepEqual(streger(-1, 1, 0.5), [-1, -0.5, 0, 0.5, 1]);
    assert.deepEqual(streger(0, 0.3, 0.1), [0, 0.1, 0.2, 0.3]);
    assert.deepEqual(streger(0.5, 3.7, 1), [1, 2, 3]);
  });

  test('antal decimaler passer til inddelingen', () => {
    assert.equal(decimalerTil(10), 0);
    assert.equal(decimalerTil(1), 0);
    assert.equal(decimalerTil(0.5), 1);
    assert.equal(decimalerTil(0.2), 1);
    assert.equal(decimalerTil(0.05), 2);
  });
});

describe('forskrifter', () => {
  test('dansk skrivemåde bliver til math.js-skrivemåde', () => {
    assert.equal(normaliser('2 · 1,05^x'), '2 * 1.05^x');
    assert.equal(normaliser('log(8; 2) − 3×x'), 'log(8, 2) - 3*x');
    assert.equal(normaliser('√(x) + π'), 'sqrt(x) + pi');
  });

  test('f(x) = 2 · 1,05^x', () => {
    const f = fortolk('f(x) = 2 · 1,05^x');
    assert.equal(f.navn, 'f');
    assert.equal(f.tekst, '2 · 1,05^x');
    assert.deepEqual(f.parametre, []);
    naesten(f.vaerdi(10), 2 * 1.05 ** 10);
  });

  test('andre bogstaver end x bliver til parametre', () => {
    const f = fortolk('b · a^x');
    assert.deepEqual(f.parametre, ['b', 'a']);
    assert.equal(f.vaerdi(2, { a: 3, b: 2 }), 18);
    assert.equal(f.medVaerdier({ a: 1.05, b: -2 }), '−2 · 1,05 ^ x');
    // En parameter uden værdi er 1
    assert.equal(f.vaerdi(5, { b: 4 }), 4);
  });

  test('underforstået gange og konstanter', () => {
    assert.equal(fortolk('2x + 1').vaerdi(3), 7);
    naesten(fortolk('2pi').vaerdi(0), 2 * Math.PI);
    naesten(fortolk('e^x').vaerdi(1), Math.E);
    assert.equal(fortolk('y = x^2').navn, null);
  });

  test('log er titalslogaritmen og ln den naturlige logaritme, også inde i hinanden', () => {
    naesten(fortolk('log(100)').vaerdi(0), 2);
    naesten(fortolk('ln(e)').vaerdi(0), 1);
    naesten(fortolk('log(8; 2)').vaerdi(0), 3);
    naesten(fortolk('log(ln(e^10))').vaerdi(0), 1);
  });

  test('funktionen giver NaN eller ±∞, hvor den ikke er defineret', () => {
    assert.ok(Number.isNaN(fortolk('sqrt(x)').vaerdi(-1)));
    assert.ok(Number.isNaN(fortolk('x^(1/3)').vaerdi(-8)));
    assert.equal(fortolk('ln(x)').vaerdi(0), -Infinity);
  });

  test('forskrifter, der ikke kan læses, giver en dansk forklaring', () => {
    assert.throws(() => fortolk(''), UdtrykFejl);
    assert.throws(() => fortolk('2 * (x + 1'), /kan ikke læses/);
    assert.throws(() => fortolk('ax + b'), /Skriv gange mellem bogstaver/);
    assert.throws(() => fortolk('foo(x)'), /Funktionen "foo" kendes ikke/);
    assert.throws(() => fortolk('x > 1'), /ikke et regneudtryk/);
  });
});

describe('flyt og zoom', () => {
  const v = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };

  test('skærm og koordinatsystem passer sammen', () => {
    assert.deepEqual(tilData(v, 200, 100, { x: 100, y: 50 }), { x: 0, y: 0 });
    assert.deepEqual(tilData(v, 200, 100, { x: 0, y: 0 }), { x: -10, y: 5 });
    assert.deepEqual(tilSkaerm(v, 200, 100, { x: 10, y: -5 }), { x: 200, y: 100 });
  });

  test('zoom holder punktet fast og ændrer spændet', () => {
    const ny = zoom(v, 0.5, 2, 1);
    assert.deepEqual(ny, { xMin: -4, xMax: 6, yMin: -2, yMax: 3 });
    assert.deepEqual(zoom(v, 2, 0, 0), { xMin: -20, xMax: 20, yMin: -10, yMax: 10 });
  });

  test('træk til højre flytter visningen mod venstre', () => {
    assert.deepEqual(flyt(v, 1, 2), { xMin: -9, xMax: 11, yMin: -3, yMax: 7 });
    assert.deepEqual(traek(v, 200, 100, { x: 100, y: 50 }, { x: 150, y: 70 }), {
      xMin: -15,
      xMax: 5,
      yMin: -3,
      yMax: 7,
    });
  });

  test('knib ud zoomer ind, og punktet mellem fingrene følger med', () => {
    const ny = knib(v, 200, 100, { x: 90, y: 50 }, { x: 110, y: 50 }, { x: 80, y: 50 }, { x: 120, y: 50 });
    naesten(ny.xMax - ny.xMin, 10);
    naesten(ny.yMax - ny.yMin, 5);
    const midt = tilData(ny, 200, 100, { x: 100, y: 50 });
    naesten(midt.x, 0);
    naesten(midt.y, 0);
  });

  test('man kan ikke zoome uendeligt ind eller ud', () => {
    assert.deepEqual(zoom(v, 1e-9, 0, 0), v);
    assert.deepEqual(zoom(v, 1e10, 0, 0), v);
    assert.deepEqual(begraens({ xMin: 1, xMax: 1, yMin: 0, yMax: 1 }, v), v);
  });
});

describe('punkterne på kurven', () => {
  const v = { xMin: -1, xMax: 1, yMin: -2, yMax: 2 };

  test('en sammenhængende funktion giver ét stykke', () => {
    const stykker = sampel((x) => x, v, 100);
    assert.equal(stykker.length, 1);
    assert.equal(stykker[0].length, 101);
  });

  test('stykket stopper, hvor funktionen ikke er defineret', () => {
    const stykker = sampel(Math.log, v, 100);
    assert.equal(stykker.length, 1);
    assert.ok(stykker[0].every(([x]) => x > 0));
  });

  test('der tegnes ikke en lodret streg hen over en asymptote', () => {
    assert.equal(sampel((x) => 1 / x, v, 101).length, 2);
    assert.equal(sampel(Math.tan, { xMin: 0, xMax: 3, yMin: -5, yMax: 5 }, 99).length, 2);
  });

  test('en stejl, men sammenhængende funktion bliver ikke delt', () => {
    assert.equal(sampel((x) => 10 ** (5 * x), v, 50).length, 1);
  });
});
