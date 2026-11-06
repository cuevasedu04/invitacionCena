import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Celebración al abrir el folleto: diamantina dorada, destellos y serpentinas.
 * Un estallido sale del folleto y después cae una lluvia suave desde arriba.
 * Se dibuja en un <canvas> y se detiene sola cuando la última partícula sale.
 */

const GOLD = ['#fff6d6', '#fbf3d2', '#f5e6a8', '#ecd590', '#d9b766', '#c49a45', '#b8893f'];
const GRAVITY = 0.16;
const MAX_LIFE = 6;

type Kind = 'flake' | 'spark' | 'ribbon';

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  size: number;
  length: number;
  curl: number;
  color: string;
  drag: number;
  wobble: number;
  seed: number;
  age: number;
  delay: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function makeParticle(kind: Kind, x: number, y: number, vx: number, vy: number, delay = 0): Particle {
  return {
    kind,
    x,
    y,
    vx,
    vy,
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.12, 0.12),
    tilt: rand(0, Math.PI * 2),
    tiltSpeed: rand(0.08, 0.2),
    size: kind === 'spark' ? rand(3, 6) : rand(2.5, 6),
    length: rand(30, 58),
    curl: rand(0.16, 0.3),
    color: pick(GOLD),
    drag: kind === 'ribbon' ? 0.955 : kind === 'spark' ? 0.94 : 0.965,
    wobble: rand(0.4, 1.4),
    seed: rand(0, 100),
    age: 0,
    delay
  };
}

export default function Celebration({ burst, origin }: { burst: number; origin: () => { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const reduce = useReducedMotion();
  const originRef = useRef(origin);
  originRef.current = origin;

  useEffect(() => {
    if (!burst || reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const power = Math.min(2.2, Math.max(1, w / 420));
    const { x: ox, y: oy } = originRef.current();
    const list: Particle[] = [];

    // estallido desde la unión del folleto, abierto hacia arriba y a los lados
    const fountain = (count: number, kind: Kind, speed: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(speed[0], speed[1]) * power;
        list.push(makeParticle(kind, ox + rand(-20, 20), oy + rand(-30, 30), Math.cos(a) * v, Math.sin(a) * v - 2, rand(0, 0.12)));
      }
    };
    fountain(130, 'flake', [5, 15]);
    fountain(45, 'spark', [6, 16]);
    fountain(12, 'ribbon', [6, 13]);

    // lluvia suave desde arriba, escalonada
    for (let i = 0; i < 90; i++) {
      list.push(makeParticle('flake', rand(0, w), rand(-80, -10), rand(-0.6, 0.6), rand(1, 2.6), rand(0.5, 2.6)));
    }
    for (let i = 0; i < 9; i++) {
      list.push(makeParticle('ribbon', rand(0, w), rand(-120, -40), rand(-0.4, 0.4), rand(1.2, 2.2), rand(0.6, 2.4)));
    }
    particles.current.push(...list);

    let last = performance.now();
    const drawRibbon = (p: Particle, alpha: number) => {
      const steps = 16;
      const thick = 1 + p.size * 0.22;
      const amp = 3 + p.size * 0.6;
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.angle);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const [width, shade] of [
        [thick, 0.75],
        [thick * 0.4, 1]
      ] as const) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const s = (i / steps - 0.5) * p.length;
          const yy = Math.sin(s * p.curl + p.tilt * 2) * amp * Math.cos(p.tilt * 0.5);
          if (i === 0) ctx.moveTo(s * dpr, yy * dpr);
          else ctx.lineTo(s * dpr, yy * dpr);
        }
        ctx.strokeStyle = shade < 1 ? p.color : '#fff8e1';
        ctx.globalAlpha = alpha * (shade < 1 ? 1 : 0.45);
        ctx.lineWidth = width * dpr;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSpark = (p: Particle, alpha: number) => {
      const r = p.size * dpr * (0.6 + 0.4 * Math.abs(Math.sin(p.tilt * 2)));
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.angle * 0.3);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff6d6';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
      ctx.restore();
    };

    const drawFlake = (p: Particle, alpha: number) => {
      // el giro en 3D se simula aplanando el rectángulo; brilla cuando queda de frente
      const flip = Math.cos(p.tilt);
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.angle);
      ctx.scale(1, Math.abs(flip) * 0.9 + 0.1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = Math.abs(flip) > 0.92 ? '#fffaf0' : p.color;
      ctx.fillRect((-p.size / 2) * dpr, (-p.size / 3) * dpr, p.size * dpr, (p.size / 1.5) * dpr);
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = dt * 60;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive: Particle[] = [];
      for (const p of particles.current) {
        if (p.delay > 0) {
          p.delay -= dt;
          alive.push(p);
          continue;
        }
        p.age += dt;
        const drag = Math.pow(p.drag, f);
        p.vx *= drag;
        p.vy = p.vy * drag + GRAVITY * (p.kind === 'ribbon' ? 0.55 : p.kind === 'spark' ? 0.5 : 0.75) * f;
        p.x += (p.vx + Math.sin(p.age * 3 * p.wobble + p.seed) * p.wobble * 0.6) * f;
        p.y += p.vy * f;
        p.angle += p.spin * f;
        p.tilt += p.tiltSpeed * f;
        const fade = p.kind === 'spark' ? Math.max(0, 1 - p.age / 1.8) : Math.min(1, (MAX_LIFE - p.age) / 1.2);
        if (fade <= 0 || p.y > h + 60) continue;
        alive.push(p);
        if (p.kind === 'ribbon') drawRibbon(p, fade);
        else if (p.kind === 'spark') drawSpark(p, fade);
        else drawFlake(p, fade);
      }
      particles.current = alive;
      ctx.globalAlpha = 1;
      if (alive.length) raf.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [burst, reduce]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 h-full w-full" />;
}
