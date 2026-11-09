import { motion } from 'motion/react';
import PanelHeading from './PanelHeading';
import { VENUE } from '../../content';
import { fs, u } from '../../lib/units';
import { bloom, cascade, rise } from './reveal';

const photo = `${import.meta.env.BASE_URL}salon_lecrillon.jpeg`;

/** Descarga y decodifica la foto con anticipación, para no hacerlo al abrir el folleto. */
export function preloadGallery() {
  const img = new Image();
  img.decoding = 'async';
  img.src = photo;
  img.decode?.().catch(() => undefined);
}

/** Solapa derecha: fotografía del salón; se puede arrastrar y regresa a su lugar. */
export default function GalleryPanel({ show }: { show: boolean }) {
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

        {/* data-no-swipe: al arrastrar la foto se mueve ella, no el folleto */}
        <motion.div variants={bloom} data-no-swipe>
          <motion.div
            drag
            dragSnapToOrigin
            dragElastic={0.5}
            dragTransition={{ bounceStiffness: 260, bounceDamping: 18 }}
            whileDrag={{ scale: 1.04, rotate: -2 }}
            whileTap={{ cursor: 'grabbing' }}
            className="cursor-grab touch-none overflow-hidden rounded"
            style={{
              width: u(50),
              aspectRatio: '335 / 597',
              border: `${u(1.4)} solid #f3ead2`,
              boxShadow: '0 18px 40px -14px rgba(0,0,0,0.75)'
            }}
          >
            <img
              src={photo}
              alt={`${VENUE.name}, fachada del salón`}
              draggable={false}
              className="pointer-events-none block h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>

        <motion.p
          variants={rise}
          className="font-sans uppercase text-gold-300/70"
          style={{ fontSize: fs(2.2, 9.5), letterSpacing: '0.3em', paddingLeft: '0.3em' }}
        >
          Arrastra la foto
        </motion.p>
      </motion.div>
    </div>
  );
}
