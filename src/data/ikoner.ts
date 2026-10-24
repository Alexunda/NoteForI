// Ikoner til menu, kort og knapper. Hvert ikon er SVG-indhold til en
// 24×24-viewBox og tegnes med streg i den aktuelle tekstfarve (Ikon.astro).

export const IKONER = {
  eksamen: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>',
  fag: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
  vaerktoejer:
    '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  studieteknik:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  pensum: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17"/>',
  flashcards: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 7V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  maane: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  // Status i pensumtjeklisten: tom ring, halvt fyldt ring og ring med flueben
  'status-roed': '<circle cx="12" cy="12" r="8"/>',
  'status-gul': '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  'status-groen': '<circle cx="12" cy="12" r="8"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  flueben: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  nulstil: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
  'pil-venstre': '<path d="m15 6-6 6 6 6"/>',
  'pil-hoejre': '<path d="m9 6 6 6-6 6"/>',
  'pil-ned': '<path d="m6 9 6 6 6-6"/>',
  op: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  ned: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  blyant: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  skraldespand: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  advarsel:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
} as const;

export type IkonNavn = keyof typeof IKONER;
