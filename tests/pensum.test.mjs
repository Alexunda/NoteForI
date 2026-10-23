// Tests af pensumtjeklistens logik (src/lib/pensum.ts). Kør dem med `npm test`.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  MAKS_LINJER,
  MAKS_NAVN,
  alleIder,
  delLinjer,
  fagFejl,
  fjernForloeb,
  flytForloeb,
  forloebFejl,
  forloebStatus,
  genindsaetFag,
  genindsaetForloeb,
  laesPensum,
  omdoebForloeb,
  optael,
  optaelAlt,
  procent,
  retFag,
  saetGeneriskPunkt,
  saetPunkt,
  sletFag,
  sletForloeb,
  tilfoejFag,
  tilfoejForloeb,
} from '../src/lib/pensum.ts';

/** Giver id'erne t1, t2, t3 … i rækkefølge, så testene kan forudsige dem. */
function taeller() {
  let n = 0;
  return () => `t${++n}`;
}

/** Fryser data helt, så en test fejler, hvis en funktion ændrer dem. */
function frys(vaerdi) {
  if (typeof vaerdi === 'object' && vaerdi !== null) {
    for (const v of Object.values(vaerdi)) frys(v);
    Object.freeze(vaerdi);
  }
  return vaerdi;
}

/** Matematik A (t1) med forløbene Lineære (t2), Eksponentielle (t3) og Differential (t4). */
function eksempel() {
  const lavId = taeller();
  const medFag = tilfoejFag({ fag: [] }, { fagside: 'matematik', navn: 'Matematik', niveau: 'A' }, lavId);
  const { pensum } = tilfoejForloeb(medFag.pensum, 't1', ['Lineære', 'Eksponentielle', 'Differential'], lavId);
  return frys(pensum);
}

function navne(pensum, fagId = 't1') {
  return pensum.fag.find((fag) => fag.id === fagId).forloeb.map((forloeb) => forloeb.navn);
}

const ALLE_PUNKTER = { forklare: 'ja', begreber: 'ja', noter: 'ja', oevet: 'ja', opgaver: 'ja' };

describe('delLinjer', () => {
  test('hver linje bliver ét navn, og tomme linjer springes over', () => {
    assert.deepEqual(delLinjer('Romantikken\r\nBarokken\n\n  \rOplysningstiden\n'), [
      'Romantikken',
      'Barokken',
      'Oplysningstiden',
    ]);
  });

  test('punkttegn i starten fjernes', () => {
    assert.deepEqual(delLinjer('- Romantikken\n• Barokken\n* Realismen\n–  Modernismen\n•Naturalismen'), [
      'Romantikken',
      'Barokken',
      'Realismen',
      'Modernismen',
      'Naturalismen',
    ]);
  });

  test('bindestreg uden mellemrum efter bliver stående', () => {
    assert.deepEqual(delLinjer('-ismer'), ['-ismer']);
  });

  test('tydelige listenumre fjernes, men "2. verdenskrig" bliver stående', () => {
    assert.deepEqual(delLinjer('1) Romantikken\n(2) Barokken\n3.\tRealismen\n2. verdenskrig'), [
      'Romantikken',
      'Barokken',
      'Realismen',
      '2. verdenskrig',
    ]);
  });

  test('mellemrum samles, og meget lange navne forkortes', () => {
    assert.deepEqual(delLinjer('Den   kolde\tkrig'), ['Den kolde krig']);
    const [langt] = delLinjer('x'.repeat(MAKS_NAVN + 30));
    assert.equal(langt.length, MAKS_NAVN);
  });
});

