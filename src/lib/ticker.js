/**
 * One requestAnimationFrame loop shared by every canvas/SVG animation on the
 * page. A single loop keeps the frame budget predictable and stops entirely
 * when the document is hidden or when nothing is subscribed.
 */

const subscribers = new Set();
let frameId = 0;
let running = false;
let lastTime = 0;

function frame(time) {
  if (!running) return;
  const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
  lastTime = time;

  for (const callback of subscribers) {
    try {
      callback(time / 1000, delta);
    } catch (error) {
      // A broken animation must never take down the rest of the scene.
      console.error('[ticker] subscriber failed', error);
      subscribers.delete(callback);
    }
  }

  frameId = requestAnimationFrame(frame);
}

function start() {
  if (running || subscribers.size === 0) return;
  running = true;
  lastTime = 0;
  frameId = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
}

function handleVisibility() {
  if (document.hidden) {
    stop();
    return;
  }
  lastTime = 0;
  start();
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibility);
}

/**
 * Register a per-frame callback.
 * @param {(time:number, delta:number) => void} callback
 * @returns {() => void} unsubscribe
 */
export function addTick(callback) {
  subscribers.add(callback);
  start();

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) stop();
  };
}

export function subscriberCount() {
  return subscribers.size;
}
