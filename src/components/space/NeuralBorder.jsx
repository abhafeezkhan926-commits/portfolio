import { useEffect, useRef } from 'react';
import { addTick } from '../../lib/ticker';
import {
  createRandom,
  getQualityTier,
  onQualityResize,
  prefersReducedMotion,
} from '../../lib/environment';

const NS = 'http://www.w3.org/2000/svg';

const PULSE_COUNTS = { low: 4, medium: 6, high: 7 };
const NODE_COUNTS = { low: 12, medium: 20, high: 28 };
const SPUR_COUNTS = { low: 3, medium: 5, high: 7 };
const NODE_REACT_RADIUS = 150;

const PULSE_COLORS = {
  blue: ['#4DA6FF', 'rgba(77,166,255,'],
  cyan: ['#22D3EE', 'rgba(34,211,238,'],
  violet: ['#A78BFA', 'rgba(167,139,250,'],
  white: ['#EAF2FF', 'rgba(234,242,255,'],
};

/**
 * Analytic rounded-rectangle perimeter so pulses can be positioned without a
 * per-frame DOM measurement pass.
 */
function createPerimeter(width, height, inset, cornerRadius) {
  const x = inset;
  const y = inset;
  const w = Math.max(1, width - inset * 2);
  const h = Math.max(1, height - inset * 2);
  const r = Math.max(0, Math.min(cornerRadius, w / 2, h / 2));

  const segments = [];
  let cursor = 0;

  const add = (length, pointAt) => {
    segments.push({ start: cursor, end: cursor + length, length, pointAt });
    cursor += length;
  };

  const line = (x0, y0, x1, y1) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const length = Math.hypot(dx, dy);
    add(length, (d) => [x0 + (dx * d) / (length || 1), y0 + (dy * d) / (length || 1)]);
  };

  const arc = (cx, cy, a0, a1) => {
    const length = Math.abs(a1 - a0) * r;
    add(length, (d) => {
      const angle = a0 + ((a1 - a0) * d) / (length || 1);
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    });
  };

  const half = Math.PI / 2;

  // The bottom edge stays open on purpose: the perimeter runs up the left
  // edge, over the top and down the right edge, so no line is drawn across
  // the bottom of the viewport.
  line(x, y + h - r, x, y + r);
  arc(x + r, y + r, Math.PI, Math.PI * 1.5);
  line(x + r, y, x + w - r, y);
  arc(x + w - r, y + r, -half, 0);
  line(x + w, y + r, x + w, y + h - r);

  const corners = [
    { cx: x + w - r, cy: y + r },
    { cx: x + w - r, cy: y + h - r },
    { cx: x + r, cy: y + h - r },
    { cx: x + r, cy: y + r },
  ];

  function pointAt(distance) {
    const wrapped = ((distance % cursor) + cursor) % cursor;
    // The perimeter is open, so its two ends are different points: `total`
    // must resolve to the end of the last segment instead of wrapping to 0.
    const d = distance > 0 && wrapped === 0 ? cursor : wrapped;
    for (const segment of segments) {
      if (d <= segment.end) return segment.pointAt(d - segment.start);
    }
    return segments[0].pointAt(0);
  }

  return { total: cursor, pointAt, corners, midX: x + w / 2, midY: y + h / 2 };
}

function pathFromPerimeter(perimeter, step = 24) {
  const points = [];
  const push = (d) => {
    const [px, py] = perimeter.pointAt(d);
    points.push(`${points.length === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`);
  };

  for (let d = 0; d < perimeter.total; d += step) push(d);
  push(perimeter.total);

  // Deliberately not closed — a closing "Z" would draw the bottom edge.
  return points.join(' ');
}

function svgEl(name, attrs = {}) {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
  return element;
}

/**
 * The signature neural border: fine circuit lines tracing the top, left and
 * right viewport edges (the bottom edge is intentionally open), connected
 * nodes with occasional branches, and luminous pulses that travel the
 * perimeter, rebounding off the two open ends and flaring softly whenever
 * they sweep a corner.
 */
