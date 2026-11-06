import { type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import ShinyText from '../reactbits/ShinyText';
import GradientText from '../reactbits/GradientText';
import { ArtDecoCorner, GoldRule } from '../ornaments/Ornaments';
import { BottleIcon, BowtieIcon, CalendarIcon, ParkingIcon, PinIcon } from '../ornaments/Icons';
import Bounce from '../ornaments/Bounce';
import { INVITATION, VENUE } from '../../content';
import { EASE_OUT, fs, u } from '../../lib/units';
import { bloom, cascade, rise } from './reveal';
import AduanasLogo from './AduanasLogo';

type Icon = ComponentType<{ className?: string; style?: CSSProperties }>;

/** Los íconos rebotan en ola, uno tras otro, en este orden. */
const BOUNCE_START = 2.4;
const BOUNCE_STEP = 0.32;
const bounceDelay = (order: number) => BOUNCE_START + order * BOUNCE_STEP;

const growRule = {
  hidden: { transform: 'scaleX(0)', opacity: 0 },
  show: { transform: 'scaleX(1)', opacity: 1, transition: { duration: 1.1, ease: EASE_OUT } }
};

/** Panel central: la invitación con todos sus datos. */
export default function InvitationPanel({ show, onShowLocation }: { show: boolean; onShowLocation?: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-navy-900">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(110% 60% at 50% 28%, #142e63 0%, #071838 55%, #000a18 100%)' }}
      />
      <div className="paper-grain absolute inset-0" />
      <div className="absolute border border-gold-500/60" style={{ inset: u(3) }} />
      <div className="absolute border border-gold-500/20" style={{ inset: u(4.4) }} />
      {/* arco del marco, como en la invitación impresa */}
      <div
        aria-hidden="true"
        className="absolute rounded-t-full border border-b-0 border-gold-400/30"
        style={{ top: u(6.5), left: u(7), right: u(7), bottom: u(6.5) }}
      />
      <ArtDecoCorner corner="tl" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="tr" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="bl" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="br" style={{ margin: u(1.4) }} />

      <div
        className="no-scrollbar absolute overflow-y-auto overscroll-contain"
        style={{
          inset: u(4.4),
          padding: `${u(5)} ${u(4.6)} ${u(3.5)}`,
        }}
      >
        <motion.div
          variants={cascade(0.12, 0.15)}
          initial="hidden"
          animate={show ? 'show' : 'hidden'}
          className="flex min-h-full flex-col items-center justify-evenly text-center"
          style={{ gap: u(3) }}
        >
          <header className="flex flex-col items-center">
            <AduanasLogo variants={rise} show={show} />
            <motion.p
              variants={rise}
              className="font-serif font-semibold text-gold-100"
              style={{ fontSize: fs(5, 15), marginTop: u(3.4), lineHeight: 1.2 }}
            >
              {INVITATION.host}
            </motion.p>
            <motion.p
              variants={rise}
              className="font-serif italic text-gold-200/80"
              style={{ fontSize: fs(4.2, 13), marginTop: u(0.8) }}
            >
              {INVITATION.lead}
            </motion.p>
            <motion.h1 variants={bloom} className="font-script font-normal leading-none" style={{ marginTop: u(2.2) }}>
              <ShinyText
                text={INVITATION.title}
                color="#d9b766"
                shineColor="#fff6d6"
                speed={3.4}
                delay={5.5}
                shineWidth={30}
                glow={0.3}
                disabled={!show}
                className="px-[0.18em] pb-[0.14em]"
                style={{ fontSize: u(11.5), whiteSpace: 'nowrap' }}
              />
            </motion.h1>
            <div className="flex w-full items-center font-serif" style={{ gap: u(3), fontSize: u(4.5) }}>
              <motion.span className="flex flex-1" variants={growRule} style={{ transformOrigin: 'right center' }}>
                <GoldRule side="left" />
              </motion.span>
              <motion.span
                variants={bloom}
                className="gold-text font-semibold leading-none"
                style={{ fontSize: u(12), letterSpacing: '0.02em' }}
              >
                {INVITATION.year}
              </motion.span>
              <motion.span className="flex flex-1" variants={growRule} style={{ transformOrigin: 'left center' }}>
                <GoldRule side="right" />
              </motion.span>
            </div>
          </header>

          <Message show={show} />

          <motion.section variants={cascade(0.1, 0)} aria-label="Fecha y horario" className="w-full">
            <motion.div variants={rise} className="flex items-center text-gold-400" style={{ gap: u(2.5) }}>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/60" />
              <Bounce active={show} delay={bounceDelay(0)}>
                <CalendarIcon className="text-gold-300" style={{ width: u(5.8), height: u(5.8) }} />
              </Bounce>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/60" />
            </motion.div>
            <motion.p
              variants={rise}
              className="font-serif font-semibold leading-tight text-gold-100"
              style={{ fontSize: fs(5, 16.5), marginTop: u(1.2) }}
            >
              Viernes 27 de noviembre de 2026
            </motion.p>
            <Schedule />
          </motion.section>

          <motion.dl variants={cascade(0.1, 0)} className="grid w-full grid-cols-2" style={{ columnGap: u(4), rowGap: u(4) }}>
            <Info icon={PinIcon} label="Lugar" show={show} order={1}>
              {VENUE.name}
              <br />
              {VENUE.room}, {VENUE.floor}
              {onShowLocation && (
                <button
                  type="button"
                  onClick={onShowLocation}
                  className="mx-auto mt-[0.6em] block cursor-pointer border-b border-gold-400/50 font-medium uppercase text-gold-300"
                  style={{ fontSize: '0.78em', letterSpacing: '0.18em' }}
                >
                  Ver mapa
                </button>
              )}
            </Info>
            <Info icon={ParkingIcon} label="Estacionamiento" show={show} order={2}>
              Servicio de valet parking
              <span className="mt-[0.15em] block font-serif font-semibold text-gold-200" style={{ fontSize: '1.3em' }}>
                $150.00
              </span>
            </Info>
            <Info icon={BottleIcon} label="Descorche libre" show={show} order={3} wide>
              Le invitamos a traer la bebida de su preferencia.{' '}
              <span className="text-gold-200/70">El salón proporcionará mezcladores.</span>
            </Info>
          </motion.dl>

          <DressCode show={show} />
        </motion.div>
      </div>
      {/* desvanecido en los bordes del área desplazable (sin mask-image: no obliga a repintar) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ top: u(4.4), left: u(4.4), right: u(4.4), height: u(3), background: 'linear-gradient(#0a1c3f, rgba(10,28,63,0))' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ bottom: u(4.4), left: u(4.4), right: u(4.4), height: u(4), background: 'linear-gradient(rgba(1,10,26,0), #010a1a)' }}
      />
    </div>
  );
}

/**
 * Mensaje central con más protagonismo: oro en movimiento (React Bits · GradientText)
 * que se revela de izquierda a derecha, enmarcado por comillas caligráficas.
 */
function Message({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={rise} className="relative w-full" style={{ paddingInline: u(1.5) }}>
      <span
        aria-hidden="true"
        className="gold-text pointer-events-none absolute font-serif leading-none opacity-60"
        style={{ fontSize: u(13), left: u(-2.5), top: u(-3.2) }}
      >
        “
      </span>
      {/* revelado de izquierda a derecha con clip-path: lo acelera el compositor */}
      <motion.p
        className="font-serif font-medium italic"
        style={{ fontSize: fs(4.2, 14.5), lineHeight: 1.42, textWrap: 'balance' }}
        initial={false}
        animate={{ clipPath: show ? 'inset(-20% 0% -20% 0%)' : 'inset(-20% 100% -20% 0%)' }}
        transition={show ? { duration: reduce ? 0.2 : 2, delay: reduce ? 0 : 0.9, ease: [0.45, 0, 0.25, 1] } : { duration: 0.2 }}
      >
        {/* el oro animado sólo corre con el folleto abierto (antes estaba oculto, pero animándose) */}
        {show ? (
          <GradientText
            colors={['#c49a45', '#ecd590', '#fff6d6', '#f5e6a8', '#d9b766']}
            animationSpeed={7}
            angle={105}
            scale={2.4}
            glow={0.35}
          >
            {INVITATION.message}
          </GradientText>
        ) : (
          <span className="gold-text">{INVITATION.message}</span>
        )}
      </motion.p>
      <span
        aria-hidden="true"
        className="gold-text pointer-events-none absolute font-serif leading-none opacity-60"
        style={{ fontSize: u(13), right: u(-2.5), bottom: u(-8.5) }}
      >
        ”
      </span>
    </motion.div>
  );
}

const SCHEDULE = [
  { label: 'Acceso', time: '21:30 – 22:00' },
  { label: 'Horario', time: '22:00 – 03:00', main: true },
  { label: 'Desalojo', time: '03:00 – 03:30' }
];

/** Horario como línea de tiempo: acceso → evento → desalojo. */
function Schedule() {
  return (
    <motion.div variants={rise} className="relative grid w-full grid-cols-3" style={{ marginTop: u(3) }}>
      <motion.span
        aria-hidden="true"
        className="absolute h-px bg-gradient-to-r from-gold-500/30 via-gold-300/80 to-gold-500/30"
        style={{ top: u(0.8), left: '16.66%', right: '16.66%', transformOrigin: 'left center' }}
        variants={{ hidden: { transform: 'scaleX(0)' }, show: { transform: 'scaleX(1)', transition: { duration: 1.4, ease: EASE_OUT, delay: 0.2 } } }}
      />
      {SCHEDULE.map(item => (
        <div key={item.label} className="relative flex flex-col items-center">
          <span
            className="relative rounded-full border border-gold-300 bg-navy-900"
            style={{
              width: u(1.8),
              height: u(1.8),
              background: item.main ? '#ecd590' : undefined,
              boxShadow: item.main ? '0 0 0 2px rgba(217,183,102,0.15)' : undefined
            }}
          >
            {/* halo que late: opacidad y escala en el compositor */}
            {item.main && (
              <span
                aria-hidden="true"
                className="inv-pulse absolute rounded-full"
                style={{ inset: `-${u(1.6)}`, background: 'radial-gradient(closest-side, rgba(236,213,144,0.85), rgba(236,213,144,0))' }}
              />
            )}
          </span>
          <span
            className="font-sans font-semibold uppercase text-gold-300"
            style={{ fontSize: fs(2.3, 9), letterSpacing: '0.2em', paddingLeft: '0.2em', marginTop: u(1.4) }}
          >
            {item.label}
          </span>
          <span
            className={`whitespace-nowrap font-serif tabular-nums ${item.main ? 'font-semibold text-gold-100' : 'text-gold-200/80'}`}
            style={{ fontSize: item.main ? fs(4.2, 14) : fs(3.7, 12.5), marginTop: u(0.4) }}
          >
            {item.time}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

interface InfoProps {
  icon: Icon;
  label: string;
  show: boolean;
  order: number;
  wide?: boolean;
  children: ReactNode;
}

function Info({ icon: Icon, label, show, order, wide = false, children }: InfoProps) {
  return (
    <motion.div variants={rise} className={`flex flex-col items-center ${wide ? 'col-span-2' : ''}`}>
      <Bounce active={show} delay={bounceDelay(order)}>
        <Icon className="text-gold-300" style={{ width: u(6), height: u(6) }} />
      </Bounce>
      <dt
        className="font-sans font-semibold uppercase text-gold-300"
        style={{ fontSize: fs(2.5, 9.5), letterSpacing: '0.2em', paddingLeft: '0.2em', marginTop: u(1.1) }}
      >
        {label}
      </dt>
      <dd
        className="font-sans leading-snug text-gold-100/95"
        style={{ fontSize: fs(3.1, 11.5), marginTop: u(0.8), maxWidth: wide ? u(84) : undefined, textWrap: 'balance' }}
      >
        {children}
      </dd>
    </motion.div>
  );
}

/** Código de vestimenta como sello al pie de la invitación. */
function DressCode({ show }: { show: boolean }) {
  return (
    <motion.div
      variants={rise}
      className="flex items-center whitespace-nowrap rounded-full border border-gold-400/45 bg-navy-950/40"
      style={{ gap: u(2.2), padding: `${u(1.6)} ${u(4)}`, boxShadow: 'inset 0 0 0 1px rgba(236,213,144,0.06)' }}
    >
      <Bounce active={show} delay={bounceDelay(4)}>
        <BowtieIcon className="text-gold-300" style={{ width: u(5.6), height: u(5.6) }} />
      </Bounce>
      <span
        className="font-sans font-semibold uppercase text-gold-300"
        style={{ fontSize: fs(2.4, 9), letterSpacing: '0.2em' }}
      >
        Vestimenta
      </span>
      <span className="h-[1.1em] w-px bg-gold-400/40" style={{ fontSize: fs(3.6, 13) }} />
      <span className="font-serif text-gold-100" style={{ fontSize: fs(3.9, 14) }}>
        Formal <span className="italic text-gold-200/70">(sugerido)</span>
      </span>
    </motion.div>
  );
}
