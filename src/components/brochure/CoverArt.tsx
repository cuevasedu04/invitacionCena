import ShinyText from '../reactbits/ShinyText';
import { ArtDecoCorner, GoldRule, Sparkle } from '../ornaments/Ornaments';

const shine = {
  color: '#d9b766',
  shineColor: '#fff6d6',
  speed: 3.2,
  delay: 1.4,
  angle: 115,
  shineWidth: 34,
  glow: 0.35
};

/**
 * Exterior del folleto a tamaño completo. Cada solapa renderiza esta misma pieza
 * desplazada, de modo que al cerrar se ve como un único diseño continuo.
 */
export default function CoverArt() {
  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 36%, #0f2652 0%, #061633 45%, #000a18 100%)' }}
      />
      {/* destello radial art déco detrás del título */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 44%, var(--color-gold-300) 0deg 1.4deg, transparent 1.4deg 7.5deg)',
          maskImage: 'radial-gradient(circle at 50% 44%, black 0%, transparent 58%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 44%, black 0%, transparent 58%)'
        }}
      />
      <div className="paper-grain absolute inset-0" />

      {/* marco doble y arco, como en la invitación impresa */}
      <div className="absolute border border-gold-500/70" style={{ inset: 'calc(var(--u) * 3)' }} />
      <div className="absolute border border-gold-500/25" style={{ inset: 'calc(var(--u) * 4.4)' }} />
      <svg
        viewBox="0 0 100 143"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-gold-400/45"
      >
        <path d="M11 134 V50 A39 39 0 0 1 89 50 V134" fill="none" stroke="currentColor" strokeWidth="0.35" />
      </svg>
      <ArtDecoCorner corner="tl" style={{ margin: 'calc(var(--u) * 1.4)' }} />
      <ArtDecoCorner corner="tr" style={{ margin: 'calc(var(--u) * 1.4)' }} />
      <ArtDecoCorner corner="bl" style={{ margin: 'calc(var(--u) * 1.4)' }} />
      <ArtDecoCorner corner="br" style={{ margin: 'calc(var(--u) * 1.4)' }} />

      <div className="absolute inset-0 flex flex-col items-center text-center" style={{ paddingTop: '17%' }}>
        <p
          className="font-sans font-medium uppercase text-gold-300/85"
          style={{ fontSize: 'calc(var(--u) * 2.5)', letterSpacing: '0.5em', paddingLeft: '0.5em' }}
        >
          Invitación
        </p>
        <Sparkle size="calc(var(--u) * 2.6)" className="mt-[calc(var(--u)*2.4)] text-gold-400" />

        <h1 className="font-script font-normal leading-none" style={{ marginTop: 'calc(var(--u) * 5)' }}>
          <ShinyText
            {...shine}
            text="Cena de"
            className="px-[0.2em] pb-[0.12em]"
            style={{ fontSize: 'calc(var(--u) * 15.5)' }}
          />
          <br />
          <ShinyText
            {...shine}
            text="Fin de Año"
            className="px-[0.2em] pb-[0.12em]"
            style={{ fontSize: 'calc(var(--u) * 15.5)', marginTop: 'calc(var(--u) * -3.5)' }}
          />
        </h1>

        <div
          className="flex w-[84%] items-center font-serif"
          style={{ marginTop: 'calc(var(--u) * 1)', gap: 'calc(var(--u) * 3)', fontSize: 'calc(var(--u) * 5)' }}
        >
          <GoldRule side="left" />
          <span
            className="gold-text font-semibold leading-none"
            style={{ fontSize: 'calc(var(--u) * 17)', letterSpacing: '0.02em' }}
          >
            2026
          </span>
          <GoldRule side="right" />
        </div>

        <p
          className="font-serif italic text-gold-200/75"
          style={{ fontSize: 'calc(var(--u) * 4)', marginTop: 'calc(var(--u) * 3.5)' }}
        >
          Unidad de Administración y Finanzas
        </p>

        <p
          className="absolute font-sans uppercase text-gold-300/70"
          style={{
            bottom: '8.5%',
            fontSize: 'calc(var(--u) * 2.3)',
            letterSpacing: '0.38em',
            paddingLeft: '0.38em'
          }}
        >
          Viernes 27 · Noviembre
        </p>
      </div>
    </div>
  );
}