describe('fag', () => {
  test('tilfoejFag giver et nyt fag med rensede data', () => {
    const { pensum, fag } = tilfoejFag(frys({ fag: [] }), { fagside: null, navn: '  Historie ', niveau: 'B' }, taeller());
    assert.deepEqual(fag, { id: 't1', fagside: null, navn: 'Historie', niveau: 'B', forloeb: [], generisk: [] });
    assert.deepEqual(pensum.fag, [fag]);
  });

  test('fagFejl afviser tomme navne og fag, man har i forvejen', () => {
    const pensum = eksempel();
    assert.equal(fagFejl(pensum, { fagside: null, navn: '  ', niveau: 'A' }), 'Skriv navnet på faget.');
    assert.equal(
      fagFejl(pensum, { fagside: null, navn: 'matematik', niveau: 'A' }),
      'Du har allerede Matematik A.',
    );
    assert.equal(fagFejl(pensum, { fagside: 'matematik', navn: 'Matematik', niveau: 'B' }), null);
    assert.equal(fagFejl(pensum, { fagside: 'matematik', navn: 'Matematik', niveau: 'A' }, 't1'), null);
  });

  test('retFag ændrer navn og niveau og beholder forløbene', () => {
    const pensum = retFag(eksempel(), 't1', { fagside: 'matematik', navn: 'Matematik', niveau: 'B' });
    assert.equal(pensum.fag[0].niveau, 'B');
    assert.deepEqual(navne(pensum), ['Lineære', 'Eksponentielle', 'Differential']);
  });

  test('et slettet fag kan sættes ind igen på sin plads', () => {
    const lavId = taeller();
    let pensum = tilfoejFag({ fag: [] }, { fagside: 'dansk', navn: 'Dansk', niveau: 'A' }, lavId).pensum;
    pensum = tilfoejFag(pensum, { fagside: 'kemi', navn: 'Kemi', niveau: 'B' }, lavId).pensum;
    frys(pensum);

    const { pensum: uden, slettet } = sletFag(pensum, 't1');
    assert.deepEqual(
      uden.fag.map((fag) => fag.navn),
      ['Kemi'],
    );
    assert.deepEqual(genindsaetFag(uden, slettet), pensum);
    assert.equal(sletFag(pensum, 'findes-ikke').slettet, null);
  });

  test('et fag sættes ikke ind to gange', () => {
    const { pensum, slettet } = sletFag(eksempel(), 't1');
    const igen = genindsaetFag(pensum, slettet);
    assert.equal(genindsaetFag(igen, slettet), igen);
  });
});

describe('tilfoejForloeb', () => {
  test('nye forløb kommer sidst med hver deres id', () => {
    const pensum = eksempel();
    assert.deepEqual(navne(pensum), ['Lineære', 'Eksponentielle', 'Differential']);
    assert.equal(alleIder(pensum).size, 4);
  });

  test('navne, der findes i forvejen, springes over, også med andre store og små bogstaver', () => {
    const { pensum, nye, dubletter } = tilfoejForloeb(eksempel(), 't1', ['lineære', 'Integral', 'INTEGRAL']);
    assert.deepEqual(
      nye.map((forloeb) => forloeb.navn),
      ['Integral'],
    );
    assert.equal(dubletter, 2);
    assert.deepEqual(navne(pensum), ['Lineære', 'Eksponentielle', 'Differential', 'Integral']);
  });

  test(`højst ${MAKS_LINJER} forløb ad gangen`, () => {
    const mange = Array.from({ length: MAKS_LINJER + 5 }, (_, i) => `Forløb ${i + 1}`);
    const { nye, forMange } = tilfoejForloeb(eksempel(), 't1', mange);
    assert.equal(nye.length, MAKS_LINJER);
    assert.equal(forMange, 5);
  });

  test('intet ændres, hvis faget ikke findes, eller der ikke er nye navne', () => {
    const pensum = eksempel();
    assert.equal(tilfoejForloeb(pensum, 'findes-ikke', ['Integral']).pensum, pensum);
    assert.equal(tilfoejForloeb(pensum, 't1', ['Lineære']).pensum, pensum);
  });

  test('en indsat liste kan fjernes igen', () => {
    const { pensum, nye } = tilfoejForloeb(eksempel(), 't1', ['Integral', 'Vektorer']);
    const fortrudt = fjernForloeb(
      pensum,
      't1',
      nye.map((forloeb) => forloeb.id),
    );
    assert.deepEqual(navne(fortrudt), ['Lineære', 'Eksponentielle', 'Differential']);
  });
});

