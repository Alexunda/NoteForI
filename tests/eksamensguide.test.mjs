// Tests af kildehenvisninger og afsnit i eksamensguiderne (src/lib/eksamensguide.ts). Kør dem med `npm test`.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  delIAfsnit,
  FASTE_AFSNIT,
  FOERSTE_AFSNIT,
  indsaetKildehenvisninger,
  SIDSTE_AFSNIT,
  tjekAfsnit,
} from '../src/lib/eksamensguide.ts';

const KILDER = [
  { id: 'laereplan', navn: 'Læreplan', url: 'https://uvm.dk/laereplan.pdf' },
  { id: 'pb', navn: 'Prøvebekendtgørelsen', url: 'https://www.retsinformation.dk/eli/lta/2026/3?a=1&b="2"' },
];

describe('indsaetKildehenvisninger', () => {
  test('et kildelink bliver til en lille henvisning, der linker til kilden', () => {
    const { html, fejl } = indsaetKildehenvisninger(
      '<li>10 skoledage. <a href="kilde:laereplan">læreplanen, pkt. 4.2.1</a></li>',
      KILDER,
    );
    assert.deepEqual(fejl, []);
    assert.equal(
      html,
      '<li>10 skoledage. <span class="kilde">(<a href="https://uvm.dk/laereplan.pdf">' +
        '<span class="skjult-visuelt">Kilde: </span>læreplanen, pkt. 4.2.1</a>)</span></li>',
    );
  });

  test('url-adressen escapes, og ekstra attributter bliver', () => {
    const { html } = indsaetKildehenvisninger('<a href="kilde:pb" title="x">§ 27</a>', KILDER);
    assert.match(html, /href="https:\/\/www\.retsinformation\.dk\/eli\/lta\/2026\/3\?a=1&amp;b=&quot;2&quot;" title="x">/);
  });

  test('to henvisninger efter hinanden kommer i samme parentes', () => {
    const { html } = indsaetKildehenvisninger(
      '<p>Tekst. <a href="kilde:laereplan">pkt. 4.4</a> <a href="kilde:pb">§ 66</a></p>',
      KILDER,
    );
    assert.equal((html.match(/class="kilde"/g) ?? []).length, 1);
    assert.match(html, /pkt\. 4\.4<\/a>; <a href="https:\/\/www\.retsinformation\.dk/);
  });

  test('henvisninger med tekst imellem holdes adskilt', () => {
    const { html } = indsaetKildehenvisninger(
      '<p><a href="kilde:laereplan">a</a> og <a href="kilde:pb">b</a></p>',
      KILDER,
    );
    assert.equal((html.match(/class="kilde"/g) ?? []).length, 2);
  });

  test('almindelige links røres ikke', () => {
    const html = '<p><a href="https://emu.dk/">emu.dk</a> og <a href="#kilder">kilderne</a></p>';
    assert.deepEqual(indsaetKildehenvisninger(html, KILDER), { html, fejl: [] });
  });

  test('et ukendt id giver en fejl', () => {
    const { fejl } = indsaetKildehenvisninger(
      '<a href="kilde:vejledning">s. 15</a> <a href="kilde:">x</a> <a href="kilde:laereplan">y</a>',
      KILDER,
    );
    assert.deepEqual(fejl, [
      'Henvisningen "kilde:vejledning" peger ikke på en kilde i frontmatter.',
      'Henvisningen "kilde:" peger ikke på en kilde i frontmatter.',
    ]);
  });
});

describe('delIAfsnit', () => {
  test('hvert h2-afsnit pakkes ind, og teksten før første h2 bliver stående', () => {
    const html =
      '<p>Intro</p>\n<h2 id="kort-fortalt">Kort fortalt</h2>\n<ul><li>a</li></ul>\n' +
      '<h2 id="tjekliste">Tjekliste</h2>\n<h3 id="foer">Før</h3>\n<ul><li>b</li></ul>\n';
    assert.equal(
      delIAfsnit(html),
      '<p>Intro</p>\n' +
        '<section class="guide-afsnit" data-afsnit="kort-fortalt"><h2 id="kort-fortalt">Kort fortalt</h2>\n<ul><li>a</li></ul>\n</section>' +
        '<section class="guide-afsnit" data-afsnit="tjekliste"><h2 id="tjekliste">Tjekliste</h2>\n<h3 id="foer">Før</h3>\n<ul><li>b</li></ul>\n</section>',
    );
  });

  test('html uden h2 er uændret', () => {
    assert.equal(delIAfsnit('<p>Tekst med &lt;h2&gt;</p>'), '<p>Tekst med &lt;h2&gt;</p>');
  });
});

describe('tjekAfsnit', () => {
  const h2 = (text) => ({ depth: 2, text });
  const fuld = [FOERSTE_AFSNIT, ...FASTE_AFSNIT.map((navne) => navne[0]), SIDSTE_AFSNIT].map(h2);

  test('en guide med alle afsnit giver ingen fejl', () => {
    assert.deepEqual(tjekAfsnit(fuld), []);
    const medEkstra = [...fuld.slice(0, -1), h2('Hvis noget går galt'), { depth: 3, text: 'Før' }, fuld.at(-1)];
    assert.deepEqual(tjekAfsnit(medEkstra), []);
  });

  test('ét af de alternative navne er nok', () => {
    const andetNavn = fuld.map((o) => (o.text === 'Typiske fejl' ? h2('Fejl, du kan undgå') : o));
    assert.deepEqual(tjekAfsnit(andetNavn), []);
  });

  test('manglende og forkert placerede afsnit findes', () => {
    assert.deepEqual(tjekAfsnit([h2('Det sker der'), h2('Kort fortalt'), { depth: 3, text: 'Tjekliste' }]), [
      'Det første afsnit skal hedde "Kort fortalt".',
      'Det sidste afsnit skal hedde "Tjekliste".',
      'Afsnittet "Det bliver du bedømt på" mangler.',
      'Afsnittet "Sådan forbereder du dig" mangler.',
      'Afsnittet "Typiske fejl" eller "Fejl, du kan undgå" mangler.',
    ]);
  });
});
