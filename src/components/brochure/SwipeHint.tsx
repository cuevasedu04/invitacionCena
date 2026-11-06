import { motion, type MotionValue } from 'motion/react';

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4 text-gold-300"
    animate={{ x: dir === 'left' ? [0, -6, 0] : [0, 6, 0], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
  >
    <path
      d={dir === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

/** Indicación bajo el folleto; se desvanece en cuanto se empieza a abrir. */
export default function SwipeHint({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div style={{ opacity }} className="pointer-events-none mt-5">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.35em] text-gold-300/80"
      >
        <Chevron dir="left" />
        <span className="pl-[0.35em]">Desliza para abrir</span>
        <Chevron dir="right" />
      </motion.p>
    </motion.div>
  );
}
