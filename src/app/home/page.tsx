"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import {
  SubscriptionTier,
  getOrCreateSubscription,
  SUBSCRIPTION_META,
} from "@/lib/subscriptions";
import {
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/testimonials-columns";
import { InteractiveImageAccordion } from "@/components/ui/interactive-image-accordion";
import {
  AlgorithmsInk,
  CustomizeInk,
  InterfaceInk,
  PlotInk,
  PrimitivesInk,
  ProblemSolvingInk,
  ProgramCreationInk,
  StartCodingInk,
} from "@/components/illustrations";
import { SiteFooter } from "@/components/site-footer";
import { AppPageBackground, SiteHeader } from "@/components/site-shell";
import { Button } from "@/design/primitives";
import { BRAND } from "@/config/brand";

import { HeroDemo } from "./hero-demo";

const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";

const testimonials: Testimonial[] = [
  {
    text: `${BRAND.name} helped our students focus on the logic behind simple programs first, then read the generated Python to understand how each step was expressed in code.`,
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Programming Instructor",
  },
  {
    text: "It is a great fit for beginner-friendly exercises. Learners can describe loops, conditions, and list operations in plain language and still see real structure on the other side.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "CS Teaching Assistant",
  },
  {
    text: "What stood out most was how clearly it supports algorithm practice. It is not pretending to build full production apps, it is helping people think through problems carefully.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Curriculum Designer",
  },
  {
    text: `Most coding tools push people toward fast output. ${BRAND.name} feels better for learning because it keeps the focus on reasoning, checking steps, and understanding the result.`,
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "Algorithms Tutor",
  },
  {
    text: `We used ${BRAND.name} during a workshop and students were solving small problem sets within minutes. Writing the instructions in plain English made the jump into coding feel much less intimidating.`,
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "STEM Workshop Facilitator",
  },
  {
    text: "The browser-based setup removed most of the friction for first-time learners. They could start practicing logic problems right away instead of getting stuck on setup.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Learning Experience Researcher",
  },
  {
    text: `${BRAND.name} works well for demos because people can follow the reasoning behind each simple program. It makes the process feel teachable instead of opaque.`,
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Intro CS Lecturer",
  },
  {
    text: "The interface encourages learners to shape their logic carefully before worrying about syntax. That makes it especially useful for early coding confidence.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Beginner Coding Coach",
  },
  {
    text: `For algorithm drills and small programming exercises, ${BRAND.name} sits in a really useful space between pseudocode and actual code. It helps learners practice thinking like programmers.`,
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Problem-Solving Mentor",
  },
];

const firstTestimonialColumn = testimonials.slice(0, 3);
const secondTestimonialColumn = testimonials.slice(3, 6);
const thirdTestimonialColumn = testimonials.slice(6, 9);
const learningSettings = [
  {
    title: "Classrooms",
    subtitle: "Intro CS and early programming lessons",
  },
  {
    title: "Workshops",
    subtitle: "Live sessions with fast setup",
  },
  {
    title: "Tutoring",
    subtitle: "Smaller guided problem-solving practice",
  },
];
const workflowStages = [
  {
    title: "Describe",
    value: "Plain-English prompt",
  },
  {
    title: BRAND.name,
    value: "Logic and structure first",
  },
  {
    title: "Read",
    value: "Generated Python output",
  },
];
const focusAreas = [
  "Loops",
  "Conditions",
  "Lists",
  "Algorithms",
  "Beginner exercises",
];
const projectSignals = [
  {
    label: "Founder",
    value: "Matthew Wilmot",
  },
  {
    label: "Context",
    value: "MIT undergraduate project",
  },
  {
    label: "Status",
    value: "Pre-alpha",
  },
  {
    label: "Goal",
    value: "Lower friction without removing rigor",
  },
];
// Drawings, not screenshots. The five PNGs these replaced were 6MB between
// them and every visitor downloaded all five to look at one; the line art is a
// few kilobytes of markup that also happens to say what the feature is rather
// than what the app looked like on the day someone took the picture.
const creatorAccordionItems = [
  {
    id: 1,
    title: "Simple Program Creation",
    Illustration: ProgramCreationInk,
  },
  {
    id: 2,
    title: "Intuitive Interface",
    Illustration: InterfaceInk,
  },
  {
    id: 3,
    title: "AI Assisted Problem Solving",
    Illustration: ProblemSolvingInk,
  },
  {
    id: 4,
    title: "Plot and Image Creation",
    Illustration: PlotInk,
  },
  {
    id: 5,
    title: "Customizable IDE",
    Illustration: CustomizeInk,
  },
];
const learningCenterTopics = [
  {
    id: 1,
    title: "Primitives and Logic",
    Illustration: PrimitivesInk,
    description:
      "Build intuition for variables, conditions, and the step-by-step reasoning that sits underneath beginner programming.",
    actionLabel: "Open Learning Center",
    destination: "resources" as const,
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    Illustration: AlgorithmsInk,
    description:
      "Move into lists, patterns, and core algorithmic thinking with guided material designed for early computer science learners.",
    actionLabel: "Explore Lessons",
    destination: "resources" as const,
  },
  {
    id: 3,
    title: "Start Coding Right Away",
    Illustration: StartCodingInk,
    description:
      `Jump from concepts into creation inside ${BRAND.name} and turn plain-English ideas into working programs without syntax getting in the way first.`,
    actionLabel: "Open Dashboard",
    destination: "dashboard" as const,
  },
];

function useActiveInView<T extends HTMLElement>(
  {
    rootMargin = REVEAL_ROOT_MARGIN,
    threshold = 0,
  }: IntersectionObserverInit = {}
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Latch. isIntersecting goes false again the moment the section
        // scrolls away, which previously un-played everything behind the
        // reader -- scroll back up and the page had reset itself.
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}

function useTypingText(text: string, active: boolean, speed = 55) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      const resetTimeout = window.setTimeout(() => {
        setCount(0);
      }, 0);

      return () => window.clearTimeout(resetTimeout);
    }

    let index = 0;
    const resetTimeout = window.setTimeout(() => {
      setCount(0);
    }, 0);
    const interval = window.setInterval(() => {
      index += 1;
      setCount(index);

      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => {
      window.clearTimeout(resetTimeout);
      window.clearInterval(interval);
    };
  }, [active, text, speed]);

  return text.slice(0, active ? count : 0);
}

