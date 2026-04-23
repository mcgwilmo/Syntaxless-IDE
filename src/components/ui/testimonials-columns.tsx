"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialsColumn({
  className = "",
  testimonials,
  duration = 18,
  isLight,
  inView = false,
  entranceDelay = 0,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  isLight: boolean;
  inView?: boolean;
  entranceDelay?: number;
}) {
  return (
    <div
      className={`w-full transition-[transform,opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        inView
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${entranceDelay}ms` }}
    >
      <div
        className="testimonial-scroll flex flex-col gap-5 pb-5"
        style={{ ["--scroll-duration" as string]: `${duration}s` } as CSSProperties}
      >
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex flex-col gap-5">
            {testimonials.map(({ text, image, name, role }) => (
              <article
                key={`${index}-${name}`}
                className={`group relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7 ${
                  isLight
                    ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,253,0.94))] shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
                    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.014))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)] backdrop-blur-sm"
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b opacity-60 ${
                    isLight
                      ? "from-cyan-100/70 via-sky-100/18 to-transparent"
                      : "from-cyan-400/16 via-sky-400/6 to-transparent"
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -left-[34%] top-0 h-full w-[28%] -skew-x-[16deg] bg-[linear-gradient(90deg,transparent,rgba(82,183,255,0.14),transparent)] animate-[cardSweep_8s_ease-in-out_infinite]" />
                </div>

                <div className="relative z-10">
                  <p
                    className={`text-[0.95rem] leading-7 ${
                      isLight ? "text-slate-700" : "text-neutral-200"
                    }`}
                  >
                    {text}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <Image
                      src={image}
                      alt={name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div>
                      <div
                        className={`text-sm font-semibold tracking-tight ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {name}
                      </div>
                      <div
                        className={`text-[0.78rem] uppercase tracking-[0.18em] ${
                          isLight ? "text-slate-500" : "text-cyan-100/55"
                        }`}
                      >
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
