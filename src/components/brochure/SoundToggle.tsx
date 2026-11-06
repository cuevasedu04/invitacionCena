import { useSound } from '../../audio/useSound';

/** Botón para silenciar o activar la música; las barras bailan mientras suena. */
export default function SoundToggle() {
  const { muted, playing, setMuted } = useSound();
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
      title={muted ? 'Activar música' : 'Silenciar música'}
      className="relative grid h-[42px] w-[42px] shrink-0 cursor-pointer place-items-center rounded-full border border-gold-400/30 bg-navy-950/70 text-gold-300/85 backdrop-blur-md transition-colors hover:text-gold-200 max-[399px]:h-[38px] max-[399px]:w-[38px]"
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        {[0.55, 1, 0.7, 0.85].map((peak, i) => (
          <span
            className={`w-[2px] rounded-full bg-current ${playing ? 'inv-eq' : ''}`}
            style={{
              transformOrigin: '50% 100%',
              transform: 'scaleY(0.2)',
              animationDuration: `${1.1 + i * 0.17}s`,
              height: `${peak * 100}%`
            }}
          />
        ))}
      </span>
      {muted && <span aria-hidden="true" className="absolute h-[1.5px] w-5 rotate-[-40deg] rounded-full bg-current" />}
    </button>
  );
}
