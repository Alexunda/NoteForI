// Tests af hullerne (src/lib/huller.ts): <Hul>-boksene på emnesiderne og
// listen i docs/huller.md skal passe sammen.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, test } from 'node:test';
import { laesHulliste, sammenlignHuller, udtraekHuller } from '../src/lib/huller.ts';

const EMNER = new URL('../src/content/emner/', import.meta.url).pathname;
const HULLISTE = new URL('../docs/huller.md', import.meta.url).pathname;

function mdxFiler(mappe) {
  return readdirSync(mappe, { withFileTypes: true }).flatMap((f) =>
    f.isDirectory() ? mdxFiler(join(mappe, f.name)) : f.name.endsWith('.mdx') ? [join(mappe, f.name)] : [],
  );
}

describe('huller', () => {
  test('finder navnene i <Hul>-boksene', () => {
    const tekst = 'Tekst.\n\n<Hul navn="Stedvektor" />\n\n  <Hul navn="Hjemmel, nodalpunkt og skræmmeargument"/>';
    assert.deepEqual(udtraekHuller(tekst), ['Stedvektor', 'Hjemmel, nodalpunkt og skræmmeargument']);
  });

  test('læser tabellen i docs/huller.md', () => {
    const md = [
      '## Huller på siderne',
      '| Fil | Hul | Hvorfor |',
      '|---|---|---|',
      "| `kemi/kvalitativ-analyse.mdx` | Tollens' reagens | Ingen kilde |",
      '## Egne forklaringer, der venter på godkendelse',
      '| `matematik/vektorer-i-planen.mdx` | Stedvektor |',
    ].join('\n');
    assert.deepEqual(laesHulliste(md), [{ fil: 'kemi/kvalitativ-analyse.mdx', navn: "Tollens' reagens" }]);
  });

  test('melder huller, der kun står det ene sted', () => {
    const bokse = [{ fil: 'a.mdx', navn: 'A' }, { fil: 'b.mdx', navn: 'B' }];
    const liste = [{ fil: 'a.mdx', navn: 'A' }, { fil: 'c.mdx', navn: 'C' }];
    assert.equal(sammenlignHuller(bokse, liste).length, 2);
  });

  test('boksene på siderne og docs/huller.md passer sammen', () => {
    const bokse = mdxFiler(EMNER).flatMap((sti) =>
      udtraekHuller(readFileSync(sti, 'utf8')).map((navn) => ({ fil: relative(EMNER, sti), navn })),
    );
    const forskel = sammenlignHuller(bokse, laesHulliste(readFileSync(HULLISTE, 'utf8')));
    assert.deepEqual(forskel, [], forskel.join('\n'));
  });
});
