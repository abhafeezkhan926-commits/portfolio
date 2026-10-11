import { useEffect, useRef } from 'react';
import { addTick } from '../../lib/ticker';
import { getQualityTier, prefersReducedMotion } from '../../lib/environment';

/**
 * A soft light that trails the pointer with a lazy ease. Purely decorative:
 * disabled for touch devices, reduced-motion users and low-tier hardware.
 */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const element = glowRef.current;
    if (!element) return undefined;

    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
    if (!finePointer || prefersReducedMotion() || getQualityTier() === 'low') return undefined;

    const state = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4, tx: 0, ty: 0, active: 0 };

    const handlePointerMove = (event) => {
      state.tx = event.clientX;
      state.ty = event.clientY;
      state.active = 1;
    };
    const handlePointerLeave = () => {
      state.active = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);

    const stopTick = addTick(() => {
      state.x += (state.tx - state.x) * 0.075;
      state.y += (state.ty - state.y) * 0.075;
      element.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      element.style.opacity = (state.active * 0.9).toFixed(2);
    });

    return () => {
      stopTick();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div className="space-layer pointer-events-none fixed inset-0" aria-hidden="true">
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
