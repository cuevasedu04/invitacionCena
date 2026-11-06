import type { CSSProperties, ReactNode, SVGProps } from 'react';

type IconProps = { className?: string; style?: CSSProperties };

/** Íconos de línea fina en dorado, en el estilo de la invitación impresa. */
function Line({ children, className = '', style, ...rest }: IconProps & SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="6" y="10" width="36" height="32" rx="5" />
    <path d="M6 19h36M15 5v9M33 5v9" />
    {[14, 21, 28, 35].flatMap(x => [26, 33].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" stroke="none" />))}
  </Line>
);

export const ClockIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="24" cy="24" r="18" />
    <path d="M24 13v11l7 7" />
  </Line>
);

export const PinIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M24 43s-13-12.6-13-23a13 13 0 0 1 26 0c0 10.4-13 23-13 23z" />
    <circle cx="24" cy="20" r="5" />
  </Line>
);

export const BowtieIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M20 20 6 12v24l14-8M28 20l14-8v24l-14-8" />
    <rect x="20" y="18.5" width="8" height="11" rx="2.5" />
  </Line>
);

export const BottleIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M14 5h6v8c0 3 4 5 4 10v18a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V23c0-5 4-7 4-10z" />
    <path d="M10 27h14" />
    <path d="M31 22h10l-1.5 8a3.6 3.6 0 0 1-7 0zM36 33v8M32 43h8" />
  </Line>
);

export const ParkingIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="24" cy="24" r="18" />
    <path d="M19 34V15h6.5a5.5 5.5 0 0 1 0 11H19" />
  </Line>
);

export const PhotosIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="11" y="13" width="30" height="24" rx="3" />
    <path d="M7 31V11a3 3 0 0 1 3-3h24" />
    <path d="m15 33 7-8 5 5 4-4 6 7" />
    <circle cx="32" cy="20" r="2.4" />
  </Line>
);

export const RouteIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M24 5 43 24 24 43 5 24z" />
    <path d="M19 28v-4a3 3 0 0 1 3-3h8M26 16l5 5-5 5" />
  </Line>
);

export const ExternalIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M27 9h12v12M39 9 22 26M34 29v8a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3h8" />
  </Line>
);

export const FoldIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M9 10h30v28H9zM24 10v28" />
    <path d="M11 24h7M37 24h-7M15 21l3 3-3 3M33 21l-3 3 3 3" />
  </Line>
);
