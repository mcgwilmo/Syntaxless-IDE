"use client";

import Image from "next/image";
import { useState } from "react";
import { BRAND } from "@/config/brand";
import { Button } from "@/design/primitives";
import { cn } from "@/lib/cn";

type InteractiveAccordionItem = {
  id: number;
  title: string;
  imageSrc: string;
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
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

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
          <h2 className="mt-[var(--space-3)] text-4xl font-bold leading-[0.95] tracking-[-0.045em] text-[var(--text-primary)] md:text-5xl">
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
                    "shadow-[var(--raised-lg)] hover:shadow-[var(--lifted)] active:shadow-[var(--pressed)]",
                    "hover:-translate-y-[var(--lift-travel)] active:translate-y-[var(--press-travel)]",
                    "motion-reduce:transform-none motion-reduce:hover:transform-none",
                    "motion-reduce:active:transform-none",
                    // One spring, on the width. The old version tweened five
                    // properties on a hand-written curve; a panel opening is a
                    // single physical motion and should read as one.
                    "transition-[width,box-shadow,transform,border-color]",
                    "duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]",
                    isActive
                      ? "w-[15rem] border-[var(--accent-border)] sm:w-[18rem] lg:w-[21rem]"
                      : "w-[3.8rem] border-[var(--border-subtle)] sm:w-[4.25rem]",
                  )}
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    sizes={
                      isActive
                        ? "(min-width: 1024px) 336px, (min-width: 640px) 288px, 240px"
                        : "(min-width: 640px) 68px, 61px"
                    }
                    className="object-cover"
                  />

                  {/* The collapsed rails are veiled and the open one is not.
                      That contrast is the whole selection signal here, since
                      every panel is otherwise the same material. */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 bg-[var(--surface-overlay)]",
                      "transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out)]",
                      isActive ? "opacity-0" : "opacity-100",
                    )}
                  />

                  {/* The photograph still has to sit under the page's light. The
                      sheen is what keeps it a panel rather than a picture
                      pasted on top of one. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[image:var(--material-sheen)]"
                  />

                  {/* The caption is a plate on the panel, not text on a photo:
                      an image can be any two colors it likes, so the label
                      brings its own surface and keeps its contrast in both
                      themes. Bottom in both states so the position springs
                      instead of jumping when the panel opens. */}
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
