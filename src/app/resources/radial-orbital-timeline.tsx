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

const NODE_TONES = [
  {
    light: {
      icon: "border-cyan-300 bg-cyan-50 text-cyan-700 shadow-cyan-200/70",
      glow: "bg-cyan-300/30",
      label: "text-cyan-800",
      hover:
        "group-hover:border-cyan-500 group-hover:text-cyan-900 group-hover:shadow-[0_18px_38px_rgba(8,145,178,0.22)]",
    },
    dark: {
      icon: "border-cyan-400/45 bg-cyan-400/10 text-cyan-200 shadow-cyan-950/40",
      glow: "bg-cyan-400/18",
      label: "text-cyan-200",
      hover:
        "group-hover:border-cyan-300/80 group-hover:text-cyan-100 group-hover:shadow-[0_18px_38px_rgba(34,211,238,0.2)]",
    },
  },
  {
    light: {
      icon: "border-violet-300 bg-violet-50 text-violet-700 shadow-violet-200/70",
      glow: "bg-violet-300/28",
      label: "text-violet-800",
      hover:
        "group-hover:border-violet-500 group-hover:text-violet-900 group-hover:shadow-[0_18px_38px_rgba(124,58,237,0.2)]",
    },
    dark: {
      icon: "border-violet-400/45 bg-violet-400/10 text-violet-200 shadow-violet-950/40",
      glow: "bg-violet-400/18",
      label: "text-violet-200",
      hover:
        "group-hover:border-violet-300/80 group-hover:text-violet-100 group-hover:shadow-[0_18px_38px_rgba(167,139,250,0.18)]",
    },
  },
  {
    light: {
      icon: "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-emerald-200/70",
      glow: "bg-emerald-300/28",
      label: "text-emerald-800",
      hover:
        "group-hover:border-emerald-500 group-hover:text-emerald-900 group-hover:shadow-[0_18px_38px_rgba(5,150,105,0.2)]",
    },
    dark: {
      icon: "border-emerald-400/45 bg-emerald-400/10 text-emerald-200 shadow-emerald-950/40",
      glow: "bg-emerald-400/16",
      label: "text-emerald-200",
      hover:
        "group-hover:border-emerald-300/80 group-hover:text-emerald-100 group-hover:shadow-[0_18px_38px_rgba(52,211,153,0.17)]",
    },
  },
  {
    light: {
      icon: "border-amber-300 bg-amber-50 text-amber-700 shadow-amber-200/70",
      glow: "bg-amber-300/28",
      label: "text-amber-800",
      hover:
        "group-hover:border-amber-500 group-hover:text-amber-900 group-hover:shadow-[0_18px_38px_rgba(217,119,6,0.2)]",
    },
    dark: {
      icon: "border-amber-400/45 bg-amber-400/10 text-amber-200 shadow-amber-950/40",
      glow: "bg-amber-400/16",
      label: "text-amber-200",
      hover:
        "group-hover:border-amber-300/80 group-hover:text-amber-100 group-hover:shadow-[0_18px_38px_rgba(251,191,36,0.17)]",
    },
  },
  {
    light: {
      icon: "border-rose-300 bg-rose-50 text-rose-700 shadow-rose-200/70",
      glow: "bg-rose-300/26",
      label: "text-rose-800",
      hover:
        "group-hover:border-rose-500 group-hover:text-rose-900 group-hover:shadow-[0_18px_38px_rgba(225,29,72,0.18)]",
    },
    dark: {
      icon: "border-rose-400/45 bg-rose-400/10 text-rose-200 shadow-rose-950/40",
      glow: "bg-rose-400/16",
      label: "text-rose-200",
      hover:
        "group-hover:border-rose-300/80 group-hover:text-rose-100 group-hover:shadow-[0_18px_38px_rgba(251,113,133,0.16)]",
    },
  },
] as const;

function getNodeTone(item: OrbitalItem, isLight: boolean) {
  return NODE_TONES[(item.id - 1) % NODE_TONES.length][isLight ? "light" : "dark"];
}

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
  const tone = getNodeTone(item, isLight);

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
          aria-hidden="true"
          className={cn(
            "absolute top-1 h-16 w-16 rounded-full blur-xl transition-opacity duration-300",
            tone.glow,
            isLesson ? "opacity-80 group-hover:opacity-100" : "opacity-45"
          )}
        />

        <div
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner transition-all duration-300",
            tone.icon,
            isLesson && tone.hover
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div
          className={cn(
            "hidden max-w-[10rem] rounded-md px-2 py-1 text-center text-xs font-bold leading-4 md:block",
            tone.label,
            !isLesson && (isLight ? "opacity-70" : "opacity-65")
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
