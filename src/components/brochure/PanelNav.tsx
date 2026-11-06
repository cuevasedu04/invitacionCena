import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { PhotosIcon, PinIcon } from '../ornaments/Icons';
import { Sparkle } from '../ornaments/Ornaments';

export type PanelId = -1 | 0 | 1;

const ITEMS: { id: PanelId; label: string; icon: ReactNode }[] = [
  { id: -1, label: 'Ubicación', icon: <PinIcon className="h-4 w-4" /> },
  { id: 0, label: 'Invitación', icon: <Sparkle size="0.85rem" /> },
  { id: 1, label: 'Galería', icon: <PhotosIcon className="h-4 w-4" /> }
];

/** Navegación entre las solapas cuando sólo cabe un panel en pantalla. */
export default function PanelNav({ active, onSelect }: { active: PanelId; onSelect: (id: PanelId) => void }) {
  return (
    <nav
      aria-label="Secciones de la invitación"
      className="flex items-center rounded-full border border-gold-400/30 bg-navy-950/70 p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md"
    >
      {ITEMS.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
            className={`relative flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.1em] min-[440px]:px-4 min-[440px]:text-[11px] min-[440px]:tracking-[0.16em] transition-colors duration-300 ${
              isActive ? 'text-navy-950' : 'text-gold-300/80 hover:text-gold-200'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="panel-nav-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #f5e6a8, #d9b766 50%, #c49a45)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative max-[439px]:hidden">{item.icon}</span>
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
