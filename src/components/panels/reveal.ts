import type { Variants } from 'motion/react';
import { EASE_OUT } from '../../lib/units';

/** Coreografía compartida: los elementos de cada panel aparecen en cascada. */
export const cascade = (stagger = 0.11, delay = 0.1): Variants => ({
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  show: { transition: { staggerChildren: stagger, delayChildren: delay } }
});

// Sólo opacidad y transformaciones: la GPU las anima sin repintar. Los desenfoques
// (filter: blur) en decenas de elementos saturaban el celular al abrir.
export const rise: Variants = {
  hidden: { opacity: 0, y: 18, transition: { duration: 0.3 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } }
};

export const bloom: Variants = {
  hidden: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  show: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE_OUT } }
};
