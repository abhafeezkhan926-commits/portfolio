/**
 * A decorative solar system inside a framed box. On its own it keeps a calm
 * pace; while the pointer is inside the frame the timeline surges forward
 * (orbits accelerate, stars streak outward, the year ruler at the bottom
 * races past the playhead) and the camera eases into a continuous zoom.
 */

import { useEffect, useRef } from 'react';
import { MousePointer2 } from 'lucide-react';

import { addTick } from '../../lib/ticker';
import { createRandom, getQualityTier, onQualityResize, prefersReducedMotion } from '../../lib/environment';

const STAR_COUNTS = { low: 70, medium: 120, high: 190 };

/** Full-warp time multiplier, shown in the HUD readout as the top value. */
const MAX_TIMELINE_SPEED = 40;

const RULER_MINOR = 18;
const RULER_MAJOR = RULER_MINOR * 5;
const YEARS_PER_MAJOR = 10;
const YEAR_ZERO = 2026;

const HAZE_COLORS = ['rgba(122, 92, 236, ', 'rgba(62, 138, 236, ', 'rgba(226, 164, 86, '];

/**
 * Eight worlds, fastest nearest the star. `size` is a fraction of the sun
 * radius; `orbit` is a fraction of the scene radius.
 */
const PLANETS = [
  { orbit: 0.24, speed: 2.35, size: 0.13, body: '#cdbca9', lit: '#f4e9dc', shade: '#6f6459' },
  { orbit: 0.33, speed: 1.7, size: 0.18, body: '#e0b877', lit: '#ffe2ac', shade: '#7c5f33' },
  { orbit: 0.43, speed: 1.28, size: 0.19, body: '#74aecf', lit: '#c9ecff', shade: '#3c6377' },
  { orbit: 0.55, speed: 0.95, size: 0.15, body: '#cf7756', lit: '#ffb28a', shade: '#6e3927' },
  { orbit: 0.7, speed: 0.66, size: 0.3, body: '#d2a072', lit: '#ffe0b5', shade: '#74522f' },
  { orbit: 0.86, speed: 0.47, size: 0.25, body: '#dcc995', lit: '#ffefc4', shade: '#7d6c46', ring: true },
  { orbit: 1.02, speed: 0.33, size: 0.2, body: '#8ccbdd', lit: '#d6f6ff', shade: '#456f7c' },
  { orbit: 1.18, speed: 0.24, size: 0.19, body: '#8a9ee8', lit: '#c9d6ff', shade: '#454f80' },
];

