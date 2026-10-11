import { useEffect, useRef } from 'react';

import { addTick } from '../../lib/ticker';
import { prefersReducedMotion } from '../../lib/environment';

/** Nose of the rocket inside the 34×64 svg — the exact click hotspot. */
const NOSE_X = 17;
const NOSE_Y = 2;

/**
 * The pointer becomes a small rocket: it trails the cursor with a light
 * ease, tilts toward the direction of travel and its engine flame grows
 * with speed. Only active on fine-pointer devices without reduced motion —
 * elsewhere the native cursor stays untouched.
 */
export default function RocketCursor() {
  const rocketRef = useRef(null);
  const flameRef = useRef(null);

  useEffect(() => {
    const rocket = rocketRef.current;
    const flame = flameRef.current;
    if (!rocket || !flame) return undefined;

    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
    if (!finePointer || prefersReducedMotion()) return undefined;

    const root = document.documentElement;

    const state = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      tx: 0,
      ty: 0,
      px: 0,
      py: 0,
      angle: -90, // nose up
      shown: false,
    };

    const handlePointerMove = (event) => {
      state.tx = event.clientX;
      state.ty = event.clientY;
      if (!state.shown) {
        state.shown = true;
        state.x = state.tx;
        state.y = state.ty;
        state.px = state.tx;
        state.py = state.ty;
        // Native cursor is hidden only while the rocket is on screen. The
        // class lives on <html> and must never share the rocket element's
        // class name — `.rocket-cursor` styles would otherwise apply to the
        // whole document.
        root.classList.add('has-rocket-cursor');
        rocket.classList.add('is-visible');
      }
    };

    const handlePointerGone = () => {
      state.shown = false;
      root.classList.remove('has-rocket-cursor');
      rocket.classList.remove('is-visible');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerGone);
    window.addEventListener('blur', handlePointerGone);

    const stopTick = addTick((time) => {
      if (!state.shown) return;

      const vx = state.tx - state.px;
      const vy = state.ty - state.py;
      state.px = state.tx;
      state.py = state.ty;
      const speed = Math.hypot(vx, vy);

      state.x += (state.tx - state.x) * 0.55;
      state.y += (state.ty - state.y) * 0.55;

      if (speed > 0.6) {
        const target = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
        let diff = target - state.angle;
        diff = ((((diff + 180) % 360) + 360) % 360) - 180;
        state.angle += diff * 0.18;
      }

      const thrust = Math.min(1, speed / 14);
      const flicker = 0.82 + 0.18 * Math.sin(time * 38) * Math.sin(time * 13.7);
      flame.style.transform = `scaleY(${((0.45 + thrust * 1.05) * flicker).toFixed(3)})`;
      flame.style.opacity = (0.55 + thrust * 0.45).toFixed(2);

      rocket.style.transform = `translate3d(${(state.x - NOSE_X).toFixed(1)}px, ${(
        state.y - NOSE_Y
      ).toFixed(1)}px, 0) rotate(${state.angle.toFixed(1)}deg)`;
    });

    return () => {
      stopTick();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerGone);
      window.removeEventListener('blur', handlePointerGone);
      root.classList.remove('has-rocket-cursor');
    };
  }, []);

  return (
    <div ref={rocketRef} className="rocket-cursor" aria-hidden="true">
      <svg viewBox="0 0 34 64" width="34" height="64" fill="none">
        <defs>
          <linearGradient id="rocket-body" x1="17" y1="2" x2="17" y2="49" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f5f8ff" />
            <stop offset="0.55" stopColor="#c9d4ea" />
            <stop offset="1" stopColor="#8fa0c0" />
          </linearGradient>
          <linearGradient id="rocket-flame" x1="17" y1="48" x2="17" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffe9b0" />
            <stop offset="0.45" stopColor="#ffb054" />
            <stop offset="1" stopColor="#ff5f2e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M17 2C23 9 27 19 27 30 27 39 24 45 20 49H14C10 45 7 39 7 30 7 19 11 9 17 2Z" fill="url(#rocket-body)" />
        <path d="M7.6 33 2.5 50l8-5.5Z" fill="#4da6ff" />
        <path d="M26.4 33 31.5 50l-8-5.5Z" fill="#4da6ff" />
        <rect x="9.2" y="32.4" width="15.6" height="3" rx="1.5" fill="#22d3ee" opacity="0.9" />
        <circle cx="17" cy="21" r="4.6" fill="#0b1226" stroke="#8cc8ff" strokeWidth="1.6" />
        <circle cx="15.5" cy="19.5" r="1.4" fill="#8cc8ff" opacity="0.85" />
        <g ref={flameRef} className="rocket-flame">
          <path
            d="M17 48C14.5 52 12.9 56 12.9 59.5 12.9 62.4 14.7 64 17 64 19.3 64 21.1 62.4 21.1 59.5 21.1 56 19.5 52 17 48Z"
            fill="url(#rocket-flame)"
          />
        </g>
      </svg>
    </div>
  );
}
