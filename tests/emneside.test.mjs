// Tests af emnesidens skabelon (src/lib/emneside.ts), plugins til
// emnesiderne (src/lib/markdown/emneside.ts) og udtrækket af begreber til
// flashcards (src/lib/begreber.ts).

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';
import { markdownToHtml, mdxToJs } from 'satteri';
import { findDubletter, forklaringTilHtml, udtraekBegreber } from '../src/lib/begreber.ts';
import { AFSNIT, afsnitNoegle, begrebId, slug, tjekEmneAfsnit } from '../src/lib/emneside.ts';
import { katexPlugin } from '../src/lib/markdown/katex.ts';
import { emneAfsnit, emneTjek } from '../src/lib/markdown/emneside.ts';

const h2 = (...titler) => titler.map((text) => ({ depth: 2, text }));
const alle = AFSNIT.map((a) => a.titel);
const emneFil = pathToFileURL('/projekt/src/content/emner/matematik/emne.mdx');
const kilder = [{ id: 'laereplan', navn: 'Læreplan', url: 'https://uvm.dk/laereplan.pdf' }];

function mdx(kilde, fil = emneFil) {
  return mdxToJs(kilde, {
    features: { math: true },
    mdastPlugins: [emneTjek],
    hastPlugins: [katexPlugin, emneAfsnit],
    fileURL: fil,
    jsxImportSource: 'astro',
    elementAttributeNameCase: 'html',
  }).code;
}

const helFormel = (dele = ['Symboler', 'Bruges', 'Eksempel', 'Fejl']) =>
  `<Formel navn="F" tex="a" kilde="k" henvisning="s. 1">\n\n${dele.map((d) => `<${d}>\n\nTekst\n\n</${d}>`).join('\n\n')}\n\n</Formel>\n`;

describe('afsnittene på en emneside', () => {
  test('alle afsnit i den rigtige rækkefølge er i orden', () => {
    assert.deepEqual(tjekEmneAfsnit(h2(...alle)), []);
  });

  test('Formler kan udelades, men de andre afsnit skal være der', () => {
    assert.deepEqual(tjekEmneAfsnit(h2(...alle.filter((t) => t !== 'Formler'))), []);
    assert.deepEqual(tjekEmneAfsnit(h2(...alle.filter((t) => t !== 'Eksamenshjørnet'))), [
      'Afsnittet "Eksamenshjørnet" mangler.',
    ]);
  });

  test('afsnittene skal stå i rækkefølge', () => {
    const fejl = tjekEmneAfsnit(h2('Vigtige pointer', 'Kort fortalt', 'Centrale begreber', 'Eksamenshjørnet'));
    assert.equal(fejl.length, 1);
    assert.match(fejl[0], /rækkefølge/);
  });

  test('ukendte og dobbelte ## overskrifter giver fejl, men ### er fri', () => {
    const fejl = tjekEmneAfsnit([...h2(...alle, 'Noget andet', 'Formler'), { depth: 3, text: 'Et underafsnit' }]);
    assert.ok(fejl.some((f) => f.includes('"Noget andet" hører ikke til skabelonen')));
    assert.ok(fejl.some((f) => f.includes('"Formler" står 2 gange')));
    assert.ok(!fejl.some((f) => f.includes('Et underafsnit')));
  });

  test('slug laver æ, ø og å om og fjerner tegn', () => {
    assert.equal(slug('Første grads ligning'), 'foerste-grads-ligning');
    assert.equal(slug('Eksamenshjørnet'), 'eksamenshjoernet');
    assert.equal(slug('  Én (eller to) størrelser! '), 'en-eller-to-stoerrelser');
    assert.equal(begrebId('Vækstrate'), 'begreb-vaekstrate');
    assert.equal(afsnitNoegle('Eksamenshjørnet'), 'eksamenshjoernet');
    assert.equal(afsnitNoegle('Noget andet'), null);
  });
});

