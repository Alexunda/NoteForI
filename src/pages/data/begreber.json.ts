// Alle centrale begreber fra emnesiderne som JSON. Laves ved build og bruges
// af flashcards i fase 4. Formatet har et versionsnummer, så det kan ændres
// senere.
import type { APIRoute } from 'astro';
import { hentFlashcards } from '../../lib/emner';

export const GET: APIRoute = async () => {
  const begreber = await hentFlashcards();
  return new Response(JSON.stringify({ version: 1, begreber }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
