// Bjælken nederst på skærmen efter en sletning (eller en indsat liste), så
// handlingen kan fortrydes i nogle sekunder. Den bruges i stedet for en
// dialog, der spørger, om man er sikker. Bjælken venter, så længe man har
// musen over den, eller den har fokus.

import { useEffect, useRef } from 'preact/hooks';

/** Så længe står bjælken, i millisekunder */
const VARIGHED = 8000;

export interface FortrydInfo {
  /** Skifter for hver ny handling, så tiden starter forfra */
  nr: number;
  besked: string;
  fortryd: () => void;
}

interface Props {
  info: FortrydInfo | null;
  onFortryd: () => void;
  onLuk: () => void;
}

export default function Fortryd({ info, onFortryd, onLuk }: Props) {
  const boks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = boks.current;
    if (!info || !element) return;

    let tilbage = VARIGHED;
    let start = Date.now();
    let timer: number | undefined = window.setTimeout(onLuk, tilbage);
    let mus = false;
    let fokus = false;

    function opdater() {
      if (mus || fokus) {
        if (timer === undefined) return;
        clearTimeout(timer);
        timer = undefined;
        tilbage -= Date.now() - start;
      } else if (timer === undefined) {
        // Lidt ekstra tid efter en pause, så man kan nå at læse beskeden
        start = Date.now();
        tilbage = Math.max(tilbage, 3000);
        timer = window.setTimeout(onLuk, tilbage);
      }
    }
    function musInd() {
      mus = true;
      opdater();
    }
    function musUd() {
      mus = false;
      opdater();
    }
    function fokusInd() {
      fokus = true;
      opdater();
    }
    function fokusUd() {
      fokus = false;
      opdater();
    }

    element.addEventListener('pointerenter', musInd);
    element.addEventListener('pointerleave', musUd);
    element.addEventListener('focusin', fokusInd);
    element.addEventListener('focusout', fokusUd);
    return () => {
      clearTimeout(timer);
      element.removeEventListener('pointerenter', musInd);
      element.removeEventListener('pointerleave', musUd);
      element.removeEventListener('focusin', fokusInd);
      element.removeEventListener('focusout', fokusUd);
    };
  }, [info?.nr]);

  // Beskeden skal altid være på siden, så skærmlæsere læser den op, når den kommer
  return (
    <div class="pensum-fortryd" role="status">
      {info && (
        <div class="pensum-fortryd-boks" ref={boks}>
          <p>{info.besked}</p>
          <button type="button" class="pensum-knap" onClick={onFortryd}>
            Fortryd
          </button>
        </div>
      )}
    </div>
  );
}
