// Tal på dansk til grafer og værktøjer: decimalkomma, rigtigt minustegn og
// pæne inddelinger på akserne.

/**
 * Skriver et tal med decimalkomma og højst `decimaler` decimaler, fx
 * formaterTal(-1.5) giver "−1,5". Store tal får ikke tusindtalsseparator, så
 * de ikke kan forveksles med decimaler.
 */
export function formaterTal(tal: number, decimaler = 2): string {
  if (Number.isNaN(tal)) return 'ikke defineret';
  if (!Number.isFinite(tal)) return tal > 0 ? '∞' : '−∞';
  const tekst = new Intl.NumberFormat('da-DK', {
    maximumFractionDigits: decimaler,
    useGrouping: false,
  }).format(tal);
  // Undgå "−0", og brug det typografiske minustegn
  return tekst === '-0' ? '0' : tekst.replace('-', '−');
}

/**
 * Afstanden mellem to streger på en akse: 1, 2 eller 5 gange en potens af
 * 10, så der bliver omkring `maks` streger eller færre mellem min og max.
 */
export function inddeling(min: number, max: number, maks: number): number {
  const spaend = Math.abs(max - min);
  if (!(spaend > 0) || maks < 1) return 1;
  const raa = spaend / maks;
  const potens = 10 ** Math.floor(Math.log10(raa));
  for (const faktor of [1, 2, 5, 10]) {
    if (faktor * potens >= raa) return faktor * potens;
  }
  return 10 * potens;
}

/** Stregerne mellem min og max for en given inddeling. */
export function streger(min: number, max: number, trin: number): number[] {
  // Lidt luft, så 0,3 / 0,1 = 2,9999999999999996 stadig giver stregen ved 0,3
  const foerste = Math.ceil(min / trin - 1e-9);
  const sidste = Math.floor(max / trin + 1e-9);
  const ud: number[] = [];
  for (let i = foerste; i <= sidste && ud.length < 1000; i++) {
    // Afrund, så 0,1 · 3 ikke bliver 0,30000000000000004
    ud.push(Number((i * trin).toPrecision(12)));
  }
  return ud;
}

/** Hvor mange decimaler der skal til for at vise tal med denne inddeling. */
export function decimalerTil(trin: number): number {
  if (!(trin > 0) || trin >= 1) return 0;
  return Math.min(10, Math.ceil(-Math.log10(trin) - 1e-9));
}
