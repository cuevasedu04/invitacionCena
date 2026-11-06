/// <reference lib="webworker" />
import { createConfettiEngine, type BurstParams } from './confettiEngine';

/**
 * Hilo aparte para la celebración: la simulación y el dibujo ocurren aquí, así el hilo
 * principal queda libre para el folleto y la página no se traba mientras cae el confeti.
 */
type Message =
  | { type: 'init'; canvas: OffscreenCanvas }
  | { type: 'burst'; params: BurstParams }
  | { type: 'resize'; w: number; h: number; dpr: number };

let engine: ReturnType<typeof createConfettiEngine> | null = null;

self.onmessage = (event: MessageEvent<Message>) => {
  const msg = event.data;
  if (msg.type === 'init') engine = createConfettiEngine(msg.canvas, active => self.postMessage({ active }));
  else if (msg.type === 'burst') engine?.burst(msg.params);
  else if (msg.type === 'resize') engine?.resize(msg.w, msg.h, msg.dpr);
};