function Reveal({
  children,
  inView,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  inView: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      /*
       * motion-reduce:translate-y-0, NOT motion-reduce:transform-none.
       *
       * Tailwind v4 compiles translate-y-* to the standalone `translate`
       * property, so `transform: none` does not cancel it -- they are different
       * properties. The travel tokens are zeroed in globals.css under
       * prefers-reduced-motion, but translate-y-5 is a literal, so nothing was
       * switching it off: this 20px slide ran at full strength for every reader
       * who had asked the OS for less motion. See testimonials-columns.tsx,
       * which already documents the same trap.
       */
      className={`transition-[transform,opacity] duration-[720ms] ease-[var(--ease-out)] will-change-transform motion-reduce:transition-none motion-reduce:translate-y-0 ${className} ${
        inView ? "translate-y-0" : "translate-y-2"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CardEntrance({
  children,
  inView,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  inView: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      // Same trap as Reveal above: the literal translate-y-5 needs
      // motion-reduce:translate-y-0, because transform-none is a different
      // property from the `translate` these compile to.
      className={`h-full transition-[transform,opacity] duration-[720ms] ease-[var(--ease-out)] will-change-transform motion-reduce:transition-none motion-reduce:translate-y-0 ${className} ${
        inView ? "translate-y-0" : "translate-y-2"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReviewCard({
  name,
  role,
  body,
  delay,
  inView,
}: {
  name: string;
  role: string;
  body: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <Reveal inView={inView} delay={delay}>
      {/* A quote is read, not pressed, so the card lies off the page and stays
          put on hover. The top-down accent wash is the card's own tint; the
          skewed sweep that used to rake across it on hover is gone. See
          testimonials-columns.tsx, which is the same card and lost the same
          band for the same reason. */}
      <div className="relative h-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] p-[var(--space-6)] shadow-[var(--raised-lg)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--accent-subtle),transparent_60%)]" />

        <div className="relative z-10 mb-[var(--space-4)] flex items-center gap-[var(--space-1)] text-[length:var(--text-base)] text-[var(--accent-text)]">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className="relative z-10 mb-[var(--space-6)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
          “{body}”
        </p>

        <div className="relative z-10 text-[length:var(--text-sm)] text-[var(--text-primary)]">
          {name}
        </div>
        <div className="relative z-10 mt-[var(--space-1)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
          {role}
        </div>
      </div>
    </Reveal>
  );
}

export default function HomePage() {
  const router = useRouter();

  const [isLeaving, setIsLeaving] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");

  const [heroRef, heroInView] = useActiveInView<HTMLElement>();
  const [overviewRevealRef, overviewRevealInView] =
    useActiveInView<HTMLDivElement>();
  const [creatorRevealRef, creatorRevealInView] =
    useActiveInView<HTMLDivElement>();
  const [learningCenterRevealRef, learningCenterRevealInView] =
    useActiveInView<HTMLDivElement>();

  const overviewRef = useRef<HTMLElement | null>(null);
  const [creatorRef, creatorInView] = useActiveInView<HTMLElement>();

  useEffect(() => {
    async function bootstrap() {
      const supabase = getSupabaseBrowserClient();
      const session = await getSupabaseSession(supabase);

      setIsAuthed(!!session);

      if (!session) {
        setCurrentTier("free");
        return;
      }

      try {
        const record = await getOrCreateSubscription(
          supabase,
          session.user.id,
          session.user.email ?? ""
        );
        setCurrentTier(record.tier);
      } catch (error) {
        console.error(error);
        setCurrentTier("free");
      }
    }

    void bootstrap();
  }, []);

  const typedCreatorHeading = useTypingText(
    "Create any Program Without the Syntax",
    creatorInView,
    50
  );
  // Shared surface and text recipes for the sections below. Tokens already swap
  // with the theme, so these are plain strings rather than theme branches.
  const cardClass =
    "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised-lg)]";
  const titleClass = "text-[var(--text-primary)]";
  // Muted rather than soft: this body text lands on raised cards, where soft
  // only measures 4.63:1 in dark and has no headroom left.
  const bodyClass = "text-[var(--text-muted)]";
  const labelClass = "text-[var(--text-muted)]";
  // Panels nested inside a card are cut into it, not stacked on top of it.
  const panelClass =
    "border-[var(--border-subtle)] bg-[var(--surface-sunken)] shadow-[var(--inlaid)]";
  // A depiction of a screen is a well, not a chip: the sunken rung takes
  // --recessed, and --inlaid is reserved for the badges and rows inside it.
  const screenClass =
    "border-[var(--border-subtle)] bg-[var(--surface-sunken)] shadow-[var(--recessed)]";
  const accentLineClass = "bg-[var(--border-strong)]";
  const accentFillClass = "bg-[var(--accent-subtle)]";
  const accentTextClass = "text-[var(--accent-text)]";

  function handleGetStarted() {
    setIsLeaving(true);
    setTimeout(() => {
      router.push(isAuthed ? "/dashboard" : "/login");
    }, 700);
  }

  function handleScrollToOverview() {
    const node = overviewRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLearningCenterCardClick(
    destination: "resources" | "dashboard"
  ) {
    if (destination === "dashboard") {
      router.push(isAuthed ? "/dashboard" : "/login");
      return;
    }

    router.push(isAuthed ? "/resources" : "/login");
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppPageBackground />

      <SiteHeader
        tierLabel={isAuthed ? SUBSCRIPTION_META[currentTier].label : undefined}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        requireAuthForNavigation={!isAuthed}
        showSignOut={isAuthed}
        hideOnScroll
      />

      <section
        ref={heroRef}
        className="relative px-6 pb-8 pt-32 md:pb-10 md:pt-36 lg:pb-12"
      >
        <div className="pointer-events-none absolute inset-0">
          {/* The wash stays; the pulse does not.
              PageBackdrop in site-shell states the rule these were breaking:
              the material system is lit by exactly one source, above and
              slightly forward, and an animated background is a second, moving
              light. Every other ambient wash in the app -- the accordion strip,
              the testimonial band, the learning-center header -- is a static
              accent-subtle radial, so these two were also the only ones of
              their kind. Brightening and swelling on a 16s cycle is what made
              them read as a lamp behind the page rather than as the page
              catching the light everything else on it catches.

              Not merely stopped under prefers-reduced-motion: a second light
              source is a lighting error, not a motion preference, so it has to
              go for everyone rather than only for the people who asked for
              less movement. */}
          <div className="absolute left-1/2 top-[46%] h-[32rem] w-[32rem] max-w-[88vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-[radial-gradient(circle,var(--accent-subtle),transparent_66%)]" />
          <div className="absolute left-1/2 top-[48%] h-[18rem] w-[18rem] max-w-[58vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[56px] bg-[radial-gradient(circle,var(--accent-subtle),transparent_68%)]" />
        </div>

        <div
          /* No mount gate. `mounted` had already been pinned to a constant
             `true` upstream, so the opacity branch it fed could only ever
             resolve one way -- this drops the vestige rather than leaving a
             conditional that reads as if it still decides something. The leave
             transition stays: that one responds to an action the reader took. */
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center transition-all duration-700 ease-[var(--ease-out)] ${
            isLeaving ? "scale-[1.03] opacity-0 blur-md" : "scale-100 opacity-100 blur-0"
          }`}
        >
          <Reveal inView={heroInView} delay={70}>
            <div className="mx-auto max-w-3xl pt-2">
              {/* Display leading, not --leading-tight: at 4.3rem a 1.25 ratio
                  opens a gap you read as two headings. Matches
                  PAGE_HEADING_CLASS and every other display heading.

                  1.05, not the 0.95 this carried under Geist. Source Serif 4's
                  ink runs 0.986em tall (0.741 ascender + 0.246 descender,
                  measured at 700), so 0.95 was a line box shorter than the
                  glyphs standing in it -- a descender on one line and an
                  ascender on the next overlapped by 2.8px at this size. 1.05 is
                  the tightest round value that clears the face's own ink and
                  still reads as one block. */}
              <h1 className="mx-auto max-w-3xl text-[clamp(2rem,5vw,4.3rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]">
                Vibe code without giving up independent thinking
              </h1>

              <p className="mx-auto mt-[var(--space-4)] max-w-xl text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--text-muted)] md:text-[length:var(--text-base)] md:leading-[var(--leading-relaxed)]">
                With the new age of AI-coding tools, {BRAND.name} helps non-coders gain confidence in core programming concepts and build algorithmic thinking without needing to know any structured coding language.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-[var(--space-3)]">
              {/* Both hero calls to action are the Button primitive, so the
                  press these two get is the same press every control in the app
                  gets -- the landing page is where that promise is made. */}
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="uppercase tracking-[var(--tracking-label)]"
              >
                {isAuthed ? "Open Dashboard" : "Get Started"}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleScrollToOverview}
                className="uppercase tracking-[var(--tracking-label)]"
              >
                Learn More
              </Button>
              </div>
            </div>
          </Reveal>

          {/* The hero used to be two 360KB screenshots of the old teal
              theme, picked by isLight -- the only theme branch left on this
              page, and an advertisement for a product that no longer looked
              like that. It is now the thing itself: a real program, its real
              translation, and a Run that prints what it really prints. */}
          <div className="relative z-0 mt-[var(--space-10)] w-full md:mt-[var(--space-12)]">
            <div className="pointer-events-none absolute left-1/2 top-[8%] h-56 w-[36rem] max-w-[76vw] -translate-x-1/2 rounded-full blur-3xl bg-[radial-gradient(circle,var(--accent-subtle),transparent_72%)]" />

            <Reveal
              inView={heroInView}
              delay={160}
              className="relative mx-auto w-full max-w-5xl"
            >
              <HeroDemo
                onGetStarted={handleGetStarted}
                getStartedLabel={isAuthed ? "Open the editor" : "Write your own"}
              />
            </Reveal>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-20 bg-[var(--surface-page)] transition-opacity duration-700 ease-[var(--ease-out)] ${
            isLeaving ? "opacity-100" : "opacity-0"
          }`}
        />
      </section>

      <section
        className="relative order-4 px-6 pb-24 pt-24 md:pt-28"
      >
        <div ref={overviewRevealRef} className="mx-auto w-full max-w-7xl">
          <Reveal inView={overviewRevealInView} className="text-center">
            <div className={`mb-[var(--space-3)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
              Testimonials
            </div>
            <h2 className={`text-4xl font-bold leading-[1.05] tracking-[-0.045em] md:text-5xl ${titleClass}`}>
              Hear What Others Say
            </h2>
            <p
              className={`mx-auto mt-[var(--space-4)] max-w-xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)] ${bodyClass}`}
            >
              T.R.A.C.E. has been used in classrooms, workshops, and tutoring sessions with a wide range of learners. Here’s some of the feedback we’ve heard most often about the experience of using the product in those settings.
            </p>
          </Reveal>

          <Reveal inView={overviewRevealInView} delay={120} className="mt-12">
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-[10%] top-1/2 h-56 -translate-y-1/2 rounded-full blur-3xl bg-[radial-gradient(circle,var(--accent-subtle),transparent_68%)]" />
                {/* The columns used to loop forever, and the height cap plus the
                    top/bottom mask fade existed only to hide the seam where the
                    loop restarted. The loop is gone, so both would now simply
                    cut the last quote in half and fade it out -- the grid takes
                    its natural height instead. */}
                <div className="relative grid items-start gap-[var(--space-5)] md:grid-cols-2 lg:grid-cols-3">
                  <TestimonialsColumn
                    testimonials={firstTestimonialColumn}
                    inView={overviewRevealInView}
                    entranceDelay={180}
                  />
                  <TestimonialsColumn
                    testimonials={secondTestimonialColumn}
                    className="hidden md:block"
                    inView={overviewRevealInView}
                    entranceDelay={280}
                  />
                  <TestimonialsColumn
                    testimonials={thirdTestimonialColumn}
                    className="hidden lg:block"
                    inView={overviewRevealInView}
                    entranceDelay={380}
                  />
                </div>
              </div>
            </Reveal>
        </div>
      </section>

      <section
        ref={creatorRef}
        className="relative order-2 px-6 pb-14 pt-4 md:pb-20 md:pt-6"
      >
        <div
          ref={(node) => {
            overviewRef.current = node;
          }}
          className="mx-auto w-full max-w-7xl"
        >
          <div ref={creatorRevealRef}>
            <Reveal inView={creatorRevealInView}>
              <InteractiveImageAccordion
                title="Create any Program Without the Syntax"
                description={`With ${BRAND.name}’s intuitive interface and powerful AI assistance, you can turn plain-English mock-ups into actual working programs without needing to write a single line of code. Focus on the logic and creativity of programming while ${BRAND.name} handles the syntax and structure for you.`}
                ctaLabel={isAuthed ? "Open Dashboard" : "Get Started"}
                onCtaClick={handleGetStarted}
                items={creatorAccordionItems}
              />
            </Reveal>

            <Reveal inView={creatorRevealInView} className="hidden">
              <div className={`mb-[var(--space-3)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                Snapshot
              </div>
              <h2 className={`text-3xl font-bold md:text-4xl ${titleClass}`}>
                {typedCreatorHeading}
                <span
                  className={`ml-1 inline-block h-[0.88em] w-[2px] bg-[var(--accent-solid)] align-[-0.08em] ${
                    creatorInView
                      ? "animate-[cursorBlink_1s_steps(1)_infinite]"
                      : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
              </h2>
              <p className={`mx-auto mt-[var(--space-4)] max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-normal)] md:text-[length:var(--text-base)] ${bodyClass}`}>
                A quick read on what {BRAND.name} is designed to do, where early feedback is
                coming from, and which parts of programming it is helping learners
                approach with more confidence.
              </p>
            </Reveal>

            <Reveal inView={creatorRevealInView} delay={140} className="hidden">
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-[10%] top-1/2 h-52 -translate-y-1/2 rounded-full blur-3xl bg-[radial-gradient(circle,var(--accent-subtle),transparent_68%)]" />

                <div className="relative grid grid-cols-6 items-stretch gap-3 lg:gap-4">
                  <CardEntrance inView={creatorRevealInView} delay={180} className="col-span-full lg:col-span-2">
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border p-[var(--space-5)] ${cardClass}`}>
                      <div className={`absolute inset-x-8 top-0 h-16 rounded-b-full blur-2xl ${accentFillClass}`} />
                      <div className={`mb-[var(--space-4)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                        Early signal
                      </div>
                      <div className="relative mx-auto flex h-20 w-full max-w-[12rem] items-center justify-center">
                        <div className="absolute inset-0 rounded-[var(--radius-full)] border border-[var(--border-subtle)]" />
                        <div className="absolute inset-[8px] rounded-[var(--radius-full)] border border-[var(--accent-border)]" />
                        <div className="text-center">
                          <div className={`text-4xl font-semibold tracking-[-0.06em] ${titleClass}`}>
                            9
                          </div>
                          <div className={`mt-[var(--space-1)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${accentTextClass}`}>
                            educator perspectives
                          </div>
                        </div>
                      </div>
                      <h3 className={`mt-[var(--space-5)] text-center text-[length:var(--text-2xl)] font-semibold tracking-[-0.04em] ${titleClass}`}>
                        Learning-first feedback
                      </h3>
                      <p className={`mx-auto mt-[var(--space-3)] max-w-sm text-center text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${bodyClass}`}>
                        Nine educator voices point to clearer teaching, easier setup,
                        and better beginner comprehension.
                      </p>
                    </div>
                  </CardEntrance>

                  <CardEntrance
                    inView={creatorRevealInView}
                    delay={260}
                    className="col-span-full sm:col-span-3 lg:col-span-2"
                  >
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border p-[var(--space-5)] ${cardClass}`}>
                      <div className={`mb-[var(--space-4)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                        Workflow
                      </div>
                      <div className={`relative mx-auto flex aspect-square size-28 items-center justify-center rounded-full border ${panelClass}`}>
                        <div className={`absolute h-px w-20 ${accentLineClass}`} />
                        {/* The four nodes read as a sequence, so the two ends
                            take neutral ink and the middle pair take the accent. */}
                        <div className="absolute left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--text-primary)]" />
                        <div className="absolute left-1/2 top-5 size-2.5 -translate-x-1/2 rounded-full bg-[var(--accent-solid)]" />
                        <div className="absolute bottom-5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[var(--accent-solid)]" />
                        <div className="absolute right-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--text-primary)]" />
                        <div className="absolute inset-5 rounded-full border border-[var(--border-subtle)]" />
                        <div className="absolute inset-9 rounded-full border border-[var(--accent-border)]" />
                        <div className={`rounded-[var(--radius-full)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${accentTextClass} ${accentFillClass}`}>
                          logic first
                        </div>
                      </div>
                      <div className="mt-[var(--space-5)] space-y-[var(--space-2)] text-center">
                        <h3 className={`text-[length:var(--text-lg)] font-semibold ${titleClass}`}>
                          Structure before syntax
                        </h3>
                        <p className={`text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${bodyClass}`}>
                          Describe intent, inspect structure, then read Python output.
                        </p>
                      </div>
                    </div>
                  </CardEntrance>

                  <CardEntrance
                    inView={creatorRevealInView}
                    delay={340}
                    className="col-span-full sm:col-span-3 lg:col-span-2"
                  >
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border p-[var(--space-5)] ${cardClass}`}>
                      <div className={`mb-[var(--space-4)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                        Settings
                      </div>
                      <div className="space-y-[var(--space-2)]">
                        {learningSettings.map((setting) => (
                          <div
                            key={setting.title}
                            className={`relative overflow-hidden rounded-[var(--radius-lg)] border px-[var(--space-3)] py-[var(--space-3)] ${panelClass}`}
                          >
                            {/* One accent for all three: the rows are a list,
                                not three different kinds of thing, so a colour
                                per row would imply a distinction that is not
                                there. */}
                            <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent-solid)]" />
                            <div className={`text-[length:var(--text-sm)] font-semibold ${titleClass}`}>
                              {setting.title}
                            </div>
                            <div className={`mt-[var(--space-1)] text-[length:var(--text-sm)] leading-[var(--leading-snug)] ${bodyClass}`}>
                              {setting.subtitle}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-[var(--space-4)] text-center">
                        <div className={`text-[length:var(--text-xl)] font-semibold tracking-[-0.04em] ${titleClass}`}>
                          3 learning contexts
                        </div>
                        <p className={`mt-[var(--space-2)] text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${bodyClass}`}>
                          Used across classrooms, workshops, and tutoring.
                        </p>
                      </div>
                    </div>
                  </CardEntrance>

                  <CardEntrance inView={creatorRevealInView} delay={420} className="col-span-full lg:col-span-3">
                    <div className={`relative h-full overflow-hidden rounded-[var(--radius-xl)] border ${cardClass}`}>
                      <div className="grid h-full gap-[var(--space-4)] p-[var(--space-5)] sm:grid-cols-[0.95fr_1.05fr]">
                        <div className="flex flex-col justify-between space-y-[var(--space-5)]">
                          <div className={`relative flex size-11 items-center justify-center rounded-full border ${panelClass}`}>
                            <div className="absolute inset-[-8px] rounded-full border border-[var(--border-subtle)]" />
                            <div className="h-4 w-6 rounded-[var(--radius-sm)] border border-[var(--text-primary)]" />
                          </div>
                          <div className="space-y-[var(--space-3)]">
                            <h3 className={`text-[length:var(--text-xl)] font-semibold tracking-[-0.03em] ${titleClass}`}>
                              Browser-based from the first session
                            </h3>
                            <p className={`text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${bodyClass}`}>
                              Browser-based onboarding keeps the focus on reasoning,
                              examples, and review instead of setup.
                            </p>
                          </div>
                        </div>

                        <div className={`relative rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:ml-2 ${screenClass}`}>
                          <div className="absolute left-4 top-3 flex gap-[var(--space-2)]">
                            <span className="block size-2.5 rounded-full bg-[var(--border-strong)]" />
                            <span className="block size-2.5 rounded-full bg-[var(--border-strong)]" />
                            <span className="block size-2.5 rounded-full bg-[var(--border-strong)]" />
                          </div>
                          <div className="mt-[var(--space-4)] grid gap-[var(--space-2)]">
                            {workflowStages.map((stage, index) => (
                              <div
                                key={stage.title}
                                className={`relative overflow-hidden rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-2)] ${panelClass}`}
                              >
                                <div className="flex items-center justify-between gap-[var(--space-4)]">
                                  <div>
                                    <div className={`text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                                      Step {index + 1}
                                    </div>
                                    <div className={`mt-[var(--space-1)] text-[length:var(--text-sm)] font-semibold ${titleClass}`}>
                                      {stage.title}
                                    </div>
                                  </div>
                                  <div className={`rounded-[var(--radius-full)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${accentTextClass} ${accentFillClass}`}>
                                    {stage.value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardEntrance>

                  <CardEntrance inView={creatorRevealInView} delay={500} className="col-span-full lg:col-span-3">
                    <div className={`relative h-full overflow-hidden rounded-[var(--radius-xl)] border ${cardClass}`}>
                      <div className="grid h-full gap-[var(--space-4)] p-[var(--space-5)] sm:grid-cols-[0.9fr_1.1fr]">
                        <div className="flex flex-col justify-between space-y-[var(--space-5)]">
                          <div className={`relative flex size-11 items-center justify-center rounded-full border ${panelClass}`}>
                            <div className="absolute inset-[-8px] rounded-full border border-[var(--border-subtle)]" />
                            <div className="flex items-center gap-[var(--space-1)]">
                              <span className="block size-1.5 rounded-full bg-[var(--text-primary)]" />
                              <span className="block size-1.5 rounded-full bg-[var(--accent-solid)]" />
                              <span className="block size-1.5 rounded-full bg-[var(--accent-solid)]" />
                            </div>
                          </div>
                          <div className="space-y-[var(--space-3)]">
                            <h3 className={`text-[length:var(--text-xl)] font-semibold tracking-[-0.03em] ${titleClass}`}>
                              Built around early programming confidence
                            </h3>
                            <p className={`text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${bodyClass}`}>
                              {BRAND.name} is tuned for beginner-friendly concepts and
                              guided instruction.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center gap-[var(--space-3)] sm:pl-2">
                          <div className="flex flex-wrap gap-[var(--space-2)]">
                            {focusAreas.map((area, index) => (
                              <div
                                key={area}
                                className={`rounded-[var(--radius-full)] border px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-sm)] ${panelClass} ${
                                  index === 0 ? accentTextClass : bodyClass
                                }`}
                              >
                                {area}
                              </div>
                            ))}
                          </div>

                          <div className="grid gap-[var(--space-2)] sm:grid-cols-2">
                            {projectSignals.map((signal) => (
                              <div
                                key={signal.label}
                                className={`rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] ${panelClass}`}
                              >
                                <div className={`text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                                  {signal.label}
                                </div>
                                <div className={`mt-[var(--space-1)] text-[length:var(--text-sm)] leading-[var(--leading-snug)] ${titleClass}`}>
                                  {signal.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardEntrance>
                </div>
              </div>
            </Reveal>

            <div className="hidden">
              <Reveal inView={creatorRevealInView}>
              <div className={`rounded-[var(--radius-xl)] border p-[var(--space-8)] md:p-[var(--space-10)] ${cardClass}`}>
                <div className={`mb-[var(--space-3)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                  About
                </div>
                <h2 className={`text-4xl font-bold md:text-5xl ${titleClass}`}>
                  {typedCreatorHeading}
                  <span
                    className={`ml-1 inline-block h-[0.88em] w-[2px] bg-[var(--accent-solid)] align-[-0.08em] ${
                      creatorInView
                        ? "animate-[cursorBlink_1s_steps(1)_infinite]"
                        : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </h2>
                <div className={`mt-[var(--space-4)] text-[length:var(--text-sm)] uppercase tracking-[var(--tracking-label)] ${accentTextClass}`}>
                  Matthew Wilmot · MIT Undergraduate
                </div>
                <p className={`mt-[var(--space-6)] max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)] ${bodyClass}`}>
                  T.R.A.C.E. began as an attempt to rethink the relationship between human intent and software creation. Rather than forcing users to begin with syntax, the idea is to let them begin with logic, structure, and thought. The goal is not to remove rigor from programming, but to lower the surface-level friction so that more attention can go toward actual problem solving.
                </p>
                <p className={`mt-[var(--space-6)] max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)] ${bodyClass}`}>
                  The motivation behind the product is both practical and educational: make programming feel more direct for builders, while also making computational thinking more accessible for beginners. T.R.A.C.E. is meant to sit at that intersection, where software creation feels cleaner, more intentional, and more human.
                </p>
              </div>
            </Reveal>

            <Reveal inView={creatorRevealInView} delay={140}>
              <div className={`rounded-[var(--radius-xl)] border p-[var(--space-6)] ${cardClass}`}>
                <div className={`mb-[var(--space-4)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                  Contact
                </div>

                <div className="space-y-[var(--space-5)]">
                  <div>
                    <div className={`text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                      Email
                    </div>
                    <div className={`mt-[var(--space-2)] text-[length:var(--text-sm)] ${titleClass}`}>
                      hello@id8.dev
                    </div>
                  </div>

                  <div>
                    <div className={`text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                      Phone
                    </div>
                    <div className={`mt-[var(--space-2)] text-[length:var(--text-sm)] ${titleClass}`}>
                      +1 (555) 281-9042
                    </div>
                  </div>
                </div>

                <div className={`mt-[var(--space-8)] border-t border-[var(--border-subtle)] pt-[var(--space-5)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}>
                  T.R.A.C.E. - Pre-Alpha
                </div>
              </div>
            </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative order-3 px-6 pb-16 pt-4 md:pb-20 md:pt-2">
        <div
          ref={learningCenterRevealRef}
          className="mx-auto w-full max-w-7xl"
        >
          <Reveal inView={learningCenterRevealInView}>
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-[-4rem] h-40 w-40 -translate-x-1/2 rounded-full blur-3xl bg-[radial-gradient(circle,var(--accent-subtle),transparent_70%)]" />

              <div className="relative z-10 mx-auto max-w-6xl">
                <div
                  className={`mb-[var(--space-4)] text-center text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] ${labelClass}`}
                >
                  Learning Center
                </div>
                <h2
                  className={`mx-auto max-w-3xl text-center text-4xl font-bold leading-[1.05] tracking-[-0.045em] md:text-5xl ${titleClass}`}
                >
                  Learn Computer Science Concepts Like Never Before
                </h2>
                <p
                  className={`mx-auto mt-[var(--space-5)] max-w-2xl text-center text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)] ${bodyClass}`}
                >
                  Explore guided computer science pathways built for the {BRAND.name}
                  workflow. Learn the concepts first, then move into real
                  building with less friction and more clarity.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {learningCenterTopics.map((topic, index) => (
                    <CardEntrance
                      key={topic.id}
                      inView={learningCenterRevealInView}
                      delay={index * 110}
                    >
                      {/* These cards navigate, so they are controls first and
                          pictures second: they rest on the page, rise on hover
                          and travel down when held, exactly like a Button. */}
                      <button
                        type="button"
                        onClick={() =>
                          handleLearningCenterCardClick(topic.destination)
                        }
                        className="group relative flex min-h-[29rem] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-left shadow-[var(--raised)] transition-[box-shadow,transform,border-color] duration-[var(--duration-press)] ease-[var(--ease-spring)] hover:-translate-y-[var(--lift-travel)] hover:border-[var(--accent-border)] hover:shadow-[var(--lifted)] active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)] motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none"
                      >
                        {/* The drawing now has its own well at the top of the
                            card instead of lying full-bleed behind the text. A
                            photograph could be cropped by the caption plate and
                            lose nothing; a line drawing loses the composition,
                            and the margin around it is half of what makes it
                            read as editorial rather than as an icon. */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-sunken)]">
                          {/* Faint rule grid. It reads as the squared paper the
                              drawing was made on, which is why it survived the
                              swap away from photography. */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] [background-position:center] [background-size:32px_32px] opacity-70"
                          />
                          {/* Decorative here, and only here. The whole card is
                              one button, so its name is read off its contents
                              -- a titled drawing puts "a value entering a
                              condition that branches two ways" in front of the
                              heading that already says "Primitives and Logic".
                              The drawing is saying the same thing the caption
                              says, and the caption says it better.

                              The zoom is a token, not a literal: `scale-*`
                              compiles to the `scale` property, which
                              `transform: none` cannot cancel, so a
                              `motion-reduce:` variant here would be dead text.
                              The reduced-motion block zeroes the token. */}
                          <topic.Illustration
                            decorative
                            className="absolute inset-0 h-full w-full transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[var(--hover-zoom)] motion-reduce:transition-none"
                            preserveAspectRatio="xMidYMid meet"
                          />
                          {/* Fades the well into the caption plate below so the
                              two do not meet on a hard line. */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,color-mix(in_srgb,var(--surface-raised)_70%,transparent)_100%)]"
                          />
                          {/* The drawing is set into the card rather than laid
                              on top of it, so the well shading reads over it. */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 shadow-[var(--recessed)]"
                          />
                        </div>

                        {/* An opaque plate, not a scrim over the drawing:
                            caption text has to clear AA against a surface we
                            control, and the ink behind it is not one. */}
                        <div className="relative z-10 mt-auto flex flex-col border-t border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] p-[var(--space-6)]">
                          <h3 className="text-[length:var(--text-2xl)] font-bold leading-[var(--leading-tight)] tracking-[-0.03em] text-[var(--text-primary)]">
                            {topic.title}
                          </h3>
                          <p className="mt-[var(--space-4)] flex-1 text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                            {topic.description}
                          </p>
                        </div>
                      </button>
                    </CardEntrance>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter className="order-5" requireAuthForLinks={!isAuthed} />

      <style jsx global>{`
        @keyframes cursorBlink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes stackFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes wordmarkBreath {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.96;
          }
          50% {
            transform: translateY(-2px);
            opacity: 1;
          }
        }

        @keyframes traceLineRise {
          0%,
          100% {
            opacity: 0.16;
          }
          50% {
            opacity: 0.42;
          }
        }

        @keyframes traceLabelFloat {
          0%,
          100% {
            opacity: 0.82;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes heroPlaneLift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes heroPlaneSheen {
          0%,
          64%,
          100% {
            transform: translateX(0) skewX(-18deg);
            opacity: 0;
          }
          72% {
            opacity: 0.5;
          }
          88% {
            transform: translateX(420%) skewX(-18deg);
            opacity: 0.06;
          }
        }

        @keyframes heroWindowDriftFar {
          0%,
          100% {
            transform: translate(1.75rem, 1.75rem) rotate(3deg);
          }
          50% {
            transform: translate(2rem, 1.45rem) rotate(3.4deg);
          }
        }

        @keyframes heroWindowDriftNear {
          0%,
          100% {
            transform: translate(0.5rem, 0.5rem) rotate(1.15deg);
          }
          50% {
            transform: translate(0.75rem, 0.25rem) rotate(1.42deg);
          }
        }

        @keyframes heroWindowEnter {
          0% {
            transform: translateY(1rem) rotate(-1deg) scale(0.985);
            opacity: 0;
          }
          100% {
            transform: translateY(0) rotate(-0.35deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes heroWindowFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-0.35deg);
          }
          50% {
            transform: translateY(-0.45rem) rotate(-0.7deg);
          }
        }

        @keyframes heroFrameDriftBack {
          0%,
          100% {
            transform: translate(1.25rem, 1.25rem) rotate(1.8deg);
          }
          50% {
            transform: translate(1.55rem, 1.55rem) rotate(2.15deg);
          }
        }

        @keyframes heroFrameDriftMid {
          0%,
          100% {
            transform: translate(0.25rem, 0.25rem) rotate(0.55deg);
          }
          50% {
            transform: translate(0.45rem, 0.45rem) rotate(0.82deg);
          }
        }

        @keyframes heroFrameSettle {
          0% {
            transform: translate(-0.65rem, -0.95rem) rotate(-1.55deg)
              scale(0.985);
            opacity: 0;
          }
          100% {
            transform: translate(-0.25rem, -0.25rem) rotate(-0.55deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes heroFrameFloat {
          0%,
          100% {
            transform: translate(-0.25rem, -0.25rem) rotate(-0.55deg);
          }
          50% {
            transform: translate(-0.05rem, -0.45rem) rotate(-0.8deg);
          }
        }

        @keyframes heroPanelSweep {
          0%,
          60%,
          100% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          68% {
            opacity: 0.52;
          }
          84% {
            transform: translateX(320%) skewX(-16deg);
            opacity: 0.05;
          }
        }

        @keyframes screenSweep {
          0%,
          62%,
          100% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          70% {
            opacity: 0.52;
          }
          86% {
            transform: translateX(410%) skewX(-16deg);
            opacity: 0.06;
          }
        }

        @keyframes executionTrail {
          0%,
          100% {
            transform: translateX(-18%);
            opacity: 0;
          }
          18% {
            opacity: 0.88;
          }
          68% {
            transform: translateX(18%);
            opacity: 0.92;
          }
          84% {
            opacity: 0;
          }
        }

        @keyframes tokenFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.82;
          }
          50% {
            transform: translate3d(0, -8px, 0);
            opacity: 1;
          }
          75% {
            transform: translate3d(0, -2px, 0);
            opacity: 0.9;
          }
        }

        @keyframes glyphFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes ambientDrift {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.72;
          }
          50% {
            transform: translate(-47%, -53%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes panelSweep {
          0%,
          58%,
          100% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          65% {
            opacity: 0.5;
          }
          82% {
            transform: translateX(320%) skewX(-16deg);
            opacity: 0.06;
          }
        }

        @keyframes traceDash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -220;
          }
        }

        @keyframes traceDashReverse {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 220;
          }
        }

        @keyframes traceNodePulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.86);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes traceLineSweep {
          0%,
          100% {
            transform: translateX(-6%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          65% {
            transform: translateX(465%);
            opacity: 0.92;
          }
          85% {
            opacity: 0;
          }
        }

        @keyframes traceNodeGlide {
          0%,
          100% {
            left: 0%;
            transform: translate(0, -50%) scale(0.9);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          65% {
            left: 100%;
            transform: translate(-100%, -50%) scale(1);
            opacity: 0.95;
          }
          85% {
            opacity: 0;
          }
        }

        @keyframes demoLinePulse {
          0%,
          100% {
            opacity: 0.58;
            transform: translateX(0);
          }
          20% {
            opacity: 0.92;
            transform: translateX(2px);
          }
          38% {
            opacity: 0.74;
            transform: translateX(0);
          }
        }

        @keyframes pythonPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: translateX(0);
          }
          18% {
            opacity: 0.9;
            transform: translateX(2px);
          }
          36% {
            opacity: 0.72;
            transform: translateX(0);
          }
        }

        @keyframes beamTravel {
          0%,
          100% {
            transform: translateX(-16px);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          60% {
            transform: translateX(16px);
            opacity: 0.8;
          }
          85% {
            opacity: 0;
          }
        }

        @keyframes beamNode {
          0%,
          100% {
            transform: translateX(-18px) scale(0.9);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          55% {
            transform: translateX(18px) scale(1);
            opacity: 0.95;
          }
          85% {
            opacity: 0;
          }
        }

      `}</style>
    </main>
  );
}
