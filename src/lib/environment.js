/**
 * Environment helpers: reduced-motion preference, device quality tier and a
 * small value-noise generator used by the canvas artwork.
 */

const reducedMotionQuery =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

export function prefersReducedMotion() {
  return Boolean(reducedMotionQuery?.matches);
}

/** Subscribe to preference changes. Returns an unsubscribe function. */
export function onReducedMotionChange(handler) {
  if (!reducedMotionQuery) return () => {};
  const listener = (event) => handler(event.matches);
  reducedMotionQuery.addEventListener('change', listener);
  return () => reducedMotionQuery.removeEventListener('change', listener);
}

/**
 * Coarse device tiering so phones and low-core machines render a lighter
 * scene. Never returns quality values above 'high'.
 */
export function getQualityTier() {
  if (typeof window === 'undefined') return 'high';
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const deviceMemory = navigator.deviceMemory ?? 8;

  if (width < 768 || coarsePointer || cores <= 4 || deviceMemory <= 4) return 'low';
  if (width < 1280 || cores <= 6) return 'medium';
  return 'high';
}

export function onQualityResize(handler, delay = 250) {
  let timer = 0;
  const listener = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(handler, delay);
  };
  window.addEventListener('resize', listener);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('resize', listener);
  };
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

/** Deterministic pseudo-random generator — keeps the scene stable per seed. */
export function createRandom(seed = 1) {
  let state = seed >>> 0 || 1;
  return function random() {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/**
 * Cheap smooth value noise — enough to make plasma brightness flow
 * organically without shipping a noise library.
 */
export function createNoise2D(seed = 7) {
  const random = createRandom(seed);
  const size = 256;
  const table = new Float32Array(size * size);

  for (let i = 0; i < table.length; i += 1) table[i] = random();

  const at = (x, y) => table[((y & 255) * size + (x & 255)) | 0];

  const smooth = (t) => t * t * (3 - 2 * t);

  return function noise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);

    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);

    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  };
}

/** Fractal brownian motion over the value noise, normalised to 0..1 */
export function fbm(noise, x, y, octaves = 3, lacunarity = 2.1, gain = 0.55) {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let i = 0; i < octaves; i += 1) {
    sum += amplitude * noise(x * frequency, y * frequency);
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / (norm || 1);
}
