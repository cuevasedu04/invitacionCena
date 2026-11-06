import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo
} from 'motion/react';
import CoverArt from './CoverArt';
import FlapInner from './FlapInner';
import Seal from './Seal';
import SwipeHint from './SwipeHint';
import PanelNav, { type PanelId } from './PanelNav';
import SoundToggle from './SoundToggle';
import { sound } from '../../audio/soundEngine';
import InvitationPanel from '../panels/InvitationPanel';
import LocationPanel from '../panels/LocationPanel';
import GalleryPanel, { preloadGallery } from '../panels/GalleryPanel';
import { FoldIcon } from '../ornaments/Icons';
import Celebration from '../Celebration';
import { useGeometry } from '../../hooks/useGeometry';
import { EASE_IN_OUT, EASE_OUT } from '../../lib/units';

/**
 * Fases del folleto:
 * closed    → solapas en 3D; se abren con el gesto (progress 0 → 1)
 * unfolding → las solapas, ya planas, se despliegan a ancho completo (spread 0 → 1)
 * open      → contenido visible; en celular se navega entre paneles deslizando
 * folding   → camino inverso al cerrar
 */
type Phase = 'closed' | 'unfolding' | 'open' | 'folding';

/** Fracción de apertura a partir de la cual, al soltar, el folleto termina de abrirse solo. */
const OPEN_THRESHOLD = 0.3;
/** Velocidad (px/s) de un gesto rápido que abre el folleto aunque no se haya arrastrado mucho. */
const FLICK_VELOCITY = 450;
/** Distancia de arrastre, relativa al ancho del folleto, que equivale a abrirlo por completo. */
const DRAG_TRAVEL = 0.62;
/** Fracción del ancho que hay que deslizar para cambiar de panel. */
const SWIPE_THRESHOLD = 0.18;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clampPanel = (v: number) => Math.max(-1, Math.min(1, v)) as PanelId;

interface BrochureProps {
  /** true cuando conviene pausar el fondo animado (celebración en curso o fondo tapado) */
  onBackdropPausedChange?: (paused: boolean) => void;
}

