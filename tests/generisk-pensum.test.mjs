// Tests af tjekket af det generiske lag (src/lib/generisk-pensum.ts). Kør dem med `npm test`.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { tilVisning, tjekGeneriskPensum } from '../src/lib/generisk-pensum.ts';

const EMNER = new Set(['matematik/eksempel']);

function liste(aendringer = {}) {
  return {
    fag: 'matematik',
    niveau: 'A',
    laereplan: '2024',
    kilder: [{ navn: 'Læreplan', url: 'https://uvm.dk/' }],
    verificeret: false,
    punkter: [
      { id: 'foerste-punkt', tekst: 'Det første', emne: 'matematik/eksempel' },
      { id: 'andet-punkt', tekst: 'Det andet' },
    ],
    ...aendringer,
  };
}

describe('tjekGeneriskPensum', () => {
  test('ingen lister og gyldige lister giver ingen fejl', () => {
    assert.deepEqual(tjekGeneriskPensum([], EMNER), []);
    assert.deepEqual(tjekGeneriskPensum([liste(), liste({ laereplan: '2017' })], EMNER), []);
  });

  test('fejl i listen findes og beskrives', () => {
    const fejl = tjekGeneriskPensum(
      [
        liste(),
        liste(),
        liste({
          niveau: 'B',
          laereplan: '24',
          kilder: [{ navn: ' ', url: 'uvm.dk' }],
          punkter: [
            { id: 'Store Bogstaver', tekst: 'x' },
            { id: 'ens', tekst: ' ' },
            { id: 'ens', tekst: 'y', emne: 'matematik/findes-ikke' },
          ],
        }),
        liste({ niveau: 'C', kilder: [], punkter: [] }),
      ],
      EMNER,
    );
    assert.deepEqual(fejl, [
      'matematik A (2024): listen findes to gange.',
      'matematik B (24): laereplan skal være et årstal, fx "2024".',
      'matematik B (24): en kilde mangler et navn.',
      'matematik B (24): kilden " " har ikke en gyldig url.',
      'matematik B (24): id\'et "Store Bogstaver" må kun have a–z, 0–9 og bindestreg.',
      'matematik B (24): punktet "ens" mangler tekst.',
      'matematik B (24): id\'et "ens" findes to gange.',
      'matematik B (24): emnet "matematik/findes-ikke" findes ikke i src/content/emner.',
      'matematik C (2024): listen skal have mindst én kilde.',
      'matematik C (2024): listen har ingen punkter.',
    ]);
  });
});

describe('tilVisning', () => {
  test('emner bliver til links', () => {
    const [visning] = tilVisning([liste()], new Map([['matematik/eksempel', '/NoteForI/fag/matematik/eksempel/']]));
    assert.deepEqual(visning.punkter, [
      { id: 'foerste-punkt', tekst: 'Det første', url: '/NoteForI/fag/matematik/eksempel/' },
      { id: 'andet-punkt', tekst: 'Det andet' },
    ]);
    assert.equal(visning.laereplan, '2024');
  });
});
