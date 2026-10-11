import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../lib/environment';

/** React binding for the reduced-motion media query. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;

    const listener = (event) => setReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return reduced;
}
