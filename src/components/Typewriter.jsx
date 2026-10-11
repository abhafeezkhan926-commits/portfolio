import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/environment';

/**
 * Cycles through phrases with a type / hold / delete rhythm. The text node is
 * written directly so the animation never triggers a React re-render, and the
 * animated line is hidden from assistive tech in favour of a static summary.
 */
export default function Typewriter({ phrases = [], className = '', typeSpeed = 62, holdTime = 1650 }) {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element || phrases.length === 0) return undefined;

    if (prefersReducedMotion()) {
      element.textContent = phrases[0];
      return undefined;
    }

    let timer = 0;
    let cancelled = false;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const step = () => {
      if (cancelled) return;
      const phrase = phrases[phraseIndex] ?? '';
      charIndex += deleting ? -1 : 1;
      element.textContent = phrase.slice(0, Math.max(0, charIndex));

      let delay = deleting ? 30 : typeSpeed;
      if (!deleting && charIndex >= phrase.length) {
        deleting = true;
        delay = holdTime;
      } else if (deleting && charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 340;
      }

      timer = window.setTimeout(step, delay);
    };

    timer = window.setTimeout(step, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phrases, typeSpeed, holdTime]);

  return (
    <span className={className}>
      <span className="sr-only">{phrases.join(', ')}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        <span ref={textRef} />
        <span className="typewriter-caret" aria-hidden="true" />
      </span>
    </span>
  );
}
