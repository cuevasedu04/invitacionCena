import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Rebote periódico para íconos. Con `delay` escalonado, varios íconos
 * rebotan uno tras otro como una ola y la invitación nunca se ve estática.
 */
export default function Bounce({ active, delay = 0, children }: { active: boolean; delay?: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const on = active && !reduce;
  return (
    <motion.span
      className="inline-flex"
      style={{ originY: 1 }}
      animate={on ? { y: ['0%', '-26%', '0%', '-9%', '0%'], scaleY: [1, 1.04, 0.92, 1.02, 1] } : { y: '0%', scaleY: 1 }}
      transition={
        on
          ? {
              duration: 1.15,
              times: [0, 0.3, 0.58, 0.78, 1],
              ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
              repeat: Infinity,
              repeatDelay: 3.4,
              delay
            }
          : { duration: 0.2 }
      }
    >
      {children}
    </motion.span>
  );
}
