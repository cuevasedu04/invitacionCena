import { useMemo } from 'react';
import { Sparkle } from './ornaments/Ornaments';

/**
 * Fondo: navy profundo con un halo central y destellos dorados que titilan.
 * Los destellos son animaciones CSS de transform/opacity (compositor/GPU): no usan
 * JavaScript por cuadro, a diferencia del fondo WebGL anterior, que mantenía el
 * procesador ocupado todo el tiempo y trababa la apertura en celulares.
 */
const COUNT = 34;

export default function Backdrop({ paused = false }: { paused?: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 9,
        glow: 0.35 + Math.random() * 0.55,
        color: ['#fbf3d2', '#ecd590', '#c49a45'][i % 3]
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(90% 60% at 50% 45%, #0b1f45 0%, #03102a 45%, #000a18 100%)' }}
      />
      {/* tres capas de destellos que titilan desfasadas: 3 animaciones en vez de 34 */}
      {[0, 1, 2].map(group => (
        <div
          key={group}
          className="inv-twinkle-layer absolute inset-0"
          style={{
            animationDuration: `${5 + group * 1.3}s`,
            animationDelay: `${-group * 2.1}s`,
            animationPlayState: paused ? 'paused' : 'running'
          }}
        >
          {stars
            .filter(star => star.id % 3 === group)
            .map(star => (
              <span
                key={star.id}
                className="absolute"
                style={{ left: `${star.left}%`, top: `${star.top}%`, opacity: star.glow, color: star.color }}
              >
                <Sparkle size={`${star.size}px`} />
              </span>
            ))}
        </div>
      ))}
      {/* viñeta para concentrar la mirada en el folleto */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)' }}
      />
    </div>
  );
}