export default function NeuralBorder() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const reduced = prefersReducedMotion();
    let tier = getQualityTier();
    let width = 0;
    let height = 0;
    let perimeter = null;
    let pulses = [];
    let nodes = [];
    let cornerFlares = [];

    const random = createRandom(4271);
    const groupPulses = svgEl('g');
    const groupFlares = svgEl('g');
    const groupNodes = svgEl('g');

    function clearScene() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      pulses = [];
      nodes = [];
      cornerFlares = [];
    }

    function buildScene() {
      clearScene();

      width = Math.max(320, window.innerWidth);
      height = Math.max(320, window.innerHeight);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));

      const compact = width < 768;
      perimeter = createPerimeter(width, height, compact ? 7 : 9, compact ? 16 : 24);
      const path = pathFromPerimeter(perimeter);

      const defs = svgEl('defs');
      for (const key of Object.keys(PULSE_COLORS)) {
        const gradient = svgEl('radialGradient', { id: `neural-${key}` });
        gradient.append(
          svgEl('stop', { offset: '0', 'stop-color': PULSE_COLORS[key][0], 'stop-opacity': '0.85' }),
          svgEl('stop', { offset: '0.3', 'stop-color': PULSE_COLORS[key][0], 'stop-opacity': '0.3' }),
          svgEl('stop', { offset: '1', 'stop-color': PULSE_COLORS[key][0], 'stop-opacity': '0' }),
        );
        defs.append(gradient);
      }
      const flareGradient = svgEl('radialGradient', { id: 'neural-flare' });
      flareGradient.append(
        svgEl('stop', { offset: '0', 'stop-color': '#DCEBFF', 'stop-opacity': '0.7' }),
        svgEl('stop', { offset: '0.4', 'stop-color': '#4DA6FF', 'stop-opacity': '0.26' }),
        svgEl('stop', { offset: '1', 'stop-color': '#4DA6FF', 'stop-opacity': '0' }),
      );
      defs.append(flareGradient);
      svg.append(defs);

      // Layered strokes fake a soft bloom without paying for an SVG filter.
      svg.append(
        svgEl('path', {
          d: path,
          fill: 'none',
          stroke: '#3E7BD6',
          'stroke-width': '9',
          'stroke-opacity': '0.05',
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: path,
          fill: 'none',
          stroke: '#63A8FF',
          'stroke-width': '2.6',
          'stroke-opacity': '0.09',
        }),
        svgEl('path', {
          d: path,
          fill: 'none',
          stroke: '#9CC4FF',
          'stroke-width': '1',
          'stroke-opacity': '0.2',
        }),
        svgEl('path', {
          d: path,
          fill: 'none',
          stroke: '#BFE0FF',
          'stroke-width': '1',
          'stroke-opacity': '0.28',
          'stroke-dasharray': '2 15',
          'stroke-linecap': 'round',
        }),
      );

      // Static network nodes along the perimeter, some with a branch spur.
      const nodeCount = NODE_COUNTS[tier] ?? NODE_COUNTS.medium;
      const spurCount = SPUR_COUNTS[tier] ?? SPUR_COUNTS.medium;
      const spurIndexes = new Set();
      while (spurIndexes.size < Math.min(spurCount, nodeCount)) {
        spurIndexes.add(Math.floor(random() * nodeCount));
      }

      for (let i = 0; i < nodeCount; i += 1) {
        const distance = (perimeter.total * (i + 0.5)) / nodeCount + (random() - 0.5) * 12;
        const [nx, ny] = perimeter.pointAt(distance);
        const base = i % 5 === 0 ? 0.5 : 0.24 + random() * 0.22;
        const radius = i % 5 === 0 ? 2.3 : 1.3 + random() * 0.9;

        const node = svgEl('circle', {
          cx: nx.toFixed(1),
          cy: ny.toFixed(1),
          r: radius.toFixed(2),
          fill: i % 3 === 0 ? '#CFE6FF' : '#7FB4FF',
          opacity: base,
        });
        groupNodes.append(node);
        nodes.push({ el: node, distance, base });

        if (spurIndexes.has(i)) {
          const inwardX = perimeter.midX - nx;
          const inwardY = perimeter.midY - ny;
          const length = Math.hypot(inwardX, inwardY) || 1;
          const ux = inwardX / length;
          const uy = inwardY / length;
          const reach = 20 + random() * 30;
          const ex = nx + ux * reach;
          const ey = ny + uy * reach;

          groupNodes.append(
            svgEl('line', {
              x1: nx.toFixed(1),
              y1: ny.toFixed(1),
              x2: ex.toFixed(1),
              y2: ey.toFixed(1),
              stroke: '#7FB4FF',
              'stroke-width': '1',
              'stroke-opacity': '0.16',
              'stroke-linecap': 'round',
            }),
            svgEl('circle', {
              cx: ex.toFixed(1),
              cy: ey.toFixed(1),
              r: '1.5',
              fill: '#9CC4FF',
              opacity: '0.28',
            }),
          );
        }
      }
      svg.append(groupNodes);

      // Corner flares — briefly lit when a pulse sweeps past.
      for (const corner of perimeter.corners) {
        const flare = svgEl('circle', {
          cx: corner.cx.toFixed(1),
          cy: corner.cy.toFixed(1),
          r: '54',
          fill: 'url(#neural-flare)',
          opacity: '0',
        });
        groupFlares.append(flare);
        cornerFlares.push({ el: flare, cx: corner.cx, cy: corner.cy, level: 0 });
      }
      svg.append(groupFlares);

      // Traveling pulses — a soft glow paired with a bright core.
      const pulseCount = PULSE_COUNTS[tier] ?? PULSE_COUNTS.medium;
      const colorKeys = Object.keys(PULSE_COLORS);
      pulses = Array.from({ length: pulseCount }, (_, index) => {
        const colorKey = colorKeys[index % colorKeys.length];
        const group = svgEl('g', { opacity: '0' });
        const glow = svgEl('circle', {
          r: '13',
          fill: `url(#neural-${colorKey})`,
        });
        const core = svgEl('circle', {
          r: '1.7',
          fill: PULSE_COLORS[colorKey][0],
        });
        group.append(glow, core);
        groupPulses.append(group);

        const direction = index % 3 === 0 ? -1 : 1;
        return {
          el: group,
          core,
          distance: random() * perimeter.total,
          speed: (compact ? 62 : 84) + random() * (compact ? 70 : 140),
          direction,
          colorKey,
          size: 1 + random() * 0.6,
          pulse: random() * Math.PI * 2,
        };
      });
      svg.append(groupPulses);
    }

    function drawFrame(time, delta) {
      for (const pulse of pulses) {
        pulse.distance += pulse.speed * pulse.direction * delta;

        // The bottom edge is open, so pulses rebound off the two open ends
        // instead of wrapping across the gap.
        if (pulse.distance > perimeter.total) {
          pulse.distance = Math.max(0, perimeter.total * 2 - pulse.distance);
          pulse.direction *= -1;
        } else if (pulse.distance < 0) {
          pulse.distance = Math.min(perimeter.total, -pulse.distance);
          pulse.direction *= -1;
        }

        const [px, py] = perimeter.pointAt(pulse.distance);
        pulse.x = px;
        pulse.y = py;
        const flicker = 0.72 + 0.28 * Math.sin(time * 2.1 + pulse.pulse);
        pulse.el.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
        pulse.el.setAttribute('opacity', flicker.toFixed(3));
        pulse.core.setAttribute('r', (pulse.size * (0.9 + 0.25 * flicker)).toFixed(2));
      }

      // Nodes brighten as a pulse passes nearby.
      for (const node of nodes) {
        let boost = 0;
        for (const pulse of pulses) {
          let gap = Math.abs(pulse.distance - node.distance);
          if (gap > perimeter.total / 2) gap = perimeter.total - gap;
          if (gap < NODE_REACT_RADIUS) {
            boost = Math.max(boost, 1 - gap / NODE_REACT_RADIUS);
          }
        }
        node.el.setAttribute('opacity', (node.base + boost * 0.6).toFixed(3));
      }

      // Corner flares decay every frame and are re-lit by close pulses.
      for (const flare of cornerFlares) {
        let target = 0;
        for (const pulse of pulses) {
          const distance = Math.hypot(pulse.x - flare.cx, pulse.y - flare.cy);
          if (distance < 90) target = Math.max(target, 1 - distance / 90);
        }
        flare.level += (Math.max(target, flare.level * 0.9) - flare.level) * 0.25;
        flare.el.setAttribute('opacity', (flare.level * 0.85).toFixed(3));
      }
    }

    function applyScene() {
      buildScene();
      if (reduced) {
        for (const pulse of pulses) pulse.el.setAttribute('opacity', '0.28');
      }
    }

    applyScene();

    const stopResize = onQualityResize(() => {
      tier = getQualityTier();
      applyScene();
    });

    if (reduced) return stopResize;

    const stopTick = addTick((time, delta) => drawFrame(time, delta));

    return () => {
      stopTick();
      stopResize();
      clearScene();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="neural-border fixed inset-0"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    />
  );
}
