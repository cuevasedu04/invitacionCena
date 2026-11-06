import { motion } from 'motion/react';
import { ArtDecoCorner, Sparkle } from '../ornaments/Ornaments';
import { u } from '../../lib/units';

/**
 * Superficie interior de cada solapa: patrón art déco y marco dorado.
 * `quiet` atenúa el patrón cuando la solapa ya muestra su contenido.
 */
export default function FlapInner({ side, quiet = false }: { side: 'left' | 'right'; quiet?: boolean }) {
  const patternId = `deco-fan-${side}`;
  return (
    <div className="relative h-full w-full overflow-hidden bg-navy-800">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(140% 70% at ${side === 'left' ? '100%' : '0%'} 50%, #16306a 0%, #0a1d40 55%, #04122b 100%)`
        }}
      />
      <motion.svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-gold-400"
        initial={false}
        animate={{ opacity: quiet ? 0.05 : 0.13 }}
        transition={{ duration: 0.8 }}
      >
        <defs>
          <pattern id={patternId} width="36" height="18" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.8">
              <path d="M0 18 A18 18 0 0 1 36 18" />
              <path d="M6 18 A12 12 0 0 1 30 18" />
              <path d="M12 18 A6 6 0 0 1 24 18" />
              <path d="M-18 9 A18 18 0 0 1 18 9 M18 9 A18 18 0 0 1 54 9" opacity="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </motion.svg>
      <div className="paper-grain absolute inset-0" />
      <div className="absolute border border-gold-500/50" style={{ inset: u(3) }} />
      <ArtDecoCorner corner={side === 'left' ? 'tl' : 'tr'} size={u(16)} style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner={side === 'left' ? 'bl' : 'br'} size={u(16)} style={{ margin: u(1.4) }} />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ opacity: quiet ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <Sparkle size={u(6)} className="text-gold-300/70" />
      </motion.div>
    </div>
  );
}
