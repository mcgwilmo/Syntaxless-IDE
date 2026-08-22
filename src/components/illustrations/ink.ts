/**
 * Ink primitives for the editorial line illustrations.
 *
 * The drawings are meant to read as pen on paper, and the wobble that sells
 * that has to live in the path data. It cannot come from an SVG filter:
 * `feTurbulence` over a full-bleed card is a per-frame raster pass on every
 * paint, and it looks like a filter rather than like a hand.
 *
 * So every primitive here emits cubic beziers whose endpoints and control
 * points are nudged off the ideal by a seeded generator. Seeded, not random:
 * these components render on the server and again on the client, and
 * `Math.random()` would hand the two passes different `d` attributes and trip
 * a hydration mismatch. Same seed, same drawing, forever.
 *
 * Nothing in here emits a colour. Callers paint with `currentColor` or a
 * `var(--token)` so both themes are one code path.
 */

/** Linear congruential generator -- small, fast, and stable across runtimes. */
function seeded(seed: number): () => number {
  // Knuth's multiplicative hash first, so adjacent seeds (1, 2, 3 ...) start in
  // genuinely different places instead of walking the same sequence offset.
  let state = Math.imul(seed || 1, 2654435761) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Signed jitter in [-amount, amount]. */
function wobble(rand: () => number, amount: number): number {
  return (rand() * 2 - 1) * amount;
}

/** Two decimals is under a tenth of a pixel at these viewBoxes. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export type StrokeOptions = {
  /** How far the pen drifts off the ideal line, in user units. */
  jitter?: number;
  /** Bow the stroke sideways. Positive bows to the left of travel. */
  bow?: number;
};

export type Point = readonly [number, number];

/**
 * One drawn stroke between two points.
 *
 * A ruled line is two points and nothing else; a drawn one arrives slightly
 * past where it meant to and bends on the way, so both the endpoints and the
 * two control points get pushed around.
 */
export function inkLine(
  from: Point,
  to: Point,
  seed: number,
  { jitter = 1.1, bow = 0 }: StrokeOptions = {},
): string {
  const rand = seeded(seed);
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  // Unit normal, so `bow` is in user units rather than in units-per-length.
  const nx = -dy / length;
  const ny = dx / length;

  const sx = x1 + wobble(rand, jitter * 0.5);
  const sy = y1 + wobble(rand, jitter * 0.5);
  const ex = x2 + wobble(rand, jitter * 0.5);
  const ey = y2 + wobble(rand, jitter * 0.5);

  const push1 = bow + wobble(rand, jitter);
  const push2 = bow + wobble(rand, jitter);
  const c1x = x1 + dx / 3 + nx * push1;
  const c1y = y1 + dy / 3 + ny * push1;
  const c2x = x1 + (dx * 2) / 3 + nx * push2;
  const c2y = y1 + (dy * 2) / 3 + ny * push2;

  return (
    `M ${round(sx)} ${round(sy)} ` +
    `C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ` +
    `${round(ex)} ${round(ey)}`
  );
}

/**
 * A run of strokes through a list of points, as a single path.
 *
 * Kept as one path rather than a stroke per segment so the joins stay joins --
 * separate paths with round caps pile two caps on top of each other at every
 * corner and the corner goes fat.
 */
export function inkPath(
  points: readonly Point[],
  seed: number,
  { jitter = 1.1, bow = 0, close = false }: StrokeOptions & { close?: boolean } = {},
): string {
  if (points.length < 2) return "";
  const run = close ? [...points, points[0]] : points;
  const rand = seeded(seed);

  // The pen only lifts once, at the start, so every vertex after the first is
  // shared between the segment arriving and the segment leaving.
  const start: Point = [
    run[0][0] + wobble(rand, jitter * 0.5),
    run[0][1] + wobble(rand, jitter * 0.5),
  ];
  let cursor: Point = start;
  let d = `M ${round(start[0])} ${round(start[1])}`;

  for (let i = 1; i < run.length; i += 1) {
    const [tx, ty] = run[i];
    const isLast = i === run.length - 1;
    // A closed run has to come back to the *jittered* start, not the ideal
    // one, or `Z` snaps across a visible gap at the corner.
    const end: Point = close && isLast
      ? start
      : [tx + wobble(rand, jitter * 0.5), ty + wobble(rand, jitter * 0.5)];

    const dx = end[0] - cursor[0];
    const dy = end[1] - cursor[1];
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const push1 = bow + wobble(rand, jitter);
    const push2 = bow + wobble(rand, jitter);

    d +=
      ` C ${round(cursor[0] + dx / 3 + nx * push1)} ${round(cursor[1] + dy / 3 + ny * push1)}` +
      ` ${round(cursor[0] + (dx * 2) / 3 + nx * push2)} ${round(cursor[1] + (dy * 2) / 3 + ny * push2)}` +
      ` ${round(end[0])} ${round(end[1])}`;
    cursor = end;
  }

  return close ? `${d} Z` : d;
}

