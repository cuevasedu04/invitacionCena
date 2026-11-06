import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { createConfettiEngine, type BurstParams } from './confettiEngine';

/**
 * Celebración al abrir el folleto: diamantina dorada, destellos y serpentinas.
 * Se dibuja en un Web Worker con OffscreenCanvas, fuera del hilo principal, para que
 * la página siga fluida mientras hay confeti en pantalla. Si el navegador no lo
 * soporta, el mismo motor corre en el hilo principal.
 */

interface CelebrationProps {
  burst: number;
  origin: () => { x: number; y: number };
  /** avisa cuando la animación empieza y termina (para pausar otros efectos mientras tanto) */
  onActiveChange?: (active: boolean) => void;
}

interface Driver {
  burst: (params: BurstParams) => void;
  resize: (w: number, h: number, dpr: number) => void;
}

// las partículas son pequeñas y se mueven rápido: 1.5x basta
const ratio = () => Math.min(window.devicePixelRatio || 1, 1.5);

export default function Celebration({ burst, origin, onActiveChange }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const driver = useRef<Driver | null>(null);
  const reduce = useReducedMotion();
  const originRef = useRef(origin);
  originRef.current = origin;
  const activeRef = useRef(onActiveChange);
  activeRef.current = onActiveChange;

  // el canvas solo puede transferirse una vez: el motor vive lo mismo que el componente
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || driver.current) return;
    const notify = (active: boolean) => activeRef.current?.(active);

    if ('transferControlToOffscreen' in canvas && typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./confetti.worker.ts', import.meta.url), { type: 'module' });
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen]);
      worker.onmessage = (e: MessageEvent<{ active: boolean }>) => notify(e.data.active);
      driver.current = {
        burst: params => worker.postMessage({ type: 'burst', params }),
        resize: (w, h, dpr) => worker.postMessage({ type: 'resize', w, h, dpr })
      };
    } else {
      const engine = createConfettiEngine(canvas, notify);
      driver.current = { burst: engine.burst, resize: engine.resize };
    }

    const onResize = () => driver.current?.resize(window.innerWidth, window.innerHeight, ratio());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!burst || reduce) return;
    const { x, y } = originRef.current();
    driver.current?.burst({ w: window.innerWidth, h: window.innerHeight, dpr: ratio(), ox: x, oy: y });
  }, [burst, reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 h-full w-full" />;
}
