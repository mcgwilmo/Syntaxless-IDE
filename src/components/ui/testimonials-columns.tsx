"use client";

import Image from "next/image";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

/*
 * Two props are gone from this component, and both removals are deliberate:
 *
 *   duration  set how long one loop of the perpetual upward scroll took. The
 *             loop is gone -- text that slides away while you are reading it is
 *             a cost with no benefit, and it had no pause control -- so each
 *             column now renders its testimonials once, statically.
 *   isLight   told the component which theme was active so it could pick
 *             colors. Colors come from tokens now, and tokens swap themselves.
 *
 * Removing the loop also removed the reason for the height cap and mask fade
 * that wrapped this component on the home page; both are gone from there too.
 */
export function TestimonialsColumn({
  className = "",
  testimonials,
  inView = false,
  entranceDelay = 0,
}: {
  className?: string;
  testimonials: Testimonial[];
  inView?: boolean;
  entranceDelay?: number;
}) {
  return (
    <div
      /* motion-reduce:translate-y-0, not motion-reduce:transform-none: Tailwind
         v4 compiles translate-y-* to the `translate` property, which
         `transform: none` does not cancel. The opacity fade stays -- a fade has
         no motion to reduce. */
      className={`w-full transition-[transform,opacity] duration-[720ms] ease-[var(--ease-out)] will-change-transform motion-reduce:translate-y-0 ${
        inView
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${entranceDelay}ms` }}
    >
      <div className="flex flex-col gap-[var(--space-5)]">
        {testimonials.map(({ text, image, name, role }) => (
          <article
            key={name}
            /* A quote is read, not pressed, so the card lies off the page on the
               card rung and stays put on hover.
               It also no longer answers the cursor with a swept band of light.
               That band was a -16deg gradient travelling across the card on a
               loop -- a second light source, and a moving one, over a card
               whose every other edge is lit from directly above. site-shell
               deleted the same treatment from the nav bar and named the reason
               there; docs/page.tsx deleted the decorative glows behind the
               changelog and cited tokens.css, which reserves the accent for
               interactive emphasis and says outright it is never decoration.
               The static top-down tint below is the card's own colour and
               stays. */
            className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] p-[var(--space-6)] shadow-[var(--raised-lg)] md:p-[var(--space-8)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--accent-subtle),transparent_60%)]" />

            <div className="relative z-10">
              <p className="text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                {text}
              </p>

              <div className="mt-[var(--space-6)] flex items-center gap-[var(--space-3)]">
                <Image
                  src={image}
                  alt={name}
                  width={44}
                  height={44}
                  /* The border seats the photo into the card instead of letting
                     it float as a cut-out; an inset shadow would paint over the
                     image itself. */
                  className="h-11 w-11 rounded-[var(--radius-full)] border border-[var(--border-subtle)] object-cover"
                />
                <div>
                  <div className="text-[length:var(--text-sm)] font-semibold tracking-tight text-[var(--text-primary)]">
                    {name}
                  </div>
                  <div className="text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                    {role}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
