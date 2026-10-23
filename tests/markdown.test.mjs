// Tests af formler og kildehenvisninger i Markdown og MDX
// (src/lib/markdown/). Pluginnerne køres med Sätteri, ligesom i buildet.
// scripts/tjek-formler.mjs tjekker desuden formlerne i et rigtigt build.

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';
import { markdownToHtml, mdxToJs } from 'satteri';
import { katexPlugin, texTilHtml } from '../src/lib/markdown/katex.ts';
import { holdSammen, kildehenvisninger } from '../src/lib/markdown/kilder.ts';

const kilder = [
  { id: 'formelsamling', navn: 'Formelsamling stx A', url: 'https://uvm.dk/formelsamling.pdf' },
  { id: 'laereplan', navn: 'Læreplan', url: 'https://uvm.dk/laereplan.pdf' },
];
const emneFil = pathToFileURL('/projekt/src/content/emner/matematik/emne.mdx');
const guideFil = pathToFileURL('/projekt/src/content/eksamen/srp.md');

function indstillinger(fileURL = emneFil) {
  return {
    features: { math: true },
    mdastPlugins: [kildehenvisninger],
    hastPlugins: [katexPlugin],
    fileURL,
    data: { astro: { frontmatter: { kilder } } },
  };
}

const md = (kilde, fil) => markdownToHtml(kilde, indstillinger(fil)).html;
const mdx = (kilde) => mdxToJs(kilde, { ...indstillinger(), jsxImportSource: 'astro', elementAttributeNameCase: 'html' }).code;

describe('formler', () => {
  const kilde = 'Inline $a^{2}$ i en sætning.\n\n$$\n\\frac{1}{2}\n$$\n';

  test('$…$ og $$…$$ bliver til KaTeX i Markdown', () => {
    const html = md(kilde);
    assert.match(html, /<p>Inline <span class="katex">/);
    assert.match(html, /<span class="katex-display">/);
    assert.doesNotMatch(html, /language-math|<pre|<code/);
  });

  test('$…$ og $$…$$ bliver til KaTeX i MDX', () => {
    const kode = mdx(kilde);
    assert.match(kode, /class: "katex"/);
    assert.match(kode, /class: "katex-display"/);
    assert.doesNotMatch(kode, /language-math/);
  });

  test('MathML kommer med til skærmlæsere, uden det forkerte :xmlns', () => {
    const html = md('$x$');
    assert.match(html, /<math>/);
    assert.doesNotMatch(html, /:xmlns/);
  });

  test('decimalkomma skal skrives som {,}', () => {
    assert.match(texTilHtml('2{,}5', false), /class="katex"/);
    assert.throws(() => texTilHtml('2,5', false), /Skriv decimalkomma som \{,\}/);
  });

  test('en fejl i en formel stopper buildet', () => {
    assert.throws(() => md('$\\frac{1}{$'));
  });

  test('æ, ø og å uden \\text{} stopper buildet i stedet for at give en advarsel', () => {
    assert.throws(() => texTilHtml('ø = 1', false));
    assert.match(texTilHtml('\\text{højde} = 2', false), /class="katex"/);
  });
});

describe('kildehenvisninger', () => {
  test('et kilde-link bliver til en henvisning i parentes, der linker til kilden', () => {
    const html = md('Påstand. [formelsamlingen, s. 12](kilde:formelsamling)');
    assert.equal(
      html.trim(),
      '<p>Påstand. <span class="kilde">(<a href="https://uvm.dk/formelsamling.pdf">' +
        '<span class="skjult-visuelt">Kilde: </span>formelsamlingen, s. 12</a>)</span></p>',
    );
  });

  test('to henvisninger lige efter hinanden deler parentes', () => {
    const html = md('Påstand. [formelsamlingen, s. 12](kilde:formelsamling) [læreplanen, pkt. 2.2](kilde:laereplan)');
    assert.match(html, /\(<a [^>]+>.*?formelsamlingen, s\. 12<\/a>;<\/span> <span class="kilde"><a /);
    assert.match(html, /pkt\. 2\.2<\/a>\)<\/span><\/p>/);
  });

  test('et ukendt id stopper buildet', () => {
    assert.throws(() => md('Påstand. [et sted](kilde:findes-ikke)'), /kilde:findes-ikke/);
  });

  test('almindelige links og eksamensguiderne bliver ikke rørt', () => {
    assert.match(md('[uvm.dk](https://uvm.dk/)'), /<a href="https:\/\/uvm.dk\/">uvm.dk<\/a>/);
    assert.match(md('[læreplanen](kilde:laereplan)', guideFil), /href="kilde:laereplan"/);
  });

  test('<Formel> får kildens navn og adresse', () => {
    const kode = mdx('<Formel tex="a" kilde="formelsamling" henvisning="s. 12">\n\nTekst\n\n</Formel>\n');
    assert.match(kode, /kildenavn: "Formelsamling stx A"/);
    assert.match(kode, /kildeurl: "https:\/\/uvm.dk\/formelsamling.pdf"/);
  });

  test('<Formel> uden kilde eller med et ukendt id stopper buildet', () => {
    assert.throws(() => mdx('<Formel tex="a" />\n'), /skal have kilde=/);
    assert.throws(() => mdx('<Formel tex="a" kilde="nej" henvisning="s. 1" />\n'), /kilde:nej/);
  });

  test('holdSammen holder sidetal og paragraffer på én linje', () => {
    assert.equal(holdSammen('s. 12 og § 27, stk. 3, formel (34)'), 's. 12 og § 27, stk. 3, formel (34)');
  });
});
