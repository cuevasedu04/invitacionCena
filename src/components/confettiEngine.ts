/**
 * Motor de la celebración: diamantina dorada, destellos y serpentinas.
 * Funciona igual en un Web Worker (OffscreenCanvas) o en el hilo principal (respaldo).
 */

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Surface = HTMLCanvasElement | OffscreenCanvas;

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

export interface BurstParams {
  w: number;
  h: number;
  dpr: number;
  ox: number;
  oy: number;
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

export function createConfettiEngine(canvas: Surface, onActive: (active: boolean) => void) {
  const ctx = canvas.getContext('2d') as Ctx | null;
  let particles: Particle[] = [];
  let raf = 0;
  let running = false;
  let dpr = 1;
  let h = 0;
  let last = 0;

  const resize = (w: number, height: number, ratio: number) => {
    dpr = ratio;
    h = height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(height * dpr);
  };

  const drawRibbon = (c: Ctx, p: Particle, alpha: number) => {
    const steps = 8;
    const amp = 3 + p.size * 0.6;
    const cos = Math.cos(p.angle) * dpr;
    const sin = Math.sin(p.angle) * dpr;
    c.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
    c.beginPath();
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps - 0.5) * p.length;
      const yy = Math.sin(s * p.curl + p.tilt * 2) * amp * Math.cos(p.tilt * 0.5);
      if (i === 0) c.moveTo(s, yy);
      else c.lineTo(s, yy);
    }
    c.strokeStyle = p.color;
    c.globalAlpha = alpha;
    c.lineWidth = 1 + p.size * 0.22;
    c.stroke();
  };

  const drawSpark = (c: Ctx, p: Particle, alpha: number) => {
    const r = p.size * (0.6 + 0.4 * Math.abs(Math.sin(p.tilt * 2)));
    const cos = Math.cos(p.angle * 0.3) * dpr;
    const sin = Math.sin(p.angle * 0.3) * dpr;
    c.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
    c.globalAlpha = alpha;
    c.fillStyle = '#fff6d6';
    c.beginPath();
    c.moveTo(0, -r);
    c.quadraticCurveTo(0, 0, r, 0);
    c.quadraticCurveTo(0, 0, 0, r);
    c.quadraticCurveTo(0, 0, -r, 0);
    c.quadraticCurveTo(0, 0, 0, -r);
    c.fill();
  };

  const drawFlake = (c: Ctx, p: Particle, alpha: number) => {
    // el giro en 3D se simula aplanando el rectángulo; brilla cuando queda de frente
    const flip = Math.cos(p.tilt);
    const squash = Math.abs(flip) * 0.9 + 0.1;
    const cos = Math.cos(p.angle) * dpr;
    const sin = Math.sin(p.angle) * dpr;
    c.setTransform(cos, sin, -sin * squash, cos * squash, p.x * dpr, p.y * dpr);
    c.globalAlpha = alpha;
    c.fillStyle = Math.abs(flip) > 0.92 ? '#fffaf0' : p.color;
    c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
  };

  const tick = (now: number) => {
    if (!ctx) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const f = dt * 60;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const alive: Particle[] = [];
    for (const p of particles) {
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
      if (p.kind === 'ribbon') drawRibbon(ctx, p, fade);
      else if (p.kind === 'spark') drawSpark(ctx, p, fade);
      else drawFlake(ctx, p, fade);
    }
    particles = alive;
    ctx.globalAlpha = 1;
    if (alive.length) raf = requestAnimationFrame(tick);
    else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      running = false;
      onActive(false);
    }
  };

  const burst = ({ w, h: height, dpr: ratio, ox, oy }: BurstParams) => {
    resize(w, height, ratio);
    const power = Math.min(2.2, Math.max(1, w / 420));
    // menos partículas en pantallas chicas (celulares), más en escritorio
    const density = Math.min(1, Math.max(0.6, (w * height) / (1280 * 800)));
    const n = (count: number) => Math.round(count * density);
    const list: Particle[] = [];

    // estallido desde la unión del folleto, abierto hacia arriba y a los lados
    const fountain = (count: number, kind: Kind, speed: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(speed[0], speed[1]) * power;
        list.push(makeParticle(kind, ox + rand(-20, 20), oy + rand(-30, 30), Math.cos(a) * v, Math.sin(a) * v - 2, rand(0, 0.12)));
      }
    };
    fountain(n(120), 'flake', [5, 15]);
    fountain(n(36), 'spark', [6, 16]);
    fountain(n(12), 'ribbon', [6, 13]);

    // lluvia suave desde arriba, escalonada
    for (let i = 0; i < n(80); i++) {
      list.push(makeParticle('flake', rand(0, w), rand(-80, -10), rand(-0.6, 0.6), rand(1, 2.6), rand(0.5, 2.6)));
    }
    for (let i = 0; i < n(9); i++) {
      list.push(makeParticle('ribbon', rand(0, w), rand(-120, -40), rand(-0.4, 0.4), rand(1.2, 2.2), rand(0.6, 2.4)));
    }
    particles.push(...list);
    if (!running) {
      running = true;
      onActive(true);
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }
  };

  const destroy = () => cancelAnimationFrame(raf);

  return { burst, resize, destroy };
}
