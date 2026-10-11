import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view. Uses one rAF-throttled scroll
 * listener instead of an IntersectionObserver per section so the header does
 * no layout reads on every scroll event.
 */
export default function useScrollSpy(ids, offset = 132) {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    if (!ids.length) return undefined;

    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const scrollY = window.scrollY || 0;
      const probe = scrollY + offset;
      let current = ids[0];

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top + scrollY;
        if (top <= probe) current = id;
      }

      const atBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 8;
      if (atBottom) current = ids[ids.length - 1];

      setActive((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);

  return active;
}
