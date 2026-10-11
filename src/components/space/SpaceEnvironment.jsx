import { useEffect, useState } from 'react';
import BlackHole from './BlackHole';
import CursorGlow from './CursorGlow';
import NeuralBorder from './NeuralBorder';
import RocketCursor from './RocketCursor';
import StarField from './StarField';

/**
 * Assembles the deep-space environment. The CSS nebula layer always paints, so
 * the scene still reads as space before (or instead of) the canvases mounting.
 * Canvas layers are deferred past first paint to keep the initial render fast.
 */
export default function SpaceEnvironment() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const mount = () => {
      if (!cancelled) setEnhanced(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(mount, { timeout: 900 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(handle);
      };
    }

    timer = window.setTimeout(mount, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div className="space-layer space-nebula" aria-hidden="true" />
      <div className="space-scrim" aria-hidden="true" />
      {enhanced && (
        <>
          <StarField />
          <BlackHole />
          <CursorGlow />
          <RocketCursor />
        </>
      )}
      <NeuralBorder />
    </>
  );
}
