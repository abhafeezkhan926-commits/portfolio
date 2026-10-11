/** Scroll helpers shared by the header, hero and footer navigation. */

import { prefersReducedMotion } from './environment';

/**
 * Smooth-scrolls to a home-page section. Sections carry `scroll-margin-top`
 * in CSS, so the sticky header never covers the heading.
 */
export function scrollToSection(id, { updateHash = true } = {}) {
  if (typeof document === 'undefined') return;

  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior });
    if (updateHash) window.history.replaceState(null, '', window.location.pathname);
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior, block: 'start' });
  if (updateHash) window.history.replaceState(null, '', `#${id}`);
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** True when the path is the home page, where in-page sections live. */
export function isHomePath(pathname) {
  return pathname === '/' || pathname === '';
}
