import type { CSSProperties } from 'react';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const CORNER_FLIP: Record<Corner, string> = {
  tl: 'none',
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1, -1)'
};

/** Esquina art déco escalonada, inspirada en el marco de la invitación impresa. */
export function ArtDecoCorner({ corner, size = '16%', style }: { corner: Corner; size?: string; style?: CSSProperties }) {
  const position: CSSProperties = {
    top: corner[0] === 't' ? 0 : undefined,
    bottom: corner[0] === 'b' ? 0 : undefined,
    left: corner[1] === 'l' ? 0 : undefined,
    right: corner[1] === 'r' ? 0 : undefined
  };
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="pointer-events-none absolute text-gold-400"
      style={{ width: size, height: 'auto', transform: CORNER_FLIP[corner], ...position, ...style }}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="square">
        <path d="M6 70 V6 H70" strokeWidth="1.6" />
        <path d="M14 48 V14 H48" strokeWidth="1" />
        <path d="M22 34 V22 H34" strokeWidth="1" />
        <path d="M6 70 L14 78" strokeWidth="1" opacity="0.7" />
        <path d="M70 6 L78 14" strokeWidth="1" opacity="0.7" />
      </g>
      <path d="M22 22 l5 -5 l5 5 l-5 5z" fill="currentColor" transform="translate(-5 -5)" />
    </svg>
  );
}

/** Estrella de cuatro puntas (el destello que acompaña al año en el diseño original). */
export function Sparkle({ size = '1em', className = '' }: { size?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={{ width: size, height: size }}>
      <path d="M12 0 C12.8 7.2 16.8 11.2 24 12 C16.8 12.8 12.8 16.8 12 24 C11.2 16.8 7.2 12.8 0 12 C7.2 11.2 11.2 7.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

/** Línea dorada que se desvanece hacia el extremo, con un destello en la punta interior. */
export function GoldRule({ side, className = '' }: { side: 'left' | 'right'; className?: string }) {
  const fade = side === 'left' ? 'to right' : 'to left';
  return (
    <span className={`flex flex-1 items-center gap-[0.4em] ${side === 'right' ? 'flex-row-reverse' : ''} ${className}`}>
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(${fade}, transparent, var(--color-gold-400) 70%, var(--color-gold-200))` }}
      />
      <Sparkle size="0.55em" className="shrink-0 text-gold-200" />
    </span>
  );
}
