import { useEffect, useRef } from 'react';
import { addTick } from '../../lib/ticker';
import {
  createNoise2D,
  createRandom,
  fbm,
  getQualityTier,
  onQualityResize,
  prefersReducedMotion,
} from '../../lib/environment';

const TEXTURE_SIZES = { low: 384, medium: 512, high: 768 };
const PARTICLE_COUNTS = { low: 22, medium: 42, high: 66 };
const HAZE_COUNTS = { low: 2, medium: 3, high: 4 };

/** Spin speed per disk layer (radians / second) — inner material orbits fastest. */
const LAYER_SPIN = [0.132, 0.078, 0.042];

/** Colour ramp across the disk, from the white-hot inner rim outwards. */
const RAMP = [
  [0.0, [255, 252, 246]],
  [0.14, [255, 238, 210]],
  [0.34, [255, 208, 142]],
  [0.58, [246, 162, 84]],
  [0.8, [198, 106, 60]],
  [1.0, [122, 60, 46]],
];

function rampColor(t) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 1; i < RAMP.length; i += 1) {
    const [stop, rgb] = RAMP[i];
    if (clamped <= stop) {
      const [prevStop, prevRgb] = RAMP[i - 1];
      const k = (clamped - prevStop) / (stop - prevStop || 1);
      return [
        prevRgb[0] + (rgb[0] - prevRgb[0]) * k,
        prevRgb[1] + (rgb[1] - prevRgb[1]) * k,
        prevRgb[2] + (rgb[2] - prevRgb[2]) * k,
      ];
    }
  }
  return RAMP[RAMP.length - 1][1];
}

const smoothstep = (t) => {
  const k = Math.max(0, Math.min(1, t));
  return k * k * (3 - 2 * k);
};

/**
 * Pre-renders one accretion-disk layer into an offscreen square canvas. The
 * texture is generated once in polar coordinates with domain-warped fbm so the
 * plasma streaks spiral naturally and tile seamlessly around the full circle.
 */
