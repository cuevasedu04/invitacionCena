import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import Stack, { type StackHandle } from '../reactbits/Stack';
import PanelHeading from './PanelHeading';
import { VENUE } from '../../content';
import { fs, u } from '../../lib/units';
import { bloom, cascade, rise } from './reveal';

const photos = Object.values(
  import.meta.glob<string>('../../assets/salon/*.webp', { eager: true, import: 'default' })
);

const pad = (n: number) => String(n).padStart(2, '0');

/** Solapa derecha: fotografías del salón en una pila infinita (React Bits · Stack). */
export default function GalleryPanel({ show }: { show: boolean }) {
  const [top, setTop] = useState(0);
  const stack = useRef<StackHandle>(null);

  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain" style={{ padding: `${u(11)} ${u(9)} ${u(10)}` }}>
      <motion.div
        variants={cascade(0.12, 0.2)}
        initial="hidden"
        animate={show ? 'show' : 'hidden'}
        className="flex min-h-full flex-col items-center justify-evenly"
        style={{ gap: u(6) }}
      >
        <PanelHeading eyebrow="El salón" title={VENUE.room} subtitle={VENUE.name} />

        {/* data-no-swipe (con margen extra): al arrastrar una foto se mueve la pila, no el folleto */}
        <motion.div variants={bloom} data-no-swipe style={{ padding: u(4), margin: `-${u(4)}` }}>
          <div className="relative" style={{ width: u(78), height: u(74) }}>
            <Stack
              controlRef={stack}
              layout="pile"
              spread={0.55}
              depth={0.4}
              radius={4}
              frame={5}
              frameColor="#f3ead2"
              threshold={60}
              sendToBackOnClick
              autoplay={show}
              autoplayDelay={4500}
              pauseOnHover
              onChange={setTop}
              cards={photos.map((src, i) => (
                <img key={src} src={src} alt={`${VENUE.room}, fotografía ${i + 1}`} draggable={false} />
              ))}
            />
          </div>
        </motion.div>

        <motion.div variants={rise} className="flex flex-col items-center" style={{ gap: u(3) }}>
          <div className="flex items-center" style={{ gap: u(4) }}>
            <StepButton dir="prev" onClick={() => stack.current?.prev()} />
            <p className="font-serif text-gold-200 tabular-nums" style={{ fontSize: fs(4.6, 15) }} aria-live="polite">
              <span className="sr-only">Fotografía </span>
              {pad(top + 1)}
              <span className="text-gold-400/60"> / {pad(photos.length)}</span>
            </p>
            <StepButton dir="next" onClick={() => stack.current?.next()} />
          </div>
          {/* puntos: la posición es circular, sugiere que la galería no tiene fin */}
          <div className="flex items-center" style={{ gap: u(1.8) }}>
            {photos.map((src, i) => (
              <motion.span
                key={src}
                className="rounded-full bg-gold-300"
                animate={{ opacity: i === top ? 1 : 0.3, width: i === top ? u(5) : u(1.4) }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{ height: u(1.4) }}
              />
            ))}
          </div>
          <p
            className="font-sans uppercase text-gold-300/70"
            style={{ fontSize: fs(2.2, 9.5), letterSpacing: '0.3em', paddingLeft: '0.3em' }}
          >
            Desliza o toca las fotos
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StepButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Fotografía anterior' : 'Fotografía siguiente'}
      className="grid cursor-pointer place-items-center rounded-full border border-gold-400/50 text-gold-300 transition-colors hover:bg-gold-400/10 active:scale-95"
      style={{ width: fs(9, 34), height: fs(9, 34) }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '45%', height: '45%' }}>
        <path
          d={dir === 'prev' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
