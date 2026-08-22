"use client";

import { useState, type ComponentType } from "react";
import { BRAND } from "@/config/brand";
import type { InkIllustrationProps } from "@/components/illustrations";
import { Button } from "@/design/primitives";
import { cn } from "@/lib/cn";

type InteractiveAccordionItem = {
  id: number;
  title: string;
  /* A drawing, not a file path. The illustration is inline SVG so it inherits
     the page's ink and accent tokens; an <img src="...svg"> is a separate
     document and could not see them, which is how these end up needing a baked
     hex and breaking one of the two themes. */
  Illustration: ComponentType<InkIllustrationProps>;
};

type InteractiveImageAccordionProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  items: InteractiveAccordionItem[];
};

export function InteractiveImageAccordion({
  title,
  description,
  ctaLabel,
  onCtaClick,
  items,
}: InteractiveImageAccordionProps) {
  /* Open the first panel, not the last. The strip is a horizontal scroller
     (`overflow-x-auto`) and below about 1024px it is wider than the viewport,
     so whichever panel is open at rest is the one the reader has to scroll to
     find. Defaulting to the end meant a 375px visitor met four closed rails
     and no drawing at all -- the section's only illustration parked off the
     right edge. First is also the reading order the labels already imply. */
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative px-[var(--space-6)] py-[var(--space-8)] md:px-[var(--space-8)] md:py-[var(--space-10)]">
      {/* Ambient wash behind the strip. The accent at its subtle strength is the
          only decorative color the section gets -- one accent, and it is warming
          the page rather than competing with the panels for attention. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[18%] top-1/2 h-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent-subtle),transparent_68%)] blur-3xl"
      />

      <div className="relative grid items-center gap-[var(--space-10)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-[var(--space-12)]">
        <div className="max-w-xl">
          <div className="text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
            Features
          </div>
          <h2 className="mt-[var(--space-3)] text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)] md:text-5xl">
            {title}
          </h2>
          {/* Muted, not soft: this paragraph can land on the page or on a card
              depending on the section around it, and soft has no headroom left
              against a raised surface in dark. */}
          <p className="mt-[var(--space-5)] max-w-lg text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
            {description}
          </p>

          {/* The same Button primitive, size and treatment as the hero call to
              action, because it is literally the same call to action. Nothing
              here overrides the primitive's own radius, padding or type: `cn`
              is a plain join, so a second `rounded-[...]` on the same element
              would leave the winner to stylesheet order rather than intent. */}
          <Button
            size="lg"
            onClick={onCtaClick}
            className="mt-[var(--space-8)] uppercase tracking-[var(--tracking-label)]"
          >
            {ctaLabel}
          </Button>
        </div>

        <div className="min-w-0">
          <div
            className="flex items-stretch justify-start gap-[var(--space-3)] overflow-x-auto pb-[var(--space-2)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={`${BRAND.name} feature previews`}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={item.title}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative h-[30rem] shrink-0 overflow-hidden rounded-[var(--radius-xl)] border",
                    // The panel behind the photograph, so a slow image never
                    // opens a hole in the strip.
                    "bg-[var(--surface-raised)]",
                    // Card rung: these are panels lifted off the page, not
                    // toolbar controls resting on it.
                    //
                    // So hover goes to --floating, not --lifted. --lifted is
                    // the hover of --raised and is a SMALLER shadow than
                    // --raised-lg: pairing it with an upward travel moved the
                    // panel toward the light while its shadow said it had
                    // dropped. Detaching is what rising means from this rung --
                    // same step the selected plan card takes in subscriptions.
                    "shadow-[var(--raised-lg)] hover:shadow-[var(--floating)] active:shadow-[var(--pressed)]",
                    "hover:-translate-y-[var(--lift-travel)] active:translate-y-[var(--press-travel)]",
                    "motion-reduce:transform-none motion-reduce:hover:transform-none",
                    "motion-reduce:active:transform-none",
                    // One spring, on the width. The old version tweened five
                    // properties on a hand-written curve; a panel opening is a
                    // single physical motion and should read as one.
                    "transition-[width,box-shadow,transform,border-color]",
                    "duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                    // The width is the motion here, and it is the biggest one
                    // on the page: a rail opening is 270px of travel that
                    // shoves four sibling panels sideways, and it fires on
                    // hover. `motion-reduce:transform-none` below does not
                    // touch it -- width is not a transform -- so the transition
                    // itself has to be narrowed. Shading and edge colour stay:
                    // those are how the strip says which panel is open, and a
                    // colour crossfade is not motion.
                    "motion-reduce:transition-[box-shadow,border-color]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]",
                    isActive
                      ? "w-[15rem] border-[var(--accent-border)] sm:w-[18rem] lg:w-[21rem]"
                      : "w-[3.8rem] border-[var(--border-subtle)] sm:w-[4.25rem]",
                  )}
                >
                  {/* The drawing is set into the panel rather than laid on it:
                      a sunken ground plus the recessed shading is the same well
                      the Learning Centre cards use, and line art needs a paper
                      that is not the same surface as the caption plate on top
                      of it. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[var(--surface-sunken)]"
                  />
                  {/* The drawing only exists in the open panel. A photograph
                      survived being cropped to a 60px rail -- it stayed a
                      picture of something. A line drawing cropped that far is a
                      handful of disconnected strokes, so the collapsed rails
                      show bare paper and their turned label instead. */}
                  <div
                    className={cn(
                      "absolute inset-0",
                      "transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out)]",
                      "motion-reduce:transition-none",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <item.Illustration
                      className="h-full w-full"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[var(--recessed)]"
                  />

                  {/* There is deliberately no veil over the collapsed rails.
                      The veil existed to hide a photograph; once the drawing
                      stopped rendering in the closed state there was nothing
                      left under it to hide, and all it still did was tint bare
                      paper. It was also reaching for --surface-overlay, which
                      is the modal scrim -- rgba(20, 26, 46, 0.45) in Academy.
                      Over --surface-sunken that composites to roughly
                      rgb(175, 180, 194) even at 60%, so every closed rail read
                      as a slate slab on the pale theme. Dark hid the problem
                      because its scrim is black on an almost-black well.
                      Selection is carried by the things that actually changed:
                      the width, --accent-border against --border-subtle, and
                      the label standing up instead of lying on its side. */}
                  {/* The drawing still has to sit under the page's light. The
                      sheen is what keeps it a panel rather than a picture
                      pasted on top of one. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[image:var(--material-sheen)]"
                  />

                  {/* The caption is a plate on the panel, not text on the
                      drawing: the label brings its own surface -- raised, one
                      rung above the sunken well behind the ink -- and keeps its
                      contrast in both themes. Bottom in both states so the
                      position springs instead of jumping when the panel
                      opens. */}
                  <span
                    className={cn(
                      "absolute left-1/2 whitespace-nowrap rounded-[var(--radius-sm)]",
                      "border border-[var(--border-subtle)] bg-[var(--surface-raised)]",
                      "px-[var(--space-3)] py-[var(--space-1)] font-semibold text-[var(--text-primary)]",
                      "text-[length:var(--text-sm)] sm:text-[length:var(--text-base)]",
                      "transition-[bottom,transform,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                      "motion-reduce:transition-none",
                      isActive
                        // Upright, so it can carry the material: the sheen and
                        // the raised edge both assume light from above.
                        ? "bottom-[var(--space-5)] -translate-x-1/2 bg-[image:var(--material-sheen)] shadow-[var(--raised)]"
                        // Turned on its side. A rotated element rotates its
                        // highlight and its cast shadow with it, which would
                        // light this one plate from the left while everything
                        // else on the page is lit from above -- so the
                        // collapsed label keeps only its surface and its edge.
                        : "bottom-1/2 -translate-x-1/2 translate-y-1/2 rotate-90",
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