describe('plugins til emnesiderne', () => {
  test('hvert afsnit bliver pakket ind i <section data-afsnit>', () => {
    const kode = mdx('Intro.\n\n## Kort fortalt\n\nTekst $x$.\n\n## Eksamenshjørnet\n\n- a\n');
    assert.match(kode, /_components\.section, \{\s*class: "emne-afsnit",\s*"data-afsnit": "kort-fortalt"/);
    assert.match(kode, /"data-afsnit": "eksamenshjoernet"/);
    assert.match(kode, /class: "katex"/);
  });

  test('en <Formel> med alle fire dele er i orden', () => {
    assert.doesNotThrow(() => mdx(helFormel()));
  });

  test('en <Formel> uden eksempel stopper buildet', () => {
    assert.throws(() => mdx(helFormel(['Symboler', 'Bruges', 'Fejl'])), /mangler <Eksempel>/);
  });

  test('et <Begreb> uden navn eller forklaring stopper buildet', () => {
    assert.throws(() => mdx('<Begreb>\n\nTekst\n\n</Begreb>\n'), /skal have navn/);
    assert.throws(() => mdx('<Begreb navn="Tomt">\n</Begreb>\n'), /har ingen forklaring/);
  });

  test('filer uden for src/content/emner/ bliver ikke rørt', () => {
    const fil = pathToFileURL('/projekt/src/content/eksamen/srp.md');
    const html = markdownToHtml('## Kort fortalt\n\nTekst', { hastPlugins: [emneAfsnit], fileURL: fil }).html;
    assert.doesNotMatch(html, /<section/);
  });
});

describe('begreber til flashcards', () => {
  const kilde = `## Centrale begreber

<Begreb navn="Vækstrate">

Den procent, en størrelse vokser med pr. periode, skrevet som $r$. [læreplanen, pkt. 2.2](kilde:laereplan)

</Begreb>

<Begreb navn="Fremskrivningsfaktor">
  Tallet $a = 1 + r$.
</Begreb>
`;

  test('alle begreber findes med navn, id og forklaring', () => {
    const begreber = udtraekBegreber(kilde);
    assert.deepEqual(
      begreber.map((b) => [b.navn, b.id]),
      [
        ['Vækstrate', 'begreb-vaekstrate'],
        ['Fremskrivningsfaktor', 'begreb-fremskrivningsfaktor'],
      ],
    );
    assert.equal(begreber[1].markdown, 'Tallet $a = 1 + r$.');
  });

  test('forklaringen bliver til HTML med formler og kildehenvisninger', () => {
    const [vaekstrate] = udtraekBegreber(kilde);
    const html = forklaringTilHtml(vaekstrate.markdown, emneFil, kilder);
    assert.match(html, /^<p>Den procent/);
    assert.match(html, /class="katex"/);
    assert.match(html, /<span class="kilde">\(<a href="https:\/\/uvm.dk\/laereplan.pdf">/);
  });

  test('to begreber med samme navn på én side stopper buildet', () => {
    assert.throws(() => udtraekBegreber(`${kilde}\n<Begreb navn="Vækstrate">\n\nIgen\n\n</Begreb>\n`), /to gange/);
  });

  test('et begreb, der står på to sider, er en dublet', () => {
    const begreber = udtraekBegreber(kilde);
    const andenSide = udtraekBegreber('<Begreb navn="vækstrate">\n\nIgen\n\n</Begreb>\n');
    assert.deepEqual(
      findDubletter([
        { side: 'matematik/eksponentielle-funktioner', begreber },
        { side: 'matematik/procent-og-rentesregning', begreber: andenSide },
      ]),
      [{ navn: 'Vækstrate', sider: ['matematik/eksponentielle-funktioner', 'matematik/procent-og-rentesregning'] }],
    );
  });

  test('begreber med fag i navnet er ikke dubletter', () => {
    const matematik = udtraekBegreber('<Begreb navn="Vektor (matematik)">\n\nEn pil\n\n</Begreb>\n');
    const biotek = udtraekBegreber('<Begreb navn="Vektor (bioteknologi)">\n\nEt DNA-molekyle\n\n</Begreb>\n');
    assert.deepEqual(
      findDubletter([
        { side: 'matematik/vektorer-i-planen', begreber: matematik },
        { side: 'bioteknologi/eksperimentelle-metoder', begreber: biotek },
      ]),
      [],
    );
  });
});

describe('fagenes overbliksside', async () => {
  const { grupperEfterOmraade, tjekFagAfsnit } = await import('../src/lib/fagside.ts');

  test('afsnittene skal være "Det handler faget om" og "Prøverne"', () => {
    assert.deepEqual(tjekFagAfsnit(h2('Det handler faget om', 'Prøverne')), []);
    assert.equal(tjekFagAfsnit(h2('Prøverne', 'Det handler faget om')).length, 1);
    assert.equal(tjekFagAfsnit(h2('Det handler faget om')).length, 1);
  });

  test('emnerne grupperes efter område i den rækkefølge, områderne kommer', () => {
    const emne = (titel, omraade) => ({ titel, data: { omraade } });
    const grupper = grupperEfterOmraade([emne('a', 'Tal'), emne('b', 'Geometri'), emne('c', 'Tal'), emne('d')]);
    assert.deepEqual(
      grupper.map((g) => [g.omraade, g.emner.map((e) => e.titel).join('')]),
      [
        ['Tal', 'ac'],
        ['Geometri', 'b'],
        [null, 'd'],
      ],
    );
  });
});
