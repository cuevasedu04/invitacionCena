import { useState } from 'react';
import { motion } from 'motion/react';
import Stack from '../reactbits/Stack';
import PanelHeading from './PanelHeading';
import { VENUE } from '../../content';
import { fs, u } from '../../lib/units';
import { bloom, cascade, rise } from './reveal';

const photos = Object.values(
  import.meta.glob<string>('../../assets/salon/*.webp', { eager: true, import: 'default' })
);

/** Solapa derecha: fotografías del salón en una pila que se desliza (React Bits · Stack). */
export default function GalleryPanel({ show }: { show: boolean }) {
  const [top, setTop] = useState(0);

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

        {/* data-no-swipe: al arrastrar una foto se mueve la pila, no el folleto */}
        <motion.div variants={bloom} data-no-swipe className="relative" style={{ width: u(76), height: u(64) }}>
          <Stack
            layout="pile"
            spread={0.55}
            depth={0.4}
            radius={4}
            frame={5}
            frameColor="#f3ead2"
            threshold={70}
            sendToBackOnClick
            onChange={setTop}
            cards={photos.map((src, i) => (
              <img key={src} src={src} alt={`${VENUE.room}, fotografía ${i + 1}`} draggable={false} />
            ))}
          />
        </motion.div>

        <motion.div variants={rise} className="flex flex-col items-center" style={{ gap: u(2.4) }}>
          <p className="flex items-center font-serif text-gold-200" style={{ gap: u(3), fontSize: fs(4.6, 15) }}>
            <span className="h-px bg-gradient-to-r from-transparent to-gold-400/70" style={{ width: u(10) }} />
            <span className="tabular-nums">
              {String(top + 1).padStart(2, '0')}
              <span className="text-gold-400/60"> / {String(photos.length).padStart(2, '0')}</span>
            </span>
            <span className="h-px bg-gradient-to-l from-transparent to-gold-400/70" style={{ width: u(10) }} />
          </p>
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