describe('omdøb, flyt og slet forløb', () => {
  test('omdoebForloeb renser navnet', () => {
    assert.deepEqual(navne(omdoebForloeb(eksempel(), 't1', 't3', '  Eksponentielle   funktioner ')), [
      'Lineære',
      'Eksponentielle funktioner',
      'Differential',
    ]);
  });

  test('forloebFejl afviser tomme navne og navne, der findes', () => {
    const fag = eksempel().fag[0];
    assert.equal(forloebFejl(fag, ' '), 'Skriv navnet på forløbet.');
    assert.equal(forloebFejl(fag, 'differential'), 'Der er allerede et forløb, der hedder sådan.');
    assert.equal(forloebFejl(fag, 'Differential', 't4'), null);
    assert.equal(forloebFejl(fag, 'Integral'), null);
  });

  test('flytForloeb flytter én plads op eller ned', () => {
    assert.deepEqual(navne(flytForloeb(eksempel(), 't1', 't3', -1)), ['Eksponentielle', 'Lineære', 'Differential']);
    assert.deepEqual(navne(flytForloeb(eksempel(), 't1', 't3', 1)), ['Lineære', 'Differential', 'Eksponentielle']);
  });

  test('øverst og nederst sker der ingenting', () => {
    const pensum = eksempel();
    assert.equal(flytForloeb(pensum, 't1', 't2', -1), pensum);
    assert.equal(flytForloeb(pensum, 't1', 't4', 1), pensum);
  });

  test('et slettet forløb kan sættes ind igen på sin plads', () => {
    const pensum = eksempel();
    const { pensum: uden, slettet } = sletForloeb(pensum, 't1', 't3');
    assert.deepEqual(navne(uden), ['Lineære', 'Differential']);
    assert.deepEqual(genindsaetForloeb(uden, slettet), pensum);
    assert.equal(sletForloeb(pensum, 't1', 'findes-ikke').slettet, null);
  });

  test('pladsen tilpasses, hvis listen er blevet kortere imens', () => {
    const { pensum, slettet } = sletForloeb(eksempel(), 't1', 't4');
    const kortere = sletForloeb(pensum, 't1', 't3').pensum;
    assert.deepEqual(navne(genindsaetForloeb(kortere, slettet)), ['Lineære', 'Differential']);
  });
});

describe('punkter og status', () => {
  test('ingen punkter er rød, nogle er gul, og alle er grøn', () => {
    assert.deepEqual(forloebStatus({ id: 'a', navn: 'A', punkter: {} }), { status: 'roed', klar: 0, ialt: 5 });
    assert.deepEqual(forloebStatus({ id: 'a', navn: 'A', punkter: { forklare: 'ja', noter: 'ja' } }), {
      status: 'gul',
      klar: 2,
      ialt: 5,
    });
    assert.deepEqual(forloebStatus({ id: 'a', navn: 'A', punkter: ALLE_PUNKTER }), {
      status: 'groen',
      klar: 5,
      ialt: 5,
    });
  });

  test('"ikke relevant" tæller ikke med', () => {
    const punkter = { ...ALLE_PUNKTER, opgaver: 'irrelevant' };
    assert.deepEqual(forloebStatus({ id: 'a', navn: 'A', punkter }), { status: 'groen', klar: 4, ialt: 4 });
    assert.deepEqual(forloebStatus({ id: 'a', navn: 'A', punkter: { opgaver: 'irrelevant' } }), {
      status: 'roed',
      klar: 0,
      ialt: 4,
    });
  });

  test('saetPunkt krydser af og fjerner krydset igen', () => {
    const krydset = saetPunkt(eksempel(), 't1', 't2', 'noter', 'ja');
    assert.deepEqual(krydset.fag[0].forloeb[0].punkter, { noter: 'ja' });
    assert.deepEqual(saetPunkt(krydset, 't1', 't2', 'noter', null).fag[0].forloeb[0].punkter, {});
  });

  test('kun øvelsesopgaver kan være "ikke relevant"', () => {
    const pensum = eksempel();
    assert.deepEqual(saetPunkt(pensum, 't1', 't2', 'opgaver', 'irrelevant').fag[0].forloeb[0].punkter, {
      opgaver: 'irrelevant',
    });
    assert.equal(saetPunkt(pensum, 't1', 't2', 'forklare', 'irrelevant'), pensum);
  });

  test('saetGeneriskPunkt gemmer hvert punkt én gang', () => {
    let pensum = saetGeneriskPunkt(eksempel(), 't1', 'et-punkt', true);
    pensum = saetGeneriskPunkt(pensum, 't1', 'et-punkt', true);
    assert.deepEqual(pensum.fag[0].generisk, ['et-punkt']);
    assert.deepEqual(saetGeneriskPunkt(pensum, 't1', 'et-punkt', false).fag[0].generisk, []);
  });
});

