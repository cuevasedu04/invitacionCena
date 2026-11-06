/** Medidas proporcionales al ancho del folleto (1u = 1 % del ancho de un panel). */
export const u = (n: number) => `calc(var(--u) * ${n})`;

/** Tamaño de letra proporcional con un mínimo legible en pantallas pequeñas. */
export const fs = (n: number, minPx: number) => `max(${minPx}px, calc(var(--u) * ${n}))`;

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];
