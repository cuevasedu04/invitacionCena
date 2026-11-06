import { motion } from 'motion/react';
import ShinyText from '../reactbits/ShinyText';
import { Sparkle } from '../ornaments/Ornaments';
import { fs, u } from '../../lib/units';
import { bloom, rise } from './reveal';

/** Encabezado común de las solapas: antetítulo, destello, título caligráfico y subtítulo. */
export default function PanelHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <motion.p
        variants={rise}
        className="font-sans font-medium uppercase text-gold-300/85"
        style={{ fontSize: fs(2.6, 10), letterSpacing: '0.45em', paddingLeft: '0.45em' }}
      >
        {eyebrow}
      </motion.p>
      <motion.span variants={rise} className="text-gold-400" style={{ marginTop: u(2.2) }}>
        <Sparkle size={u(2.8)} />
      </motion.span>
      <motion.h2 variants={bloom} className="font-script font-normal leading-none" style={{ marginTop: u(2.5) }}>
        <ShinyText
          text={title}
          color="#d9b766"
          shineColor="#fff6d6"
          speed={3.4}
          delay={2.2}
          shineWidth={30}
          glow={0.3}
          className="px-[0.18em] pb-[0.14em]"
          style={{ fontSize: u(13), whiteSpace: 'nowrap' }}
        />
      </motion.h2>
      <motion.p variants={rise} className="font-serif italic text-gold-200/80" style={{ fontSize: fs(4.4, 14) }}>
        {subtitle}
      </motion.p>
    </header>
  );
}