function buildDiskTexture({ size, inner, outer, winding, seed, opacity, contrast }) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  const data = image.data;

  const noiseA = createNoise2D(seed);
  const noiseB = createNoise2D(seed * 31 + 7);

  const half = size / 2;
  const innerPx = inner * half;
  const outerPx = outer * half;
  const band = Math.max(1, outerPx - innerPx);

  for (let y = 0; y < size; y += 1) {
    const dy = y - half + 0.5;
    for (let x = 0; x < size; x += 1) {
      const dx = x - half + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < innerPx || dist > outerPx) continue;

      const t = (dist - innerPx) / band;
      const angle = Math.atan2(dy, dx);

      // Circular noise lookups keep the pattern seamless across the seam.
      const spiral = angle * winding + dist * 0.018;
      const streak = fbm(noiseA, Math.cos(spiral) * 2.4 + dist * 0.004, Math.sin(spiral) * 2.4, 3);
      const clump = fbm(noiseB, Math.cos(angle) * 1.5 + dist * 0.007, Math.sin(angle) * 1.5, 2);

      const taperIn = smoothstep(t / 0.13);
      const decay = Math.pow(1 - t, 2.1);
      const profile = taperIn * (0.26 + 0.74 * decay);
      const turbulence = (0.42 + 0.58 * streak) * (0.6 + 0.4 * clump);
      const heat = profile * turbulence * contrast * (1 + 0.85 * Math.pow(1 - t, 4.5));

      if (heat <= 0.004) continue;

      const [r, g, b] = rampColor(t);
      const index = (y * size + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = Math.min(255, heat * opacity * 255);
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function buildLayers(size) {
  return [
    buildDiskTexture({
      size,
      inner: 0.26,
      outer: 0.66,
      winding: 5.5,
      seed: 91,
      opacity: 1,
      contrast: 1.42,
    }),
    buildDiskTexture({
      size,
      inner: 0.4,
      outer: 0.86,
      winding: 3.4,
      seed: 17,
      opacity: 0.82,
      contrast: 1.15,
    }),
    buildDiskTexture({
      size,
      inner: 0.56,
      outer: 1.0,
      winding: 2.1,
      seed: 53,
      opacity: 0.6,
      contrast: 0.95,
    }),
  ];
}

/**
 * The living black hole: a procedural accretion disk (three independently
 * rotating pre-rendered plasma layers), gravitational-lensing arc, photon
 * ring, drifting nebula haze and orbiting particles.
 */
export default function BlackHole() {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scroll = useRef(0);
  const lastOpacity = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    let tier = getQualityTier();
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let horizon = 0;
    let diskRadius = 0;
    let diskSquash = 0.3;
    let tilt = -0.28;
    let layers = [];
    let particles = [];
    let haze = [];
    let spin = [0, 0, 0];

    const random = createRandom(710720);

    function buildScene() {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const compact = width < 768;
      const short = Math.min(width, height);

      centerX = compact ? width * 0.5 : width * (width < 1280 ? 0.63 : 0.69);
      centerY = compact ? height * 0.28 : height * 0.45;
      horizon = compact
        ? Math.min(width * 0.12, height * 0.07)
        : Math.min(short * 0.085, width * 0.072);
      diskRadius = Math.min(horizon * 5.1, width * (compact ? 0.5 : 0.31));
      diskSquash = compact ? 0.34 : 0.3;
      tilt = -0.28;

      const count = PARTICLE_COUNTS[tier] ?? PARTICLE_COUNTS.medium;
      particles = Array.from({ length: count }, () => {
        const layer = Math.floor(random() * 3);
        return {
          layer,
          baseAngle: random() * Math.PI * 2,
          radius: horizon * (1.7 + random() * 3.1),
          size: 0.7 + random() * 1.7,
          drift: 0.82 + random() * 0.36,
          pulse: random() * Math.PI * 2,
          warm: random(),
        };
      });

      const hazeCount = HAZE_COUNTS[tier] ?? HAZE_COUNTS.medium;
      haze = Array.from({ length: hazeCount }, (_, index) => ({
        offsetX: (random() - 0.5) * width * 1.1,
        offsetY: (random() - 0.5) * height * 0.9,
        radius: short * (0.32 + random() * 0.4),
        hue: index % 3,
        phase: random() * Math.PI * 2,
        drift: 0.05 + random() * 0.08,
      }));
    }

    const HAZE_COLORS = ['rgba(120,86,230,', 'rgba(70,150,235,', 'rgba(226,164,86,'];

    function drawHaze(time, ox, oy) {
      for (const blob of haze) {
        const driftX = Math.sin(time * blob.drift * 0.6 + blob.phase) * 46;
        const driftY = Math.cos(time * blob.drift * 0.45 + blob.phase) * 34;
        const x = ox + blob.offsetX + driftX;
        const y = oy + blob.offsetY + driftY;
        const alpha = 0.028 + 0.014 * (0.5 + 0.5 * Math.sin(time * 0.11 + blob.phase));
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.radius);
        gradient.addColorStop(0, `${HAZE_COLORS[blob.hue]}${alpha})`);
        gradient.addColorStop(1, `${HAZE_COLORS[blob.hue]}0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * Draws every disk layer with the disk-plane transform applied.
     * `region` is 'far' (whole disk) or 'near' (bottom half only, in front of
     * the event horizon).
     */
    function drawDisk(ox, oy, time, region) {
      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i];
        const breathe = 1 + 0.09 * Math.sin(time * (0.13 + i * 0.05) + i * 2.1);
        const radius = diskRadius;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(tilt);
        ctx.scale(1, diskSquash);
        ctx.rotate(spin[i]);
        if (region === 'near') {
          ctx.beginPath();
          ctx.rect(-radius, 0, radius * 2, radius);
          ctx.clip();
        }
        ctx.globalAlpha = Math.min(1, breathe) * (region === 'near' ? 1 : 0.92);
        ctx.drawImage(layer, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
      }
    }

    function drawHorizon(ox, oy) {
      // Soft dark bloom that dims the disk immediately behind the hole.
      const bloom = ctx.createRadialGradient(ox, oy, horizon * 0.4, ox, oy, horizon * 2.35);
      bloom.addColorStop(0, 'rgba(2,3,8,0.9)');
      bloom.addColorStop(0.45, 'rgba(2,3,8,0.5)');
      bloom.addColorStop(1, 'rgba(2,3,8,0)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(ox, oy, horizon * 2.35, 0, Math.PI * 2);
      ctx.fill();

      // Event horizon — kept almost perfectly black.
      ctx.fillStyle = '#010205';
      ctx.beginPath();
      ctx.arc(ox, oy, horizon, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLensedArc(ox, oy, time) {
      const radius = diskRadius * 0.6;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5 + 0.08 * Math.sin(time * 0.17);

      ctx.beginPath();
      ctx.ellipse(
        ox,
        oy - horizon * 0.12,
        horizon * 2.95,
        horizon * 1.42,
        tilt * 0.8,
        Math.PI,
        Math.PI * 2,
      );
      ctx.save();
      ctx.clip();
      ctx.translate(ox, oy - horizon * 0.1);
      ctx.rotate(tilt * 0.72);
      ctx.scale(1, 0.24);
      ctx.rotate(spin[1] * 1.25);
      ctx.globalAlpha = 0.62;
      ctx.drawImage(layers[1], -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
      ctx.restore();
    }

    function drawPhotonRing(ox, oy, time) {
      const pulse = 0.72 + 0.14 * Math.sin(time * 0.9);
      const ring = ctx.createRadialGradient(
        ox,
        oy,
        horizon * 0.94,
        ox,
        oy,
        horizon * 1.5,
      );
      ring.addColorStop(0, 'rgba(255,248,236,0)');
      ring.addColorStop(0.18, `rgba(255,246,230,${0.34 * pulse})`);
      ring.addColorStop(0.42, `rgba(200,226,255,${0.18 * pulse})`);
      ring.addColorStop(1, 'rgba(200,226,255,0)');

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(ox, oy, horizon * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255,252,244,${0.5 * pulse})`;
      ctx.lineWidth = Math.max(1, horizon * 0.035);
      ctx.beginPath();
      ctx.arc(ox, oy, horizon * 1.045, 0, Math.PI * 2);
      ctx.stroke();
    }

    function drawParticles(ox, oy, time, side) {
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const compact = width < 768;

      ctx.globalCompositeOperation = 'lighter';
      for (const particle of particles) {
        const layerSpin = LAYER_SPIN[particle.layer];
        const angle = particle.baseAngle + spin[particle.layer] * particle.drift;
        const px = Math.cos(angle) * particle.radius;
        const py = Math.sin(angle) * particle.radius;
        if ((py < 0 ? 'far' : 'near') !== side) continue;

        const sx = ox + px * cosT - py * diskSquash * sinT;
        const sy = oy + px * sinT + py * diskSquash * cosT;
        const twinkle = 0.45 + 0.55 * Math.sin(time * (0.8 + layerSpin * 6) + particle.pulse);
        const alpha = Math.max(0, 0.16 + 0.55 * twinkle) * (compact ? 0.8 : 1);
        const size = particle.size * (0.9 + 0.2 * twinkle);

        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = particle.warm > 0.62 ? '#ffe6bd' : '#e8f2ff';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawFrame(time) {
      ctx.clearRect(0, 0, width, height);

      const ox = centerX + pointer.current.x;
      const oy = centerY + pointer.current.y - scroll.current * 0.18;

      ctx.globalCompositeOperation = 'lighter';
      drawHaze(time, ox, oy);

      drawDisk(ox, oy, time, 'far');
      drawHorizon(ox, oy);
      drawLensedArc(ox, oy, time);
      drawPhotonRing(ox, oy, time);
      drawParticles(ox, oy, time, 'far');
      drawDisk(ox, oy, time, 'near');
      drawParticles(ox, oy, time, 'near');
      ctx.globalCompositeOperation = 'source-over';
    }

    function updateScrollFade() {
      const fade = Math.max(0.12, Math.min(1, 1 - scroll.current / (height * 1.05)));
      if (Math.abs(fade - lastOpacity.current) > 0.006) {
        canvas.style.opacity = fade.toFixed(3);
        lastOpacity.current = fade;
      }
    }

    function applyScene() {
      buildScene();
      updateScrollFade();
      if (reduced) drawFrame(0);
    }

    layers = buildLayers(TEXTURE_SIZES[tier] ?? TEXTURE_SIZES.medium);
    buildScene();
    canvas.style.opacity = '1';

    const handlePointerMove = (event) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * 16;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * 12;
    };

    const handleScroll = () => {
      scroll.current = window.scrollY || 0;
      updateScrollFade();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    const stopResize = onQualityResize(() => {
      const nextTier = getQualityTier();
      if (nextTier !== tier) {
        tier = nextTier;
        layers = buildLayers(TEXTURE_SIZES[tier] ?? TEXTURE_SIZES.medium);
      }
      applyScene();
    });

    if (reduced) {
      drawFrame(0);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('scroll', handleScroll);
        stopResize();
      };
    }

    const stopTick = addTick((time, delta) => {
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.04;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.04;

      for (let i = 0; i < LAYER_SPIN.length; i += 1) {
        spin[i] += LAYER_SPIN[i] * delta;
      }

      drawFrame(time);
    });

    return () => {
      stopTick();
      stopResize();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      layers = [];
      particles = [];
      haze = [];
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
