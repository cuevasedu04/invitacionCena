import { motion } from 'motion/react';
import { Sparkle } from '../ornaments/Ornaments';

/** Sello dorado sobre la unión de las solapas: también abre el folleto con un toque. */
export default function Seal({ onActivate, disabled }: { onActivate: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label="Abrir invitación"
      disabled={disabled}
      onClick={onActivate}
      className="group relative grid cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold-200"
      style={{ width: 'calc(var(--u) * 17)', height: 'calc(var(--u) * 17)' }}
    >
      {/* halo pulsante */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 calc(var(--u) * 6) calc(var(--u) * 1) rgba(236, 213, 144, 0.45)' }}
        animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.92, 1.06, 0.92] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 210deg, #8a6a2a, #f5e6a8, #c49a45, #fbf3d2, #8a6a2a, #d9b766, #8a6a2a)',
          boxShadow: '0 calc(var(--u) * 1.2) calc(var(--u) * 3) rgba(0, 0, 0, 0.55)'
        }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          inset: 'calc(var(--u) * 1.1)',
          background: 'radial-gradient(circle at 35% 30%, #13295a, #04122b 70%)',
          boxShadow: 'inset 0 0 calc(var(--u) * 2) rgba(0, 0, 0, 0.6)'
        }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full border border-gold-400/50"
        style={{ inset: 'calc(var(--u) * 2.4)' }}
      />
      <span className="relative flex flex-col items-center text-gold-200 transition-transform duration-300 group-hover:scale-110">
        <Sparkle size="calc(var(--u) * 4.4)" />
        <span
          className="font-sans font-semibold uppercase"
          style={{ fontSize: 'calc(var(--u) * 1.7)', letterSpacing: '0.3em', paddingLeft: '0.3em', marginTop: 'calc(var(--u) * 0.8)' }}
        >
          Abrir
        </span>
      </span>
    </button>
  );
}
