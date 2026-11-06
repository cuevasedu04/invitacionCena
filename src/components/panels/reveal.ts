import type { Variants } from 'motion/react';
import { EASE_OUT } from '../../lib/units';

/** Coreografía compartida: los elementos de cada panel aparecen en cascada. */
export const cascade = (stagger = 0.11, delay = 0.1): Variants => ({
  hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  show: { transition: { staggerChildren: stagger, delayChildren: delay } }
});

export const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)', transition: { duration: 0.3 } },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE_OUT } }
};

export const bloom: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(10px)', transition: { duration: 0.3 } },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.2, ease: EASE_OUT } }
};
