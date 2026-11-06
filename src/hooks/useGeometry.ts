import { useEffect, useState } from 'react';

/**
 * tri: los tres paneles caben a la vez (escritorio).
 * carousel: se ve un panel y se desliza a las solapas (celular / tableta).
 */
export type LayoutMode = 'tri' | 'carousel';

export interface Geometry {
  mode: LayoutMode;
  /** ancho de un panel (el folleto cerrado mide lo mismo) */
  w: number;
  hClosed: number;
  hOpen: number;
  /** alto de la barra inferior (indicación / navegación) */
  bar: number;
}

export function computeGeometry(vw: number, vh: number): Geometry {
  if (vw >= 1024 && vw / vh >= 1.25) {
    const bar = 64;
    const avail = vh - bar - 24;
    const w = Math.min((vw - 96) / 3, avail / 1.9, 620);
    return { mode: 'tri', w, hClosed: Math.min(w / 0.7, avail), hOpen: Math.min(w * 1.9, avail), bar };
  }
  const bar = 76;
  const avail = vh - bar - 20;
  const w = Math.min(vw * 0.9, 500, avail / 1.85);
  return { mode: 'carousel', w, hClosed: Math.min(w / 0.7, avail), hOpen: Math.min(w * 2.05, avail), bar };
}

export function useGeometry() {
  const [geometry, setGeometry] = useState(() => computeGeometry(window.innerWidth, window.innerHeight));
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGeometry(computeGeometry(window.innerWidth, window.innerHeight)));
    };
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, []);
  return geometry;
}
