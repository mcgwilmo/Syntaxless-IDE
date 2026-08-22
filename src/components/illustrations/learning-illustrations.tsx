import {
  arrowHead,
  hatchBox,
  inkBox,
  inkCurve,
  inkEllipse,
  inkLine,
  inkPath,
  scriptLine,
} from "./ink";
import {
  Accent,
  INK_HAIR,
  INK_LIGHT,
  Ink,
  Plate,
  Texture,
  type InkIllustrationProps,
} from "./plate";

/**
 * The three drawings above the Learning Centre cards.
 *
 * Landscape, because these sit in a 4:3 well at the top of a card rather than
 * behind its text. Each has one subject and a lot of paper around it -- the
 * white space is doing as much work here as the line is.
 */
const TOPIC_VIEWBOX = "0 0 400 300";

/* -------------------------------------------------------------------------- */

/**
 * "Primitives and Logic" -- a value goes in, a question is asked about it, and
 * the answer decides which way the program goes. One decision, drawn once.
 */
export function PrimitivesInk(props: InkIllustrationProps) {
  const value = inkBox(26, 126, 62, 44, 71);
  const valueBar = inkLine([40, 148], [74, 148], 72, { jitter: 0.8 });
  const lead = inkLine([88, 148], [148, 148], 73, { jitter: 1, bow: 0.8 });

  // The condition. Four strokes, no two the same length, which is what stops a
  // diamond reading as an icon.
  const diamond = inkPath(
    [
      [196, 108],
      [244, 148],
      [196, 188],
      [148, 148],
    ],
    74,
    { jitter: 1.4, bow: 0.6, close: true },
  );

  const takenBranch = inkPath([[244, 148], [292, 148], [292, 86], [340, 86]], 75, {
    jitter: 1.2,
    bow: 1.4,
  });
  const takenHead = arrowHead([340, 86], 0, 76);
  const otherBranch = inkPath([[244, 148], [292, 148], [292, 212], [340, 212]], 77, {
    jitter: 1.2,
    bow: 1.4,
  });
  const otherHead = arrowHead([340, 212], 0, 78);

  const takenEnd = inkBox(346, 68, 34, 36, 79);
  const otherEnd = inkBox(346, 194, 34, 36, 80);
  const labels = [scriptLine(258, 128, 26, 81), scriptLine(258, 176, 22, 82)];

  return (
    <Plate title="A value entering a condition that branches two ways" viewBox={TOPIC_VIEWBOX} {...props}>
      <Texture paths={hatchBox(174, 130, 44, 36, 83, { gap: 7, angle: 55 })} opacity={0.2} />

      <Ink paths={[value, diamond]} />
      <Ink paths={[valueBar]} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={[lead]} strokeWidth={INK_LIGHT} />
      <Ink paths={[otherBranch, otherHead]} strokeWidth={INK_LIGHT} opacity={0.55} />
      <Ink paths={[takenEnd, otherEnd]} strokeWidth={INK_LIGHT} opacity={0.75} />
      <Texture paths={labels} strokeWidth={INK_HAIR} opacity={0.5} />
      <Accent paths={[takenBranch, takenHead]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

const CELL_X = 34;
const CELL_W = 46;
const CELL_Y = 140;
const CELL_H = 54;

/**
 * "Data Structures and Algorithms" -- a list mid-sort. The sorted run is shaded,
 * two cells are trading places, and the whole picture is the one thing an
 * algorithm actually is: a rule being applied to a structure.
 */
export function AlgorithmsInk(props: InkIllustrationProps) {
  const row = inkBox(CELL_X, CELL_Y, CELL_W * 7, CELL_H, 91);
  const dividers = [1, 2, 3, 4, 5, 6].map((index) =>
    inkLine(
      [CELL_X + CELL_W * index, CELL_Y],
      [CELL_X + CELL_W * index, CELL_Y + CELL_H],
      500 + index,
      { jitter: 1 },
    ),
  );

  const heights = [18, 26, 44, 22, 34, 12, 40];
  const bars = heights.map((height, index) => {
    const x = CELL_X + CELL_W * index + CELL_W / 2;
    const base = CELL_Y + CELL_H - 8;
    return inkLine([x, base], [x, base - height], 520 + index, { jitter: 0.6, bow: 0.5 });
  });

  const centreOf = (index: number) => CELL_X + CELL_W * index + CELL_W / 2;
  // Over the top one way and back underneath the other -- that is a swap, and
  // a single arrow would only have been a move.
  const overArc = inkCurve(
    [
      [centreOf(2), CELL_Y - 12],
      [centreOf(3), CELL_Y - 48],
      [centreOf(4), CELL_Y - 46],
      [centreOf(5), CELL_Y - 14],
    ],
    92,
    { jitter: 1.3 },
  );
  const overHead = arrowHead([centreOf(5), CELL_Y - 14], 55, 93);
  const underArc = inkCurve(
    [
      [centreOf(5), CELL_Y + CELL_H + 12],
      [centreOf(4), CELL_Y + CELL_H + 46],
      [centreOf(3), CELL_Y + CELL_H + 48],
      [centreOf(2), CELL_Y + CELL_H + 14],
    ],
    94,
    { jitter: 1.3 },
  );
  const underHead = arrowHead([centreOf(2), CELL_Y + CELL_H + 14], 235, 95);

  return (
    <Plate title="A list mid-sort with two elements trading places" viewBox={TOPIC_VIEWBOX} {...props}>
      {/* The settled part of the list. Cross-hatched, so "done" is a texture
          rather than a second colour. */}
      <Texture paths={hatchBox(CELL_X + 1, CELL_Y + 1, CELL_W * 2 - 2, CELL_H - 2, 96, { gap: 8, angle: 45 })} opacity={0.2} />
      <Texture paths={hatchBox(CELL_X + 1, CELL_Y + 1, CELL_W * 2 - 2, CELL_H - 2, 97, { gap: 8, angle: -45 })} opacity={0.14} />

      <Ink paths={[row]} />
      <Ink paths={dividers} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={bars} />
      <Accent paths={[overArc, overHead, underArc, underHead]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * "Start Coding Right Away" -- the gate is standing open and the path goes
 * straight through it, from the sentence you wrote to the program that ran.
 * Syntax is the gate, and the point of the card is that it is not shut.
 */
export function StartCodingInk(props: InkIllustrationProps) {
  const written = [
    scriptLine(22, 96, 92, 111),
    scriptLine(22, 120, 100, 112),
    scriptLine(22, 144, 66, 113),
  ];

  const leftPost = inkBox(168, 84, 14, 132, 114);
  const rightPost = inkBox(246, 84, 14, 132, 115);
  // The arch springs from the centre of each pier, not from the ground beyond
  // them -- landing it outside the posts left two stubs poking up past it.
  const lintel = inkCurve(
    [[175, 88], [192, 72], [214, 65], [236, 72], [253, 88]],
    116,
    { jitter: 1.2 },
  );
  // The leaf, swung back out of the way. Drawn light, because it is the thing
  // that is no longer in the picture's way.
  const leaf = inkPath(
    [
      [168, 96],
      [136, 80],
      [136, 202],
      [168, 208],
    ],
    117,
    { jitter: 1.2, close: true },
  );
  // Two rails across it, or the quadrilateral is just a quadrilateral.
  const leafRails = [
    inkLine([137, 118], [167, 130], 126, { jitter: 0.6 }),
    inkLine([137, 166], [167, 174], 127, { jitter: 0.6 }),
  ];

  const ground = inkLine([18, 218], [382, 218], 118, { jitter: 1.4 });
  // Dashes stepping through the opening, none of them the same length. The two
  // that would land on a gatepost are dropped rather than drawn over it -- the
  // path goes behind the gate, and a dash crossing a post would say it went in
  // front, which is the wrong side of a thing you are walking through.
  const posts: Array<[number, number]> = [
    [168, 182],
    [246, 260],
  ];
  const trail = Array.from({ length: 12 }, (_, index) => {
    const x = 26 + index * 30;
    const width = 12 + (index % 3) * 3;
    const y = 204 + (index % 2 === 0 ? 0 : 2);
    const behindPost = posts.some(([from, to]) => x < to && x + width > from);
    return behindPost ? null : inkLine([x, y], [x + width, y], 540 + index, { jitter: 0.7 });
  }).filter((d): d is string => d !== null);

  const outputFrame = inkBox(288, 96, 90, 84, 119);
  const windowRule = inkLine([288, 116], [378, 116], 120, { jitter: 1 });
  const windowLines = [134, 150, 166].map((y, index) =>
    inkLine([300, y], [300 + (index === 1 ? 44 : 60), y], 560 + index, { jitter: 0.7 }),
  );
  const runMark = inkEllipse(298, 106, 4.2, 4, 121, { jitter: 0.6 });
  const caret = inkLine([366, 158], [366, 174], 122, { jitter: 0.4 });

  return (
    <Plate title="A path running through an open gate from a written note to a running program" viewBox={TOPIC_VIEWBOX} {...props}>
      <Texture paths={hatchBox(169, 86, 12, 128, 123, { gap: 8, angle: 78 })} opacity={0.22} />
      <Texture paths={hatchBox(247, 86, 12, 128, 124, { gap: 8, angle: 78 })} opacity={0.22} />
      <Texture paths={hatchBox(286, 182, 94, 14, 125, { gap: 6, angle: 62 })} opacity={0.2} />

      <Ink paths={written} strokeWidth={INK_LIGHT} opacity={0.8} />
      <Ink paths={[leaf]} strokeWidth={INK_LIGHT} opacity={0.6} />
      <Ink paths={leafRails} strokeWidth={INK_HAIR} opacity={0.45} />
      <Ink paths={[leftPost, rightPost, lintel]} />
      <Ink paths={[ground]} strokeWidth={INK_HAIR} opacity={0.45} />
      <Ink paths={[outputFrame]} strokeWidth={INK_LIGHT} />
      <Ink paths={[windowRule, runMark]} strokeWidth={INK_HAIR} opacity={0.6} />
      <Ink paths={windowLines} strokeWidth={INK_HAIR} opacity={0.7} />
      <Accent paths={trail} strokeWidth={INK_LIGHT} />
      <Accent paths={[caret]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}
