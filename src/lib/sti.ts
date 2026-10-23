// Siden ligger under en base-sti på GitHub Pages (/NoteForI/).
// Alle interne links laves med url(), så base-stien kommer med.

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** url('/fag/') giver '/NoteForI/fag/'. */
export function url(sti: string): string {
  return `${BASE}${sti}`;
}

/** Fjerner base-stien: '/NoteForI/fag/' giver '/fag/'. */
export function udenBase(sti: string): string {
  return sti.startsWith(`${BASE}/`) ? sti.slice(BASE.length) : sti;
}
