import { useSyncExternalStore } from 'react';
import { sound } from './soundEngine';

/** Estado del sonido para la interfaz: silenciado y si la música está sonando. */
export function useSound() {
  const muted = useSyncExternalStore(
    listener => sound.subscribe(listener),
    () => sound.isMuted
  );
  const playing = useSyncExternalStore(
    listener => sound.subscribe(listener),
    () => sound.isPlaying
  );
  return { muted, playing, setMuted: (value: boolean) => sound.setMuted(value) };
}
