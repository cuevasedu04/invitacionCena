import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import PanelHeading from './PanelHeading';
import { ExternalIcon, PinIcon, RouteIcon } from '../ornaments/Icons';
import { VENUE } from '../../content';
import { fs, u } from '../../lib/units';
import { cascade, rise } from './reveal';

// Tono oscuro para el mapa: invierte y regresa los matices, así el pin conserva su rojo.
const MAP_FILTER = 'invert(0.9) hue-rotate(180deg) saturate(0.85) brightness(0.95) contrast(0.9)';

/**
 * Solapa izquierda: ubicación del salón con mapa y accesos directos a la ruta.
 * `loadMap` decide cuándo cargar Google Maps (pesa ~1 MB de JavaScript): no durante
 * la celebración de apertura, sino después o cuando la persona abre esta solapa.
 */
export default function LocationPanel({ show, loadMap }: { show: boolean; loadMap: boolean }) {
  const [mapRequested, setMapRequested] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    if (show && loadMap) setMapRequested(true);
  }, [show, loadMap]);

  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain" style={{ padding: `${u(11)} ${u(9)} ${u(10)}` }}>
      <motion.div
        variants={cascade(0.12, 0.2)}
        initial="hidden"
        animate={show ? 'show' : 'hidden'}
        className="flex min-h-full flex-col items-center"
        style={{ gap: u(6) }}
      >
        <PanelHeading eyebrow="Ubicación" title={VENUE.name} subtitle={`${VENUE.room} · ${VENUE.floor}`} />

        <motion.div
          variants={rise}
          className="relative w-full flex-1 overflow-hidden rounded-[10px] border border-gold-400/60 bg-navy-950"
          style={{ minHeight: u(62), maxHeight: u(100), boxShadow: '0 12px 30px -12px rgba(0,0,0,0.7)' }}
        >
          {/* mientras carga: un pin que late en el centro */}
          {!mapLoaded && (
            <motion.span
              className="absolute inset-0 grid place-items-center text-gold-400"
              animate={{ opacity: [0.35, 0.9, 0.35], y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PinIcon style={{ width: u(10), height: u(10) }} />
            </motion.span>
          )}
          {mapRequested && (
            <motion.iframe
              title={`Mapa de ${VENUE.name}`}
              src={VENUE.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              onLoad={() => setMapLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: mapLoaded ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 h-full w-full border-0"
              style={{ filter: MAP_FILTER }}
            />
          )}
          {/* todo el mapa es un enlace: abre la app de Maps (o el navegador) en el lugar exacto */}
          <a
            href={VENUE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${VENUE.name} en Google Maps`}
            className="group absolute inset-0 flex items-end justify-center"
            style={{ background: 'linear-gradient(to top, rgba(0,10,24,0.85), transparent 38%)', padding: u(4) }}
          >
            <span
              className="flex items-center rounded-full border border-gold-300/60 bg-navy-950/80 font-sans font-medium uppercase text-gold-200 backdrop-blur-sm transition-colors group-hover:bg-navy-800"
              style={{ fontSize: fs(2.3, 9.5), letterSpacing: '0.22em', padding: '0.85em 1.4em', gap: '0.7em' }}
            >
              Abrir en Google Maps
              <ExternalIcon className="h-[1.3em] w-[1.3em]" />
            </span>
          </a>
        </motion.div>

        <motion.address
          variants={rise}
          className="font-sans font-light not-italic leading-relaxed text-gold-100"
          style={{ fontSize: fs(3.4, 12) }}
        >
          {VENUE.address.map(line => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.address>

        <motion.div variants={rise} className="flex w-full flex-col items-stretch" style={{ gap: u(2.6) }}>
          <a
            href={VENUE.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full font-sans font-semibold uppercase text-navy-950 transition-[filter] hover:brightness-110"
            style={{
              fontSize: fs(2.6, 10.5),
              letterSpacing: '0.24em',
              padding: '1.15em 1em',
              gap: '0.8em',
              background: 'linear-gradient(135deg, #f5e6a8, #d9b766 45%, #b8893f)',
              boxShadow: '0 10px 24px -10px rgba(217,183,102,0.55)'
            }}
          >
            <RouteIcon className="h-[1.6em] w-[1.6em]" />
            Cómo llegar
          </a>
          <a
            href={VENUE.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full border border-gold-400/50 font-sans font-medium uppercase text-gold-200 transition-colors hover:bg-gold-400/10"
            style={{ fontSize: fs(2.4, 10), letterSpacing: '0.24em', padding: '1em' }}
          >
            Abrir en Waze
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
