"use client";

import Image from "next/image";
import { useState } from "react";
import { BRAND } from "@/config/brand";

type InteractiveAccordionItem = {
  id: number;
  title: string;
  imageSrc: string;
};

type InteractiveImageAccordionProps = {
  isLight: boolean;
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  items: InteractiveAccordionItem[];
};

export function InteractiveImageAccordion({
  isLight,
  title,
  description,
  ctaLabel,
  onCtaClick,
  items,
}: InteractiveImageAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

  return (
    <div className="relative px-6 py-8 md:px-8 md:py-10">
      <div
        className={`pointer-events-none absolute inset-x-[18%] top-1/2 h-56 -translate-y-1/2 rounded-full blur-3xl ${
          isLight
            ? "bg-[radial-gradient(circle,rgba(14,165,233,0.1),transparent_68%)]"
            : "bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_68%)]"
        }`}
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12">
        <div className="max-w-xl">
          <div
            className={`text-[9px] uppercase tracking-[0.24em] md:text-[10px] ${
              isLight ? "text-slate-500" : "text-neutral-500"
            }`}
          >
            Features
          </div>
          <h2
            className={`mt-3 text-4xl font-bold leading-[0.95] tracking-[-0.045em] md:text-5xl ${
              isLight ? "text-slate-950" : "text-white"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-5 max-w-lg text-[0.95rem] leading-7 ${
              isLight ? "text-slate-600" : "text-neutral-400"
            }`}
          >
            {description}
          </p>

          <button
            onClick={onCtaClick}
            className={`group relative mt-8 overflow-hidden rounded-full border px-6 py-3 text-sm uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_rgba(66,146,255,0)] transition-all duration-300 ${
              isLight
                ? "border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:text-slate-900 hover:shadow-[0_16px_32px_rgba(59,130,246,0.12)]"
                : "border-blue-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] text-neutral-300 hover:border-blue-300/28 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(66,146,255,0.07)]"
            }`}
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.05)_38%,rgba(23,111,255,0.15)_50%,rgba(23,223,255,0.12)_60%,rgba(255,255,255,0.05)_68%,transparent_82%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[metalSweep_1.15s_ease]" />
            <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.004))]" />
            <span className="relative z-10 transition-all duration-300 group-hover:tracking-[0.28em] group-hover:text-[#eef8ff]">
              {ctaLabel}
            </span>
          </button>
        </div>

        <div className="min-w-0">
          <div
            className="flex items-stretch justify-start gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                  className={`group relative h-[30rem] shrink-0 overflow-hidden rounded-[1.85rem] border transition-[width,transform,border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                    isActive
                      ? "w-[15rem] sm:w-[18rem] lg:w-[21rem]"
                      : "w-[3.8rem] sm:w-[4.25rem]"
                  } ${
                    isLight
                      ? "border-slate-200 bg-[linear-gradient(180deg,#111827,#0f172a_58%,#020617)] shadow-[0_18px_45px_rgba(15,23,42,0.16)] hover:border-slate-300"
                      : "border-white/[0.1] bg-[linear-gradient(180deg,rgba(4,10,22,0.9),rgba(1,5,16,0.96))] shadow-[0_24px_55px_rgba(0,0,0,0.28)] hover:border-cyan-300/20"
                  }`}
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
                  <div
                    className={`absolute inset-0 ${
                      isActive ? "bg-black/28" : "bg-black/44"
                    }`}
                  />
                  <div className="absolute inset-0 opacity-70">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_30%,transparent_70%,rgba(56,189,248,0.08))]" />
                    <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-white/10" />
                    <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                  </div>
                  <div className="absolute inset-[1px] rounded-[calc(1.85rem-1px)] border border-white/6" />

                  <span
                    className={`absolute text-white font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                      isActive
                        ? "bottom-6 left-1/2 -translate-x-1/2 text-base sm:text-lg"
                        : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-[0.95rem] sm:text-[1.02rem]"
                    }`}
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
