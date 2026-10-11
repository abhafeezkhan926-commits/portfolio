import { useEffect, useRef } from 'react';
import { addTick } from '../../lib/ticker';
import {
  createRandom,
  getQualityTier,
  onQualityResize,
  prefersReducedMotion,
} from '../../lib/environment';

const STAR_COUNTS = { low: 130, medium: 240, high: 380 };

/** Pre-rendered glow sprites — far cheaper than building gradients per frame. */
function createGlowSprite(color) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, color.replace('ALPHA', '0.95'));
  gradient.addColorStop(0.25, color.replace('ALPHA', '0.35'));
  gradient.addColorStop(0.6, color.replace('ALPHA', '0.08'));
  gradient.addColorStop(1, color.replace('ALPHA', '0'));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

const SPRITE_COLORS = {
  cool: 'rgba(206,226,255,ALPHA)',
  white: 'rgba(255,255,255,ALPHA)',
  warm: 'rgba(255,231,196,ALPHA)',
  blue: 'rgba(150,196,255,ALPHA)',
};

/**
 * Layered parallax star field. Three depth bands twinkle at different rates,
 * react subtly to the pointer and drift slowly with scroll.
 */
export default function StarField() {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    let tier = getQualityTier();
    let width = 0;
    let height = 0;
    let stars = [];
    let sprites = {};

    const random = createRandom(20261009);

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = STAR_COUNTS[tier] ?? STAR_COUNTS.medium;
      stars = Array.from({ length: count }, () => {
        const depth = random();
        const isBright = depth > 0.86;
        return {
          x: random() * width,
          y: random() * height,
          radius: isBright ? 0.9 + random() * 1.5 : 0.4 + random() * 0.7,
          base: isBright ? 0.55 + random() * 0.45 : 0.18 + random() * 0.5,
          phase: random() * Math.PI * 2,
          twinkle: 0.35 + random() * 1.2,
          parallax: 1.6 + depth * 9,
          scrollFactor: depth * 0.05,
          sprite: Object.keys(SPRITE_COLORS)[Math.floor(random() * 4)],
          bright: isBright,
        };
      });
    }

    function drawStarField(time) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      const px = pointer.current.x;
      const py = pointer.current.y;
      const scrollOffset = scroll.current;

      for (const star of stars) {
        const twinkle = reduced
          ? 1
          : 0.62 + 0.38 * Math.sin(time * star.twinkle + star.phase);
        const alpha = Math.min(1, star.base * twinkle);

        const x = star.x + px * star.parallax;
        const y = star.y + py * star.parallax - scrollOffset * star.scrollFactor;
        const wrappedY = ((y % height) + height) % height;

        if (star.bright) {
          const sprite = sprites[star.sprite];
          if (sprite) {
            const size = star.radius * 12;
            ctx.globalAlpha = alpha;
            ctx.drawImage(sprite, x - size / 2, wrappedY - size / 2, size, size);
          }
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, wrappedY, star.radius, star.radius);
      }

      ctx.globalAlpha = 1;
    }

    function resize() {
      const nextTier = getQualityTier();
      if (nextTier !== tier) tier = nextTier;
      build();
      if (reduced) drawStarField(0);
    }

    sprites = Object.fromEntries(
      Object.entries(SPRITE_COLORS).map(([key, value]) => [key, createGlowSprite(value)]),
    );

    build();

    const handlePointerMove = (event) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * -14;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * -10;
    };

    const handleScroll = () => {
      scroll.current = window.scrollY || 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    const stopResize = onQualityResize(resize);

    if (reduced) {
      drawStarField(0);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('scroll', handleScroll);
        stopResize();
      };
    }

    const stopTick = addTick((time) => {
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.045;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.045;
      drawStarField(time);
    });

    return () => {
      stopTick();
      stopResize();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="space-layer fixed inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
