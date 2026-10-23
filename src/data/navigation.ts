// Sidens struktur (projektplan afsnit 5). Menuen, oversigtssiderne og
// pladsholdersiderne henter navne og beskrivelser herfra.

import type { IkonNavn } from './ikoner';
import type { Klassetrin } from './klassetrin';

/** Arbejdstitel. Sidens navn er stadig et åbent spørgsmål (projektplan afsnit 12). */
export const SIDENAVN = 'Gymnasiehjælp';

export interface Underside {
  sti: string;
  navn: string;
  beskrivelse: string;
  /** De klassetrin, siden især er til. Udelades, hvis den er til alle. */
  klassetrin?: Klassetrin[];
}

export interface Omraade extends Underside {
  ikon: IkonNavn;
}

/** De fire hovedområder i menuen. */
export const OMRAADER: Omraade[] = [
  { sti: '/eksamen/', navn: 'Eksamen', ikon: 'eksamen', beskrivelse: 'Sådan fungerer eksamen på STX.' },
  { sti: '/fag/', navn: 'Fag', ikon: 'fag', beskrivelse: 'Find dit fag, og slå emner op.' },
  { sti: '/vaerktoejer/', navn: 'Værktøjer', ikon: 'vaerktoejer', beskrivelse: 'Værktøjer til at læse op og øve dig.' },
  {
    sti: '/studieteknik/',
    navn: 'Studieteknik',
    ikon: 'studieteknik',
    beskrivelse: 'Opgaveverber, læse- og noteteknik, kildehenvisning og mundtlig fremlæggelse.',
  },
];

export const EKSAMENSSIDER: Underside[] = [
  {
    sti: '/eksamen/mundtlig/',
    navn: 'Mundtlige prøver',
    beskrivelse: 'Hvad der sker til en mundtlig prøve, og hvordan du forbereder dig.',
  },
  {
    sti: '/eksamen/skriftlig/',
    navn: 'Skriftlige prøver',
    beskrivelse: 'Hvad der sker til en skriftlig prøve, og hvordan du forbereder dig.',
  },
  {
    sti: '/eksamen/srp/',
    navn: 'Studieretningsprojektet (SRP)',
    beskrivelse: 'Forløbet, bedømmelsen og forberedelsen.',
    klassetrin: ['3g'],
  },
  {
    sti: '/eksamen/sro/',
    navn: 'Studieretningsopgaven (SRO)',
    beskrivelse: 'Forløbet, bedømmelsen og forberedelsen.',
    klassetrin: ['2g'],
  },
  {
    sti: '/eksamen/aarsproever/',
    navn: 'Årsprøver og grundforløbet',
    beskrivelse: 'Prøverne i 1.g og 2.g.',
    klassetrin: ['1g', '2g'],
  },
  {
    sti: '/eksamen/eksamensdagen/',
    navn: 'Eksamensdagen',
    beskrivelse: 'Praktisk: før, under og efter, og hvis du bliver syg.',
  },
];

export const VAERKTOEJER: Underside[] = [
  {
    sti: '/vaerktoejer/pensum/',
    navn: 'Pensumtjekliste',
    beskrivelse: 'Skriv dine forløb ind, og hold styr på, hvad du kan.',
  },
  { sti: '/vaerktoejer/flashcards/', navn: 'Flashcards', beskrivelse: 'Øv begreber, til de sidder fast.' },
  { sti: '/vaerktoejer/timer/', navn: 'Timer', beskrivelse: 'Læs i faste blokke med pauser imellem.' },
  {
    sti: '/vaerktoejer/nedtaelling/',
    navn: 'Nedtælling',
    beskrivelse: 'Skriv dine eksamensdatoer ind, og se, hvor lang tid der er tilbage.',
  },
  { sti: '/vaerktoejer/gennemsnit/', navn: 'Karaktergennemsnit', beskrivelse: 'Regn et vejledende gennemsnit ud.' },
  {
    sti: '/vaerktoejer/laeseplan/',
    navn: 'Læseplan',
    beskrivelse: 'Fordel din repetition over dagene op til eksamen.',
  },
  {
    sti: '/vaerktoejer/lommeregner/',
    navn: 'Lommeregner',
    beskrivelse: 'Videnskabelig lommeregner med decimalkomma.',
  },
  { sti: '/vaerktoejer/graf/', navn: 'Grafværktøj', beskrivelse: 'Tegn grafer, aflæs punkter, og lav regression.' },
];

/** Siderne i sidefoden. */
export const SIDEFOD: Underside[] = [
  { sti: '/kilder/', navn: 'Kilder', beskrivelse: 'De officielle kilder, siden bygger på, samlet ét sted.' },
  { sti: '/om/', navn: 'Om siden', beskrivelse: 'Hvem siden er til, og hvad der sker med dine data.' },
];

/** Finder en side ud fra stien. Buildet fejler, hvis stien ikke står her. */
export function findSide(sti: string): Underside {
  const side = [...OMRAADER, ...EKSAMENSSIDER, ...VAERKTOEJER, ...SIDEFOD].find((s) => s.sti === sti);
  if (!side) throw new Error(`Siden ${sti} står ikke i src/data/navigation.ts`);
  return side;
}
