import {
  arrowHead,
  hatchBox,
  inkCurve,
  hatchUnder,
  inkBox,
  inkEllipse,
  inkLine,
  inkPath,
  scriptLine,
  type Point,
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
 * The five drawings behind the feature accordion.
 *
 * They share a portrait plate because the accordion panel is one: 21rem by
 * 30rem when open, which is 0.70, and 320x460 is 0.696. Close enough that
 * `slice` crops a hair off the sides and nothing important leaves the frame.
 *
 * Each one illustrates the sentence next to it and nothing else. A drawing that
 * tries to say five things at this size says none of them.
 */
const FEATURE_VIEWBOX = "0 0 320 460";

/** Content bars -- the greeked code that stands in for a line of a program. */
function codeBar(x: number, y: number, width: number, seed: number): string {
  return inkLine([x, y], [x + width, y], seed, { jitter: 0.9, bow: 0.5 });
}

/* -------------------------------------------------------------------------- */

/**
 * "Simple Program Creation" -- you write the sentence, the program comes back.
 * One sheet, the fold between the two halves, and the accent turning the corner
 * from handwriting into code.
 */
export function ProgramCreationInk(props: InkIllustrationProps) {
  const sheet = inkBox(46, 54, 228, 352, 11);
  const fold = inkLine([70, 222], [250, 222], 12, { jitter: 1.8, bow: 0.8 });

  const written = [
    scriptLine(74, 112, 166, 101),
    scriptLine(74, 140, 174, 102),
    scriptLine(74, 168, 148, 103),
    scriptLine(74, 196, 92, 104),
  ];

  const code: Array<[number, number, number]> = [
    [74, 254, 118],
    [90, 276, 92],
    [90, 298, 132],
    [106, 320, 74],
    [90, 342, 104],
    [74, 364, 82],
  ];
  const codeLines = code.map(([x, y, width], index) => codeBar(x, y, width, 120 + index));
  const gutter = code.map(([, y], index) =>
    inkLine([62, y], [66, y], 140 + index, { jitter: 0.4 }),
  );

  // The turn from prose to program. It is the only thing on the sheet that
  // moves, so it is the only thing that gets the accent.
  const turn = inkCurve([[234, 192], [266, 216], [240, 248]], 150, { jitter: 1 });
  const turnHead = arrowHead([240, 248], 129, 151);
  const caret = inkLine([164, 356], [164, 372], 152, { jitter: 0.5 });

  return (
    <Plate title="A handwritten sentence turning into lines of code" viewBox={FEATURE_VIEWBOX} {...props}>
      {/* Cast shadow, hatched. A drop shadow here would be a gradient, and a
          gradient is a printing process this drawing does not have. */}
      <Texture paths={hatchBox(274, 66, 11, 352, 15, { gap: 5, angle: 68 })} opacity={0.3} />
      <Texture paths={hatchBox(58, 406, 227, 10, 16, { gap: 5, angle: 68 })} opacity={0.3} />

      <Ink paths={[sheet]} />
      <Ink paths={written} strokeWidth={INK_LIGHT} opacity={0.85} />
      <Ink paths={[fold]} strokeWidth={INK_HAIR} opacity={0.5} />
      <Ink paths={codeLines} strokeWidth={INK_LIGHT} />
      <Texture paths={gutter} strokeWidth={INK_LIGHT} opacity={0.55} />
      <Accent paths={[turn, turnHead, caret]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * "Intuitive Interface" -- the whole workspace readable at a glance: what you
 * wrote on the left, what it did on the right, and the caret telling you where
 * you are.
 */
export function InterfaceInk(props: InkIllustrationProps) {
  const frame = inkBox(38, 80, 244, 300, 21);
  const titleRule = inkLine([38, 112], [282, 112], 22, { jitter: 1.2 });
  const split = inkLine([190, 112], [190, 380], 23, { jitter: 1.6 });
  const lamps = [
    inkEllipse(58, 96, 4.6, 4.2, 24),
    inkEllipse(74, 96, 4.4, 4.6, 25),
    inkEllipse(90, 96, 4.8, 4.3, 26),
  ];

  const editor: Array<[number, number, number]> = [
    [62, 144, 92],
    [62, 168, 68],
    [74, 192, 84],
    [74, 216, 62],
    [86, 240, 70],
    [74, 264, 54],
    [62, 288, 88],
    [62, 312, 46],
  ];
  const editorLines = editor.map(([x, y, width], index) => codeBar(x, y, width, 220 + index));
  const numbers = editor.map(([, y], index) =>
    inkLine([48, y], [52, y], 240 + index, { jitter: 0.4 }),
  );

  const resultFrame = inkBox(202, 142, 68, 52, 27);
  const resultLines = [
    codeBar(212, 158, 44, 260),
    codeBar(212, 172, 32, 261),
    codeBar(212, 186, 48, 262),
  ];
  const outputLines = [
    codeBar(202, 226, 62, 270),
    codeBar(202, 246, 48, 271),
    codeBar(202, 266, 68, 272),
    codeBar(202, 286, 40, 273),
  ];

  // The active line: one underline and one caret. That pair is the whole "you
  // are here", and it is the only accent in the frame.
  const activeRule = inkLine([74, 224], [136, 224], 280, { jitter: 0.6 });
  const caret = inkLine([140, 208], [140, 224], 281, { jitter: 0.4 });

  return (
    <Plate title="A code editor beside the output it produced" viewBox={FEATURE_VIEWBOX} {...props}>
      {/* Only the empty tail of the output pane is shaded. Hatching the whole
          pane sat a second texture on top of the very lines the drawing is
          about, and made the workspace look busy in a picture whose entire
          claim is that it is not. */}
      <Texture paths={hatchBox(194, 306, 84, 70, 28, { gap: 9, angle: 62 })} opacity={0.16} />
      <Texture paths={hatchBox(39, 81, 242, 30, 29, { gap: 9, angle: 20 })} opacity={0.07} />

      <Ink paths={[frame]} />
      <Ink paths={[titleRule]} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={lamps} strokeWidth={INK_LIGHT} opacity={0.75} />
      <Ink paths={[split]} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={editorLines} strokeWidth={INK_LIGHT} />
      <Texture paths={numbers} strokeWidth={INK_LIGHT} opacity={0.5} />
      <Ink paths={[resultFrame]} strokeWidth={INK_LIGHT} opacity={0.8} />
      <Ink paths={resultLines} strokeWidth={INK_HAIR} opacity={0.7} />
      <Ink paths={outputLines} strokeWidth={INK_HAIR} opacity={0.7} />
      <Accent paths={[activeRule, caret]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * "AI Assisted Problem Solving" -- marginalia. Someone has read your working,
 * ringed the step that went wrong, and written a note about it in the margin.
 * That is the promise, and it is a much more honest picture of it than a robot.
 */
export function ProblemSolvingInk(props: InkIllustrationProps) {
  const steps = [100, 140, 180, 220, 260];
  const widths = [108, 92, 122, 86, 104];
  const markers = steps.map((y, index) => inkBox(56, y - 8, 15, 15, 300 + index));
  const bars = steps.map((y, index) => codeBar(84, y, widths[index], 320 + index));

  const ring = inkEllipse(132, 180, 82, 22, 340, { jitter: 2.2 });
  const leader = inkCurve([[214, 184], [252, 240], [198, 300], [172, 322]], 341, { jitter: 1.1 });
  const leaderHead = arrowHead([172, 322], 140, 342, { size: 10 });

  const bracket = inkPath([[160, 336], [150, 340], [150, 414], [160, 418]], 343, { jitter: 0.8 });
  const note = [
    scriptLine(168, 356, 118, 344),
    scriptLine(168, 380, 124, 345),
    scriptLine(168, 404, 84, 346),
  ];
  // A drawn asterisk: three strokes crossing, none of them through the middle
  // at quite the same place.
  const asterisk = [
    inkLine([134, 342], [146, 354], 347, { jitter: 0.5 }),
    inkLine([146, 342], [134, 354], 348, { jitter: 0.5 }),
    inkLine([140, 340], [140, 356], 349, { jitter: 0.5 }),
  ];

  return (
    <Plate title="A column of steps with one ringed and annotated in the margin" viewBox={FEATURE_VIEWBOX} {...props}>
      {/* Shading under the note rather than behind it. Hatching the block
          itself put a second texture straight through the writing and turned
          the aside into the loudest thing on the page. */}
      <Texture paths={hatchBox(158, 422, 138, 12, 350, { gap: 5, angle: 64 })} opacity={0.28} />

      <Ink paths={markers} strokeWidth={INK_LIGHT} opacity={0.8} />
      <Ink paths={bars} strokeWidth={INK_LIGHT} />
      <Ink paths={[bracket]} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={note} strokeWidth={INK_HAIR} opacity={0.75} />
      <Accent paths={[ring, leader, leaderHead]} strokeWidth={INK_LIGHT} />
      <Accent paths={asterisk} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

const PLOT_CURVE: Point[] = [
  [78, 332],
  [110, 302],
  [142, 308],
  [174, 252],
  [206, 220],
  [238, 170],
  [268, 142],
];

/**
 * "Plot and Image Creation" -- a plotted series on drawn axes, shaded the way a
 * broadsheet shades one: strokes hanging off the curve, not a tint under it.
 */
export function PlotInk(props: InkIllustrationProps) {
  const yAxis = inkLine([70, 92], [70, 368], 41, { jitter: 1.4 });
  const xAxis = inkLine([70, 368], [282, 368], 42, { jitter: 1.4 });
  const yTicks = [124, 172, 220, 268, 316].map((y, index) =>
    inkLine([63, y], [70, y], 400 + index, { jitter: 0.5 }),
  );
  const xTicks = [110, 152, 194, 236, 268].map((x, index) =>
    inkLine([x, 368], [x, 375], 420 + index, { jitter: 0.5 }),
  );

  const curve = inkCurve(PLOT_CURVE, 43, { jitter: 1.4 });
  const baseline = inkCurve(
    [
      [78, 352],
      [122, 346],
      [166, 338],
      [214, 332],
      [268, 320],
    ],
    44,
    { jitter: 1.1 },
  );
  const points = [PLOT_CURVE[1], PLOT_CURVE[3], PLOT_CURVE[5], PLOT_CURVE[6]].map(
    ([x, y], index) => inkEllipse(x, y, 4.2, 3.9, 440 + index, { jitter: 0.7 }),
  );

  return (
    <Plate title="A plotted curve on hand-drawn axes, shaded with hatching" viewBox={FEATURE_VIEWBOX} {...props}>
      <Texture paths={hatchUnder(PLOT_CURVE, 366, 45, { gap: 9 })} opacity={0.24} />

      <Ink paths={[yAxis, xAxis]} />
      <Texture paths={[...yTicks, ...xTicks]} strokeWidth={INK_LIGHT} opacity={0.6} />
      <Ink paths={[baseline]} strokeWidth={INK_HAIR} opacity={0.5} />
      <Ink paths={[curve]} />
      <Accent paths={points} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * "Customizable IDE" -- a pane out of its slot and on its way somewhere else,
 * with the empty slot left dashed behind it. The controls underneath are there
 * to say the layout is yours, not to be operated.
 */
export function CustomizeInk(props: InkIllustrationProps) {
  const frame = inkBox(38, 74, 244, 250, 51);
  const titleRule = inkLine([38, 104], [282, 104], 52, { jitter: 1.2 });
  const leftPane = inkBox(52, 118, 100, 190, 53);
  const topRight = inkBox(164, 118, 104, 84, 54);
  const slot = inkBox(164, 216, 104, 92, 55);

  const leftContent = [140, 160, 180, 200, 220, 240].map((y, index) =>
    codeBar(64, y, index % 2 === 0 ? 74 : 56, 460 + index),
  );
  const topRightContent = [140, 158, 176].map((y, index) =>
    codeBar(176, y, index === 1 ? 58 : 78, 470 + index),
  );

  // The pane in transit, rotated off square. Rotation is a transform on the
  // group rather than baked into the coordinates, so the stroke stays one
  // weight all the way round.
  const lifted = inkBox(184, 262, 104, 92, 56);
  const liftedContent = [284, 302, 320].map((y, index) =>
    codeBar(196, y, index === 2 ? 52 : 76, 480 + index),
  );

  const sliderA = inkLine([58, 396], [238, 396], 57, { jitter: 1.1 });
  const sliderB = inkLine([58, 428], [238, 428], 58, { jitter: 1.1 });
  const knobA = inkEllipse(168, 396, 9, 8.4, 59, { jitter: 0.8 });
  const knobB = inkEllipse(104, 428, 8.6, 8.8, 60, { jitter: 0.8 });
  const toggle = inkBox(254, 388, 42, 17, 61);
  const toggleKnob = inkEllipse(285, 396, 7.4, 7, 62, { jitter: 0.6 });

  return (
    <Plate title="A workspace pane lifted out of its slot, with layout controls below" viewBox={FEATURE_VIEWBOX} {...props}>
      <Texture paths={hatchBox(166, 218, 100, 88, 63, { gap: 11, angle: 45 })} opacity={0.14} />
      <Texture paths={hatchBox(39, 75, 242, 28, 64, { gap: 9, angle: 20 })} opacity={0.08} />

      <Ink paths={[frame]} />
      <Ink paths={[titleRule]} strokeWidth={INK_LIGHT} opacity={0.7} />
      <Ink paths={[leftPane, topRight]} strokeWidth={INK_LIGHT} opacity={0.85} />
      <Ink paths={leftContent} strokeWidth={INK_HAIR} opacity={0.65} />
      <Ink paths={topRightContent} strokeWidth={INK_HAIR} opacity={0.65} />
      {/* The empty slot, dashed: the pane is not there any more. */}
      <Ink paths={[slot]} strokeWidth={INK_LIGHT} opacity={0.45} strokeDasharray="8 8" />

      <g transform="rotate(-6 236 308)">
        <Accent paths={[lifted]} strokeWidth={INK_LIGHT} />
        <Ink paths={liftedContent} strokeWidth={INK_LIGHT} opacity={0.8} />
      </g>

      <Ink paths={[sliderA, sliderB]} strokeWidth={INK_HAIR} opacity={0.55} />
      <Ink paths={[knobA, toggle]} strokeWidth={INK_LIGHT} opacity={0.8} />
      <Accent paths={[knobB, toggleKnob]} strokeWidth={INK_LIGHT} />
    </Plate>
  );
}