export default function SolarSystem() {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const speedRef = useRef(null);
  const hoverRef = useRef(false);
  const reducedRef = useRef(false);
  const pointerRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  const reduced = prefersReducedMotion();

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const prefersReduced = prefersReducedMotion();
    reducedRef.current = prefersReduced;
    let tier = getQualityTier();

    let width = 0;
    let height = 0;
    let sceneRadius = 0;
    let sunRadius = 0;
    const squash = 0.42;
    const tilt = -0.14;

    let stars = [];
    let haze = [];
    let planets = [];

    let clock = 0; // real seconds — shimmer, twinkle, pulses
    let travel = 0; // time-dilated seconds — orbital motion
    let timelineX = 0; // ruler scroll distance, in pixels
    let warp = 0; // 0 → 1 ease into full time-travel
    let zoomProgress = 0; // 0 → 1 continuous camera push-in
    let lastWarpShown = -1;
    let lastSpeedLabel = '';

    const random = createRandom(26012026);

    function buildScene() {
      const rect = box.getBoundingClientRect();
      width = Math.max(280, rect.width);
      height = Math.max(220, rect.height);

      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.5 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sunRadius = Math.max(13, Math.min(width, height) * 0.058);
      sceneRadius = Math.min(width * 0.36, height * 0.72);

      planets = PLANETS.map((planet) => ({ ...planet, phase: random() * Math.PI * 2 }));

      const starCount = STAR_COUNTS[tier] ?? STAR_COUNTS.medium;
      stars = Array.from({ length: starCount }, () => ({
        angle: random() * Math.PI * 2,
        distance: 0.06 + random() * 0.98,
        depth: 0.45 + random() * 1,
        size: 0.6 + random() * 1.5,
        twinkle: random() * Math.PI * 2,
      }));

      haze = Array.from({ length: 3 }, (_, index) => ({
        x: (0.2 + random() * 0.6) * width,
        y: (0.14 + random() * 0.5) * height,
        radius: Math.min(width, height) * (0.4 + random() * 0.3),
        hue: index,
        phase: random() * Math.PI * 2,
      }));
    }

    function drawHaze(ox) {
      for (const blob of haze) {
        const x = blob.x + (ox - width * 0.5) * 0.25 + Math.sin(clock * 0.06 + blob.phase) * 16;
        const y = blob.y + Math.cos(clock * 0.05 + blob.phase) * 12;
        const alpha = 0.05 + warp * 0.03 + 0.02 * (0.5 + 0.5 * Math.sin(clock * 0.1 + blob.phase));
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.radius);
        gradient.addColorStop(0, `${HAZE_COLORS[blob.hue]}${alpha})`);
        gradient.addColorStop(1, `${HAZE_COLORS[blob.hue]}0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawStars(ox, oy, zoom, delta) {
      const maxR = Math.hypot(width, height) * 0.62;
      ctx.lineCap = 'round';

      for (const star of stars) {
        star.distance += (0.012 + warp * star.depth * 0.5) * delta;

        // Stars stream outwards at speed and are recycled once they leave
        // the frame, so the field never empties during the warp.
        if (star.distance * zoom > 1.04) {
          star.distance = 0.05 + random() * 0.09;
          star.angle = random() * Math.PI * 2;
          star.twinkle = random() * Math.PI * 2;
        }

        const screenR = star.distance * maxR * zoom;
        const x = ox + Math.cos(star.angle) * screenR;
        const y = oy + Math.sin(star.angle) * screenR;

        const fadeIn = Math.min(1, star.distance / 0.1);
        const fadeOut = Math.min(1, (1.06 - star.distance) / 0.16);
        const twinkle = 0.45 + 0.55 * Math.sin(clock * (0.7 + star.depth * 1.6) + star.twinkle);
        const alpha = (0.16 + 0.5 * twinkle) * fadeIn * fadeOut * (0.6 + 0.4 * star.depth);
        if (alpha <= 0.01) continue;

        const streak = warp * warp * (24 + star.depth * 170) * (0.35 + star.distance);

        if (streak > 2) {
          ctx.globalAlpha = Math.min(1, alpha * (1 + warp * 1.4));
          ctx.strokeStyle = '#dbe9ff';
          ctx.lineWidth = star.size * (0.9 + warp * 0.9);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(star.angle) * streak, y + Math.sin(star.angle) * streak);
          ctx.stroke();
        } else {
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.fillStyle = '#e8f2ff';
          ctx.beginPath();
          ctx.arc(x, y, star.size * (0.9 + 0.15 * twinkle), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    }

    function drawOrbits(ox, oy, zoom) {
      ctx.lineWidth = 1;
      for (const planet of planets) {
        const radius = planet.orbit * sceneRadius * zoom;
        ctx.strokeStyle = `rgba(130, 175, 255, ${0.09 + warp * 0.09})`;
        ctx.beginPath();
        ctx.ellipse(ox, oy, radius, radius * squash, tilt, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawPlanet(planet, angle, ox, oy, zoom, front) {
      const orbitR = planet.orbit * sceneRadius * zoom;
      const radX = Math.cos(angle) * orbitR;
      const radY = Math.sin(angle) * orbitR;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const sx = ox + radX * cosT - radY * squash * sinT;
      const sy = oy + radX * sinT + radY * squash * cosT;
      const size = planet.size * sunRadius * (1 + zoom * 0.14);

      if (warp > 0.02) {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(tilt);
        ctx.scale(1, squash);
        ctx.globalAlpha = Math.min(0.6, warp * 0.45);
        ctx.strokeStyle = planet.body;
        ctx.lineWidth = Math.max(1, size * 0.42);
        ctx.beginPath();
        ctx.arc(0, 0, orbitR, angle - warp * 0.9, angle);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = front ? 1 : 0.8;

      if (planet.ring) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(tilt + 0.24);
        ctx.strokeStyle = 'rgba(250, 232, 196, 0.5)';
        ctx.lineWidth = Math.max(1, size * 0.24);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.9, size * 0.68, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const ux = ox - sx;
      const uy = oy - sy;
      const dist = Math.hypot(ux, uy) || 1;
      const hx = sx + (ux / dist) * size * 0.42;
      const hy = sy + (uy / dist) * size * 0.42;
      const body = ctx.createRadialGradient(hx, hy, size * 0.1, sx, sy, size * 1.08);
      body.addColorStop(0, planet.lit);
      body.addColorStop(0.55, planet.body);
      body.addColorStop(1, planet.shade);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      if (planet.ring) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(tilt + 0.24);
        ctx.strokeStyle = 'rgba(250, 232, 196, 0.75)';
        ctx.lineWidth = Math.max(1, size * 0.24);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.9, size * 0.68, 0, 0, Math.PI * 0.98);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    }

    function drawSun(ox, oy, zoom) {
      const base = sunRadius * zoom * (1 + 0.035 * Math.sin(clock * 1.7 + 0.6));

      const glowR = base * (5.2 + warp * 3.6);
      const glow = ctx.createRadialGradient(ox, oy, base * 0.5, ox, oy, glowR);
      glow.addColorStop(0, `rgba(255, 216, 150, ${0.34 + warp * 0.24})`);
      glow.addColorStop(0.32, `rgba(255, 176, 92, ${0.13 + warp * 0.1})`);
      glow.addColorStop(1, 'rgba(255, 150, 70, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ox, oy, glowR, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(
        ox - base * 0.2,
        oy - base * 0.24,
        base * 0.08,
        ox,
        oy,
        base,
      );
      core.addColorStop(0, '#fffdf6');
      core.addColorStop(0.4, '#ffe3a8');
      core.addColorStop(0.78, '#ffab52');
      core.addColorStop(1, '#ff8432');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(ox, oy, base, 0, Math.PI * 2);
      ctx.fill();

      // Anamorphic lens streak — stretches as the timeline accelerates.
      const streakW = base * (3.6 + warp * 3.4);
      const streakH = Math.max(1.5, base * (0.07 + warp * 0.12));
      const streak = ctx.createLinearGradient(ox - streakW / 2, 0, ox + streakW / 2, 0);
      streak.addColorStop(0, 'rgba(255, 214, 150, 0)');
      streak.addColorStop(0.5, `rgba(255, 232, 190, ${0.4 + warp * 0.3})`);
      streak.addColorStop(1, 'rgba(255, 214, 150, 0)');
      ctx.fillStyle = streak;
      ctx.fillRect(ox - streakW / 2, oy - streakH / 2, streakW, streakH);
    }

    function drawTimeline() {
      const y = height - 30;
      const boost = 1 + warp * 0.6;

      const veil = ctx.createLinearGradient(0, y - 34, 0, height);
      veil.addColorStop(0, 'rgba(3, 6, 14, 0)');
      veil.addColorStop(1, 'rgba(3, 6, 14, 0.62)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, y - 34, width, 34 + 30);

      ctx.strokeStyle = `rgba(130, 175, 255, ${0.16 * boost})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(140, 185, 255, ${0.2 * boost})`;
      const minorOffset = timelineX % RULER_MINOR;
      for (let x = -minorOffset; x <= width; x += RULER_MINOR) {
        const index = Math.round((timelineX + x) / RULER_MINOR);
        if (index % 5 === 0) continue;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 4);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(150, 200, 255, ${0.5 * boost})`;
      ctx.fillStyle = `rgba(160, 200, 255, ${0.42 * boost})`;
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      const majorOffset = timelineX % RULER_MAJOR;
      for (let x = -majorOffset; x <= width; x += RULER_MAJOR) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 11);
        ctx.stroke();

        const year = YEAR_ZERO + Math.round((timelineX + x) / RULER_MAJOR) * YEARS_PER_MAJOR;
        ctx.fillText(String(year), x + 4, y - 15);
      }

      const playheadX = width * 0.5;
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
      ctx.shadowBlur = 6 + warp * 12;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(playheadX, y - 22);
      ctx.lineTo(playheadX, y + 6);
      ctx.stroke();
      ctx.restore();
    }

    function drawFrame(time, delta) {
      clock = time;

      const engaged = hoverRef.current && !prefersReduced;
      warp += ((engaged ? 1 : 0) - warp) * Math.min(1, delta * (engaged ? 1.6 : 2.8));
      if (warp < 0.002) warp = 0;

      travel += delta * (1 + warp * (MAX_TIMELINE_SPEED - 1));
      timelineX += delta * (12 + warp * 1650);
      zoomProgress = Math.max(0, Math.min(1, zoomProgress + delta * (engaged ? 0.5 : -1.7)));

      const zoomEase = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
      let zoom = 1 + zoomEase * 1.55;
      // A light breathing on top of the push-in keeps the zoom continuously
      // moving for as long as the pointer stays inside.
      zoom *= 1 + 0.016 * Math.sin(clock * 2.1) * warp;

      const pointer = pointerRef.current;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, delta * 4);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, delta * 4);

      let ox = width * 0.5 + (pointer.x - 0.5) * (10 + warp * 14);
      let oy = height * 0.5 - height * 0.04 + (pointer.y - 0.5) * (8 + warp * 10);
      ox += Math.sin(clock * 33) * 1.1 * warp;
      oy += Math.cos(clock * 41) * 0.9 * warp;

      ctx.clearRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      drawHaze(ox);
      drawStars(ox, oy, zoom, delta);

      ctx.globalCompositeOperation = 'source-over';
      drawOrbits(ox, oy, zoom);

      for (const planet of planets) {
        const angle = planet.phase + travel * planet.speed * 0.16;
        if (Math.sin(angle) >= 0) continue;
        drawPlanet(planet, angle, ox, oy, zoom, false);
      }

      ctx.globalCompositeOperation = 'lighter';
      drawSun(ox, oy, zoom);

      ctx.globalCompositeOperation = 'source-over';
      for (const planet of planets) {
        const angle = planet.phase + travel * planet.speed * 0.16;
        if (Math.sin(angle) < 0) continue;
        drawPlanet(planet, angle, ox, oy, zoom, true);
      }

      drawTimeline();

      const shownWarp = Math.round(warp * 1000) / 1000;
      if (Math.abs(shownWarp - lastWarpShown) > 0.006) {
        lastWarpShown = shownWarp;
        box.style.setProperty('--warp', shownWarp.toFixed(3));
      }

      if (speedRef.current) {
        const label = `×${(1 + warp * (MAX_TIMELINE_SPEED - 1)).toFixed(1)}`;
        if (label !== lastSpeedLabel) {
          lastSpeedLabel = label;
          speedRef.current.textContent = label;
        }
      }
    }

    buildScene();
    drawFrame(0, 0.016);

    let stopTick = null;
    let observer = null;

    if (!prefersReduced) {
      observer = new IntersectionObserver(
        (entries) => {
          const inView = entries.some((entry) => entry.isIntersecting);
          if (inView && !stopTick) stopTick = addTick(drawFrame);
          if (!inView && stopTick) {
            stopTick();
            stopTick = null;
          }
        },
        { rootMargin: '140px 0px' },
      );
      observer.observe(box);
    }

    const stopResize = onQualityResize(() => {
      const nextTier = getQualityTier();
      if (nextTier !== tier) tier = nextTier;
      buildScene();
      if (stopTick) drawFrame(clock, 0.016);
      else drawFrame(0, 0.016);
    });

    return () => {
      stopResize();
      observer?.disconnect();
      stopTick?.();
      stars = [];
      haze = [];
      planets = [];
    };
  }, []);

  const handleEnter = () => {
    hoverRef.current = true;
    if (!reducedRef.current) boxRef.current?.classList.add('is-engaged');
  };

  const handleLeave = () => {
    hoverRef.current = false;
  };

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerRef.current.tx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    pointerRef.current.ty = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  };

  return (
    <div
      ref={boxRef}
      className="solar-box aspect-[16/11] sm:aspect-[16/8] lg:aspect-[16/7]"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onPointerMove={handleMove}
      role="img"
      aria-label="Decorative animation: a solar system orbiting a small star. While the pointer stays inside the frame the timeline speeds up and the view zooms in continuously."
    >
      <canvas ref={canvasRef} className="solar-canvas" aria-hidden="true" />

      <div className="solar-hud solar-hud--hint" aria-hidden="true">
        <MousePointer2 size={13} />
        {reduced ? 'Motion reduced — static view' : 'Hover to travel through time'}
      </div>

      <div className="solar-hud solar-hud--speed" aria-hidden="true">
        <span className="solar-speed-dot" />
        <span className="text-[0.64rem] uppercase tracking-[0.22em] text-[color:var(--color-faint)]">
          timeline
        </span>
        <span
          ref={speedRef}
          className="font-[family-name:var(--font-mono)] text-[0.78rem] text-[color:var(--color-mist)]"
        >
          ×1.0
        </span>
      </div>
    </div>
  );
}
