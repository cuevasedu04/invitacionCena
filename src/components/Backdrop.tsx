import { motion } from 'motion/react';
import Particles from './reactbits/Particles';

/** Fondo: navy profundo con un halo central y destellos dorados flotando (React Bits · Particles). */
export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(90% 60% at 50% 45%, #0b1f45 0%, #03102a 45%, #000a18 100%)' }}
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.4 }}
      >
        <Particles
          particleCount={110}
          particleSpread={12}
          speed={0.05}
          particleColors={['#fbf3d2', '#ecd590', '#c49a45']}
          particleBaseSize={60}
          sizeRandomness={1.2}
          alphaParticles
          shape="sparkle"
          glow={0.6}
          twinkle={0.7}
          moveParticlesOnHover={false}
          clickBurst={false}
          drift="up"
          driftSpeed={0.25}
          opacity={0.75}
          pixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
        />
      </motion.div>
      {/* viñeta para concentrar la mirada en el folleto */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)' }}
      />
    </div>
  );
}
