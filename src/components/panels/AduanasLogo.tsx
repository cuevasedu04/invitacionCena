import { motion, useReducedMotion, type Variants } from 'motion/react';
import logo from '../../assets/logo-aduanas.png';
import { u } from '../../lib/units';

const silhouette = {
  maskImage: `url(${logo})`,
  WebkitMaskImage: `url(${logo})`,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat'
} as const;

/**
 * Logo de Aduanas con presencia: un aura dorada que respira detrás
 * y un destello metálico que recorre su silueta cada pocos segundos.
 */
export default function AduanasLogo({ variants, show }: { variants: Variants; show: boolean }) {
  const reduce = useReducedMotion();
  const alive = show && !reduce;
  return (
    <motion.div variants={variants} className="relative" style={{ width: u(44) }}>
      {/* aura: halo dorado suave que late lentamente */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[50%]"
        style={{
          inset: `-${u(7)} -${u(9)}`,
          background:
            'radial-gradient(closest-side, rgba(236,213,144,0.30), rgba(217,183,102,0.12) 50%, rgba(217,183,102,0) 100%)'
        }}
        animate={alive ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1.06, 0.92] } : { opacity: 0.7, scale: 1 }}
        transition={alive ? { duration: 4.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      />
      <img
        src={logo}
        alt="Aduanas · Agencia Nacional de Aduanas de México"
        draggable={false}
        className="relative block w-full"
        style={{ filter: 'drop-shadow(0 0 calc(var(--u) * 1.6) rgba(236, 213, 144, 0.28))' }}
      />
      {/* destello: banda de luz recortada a la forma del logo */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={silhouette}>
        <motion.span
          className="absolute inset-y-0 block"
          style={{
            width: '45%',
            background:
              'linear-gradient(100deg, rgba(255,248,225,0) 0%, rgba(255,248,225,0.95) 50%, rgba(255,248,225,0) 100%)'
          }}
          initial={{ x: '-120%' }}
          animate={alive ? { x: ['-120%', '260%'] } : { x: '-120%' }}
          transition={alive ? { duration: 1.5, ease: [0.45, 0, 0.25, 1], repeat: Infinity, repeatDelay: 4.5, delay: 2.2 } : { duration: 0 }}
        />
      </span>
    </motion.div>
  );
}