describe('fremdrift', () => {
  test('optael tæller status og punkter for et fag og samlet', () => {
    let pensum = saetPunkt(eksempel(), 't1', 't2', 'forklare', 'ja');
    for (const punkt of Object.keys(ALLE_PUNKTER)) pensum = saetPunkt(pensum, 't1', 't3', punkt, 'ja');
    const forventet = { roed: 1, gul: 1, groen: 1, punkter: 6, muligePunkter: 15 };
    assert.deepEqual(optael(pensum.fag[0].forloeb), forventet);
    assert.deepEqual(optaelAlt(pensum), forventet);
    assert.equal(procent(forventet), 40);
  });

  test('procent rundes ned, så der kun står 100, når alt er krydset af', () => {
    assert.equal(procent({ roed: 0, gul: 1, groen: 0, punkter: 199, muligePunkter: 200 }), 99);
    assert.equal(procent({ roed: 0, gul: 0, groen: 1, punkter: 5, muligePunkter: 5 }), 100);
    assert.equal(procent({ roed: 0, gul: 0, groen: 0, punkter: 0, muligePunkter: 0 }), 0);
  });
});

describe('laesPensum', () => {
  test('tomme eller ødelagte data giver en tom tjekliste', () => {
    for (const raa of [null, undefined, 'tekst', 42, [], {}, { fag: 'nej' }, { fag: [null, 7, 'x'] }]) {
      assert.deepEqual(laesPensum(raa), { fag: [] });
    }
  });

  test('gyldige data kommer uændret igennem JSON', () => {
    let pensum = saetPunkt(eksempel(), 't1', 't2', 'opgaver', 'irrelevant');
    pensum = saetGeneriskPunkt(pensum, 't1', 'et-punkt', true);
    assert.deepEqual(laesPensum(JSON.parse(JSON.stringify(pensum))), pensum);
  });

  test('fag og forløb, der ikke kan bruges, springes over', () => {
    const raa = {
      fag: [
        { id: 'a1', navn: '', niveau: 'A', forloeb: [] },
        { id: 'a2', navn: 'Kemi', niveau: 'D', forloeb: [] },
        {
          id: 'a3',
          fagside: 'astronomi',
          navn: ' Historie ',
          niveau: 'A',
          ekstra: true,
          forloeb: [
            { id: 'b1', navn: '   ' },
            { id: 'b2', navn: 'Den kolde krig', punkter: { forklare: 'ja', noter: 'maaske', ukendt: 'ja' } },
            { id: 'b3', navn: 'Reformationen', punkter: { forklare: 'irrelevant', opgaver: 'irrelevant' } },
          ],
          generisk: ['x', 'x', 3, ''],
        },
      ],
    };
    assert.deepEqual(laesPensum(raa), {
      fag: [
        {
          id: 'a3',
          fagside: null,
          navn: 'Historie',
          niveau: 'A',
          forloeb: [
            { id: 'b2', navn: 'Den kolde krig', punkter: { forklare: 'ja' } },
            { id: 'b3', navn: 'Reformationen', punkter: { opgaver: 'irrelevant' } },
          ],
          generisk: ['x'],
        },
      ],
    });
  });

  test('id\'er, der mangler, er ugyldige eller går igen, bliver udskiftet', () => {
    const raa = {
      fag: [
        {
          id: 'a1',
          navn: 'Dansk',
          niveau: 'A',
          forloeb: [
            { id: 'a1', navn: 'Romantikken' },
            { navn: 'Barokken' },
            { id: 'UGYLDIG!', navn: 'Realismen' },
          ],
        },
      ],
    };
    const pensum = laesPensum(raa, taeller());
    assert.deepEqual(
      pensum.fag[0].forloeb.map((forloeb) => forloeb.id),
      ['t1', 't2', 't3'],
    );
    assert.equal(alleIder(pensum).size, 4);
  });
});