/**
 * A stroke that curves *through* its points instead of turning at them.
 *
 * `inkPath` puts a corner at every vertex, which is what you want for a frame
 * and exactly what you do not want for an arc: three points and a corner is a
 * chevron, not a bend. This is Catmull-Rom converted to cubics, so the tangent
 * is continuous across each point and a three-point arc reads as one sweep of
 * the wrist.
 */
export function inkCurve(
  points: readonly Point[],
  seed: number,
  { jitter = 1.1, tension = 1 }: StrokeOptions & { tension?: number } = {},
): string {
  if (points.length < 2) return "";
  const rand = seeded(seed);
  // Duplicate the endpoints so the first and last segments get a phantom
  // neighbour to take their tangent from.
  const run = [points[0], ...points, points[points.length - 1]];

  const start: Point = [
    points[0][0] + wobble(rand, jitter * 0.4),
    points[0][1] + wobble(rand, jitter * 0.4),
  ];
  let d = `M ${round(start[0])} ${round(start[1])}`;

  for (let i = 1; i < run.length - 2; i += 1) {
    const p0 = run[i - 1];
    const p1 = run[i];
    const p2 = run[i + 1];
    const p3 = run[i + 2];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension + wobble(rand, jitter);
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension + wobble(rand, jitter);
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension + wobble(rand, jitter);
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension + wobble(rand, jitter);
    const isLast = i === run.length - 3;
    const ex = p2[0] + (isLast ? wobble(rand, jitter * 0.4) : wobble(rand, jitter * 0.25));
    const ey = p2[1] + (isLast ? wobble(rand, jitter * 0.4) : wobble(rand, jitter * 0.25));
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(ex)} ${round(ey)}`;
  }
  return d;
}

/** A drawn box. Four strokes, none of them quite square to the others. */
export function inkBox(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  options: StrokeOptions = {},
): string {
  return inkPath(
    [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ],
    seed,
    { jitter: 1, bow: 0.5, ...options, close: true },
  );
}

/**
 * A drawn ellipse. Four quadrants, each with its own radius, so the result is
 * a shape someone meant to be round rather than one a compass made.
 */
export function inkEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  { jitter = 1.4 }: StrokeOptions = {},
): string {
  const rand = seeded(seed);
  // Circular-arc bezier constant. Bent slightly per quadrant below.
  const k = 0.5523;
  const points: Point[] = [
    [cx, cy - ry + wobble(rand, jitter)],
    [cx + rx + wobble(rand, jitter), cy],
    [cx, cy + ry + wobble(rand, jitter)],
    [cx - rx + wobble(rand, jitter), cy],
  ];

  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < 4; i += 1) {
    const from = points[i];
    const to = points[(i + 1) % 4];
    const kx = k * (1 + wobble(rand, 0.12));
    const ky = k * (1 + wobble(rand, 0.12));
    // Horizontal handle on the vertical extremes, vertical on the horizontal
    // ones -- that is what keeps the tangents flat where the curve turns over.
    const c1: Point = i % 2 === 0
      ? [from[0] + (to[0] - from[0]) * kx, from[1]]
      : [from[0], from[1] + (to[1] - from[1]) * ky];
    const c2: Point = i % 2 === 0
      ? [to[0], to[1] + (from[1] - to[1]) * ky]
      : [to[0] + (from[0] - to[0]) * kx, to[1]];
    d +=
      ` C ${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])}` +
      ` ${round(to[0])} ${round(to[1])}`;
  }
  return `${d} Z`;
}

/** Liang-Barsky, so hatch strokes stop at the edge of the region they shade. */
function clipToBox(
  from: Point,
  to: Point,
  x: number,
  y: number,
  width: number,
  height: number,
): [Point, Point] | null {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [from[0] - x, x + width - from[0], from[1] - y, y + height - from[1]];

  for (let i = 0; i < 4; i += 1) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
      continue;
    }
    const t = q[i] / p[i];
    if (p[i] < 0) {
      if (t > t1) return null;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return null;
      if (t < t1) t1 = t;
    }
  }

  return [
    [from[0] + dx * t0, from[1] + dy * t0],
    [from[0] + dx * t1, from[1] + dy * t1],
  ];
}

export type HatchOptions = StrokeOptions & {
  /** Distance between strokes, in user units. */
  gap?: number;
  /** Direction of the strokes in degrees. 45 runs up to the right. */
  angle?: number;
};

/**
 * Parallel strokes filling a box. Texture comes from these, never from a
 * gradient -- a gradient is a printing process this drawing does not have.
 */
export function hatchBox(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  { gap = 7, angle = 45, jitter = 0.9 }: HatchOptions = {},
): string[] {
  const radians = (angle * Math.PI) / 180;
  const dirX = Math.cos(radians);
  const dirY = -Math.sin(radians);
  // Step perpendicular to the stroke direction across the whole diagonal, so
  // the sweep covers the box at any angle without a special case.
  const stepX = -dirY;
  const stepY = dirX;
  const span = Math.hypot(width, height);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const strokes: string[] = [];
  const rand = seeded(seed);

  for (let offset = -span / 2; offset <= span / 2; offset += gap) {
    const ox = cx + stepX * offset;
    const oy = cy + stepY * offset;
    const clipped = clipToBox(
      [ox - dirX * span, oy - dirY * span],
      [ox + dirX * span, oy + dirY * span],
      x,
      y,
      width,
      height,
    );
    if (!clipped) continue;
    // Pull each stroke a little short of the boundary at a random end. Hatching
    // that lands exactly on the edge every time reads as a fill, not a hand.
    const shrink = rand() * 0.12;
    const [a, b] = clipped;
    const ax = a[0] + (b[0] - a[0]) * shrink;
    const ay = a[1] + (b[1] - a[1]) * shrink;
    strokes.push(
      inkLine([ax, ay], b, seed + strokes.length * 31 + 7, {
        jitter,
        bow: wobble(rand, 0.6),
      }),
    );
  }
  return strokes;
}

/**
 * Short strokes hanging from a curve down to a baseline -- the way a broadsheet
 * shades the area under a plotted line.
 */
export function hatchUnder(
  points: readonly Point[],
  baseline: number,
  seed: number,
  { gap = 9, jitter = 0.7 }: HatchOptions = {},
): string[] {
  if (points.length < 2) return [];
  const rand = seeded(seed);
  const strokes: string[] = [];
  const first = points[0][0];
  const last = points[points.length - 1][0];

  for (let x = first + gap * 0.6; x < last; x += gap) {
    // Walk the polyline for the y at this x. Sampling the drawn bezier would
    // be more exact and nobody would be able to tell.
    let y = points[0][1];
    for (let i = 1; i < points.length; i += 1) {
      const [px, py] = points[i - 1];
      const [qx, qy] = points[i];
      if (x >= px && x <= qx && qx !== px) {
        y = py + ((qy - py) * (x - px)) / (qx - px);
        break;
      }
    }
    if (y >= baseline - 2) continue;
    strokes.push(
      inkLine([x, y + 2], [x + wobble(rand, 2.5), baseline], seed + strokes.length * 17 + 3, {
        jitter,
      }),
    );
  }
  return strokes;
}

/**
 * A line of handwriting, at the size where handwriting stops being letters and
 * becomes a texture. This is the "greeked" script an illustrator draws when the
 * point is that something is written, not what it says.
 */
export function scriptLine(
  x: number,
  y: number,
  width: number,
  seed: number,
  { step = 7, amplitude = 3.2 }: { step?: number; amplitude?: number } = {},
): string {
  const rand = seeded(seed);
  const points: Point[] = [];
  let cursor = 0;
  let up = true;

  while (cursor <= width) {
    if (up) {
      // Up-strokes leave the baseline by wildly different amounts, and every
      // few letters one of them is an ascender. This is the whole difference
      // between writing and a sine wave: a wave is symmetric about its centre,
      // handwriting hangs off a line it keeps returning to.
      const roll = rand();
      const reach =
        roll > 0.84 ? amplitude * (1.7 + rand() * 0.6) : amplitude * (0.5 + rand() * 0.7);
      points.push([x + cursor, y - reach]);
    } else {
      // Back to the baseline, or just under it on the odd descender.
      const drop = rand() > 0.88 ? amplitude * 0.8 : rand() * 0.5;
      points.push([x + cursor, y + drop]);
    }
    cursor += step * (0.55 + rand() * 0.8);
    up = !up;
  }
  // Smoothed, so the marks join the way letters do rather than zigzagging.
  return inkCurve(points, seed + 991, { jitter: 0.35 });
}

/** A two-stroke arrowhead, pointing along `angle` degrees. */
export function arrowHead(
  at: Point,
  angle: number,
  seed: number,
  { size = 9, spread = 28 }: { size?: number; spread?: number } = {},
): string {
  const back = angle + 180;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const wing = (deg: number): Point => [
    at[0] + Math.cos(toRad(deg)) * size,
    at[1] + Math.sin(toRad(deg)) * size,
  ];
  return inkPath([wing(back - spread), at, wing(back + spread)], seed, {
    jitter: 0.5,
    bow: 0.4,
  });
}
