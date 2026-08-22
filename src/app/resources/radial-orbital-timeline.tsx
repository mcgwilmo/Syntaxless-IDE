"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
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
        "radar-circle absolute rounded-[var(--radius-full)]",
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
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const circles = new Array(8).fill(null);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-[var(--radius-full)]",
        className
      )}
      style={style}
    >
      {/*
       * The sweep is a fixed bearing, not a rotation. A line that circles the
       * page forever pulls the eye away from the nodes it is meant to sit
       * behind, and there is nothing being scanned for it to report.
       */}
      <div
        style={{ transformOrigin: "right center", transform: "rotate(20deg)" }}
        className="absolute right-1/2 top-1/2 z-40 flex h-[5px] w-[400px] items-end justify-center overflow-hidden bg-transparent"
      >
        <div className="relative z-40 h-px w-full bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
      </div>

      {circles.map((_, idx) => (
        <Circle
          key={`circle-${idx}`}
          idx={idx}
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`,
            /* Rings thin out as they travel from the centre, so the field
               fades into the page instead of ending on a hard outer edge. */
            border: `1px solid color-mix(in srgb, var(--border-strong) ${
              100 - idx * 11
            }%, transparent)`,
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
        className="group block rounded-[var(--radius-lg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
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

function IconContainer({ item, delay }: { item: OrbitalItem; delay: number }) {
  const Icon = item.icon;
  const isLesson = item.kind === "lesson" && Boolean(item.href);
  const label = isLesson ? item.title : "Coming Soon";

  return (
    <NodeShell item={item}>
      <div
        className={cn(
          "radar-node relative z-50 flex w-[5.25rem] flex-col items-center justify-center gap-[var(--space-2)] sm:w-[7.5rem] md:w-[10rem]",
          // Unavailable is said by the tile's material and by the label text,
          // not by fading the node: a blanket opacity took the Coming Soon
          // label to 3.74:1 on the light page, under AA for the one word that
          // has to be readable.
          isLesson ? "cursor-pointer" : "cursor-default"
        )}
        style={{ animationDelay: `${delay}s` }}
      >
        {/*
         * An accent wash under an openable node, not a second light source --
         * it stays far below the tile's own shading and only answers hover.
         */}
        {isLesson && (
          <div
            aria-hidden="true"
            className="absolute top-1 h-16 w-16 rounded-[var(--radius-full)] bg-[var(--accent-solid)] opacity-10 blur-xl transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:opacity-20"
          />
        )}

        <div
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border",
            "transition-[background-color,box-shadow,transform,color]",
            "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
            isLesson
              ? cn(
                  // A lesson tile is the pressable object on this page: it rests
                  // on the page, rises toward the light on hover, and goes down
                  // and in when held.
                  //
                  // The sheen belongs to raised material only. It is a top-lit
                  // falloff, so putting it on something set INTO the page would
                  // light the tile from above while its shadow says it is below
                  // -- two contradictory light sources on one object.
                  "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--accent-text)]",
                  "shadow-[var(--raised)]",
                  "group-hover:shadow-[var(--lifted)] group-hover:-translate-y-[var(--lift-travel)]",
                  "group-active:shadow-[var(--pressed)] group-active:translate-y-[var(--press-travel)]",
                  "motion-reduce:transform-none motion-reduce:group-hover:transform-none",
                  "motion-reduce:group-active:transform-none"
                )
              : // Coming Soon has nothing behind it, so it is set into the page
                // rather than sitting on it -- inlaid reads, raised invites.
                "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)] shadow-[var(--inlaid)]"
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div
          className={cn(
            "hidden max-w-[10rem] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[var(--space-1)] text-center text-[length:var(--text-xs)] font-semibold leading-[var(--leading-snug)] md:block",
            isLesson ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
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
  const rows = [
    timelineData.slice(0, 3),
    timelineData.slice(3, 5),
    timelineData.slice(5, 7),
  ];

  return (
    <div className="relative mx-auto flex h-[30rem] w-full max-w-5xl flex-col items-center justify-center overflow-hidden px-[var(--space-4)] text-[var(--text-primary)]">
      <div className="relative z-50 flex w-full max-w-3xl flex-col items-center justify-center gap-[var(--space-4)]">
        {rows.map((row, rowIndex) => (
          <div
            key={`radar-row-${rowIndex}`}
            className={cn(
              "mx-auto w-full",
              rowIndex === 1 ? "max-w-md" : "max-w-3xl"
            )}
          >
            <div className="flex w-full items-center justify-center gap-[var(--space-5)] sm:gap-[var(--space-10)] md:justify-between md:gap-0">
              {row.map((item, itemIndex) => (
                <IconContainer
                  key={item.id}
                  item={item}
                  delay={0.16 + rowIndex * 0.16 + itemIndex * 0.08}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Radar className="absolute bottom-[-2.5rem]" />

      <style jsx global>{`
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

        /* Both reveals run once on mount and settle. Nothing here loops. */
        .radar-circle {
          opacity: 0;
          animation: radar-circle-reveal var(--duration-slow) var(--ease-out) both;
        }

        .radar-node {
          opacity: 0;
          animation: radar-node-reveal var(--duration-slow) var(--ease-spring) both;
        }

        @media (prefers-reduced-motion: reduce) {
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