export default function Brochure({ onBackdropPausedChange }: BrochureProps) {
  const geo = useGeometry();
  const carousel = geo.mode === 'carousel';
  const reduceMotion = useReducedMotion();

  // 0 = cerrado, 1 = solapas abiertas. Todo el giro 3D se deriva de este valor.
  const progress = useMotionValue(0);
  // 0 = solapas a medio ancho, 1 = desplegadas a ancho completo (también crece el alto).
  const spread = useMotionValue(0);
  // desplazamiento horizontal del tríptico en modo carrusel
  const trackX = useMotionValue(0);

  const [phase, setPhaseState] = useState<Phase>('closed');
  const phaseRef = useRef<Phase>('closed');
  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };
  const [panel, setPanel] = useState<PanelId>(0);
  const panelRef = useRef<PanelId>(0);

  const [celebration, setCelebration] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const trackControls = useRef<AnimationPlaybackControls | null>(null);
  const dragStart = useRef(0);
  const interacted = useRef(false);
  // la hoja ya sonó durante este arrastre (para no repetirla al soltar)
  const turnPlayed = useRef(false);
  const swipe = useRef({ active: false, base: 0, endedAt: 0, used: false });

  const leftAngle = useTransform(progress, [0, 1], [0, -180]);
  const rightAngle = useTransform(progress, [0, 1], [0, 180]);
  const frontShade = useTransform(progress, [0, 0.5], [0, 0.6]);
  const backShade = useTransform(progress, [0.5, 1], [0.6, 0]);
  const interiorShadow = useTransform(progress, [0, 0.65, 1], [1, 0.55, 0]);
  const revealOpacity = useTransform(progress, [0.05, 0.75], [0, 1]);
  const revealScale = useTransform(progress, [0, 1], [0.94, 1]);
  const innerGlow = useTransform(progress, [0, 0.35, 1], [0, 1, 0]);
  const sealOpacity = useTransform(progress, [0.1, 0.22], [1, 0]);
  const hintOpacity = useTransform(progress, [0.1, 0.2], [1, 0]);

  /* ---------- abrir / cerrar ---------- */

  const unfold = useCallback(() => {
    setPhase('unfolding');
    setCelebration(n => n + 1);
    sound.celebrate();
    sound.startMusic();
    controls.current = animate(spread, 1, {
      duration: reduceMotion ? 0.3 : 1.05,
      ease: EASE_IN_OUT,
      onComplete: () => setPhase('open')
    });
  }, [spread, reduceMotion]);

  const open = useCallback(() => {
    if (phaseRef.current !== 'closed') return;
    interacted.current = true;
    if (!turnPlayed.current) sound.pageTurn();
    turnPlayed.current = false;
    controls.current?.stop();
    const remaining = 1 - progress.get();
    controls.current = animate(progress, 1, {
      duration: reduceMotion ? 0.3 : 0.55 + remaining * 1.35,
      ease: EASE_OUT,
      onComplete: unfold
    });
  }, [progress, reduceMotion, unfold]);

  const goTo = useCallback(
    (target: PanelId) => {
      if (target !== panelRef.current && phaseRef.current === 'open') sound.pageTurn(true);
      panelRef.current = target;
      setPanel(target);
      trackControls.current?.stop();
      trackControls.current = animate(trackX, -target * geo.w, reduceMotion
        ? { duration: 0.2 }
        : { type: 'spring', stiffness: 230, damping: 32 });
    },
    [trackX, geo.w, reduceMotion]
  );

  const close = useCallback(() => {
    if (phaseRef.current !== 'open') return;
    setPhase('folding');
    sound.pageTurn();
    sound.stopMusic();
    goTo(0);
    controls.current = animate(spread, 0, {
      duration: reduceMotion ? 0.3 : 0.85,
      ease: EASE_IN_OUT,
      delay: 0.25,
      onComplete: () => {
        setPhase('closed');
        controls.current = animate(progress, 0, { duration: reduceMotion ? 0.3 : 1.4, ease: EASE_IN_OUT });
      }
    });
  }, [spread, progress, reduceMotion, goTo]);

  /* ---------- gesto de apertura ---------- */

  // "Asomo" periódico: las solapas se entreabren un poco para sugerir que el folleto se abre.
  useEffect(() => {
    if (reduceMotion) return;
    let interval: number | undefined;
    const peek = () => {
      if (interacted.current || progress.get() !== 0) return;
      controls.current = animate(progress, [0, 0.075, 0], { duration: 1.5, ease: 'easeInOut' });
    };
    const first = window.setTimeout(() => {
      peek();
      interval = window.setInterval(peek, 5200);
    }, 2900);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [progress, reduceMotion]);

  const handleOpenPanStart = () => {
    interacted.current = true;
    turnPlayed.current = false;
    controls.current?.stop();
    dragStart.current = progress.get();
  };

  // Cualquier deslizamiento horizontal (o hacia arriba) abre ambas solapas a la vez.
  const handleOpenPan = (_: PointerEvent, info: PanInfo) => {
    const distance = Math.max(Math.abs(info.offset.x), -info.offset.y * 0.9);
    const next = clamp01(dragStart.current + distance / (geo.w * DRAG_TRAVEL));
    progress.set(next);
    // la hoja suena mientras se arrastra (en celular, el navegador sólo lo permite
    // después del primer toque; entonces suena al soltar, desde open())
    if (!turnPlayed.current && next > 0.12 && sound.isReady) {
      sound.pageTurn();
      turnPlayed.current = true;
    }
  };

  const handleOpenPanEnd = (_: PointerEvent, info: PanInfo) => {
    const flick = Math.max(Math.abs(info.velocity.x), -info.velocity.y);
    if (progress.get() > OPEN_THRESHOLD || flick > FLICK_VELOCITY) open();
    else {
      controls.current?.stop();
      controls.current = animate(progress, 0, { type: 'spring', stiffness: 210, damping: 24 });
    }
  };

  /* ---------- carrusel entre paneles (celular) ---------- */

  const handleSwipeStart = (event: PointerEvent, info: PanInfo) => {
    const target = event.target as Element | null;
    const horizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
    swipe.current.active = horizontal && !target?.closest?.('[data-no-swipe]');
    if (!swipe.current.active) return;
    swipe.current.used = true;
    swipe.current.base = -panelRef.current * geo.w;
    trackControls.current?.stop();
  };

  const handleSwipe = (_: PointerEvent, info: PanInfo) => {
    if (!swipe.current.active) return;
    const limit = geo.w;
    let x = swipe.current.base + info.offset.x;
    // resistencia elástica más allá de las solapas
    if (x > limit) x = limit + (x - limit) * 0.25;
    if (x < -limit) x = -limit + (x + limit) * 0.25;
    trackX.set(x);
  };

  const handleSwipeEnd = (_: PointerEvent, info: PanInfo) => {
    if (!swipe.current.active) return;
    swipe.current.active = false;
    swipe.current.endedAt = performance.now();
    let next: number = panelRef.current;
    if (info.offset.x < -geo.w * SWIPE_THRESHOLD || info.velocity.x < -350) next += 1;
    else if (info.offset.x > geo.w * SWIPE_THRESHOLD || info.velocity.x > 350) next -= 1;
    goTo(clampPanel(next));
  };

  // un deslizamiento que termina sobre un enlace (p. ej. el mapa) no debe abrirlo
  const swallowClickAfterSwipe = (event: MouseEvent) => {
    if (performance.now() - swipe.current.endedAt < 250) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // al cambiar el tamaño de la ventana, recoloca el carrusel (o lo centra en escritorio)
  useEffect(() => {
    trackControls.current?.stop();
    if (!carousel && panelRef.current !== 0) {
      panelRef.current = 0;
      setPanel(0);
    }
    trackX.set(carousel ? -panelRef.current * geo.w : 0);
  }, [carousel, geo.w, trackX]);

  // sugerencia al abrir en celular: el tríptico se asoma hacia la galería y regresa
  useEffect(() => {
    if (phase !== 'open' || !carousel || reduceMotion) return;
    const id = window.setTimeout(() => {
      if (swipe.current.used || panelRef.current !== 0) return;
      trackControls.current = animate(trackX, [0, -geo.w * 0.12, 0], { duration: 1.3, ease: 'easeInOut' });
    }, 2600);
    return () => window.clearTimeout(id);
  }, [phase, carousel, geo.w, trackX, reduceMotion]);

  // flechas del teclado para cambiar de panel
  useEffect(() => {
    if (phase !== 'open' || !carousel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goTo(clampPanel(panelRef.current + 1));
      if (event.key === 'ArrowLeft') goTo(clampPanel(panelRef.current - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, carousel, goTo]);

  // la celebración brota desde la unión de las solapas
  const celebrationOrigin = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    return rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  };

  // el sonido se habilita con el primer gesto de la persona
  useEffect(() => sound.arm(), []);

  // fotos de la galería: se descargan mientras el folleto sigue cerrado
  useEffect(() => {
    const id = window.setTimeout(preloadGallery, 1800);
    return () => window.clearTimeout(id);
  }, []);

  // el fondo de partículas se pausa durante la celebración y cuando el folleto
  // abierto lo tapa casi por completo (celular)
  const backdropPaused = celebrating || (carousel && phase !== 'closed');
  useEffect(() => {
    onBackdropPausedChange?.(backdropPaused);
  }, [backdropPaused, onBackdropPausedChange]);

  /* ---------- render ---------- */

  const isClosed = phase === 'closed';
  const showContent = phase === 'open';
  const swipeEnabled = showContent && carousel;

  const vars = {
    '--card-w': `${geo.w}px`,
    '--card-h': `${geo.hClosed}px`,
    '--h-closed': `${geo.hClosed}px`,
    '--h-open': `${geo.hOpen}px`,
    '--u': `${geo.w / 100}px`,
    '--spread': spread
  } as unknown as Record<string, string | MotionValue<number>>;

  return (
    <motion.div className="relative z-10 flex h-full flex-col" style={vars}>
      <Celebration burst={celebration} origin={celebrationOrigin} onActiveChange={setCelebrating} />
      <div className="relative flex min-h-0 flex-1 items-center justify-center" style={{ perspective: '1600px' }}>
        <motion.div
          className="relative"
          style={{ x: trackX, touchAction: isClosed ? 'none' : 'pan-y' }}
          onPanStart={swipeEnabled ? handleSwipeStart : undefined}
          onPan={swipeEnabled ? handleSwipe : undefined}
          onPanEnd={swipeEnabled ? handleSwipeEnd : undefined}
          onClickCapture={swallowClickAfterSwipe}
        >
          <motion.div
            ref={cardRef}
            className="relative select-none"
            style={{
              width: 'var(--card-w)',
              height: 'calc(var(--h-closed) + (var(--h-open) - var(--h-closed)) * var(--spread))',
              perspective: 'calc(var(--card-w) * 3.2)',
              cursor: isClosed ? 'grab' : undefined
            }}
            initial={{ opacity: 0, y: 56, scale: 0.9, rotateX: 16, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            transition={{ duration: reduceMotion ? 0.4 : 1.8, ease: EASE_OUT, delay: 0.2 }}
            onPanStart={isClosed ? handleOpenPanStart : undefined}
            onPan={isClosed ? handleOpenPan : undefined}
            onPanEnd={isClosed ? handleOpenPanEnd : undefined}
          >
            {/* sombra proyectada sobre la "mesa"; se ensancha al desplegarse el tríptico */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 rounded-[50%] bg-black/70 blur-2xl"
              style={{
                top: '98%',
                width: 'calc(var(--card-w) * (0.9 + 2 * var(--spread)))',
                height: 'calc(var(--u) * 8)',
                x: '-50%'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.6 }}
            />

            {/* panel central: se revela conforme se abren las solapas */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <motion.div className="absolute inset-0" style={{ opacity: revealOpacity, scale: revealScale }}>
                <InvitationPanel show={showContent} onShowLocation={carousel ? () => goTo(-1) : undefined} />
              </motion.div>
              {/* luz dorada que "escapa" por la abertura */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: innerGlow,
                  background:
                    'radial-gradient(26% 42% at 50% 45%, rgba(214, 168, 72, 0.16), rgba(196, 154, 69, 0.05) 55%, transparent 80%)'
                }}
              />
              {/* sombra que proyectan las solapas sobre el interior */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: interiorShadow,
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.15) 30%, transparent 50%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.9))'
                }}
              />
            </div>

            {isClosed ? (
              <>
                <Flap side="left" angle={leftAngle} frontShade={frontShade} backShade={backShade} />
                <Flap side="right" angle={rightAngle} frontShade={frontShade} backShade={backShade}>
                  <motion.div
                    className="backface-hidden absolute"
                    style={{ left: 0, top: '75%', x: '-50%', y: '-50%', z: 2, opacity: sealOpacity }}
                  >
                    <Seal onActivate={open} disabled={!isClosed} />
                  </motion.div>
                </Flap>
              </>
            ) : (
              <>
                <SidePanel side="left" quiet={showContent}>
                  <LocationPanel show={showContent} loadMap={!celebrating || (carousel && panel === -1)} />
                </SidePanel>
                <SidePanel side="right" quiet={showContent}>
                  <GalleryPanel show={showContent} />
                </SidePanel>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      <div
        className="relative flex shrink-0 items-start justify-center"
        style={{ height: geo.bar, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <AnimatePresence mode="wait">
          {isClosed ? (
            <motion.div key="hint" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              <SwipeHint opacity={hintOpacity} />
            </motion.div>
          ) : showContent ? (
            <motion.div
              key="nav"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.5, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
              className="flex items-center gap-2 max-[399px]:gap-1.5"
            >
              <SoundToggle />
              {carousel && <PanelNav active={panel} onSelect={goTo} />}
              <CloseButton onClick={close} compact={carousel} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---------- piezas ---------- */

interface FlapProps {
  side: 'left' | 'right';
  angle: MotionValue<number>;
  frontShade: MotionValue<number>;
  backShade: MotionValue<number>;
  children?: ReactNode;
}

/** Solapa del folleto: cara exterior (mitad de la portada) y cara interior, giradas sobre su bisagra. */
function Flap({ side, angle, frontShade, backShade, children }: FlapProps) {
  const isLeft = side === 'left';
  const seamEdge = isLeft ? 'right' : 'left';
  return (
    <motion.div
      className="preserve-3d absolute top-0 h-full w-1/2"
      style={{
        [isLeft ? 'left' : 'right']: 0,
        rotateY: angle,
        transformOrigin: isLeft ? 'left center' : 'right center'
      }}
    >
      <div className="backface-hidden absolute inset-0 overflow-hidden">
        <div className="absolute top-0" style={{ left: isLeft ? 0 : '-100%' }}>
          <CoverArt />
        </div>
        {/* filo de la unión: brillo dorado y una leve sombra que da grosor al papel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0"
          style={{
            [seamEdge]: 0,
            width: 'calc(var(--u) * 4)',
            background: `linear-gradient(to ${seamEdge}, transparent, rgba(0,0,0,0.35))`
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{
            [seamEdge]: 0,
            background: 'linear-gradient(to bottom, transparent, rgba(236,213,144,0.7) 20%, rgba(236,213,144,0.7) 80%, transparent)'
          }}
        />
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: frontShade }} />
      </div>

      <div className="backface-hidden absolute inset-0" style={{ transform: 'rotateY(180deg)' }}>
        <FlapInner side={side} />
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: backShade }} />
      </div>

      {children}
    </motion.div>
  );
}

/**
 * Solapa ya abierta, en plano: ocupa el mismo lugar que la solapa 3D a 180°
 * y se despliega hasta el ancho completo de un panel.
 */
function SidePanel({ side, quiet, children }: { side: 'left' | 'right'; quiet: boolean; children: ReactNode }) {
  const style: CSSProperties = {
    [side === 'left' ? 'right' : 'left']: '100%',
    width: 'calc(var(--card-w) * (0.5 + 0.5 * var(--spread)))'
  };
  return (
    <div className="absolute top-0 h-full overflow-hidden" style={style}>
      <FlapInner side={side} quiet={quiet} />
      {/* el contenido se maqueta al ancho final y queda anclado al pliegue */}
      <div className="absolute top-0 h-full" style={{ width: 'var(--card-w)', [side === 'left' ? 'right' : 'left']: 0 }}>
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClick, compact }: { onClick: () => void; compact: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar invitación"
      title="Cerrar invitación"
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gold-400/30 bg-navy-950/70 font-sans text-[11px] uppercase tracking-[0.25em] text-gold-300/80 backdrop-blur-md transition-colors hover:text-gold-200 ${
        compact ? 'h-[42px] w-[42px] shrink-0 max-[399px]:h-[38px] max-[399px]:w-[38px]' : 'px-5 py-2.5'
      }`}
    >
      <FoldIcon className="h-4 w-4" />
      {!compact && <span>Cerrar invitación</span>}
    </button>
  );
}
