"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";

export type OrbitalItem = {
  id: number;
  title: string;
  description: string;
  difficulty?: string;
  href?: string;
  relatedIds: number[];
  energy: number;
  kind: "lesson" | "coming-soon";
  icon: (props: { className?: string }) => React.JSX.Element;
};

interface RadialOrbitalTimelineProps {
  timelineData: OrbitalItem[];
}

type CircleProps = {
  className?: string;
  idx: number;
  style?: CSSProperties;
};

function Circle({ className, idx, style }: CircleProps) {
  return (
    <div
      className={cn(
        "radar-circle absolute rounded-full",
        className
      )}
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        ...style,
        animationDelay: `${idx * 80}ms`,
      }}
    />
  );
}

function Radar({
  className,
  isLight,
  style,
}: {
  className?: string;
  isLight: boolean;
  style?: CSSProperties;
}) {
  const circles = new Array(8).fill(null);
  const circleColor = isLight ? "15, 23, 42" : "71, 85, 105";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        className
      )}
      style={style}
    >
      <div
        style={{ transformOrigin: "right center" }}
        className="animate-radar-spin absolute right-1/2 top-1/2 z-40 flex h-[5px] w-[400px] items-end justify-center overflow-hidden bg-transparent"
      >
        <div
          className={cn(
            "relative z-40 h-px w-full bg-gradient-to-r from-transparent to-transparent",
            isLight ? "via-black/80" : "via-sky-400/85"
          )}
        />
      </div>

      {circles.map((_, idx) => (
        <Circle
          key={`circle-${idx}`}
          idx={idx}
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`,
            border: `1px solid rgba(${circleColor}, ${1 - (idx + 1) * 0.1})`,
          }}
        />
      ))}
    </div>
  );
}

function NodeShell({
  children,
  item,
}: {
  children: ReactNode;
  item: OrbitalItem;
}) {
  if (item.kind === "lesson" && item.href) {
    return (
      <Link
        href={item.href}
        aria-label={`Open ${item.title}`}
        className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
      >
        {children}
      </Link>
    );
  }

  return (
    <div aria-disabled="true" aria-label="Coming Soon" className="block">
      {children}
    </div>
  );
}

function IconContainer({
  item,
  delay,
  isLight,
}: {
  item: OrbitalItem;
  delay: number;
  isLight: boolean;
}) {
  const Icon = item.icon;
  const isLesson = item.kind === "lesson" && Boolean(item.href);
  const label = isLesson ? item.title : "Coming Soon";

  return (
    <NodeShell item={item}>
      <div
        className={cn(
          "radar-node relative z-50 flex w-[5.25rem] flex-col items-center justify-center gap-2 sm:w-[7.5rem] md:w-[10rem]",
          isLesson ? "cursor-pointer" : "cursor-default opacity-75"
        )}
        style={{ animationDelay: `${delay}s` }}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner transition-all duration-300",
            isLight
              ? "border-slate-300 bg-white text-slate-700 shadow-slate-200/70"
              : "border-slate-700 bg-slate-900 text-slate-400 shadow-black/30",
            isLesson &&
              (isLight
                ? "group-hover:border-slate-950 group-hover:text-slate-950 group-hover:shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                : "group-hover:border-sky-400/70 group-hover:text-sky-200 group-hover:shadow-[0_18px_36px_rgba(14,165,233,0.16)]")
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div
          className={cn(
            "hidden max-w-[10rem] rounded-md px-2 py-1 text-center text-xs font-bold leading-4 md:block",
            isLight ? "text-slate-700" : "text-slate-400"
          )}
        >
          {label}
        </div>
      </div>
    </NodeShell>
  );
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const { isLight } = useTheme();
  const rows = [
    timelineData.slice(0, 3),
    timelineData.slice(3, 5),
    timelineData.slice(5, 7),
  ];

  return (
    <div
      className={cn(
        "relative mx-auto flex h-[30rem] w-full max-w-5xl flex-col items-center justify-center overflow-hidden px-4",
        isLight ? "text-slate-900" : "text-white"
      )}
    >
      <div className="relative z-50 flex w-full max-w-3xl flex-col items-center justify-center gap-4">
        {rows.map((row, rowIndex) => (
          <div
            key={`radar-row-${rowIndex}`}
            className={cn(
              "mx-auto w-full",
              rowIndex === 1 ? "max-w-md" : "max-w-3xl"
            )}
          >
            <div className="flex w-full items-center justify-center gap-5 sm:gap-10 md:justify-between md:gap-0">
              {row.map((item, itemIndex) => (
                <IconContainer
                  key={item.id}
                  item={item}
                  isLight={isLight}
                  delay={0.16 + rowIndex * 0.16 + itemIndex * 0.08}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Radar
        className="absolute bottom-[-2.5rem]"
        isLight={isLight}
      />

      <style jsx global>{`
        @keyframes radar-spin {
          from {
            transform: rotate(20deg);
          }
          to {
            transform: rotate(380deg);
          }
        }

        @keyframes radar-circle-reveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes radar-node-reveal {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-radar-spin {
          animation: radar-spin 8s linear infinite;
        }

        .radar-circle {
          opacity: 0;
          animation: radar-circle-reveal 240ms ease-out both;
        }

        .radar-node {
          opacity: 0;
          animation: radar-node-reveal 260ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-radar-spin,
          .radar-node {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .radar-circle {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
