import { useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import ShinyText from '../reactbits/ShinyText';
import BlurText from '../reactbits/BlurText';
import { ArtDecoCorner, GoldRule, Sparkle } from '../ornaments/Ornaments';
import { BottleIcon, BowtieIcon, CalendarIcon, ClockIcon, ParkingIcon, PinIcon } from '../ornaments/Icons';
import { INVITATION, VENUE } from '../../content';
import { EASE_OUT, fs, u } from '../../lib/units';
import { bloom, cascade, rise } from './reveal';
import logo from '../../assets/logo-aduanas.png';

type Icon = ComponentType<{ className?: string; style?: CSSProperties }>;

/** Panel central: la invitación con todos sus datos. */
export default function InvitationPanel({ show, onShowLocation }: { show: boolean; onShowLocation?: () => void }) {
  // el mensaje se escribe palabra por palabra cuando el encabezado ya apareció
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    if (!show) {
      setShowMessage(false);
      return;
    }
    const id = window.setTimeout(() => setShowMessage(true), 900);
    return () => window.clearTimeout(id);
  }, [show]);

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
        style={{ top: u(7), left: u(8), right: u(8), bottom: u(7) }}
      />
      <ArtDecoCorner corner="tl" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="tr" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="bl" style={{ margin: u(1.4) }} />
      <ArtDecoCorner corner="br" style={{ margin: u(1.4) }} />

      <div
        className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain"
        style={{ padding: `${u(12)} ${u(9)} ${u(9)}` }}
      >
        <motion.div
          variants={cascade(0.12, 0.15)}
          initial="hidden"
          animate={show ? 'show' : 'hidden'}
          className="flex min-h-full flex-col items-center justify-evenly text-center"
          style={{ gap: u(4) }}
        >
          <header className="flex flex-col items-center">
            <motion.img
              variants={rise}
              src={logo}
              alt="Aduanas · Agencia Nacional de Aduanas de México"
              draggable={false}
              style={{ width: u(52) }}
            />
            <motion.p
              variants={rise}
              className="font-serif font-semibold text-gold-100"
              style={{ fontSize: fs(5, 15), marginTop: u(6), lineHeight: 1.2 }}
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
            <motion.h1 variants={bloom} className="font-script font-normal leading-none" style={{ marginTop: u(3) }}>
              <ShinyText
                text={INVITATION.title}
                color="#d9b766"
                shineColor="#fff6d6"
                speed={3.4}
                delay={1.6}
                shineWidth={30}
                glow={0.3}
                className="px-[0.18em] pb-[0.14em]"
                style={{ fontSize: u(11.5), whiteSpace: 'nowrap' }}
              />
            </motion.h1>
            <div className="flex w-full items-center font-serif" style={{ gap: u(3), fontSize: u(4.5) }}>
              <motion.span
                className="flex flex-1"
                variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1, transition: { duration: 1.1, ease: EASE_OUT } } }}
                style={{ originX: 1 }}
              >
                <GoldRule side="left" />
              </motion.span>
              <motion.span
                variants={bloom}
                className="gold-text font-semibold leading-none"
                style={{ fontSize: u(12), letterSpacing: '0.02em' }}
              >
                {INVITATION.year}
              </motion.span>
              <motion.span
                className="flex flex-1"
                variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1, transition: { duration: 1.1, ease: EASE_OUT } } }}
                style={{ originX: 0 }}
              >
                <GoldRule side="right" />
              </motion.span>
            </div>
          </header>

          {/* el espacio se reserva desde el inicio para que nada salte al aparecer el texto */}
          <div className="relative w-full" style={{ fontSize: fs(4, 13.5) }}>
            <p className="invisible font-serif italic leading-snug" aria-hidden="true">
              {INVITATION.message}
            </p>
            {showMessage && (
              <BlurText
                text={INVITATION.message}
                trigger="load"
                animateBy="words"
                direction="bottom"
                delay={45}
                distance={12}
                blur={8}
                className="absolute inset-0 justify-center font-serif italic leading-snug text-gold-100/90"
              />
            )}
          </div>

          <motion.div variants={rise} className="flex items-center text-gold-400" style={{ gap: u(2.5) }}>
            <span className="h-px bg-gradient-to-r from-transparent to-gold-400/70" style={{ width: u(14) }} />
            <Sparkle size={u(3)} />
            <span className="h-px bg-gradient-to-l from-transparent to-gold-400/70" style={{ width: u(14) }} />
          </motion.div>

          <motion.dl
            variants={cascade(0.1, 0)}
            className="grid w-full grid-cols-2"
            style={{ columnGap: u(5), rowGap: u(6) }}
          >
            <Info icon={CalendarIcon} label="Fecha">
              Viernes 27 de noviembre
              <br />
              de 2026
            </Info>
            <Info icon={ClockIcon} label="Horario">
              De 22:00 a 03:00 hrs
              <Detail>Acceso: de 21:30 a 22:00 hrs</Detail>
              <Detail>Desalojo: de 03:00 a 03:30 hrs</Detail>
            </Info>
            <Info icon={PinIcon} label="Lugar">
              {VENUE.name}
              <br />
              {VENUE.room}, {VENUE.floor}
              {onShowLocation && (
                <button
                  type="button"
                  onClick={onShowLocation}
                  className="mx-auto mt-[0.5em] block cursor-pointer border-b border-gold-400/50 font-medium uppercase text-gold-300"
                  style={{ fontSize: '0.78em', letterSpacing: '0.18em' }}
                >
                  Ver mapa
                </button>
              )}
            </Info>
            <Info icon={BowtieIcon} label="Vestimenta">
              Formal (sugerido)
            </Info>
            <Info icon={BottleIcon} label="Descorche libre">
              Le invitamos a traer la bebida de su preferencia.
              <Detail>El salón proporcionará mezcladores.</Detail>
            </Info>
            <Info icon={ParkingIcon} label="Estacionamiento">
              Servicio de valet parking
              <span className="mt-[0.2em] block font-serif font-semibold text-gold-200" style={{ fontSize: '1.3em' }}>
                $150.00
              </span>
            </Info>
          </motion.dl>
        </motion.div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, children }: { icon: Icon; label: string; children: ReactNode }) {
  return (
    <motion.div variants={rise} className="flex flex-col items-center">
      <Icon className="text-gold-300" style={{ width: u(8), height: u(8) }} />
      <dt
        className="font-sans font-semibold uppercase text-gold-300"
        style={{ fontSize: fs(2.5, 9.5), letterSpacing: '0.2em', paddingLeft: '0.2em', marginTop: u(1.8) }}
      >
        {label}
      </dt>
      <dd className="font-sans font-light leading-snug text-gold-100" style={{ fontSize: fs(3.2, 11.5), marginTop: u(1) }}>
        {children}
      </dd>
    </motion.div>
  );
}

const Detail = ({ children }: { children: ReactNode }) => (
  <span className="mt-[0.2em] block text-gold-200/70" style={{ fontSize: '0.92em' }}>
    {children}
  </span>
);
