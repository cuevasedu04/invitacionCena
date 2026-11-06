import type { ReactNode } from 'react';

/**
 * Rebote periódico para íconos (animación CSS en el compositor). Con `delay`
 * escalonado, varios íconos rebotan uno tras otro como una ola.
 */
export default function Bounce({ active, delay = 0, children }: { active: boolean; delay?: number; children: ReactNode }) {
  return (
    <span className={`inline-flex ${active ? 'inv-bounce' : ''}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </span>
  );
}
