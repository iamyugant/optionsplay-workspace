import { useEffect, useRef, useState } from 'react';

/** Closes an overlay on outside pointer-down or Escape. */
export function useDismiss<T extends HTMLElement>(open: boolean, onDismiss: () => void) {
  const ref = useRef<T>(null);
  const handler = useRef(onDismiss);
  handler.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return ref;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return matches;
}
