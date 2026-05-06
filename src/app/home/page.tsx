"use client";

import Image from "next/image";
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
import { SiteFooter } from "@/components/site-footer";
import { AppPageBackground, SiteHeader } from "@/components/site-shell";
import { useTheme } from "@/components/theme-provider";

const HERO_WINDOW_SCALE_PERCENT = 75;
const HERO_WINDOW_X_SHIFT_PERCENT = 25;
const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";

const testimonials: Testimonial[] = [
  {
    text: "Trace helped our students focus on the logic behind simple programs first, then read the generated Python to understand how each step was expressed in code.",
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
    text: "Most coding tools push people toward fast output. Trace feels better for learning because it keeps the focus on reasoning, checking steps, and understanding the result.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "Algorithms Tutor",
  },
  {
    text: "We used Trace during a workshop and students were solving small problem sets within minutes. Writing the instructions in plain English made the jump into coding feel much less intimidating.",
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
    text: "Trace works well for demos because people can follow the reasoning behind each simple program. It makes the process feel teachable instead of opaque.",
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
    text: "For algorithm drills and small programming exercises, Trace sits in a really useful space between pseudocode and actual code. It helps learners practice thinking like programmers.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Problem-Solving Mentor",
  },
];

const firstTestimonialColumn = testimonials.slice(0, 3);
const secondTestimonialColumn = testimonials.slice(3, 6);
const thirdTestimonialColumn = testimonials.slice(6, 9);
const traceLearningSettings = [
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
const traceWorkflowStages = [
  {
    title: "Describe",
    value: "Plain-English prompt",
  },
  {
    title: "Trace",
    value: "Logic and structure first",
  },
  {
    title: "Read",
    value: "Generated Python output",
  },
];
const traceFocusAreas = [
  "Loops",
  "Conditions",
  "Lists",
  "Algorithms",
  "Beginner exercises",
];
const traceProjectSignals = [
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
const creatorAccordionItems = [
  {
    id: 1,
    title: "Simple Program Creation",
    imageSrc: "/content/program creation.png",
  },
  {
    id: 2,
    title: "Intuitive Interface",
    imageSrc: "/content/algorithmic thinking.png",
  },
  {
    id: 3,
    title: "AI Assisted Problem Solving",
    imageSrc: "/content/problem solving.png",
  },
  {
    id: 4,
    title: "Plot and Image Creation",
    imageSrc: "/content/plot creation.png",
  },
  {
    id: 5,
    title: "Customizable IDE",
    imageSrc: "/content/customize.png",
  },
];
const learningCenterTopics = [
  {
    id: 1,
    title: "Primirives and Logic",
    imageSrc: "/content/learn%201.png",
    description:
      "Build intuition for variables, conditions, and the step-by-step reasoning that sits underneath beginner programming.",
    actionLabel: "Open Learning Center",
    destination: "resources" as const,
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    imageSrc: "/content/learn%202.png",
    description:
      "Move into lists, patterns, and core algorithmic thinking with guided material designed for early computer science learners.",
    actionLabel: "Explore Lessons",
    destination: "resources" as const,
  },
  {
    id: 3,
    title: "Start Coding Right Away",
    imageSrc: "/content/learn%203.png",
    description:
      "Jump from concepts into creation inside TRACE and turn plain-English ideas into working programs without syntax getting in the way first.",
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
        setInView(entry.isIntersecting);
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
      className={`transition-[transform,opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${className} ${
        inView
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
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
      className={`h-full transition-[transform,opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${className} ${
        inView
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
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
  isLight,
}: {
  name: string;
  role: string;
  body: string;
  delay: number;
  inView: boolean;
  isLight: boolean;
}) {
  return (
    <Reveal inView={inView} delay={delay}>
      <div
        className={`group relative h-full overflow-hidden rounded-[2rem] border p-7 transition-all duration-300 hover:-translate-y-1 ${
          isLight
            ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_44px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.96))] [&_p]:!text-slate-600"
            : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)] hover:border-cyan-300/[0.14] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))]"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-b opacity-50 ${
            isLight
              ? "from-cyan-200/45 via-sky-200/12 to-transparent"
              : "from-cyan-400/16 via-sky-400/6 to-transparent"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -left-[40%] top-0 h-full w-[38%] -skew-x-[16deg] bg-[linear-gradient(90deg,transparent,rgba(86,176,255,0.14),transparent)] animate-[cardSweep_7.5s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10 mb-4 flex items-center gap-1 text-[15px] text-[#53d4ff]">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className="mb-6 text-sm leading-7 text-neutral-300">“{body}”</p>

        <div className={`relative z-10 text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{name}</div>
        <div className={`relative z-10 mt-1 text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-400" : "text-cyan-200/60"}`}>
          {role}
        </div>
      </div>
    </Reveal>
  );
}

function TraceHeroStage({
  isLight,
  inView,
}: {
  isLight: boolean;
  inView: boolean;
}) {
  const heroWindowScale = HERO_WINDOW_SCALE_PERCENT / 100;
  const heroWindowFadeStyle = {
    maskImage:
      "linear-gradient(to bottom, black 0%, black 60%, transparent 100%), linear-gradient(to right, black 0%, black 70%, transparent 100%)",
    maskComposite: "intersect" as const,
    WebkitMaskImage:
      "linear-gradient(to bottom, black 0%, black 60%, transparent 100%), linear-gradient(to right, black 0%, black 70%, transparent 100%)",
    WebkitMaskComposite: "source-in" as const,
  };
  const heroShellClass = isLight
    ? "shadow-[0_34px_90px_rgba(15,23,42,0.16)]"
    : "shadow-[0_38px_120px_rgba(0,0,0,0.56)]";
  const stackedPaneClass = isLight
    ? "border-slate-400/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.46),rgba(248,250,252,0.22))] shadow-[0_26px_70px_rgba(15,23,42,0.14)]"
    : "border-white/[0.14] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.018))] shadow-[0_20px_70px_rgba(0,0,0,0.24)]";
  const stackedPaneInnerBorderClass = isLight
    ? "border-slate-500/20"
    : "border-white/[0.1]";
  const glowClass = isLight
    ? "bg-[radial-gradient(circle,rgba(37,99,235,0.14),rgba(14,165,233,0.08),transparent_72%)]"
    : "bg-[radial-gradient(circle,rgba(36,99,235,0.2),rgba(8,145,178,0.14),transparent_72%)]";
  return (
    <div className="pointer-events-none relative z-0 -mb-20 mt-6 w-full md:-mb-24 md:mt-8 lg:-mb-28 lg:mt-10">
      <div
        className={`transition-[transform,opacity] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
        style={{ transitionDelay: "160ms" }}
      >
        <div className={`pointer-events-none absolute left-1/2 top-[12%] h-56 w-[36rem] max-w-[76vw] -translate-x-1/2 rounded-full blur-3xl ${glowClass}`} />

        <div className="mx-auto max-w-none">
          <div className="[perspective:1800px]">
            <div className="transition-transform duration-300 ease-out will-change-transform">
              <div className="[transform:rotateX(16deg)]">
                <div
                  className="relative mx-auto aspect-[1858/905] w-[min(98rem,98vw)] sm:w-[min(76rem,114vw)] md:w-[min(84rem,118vw)] lg:w-[min(92rem,104vw)] xl:w-[min(98rem,98vw)]"
                  style={{
                    transform: `translateX(${HERO_WINDOW_X_SHIFT_PERCENT}%) skewX(0.34rad)`,
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-[2rem] border backdrop-blur-[2px] ${stackedPaneClass}`}
                    style={{
                      transform: `translate(-1.45rem, -1.5rem) scale(${heroWindowScale})`,
                      transformOrigin: "top center",
                      opacity: isLight ? 0.78 : 0.58,
                      ...heroWindowFadeStyle,
                    }}
                  >
                    <div
                      className={`absolute inset-[1px] rounded-[calc(2rem-1px)] border ${stackedPaneInnerBorderClass}`}
                    />
                  </div>

                  <div
                    className={`absolute inset-0 rounded-[2rem] border backdrop-blur-[1px] ${stackedPaneClass}`}
                    style={{
                      transform: `translate(-0.72rem, -0.78rem) scale(${heroWindowScale})`,
                      transformOrigin: "top center",
                      opacity: isLight ? 0.9 : 0.76,
                      ...heroWindowFadeStyle,
                    }}
                  >
                    <div
                      className={`absolute inset-[1px] rounded-[calc(2rem-1px)] border ${stackedPaneInnerBorderClass}`}
                    />
                  </div>

                  <div
                    className={`absolute inset-0 overflow-hidden rounded-[2rem] ${heroShellClass}`}
                    style={{
                      transform: `scale(${heroWindowScale})`,
                      transformOrigin: "top center",
                      ...heroWindowFadeStyle,
                    }}
                  >
                    <div className="absolute inset-0 rounded-[2rem]">
                      <div className="absolute inset-0 overflow-hidden rounded-[1.45rem]">
                        <Image
                          src={
                            isLight
                              ? "/brand/ide%20window%20light.png"
                              : "/brand/ide%20window.png"
                          }
                          alt="TRACE IDE window interface"
                          fill
                          priority
                          sizes="(min-width: 1280px) 1500px, 100vw"
                          className="object-contain object-top"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isLight } = useTheme();

  const [isLeaving, setIsLeaving] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const mounted = true;

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
  const traceCardClass = isLight
    ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.012))]";
  const traceTitleClass = isLight ? "text-slate-900" : "text-white";
  const traceBodyClass = isLight ? "text-slate-600" : "text-neutral-400";
  const traceLabelClass = isLight ? "text-slate-500" : "text-neutral-500";
  const tracePanelClass = isLight
    ? "border-slate-200/80 bg-white/88"
    : "border-white/[0.08] bg-black/20";
  const traceAccentLineClass = isLight ? "bg-slate-300/70" : "bg-white/10";
  const traceAccentFillClass = isLight ? "bg-cyan-500/12" : "bg-cyan-400/12";
  const traceAccentTextClass = isLight ? "text-cyan-700" : "text-cyan-200";

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
    <main
      className={`relative flex min-h-screen flex-col overflow-x-hidden ${
        isLight ? "bg-[#eef3f9] text-slate-900" : "bg-black text-white"
      }`}
    >
      <AppPageBackground />

      <SiteHeader
        tierLabel={isAuthed ? SUBSCRIPTION_META[currentTier].label : undefined}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        requireAuthForNavigation={!isAuthed}
        showSignOut={isAuthed}
        hideOnScroll
        surfaceClassName={isLight ? "border-slate-200 bg-white/78" : "border-white/[0.06] bg-black/40"}
      />

      <section
        ref={heroRef}
        className="relative px-6 pb-8 pt-32 md:pb-10 md:pt-36 lg:pb-12"
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className={`absolute left-1/2 top-[46%] h-[32rem] w-[32rem] max-w-[88vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-[orbPulse_16s_ease-in-out_infinite] ${
              isLight
                ? "bg-[radial-gradient(circle,rgba(37,99,235,0.06),rgba(56,189,248,0.04),transparent_66%)]"
                : "bg-[radial-gradient(circle,rgba(26,90,255,0.024),rgba(12,62,210,0.012),transparent_66%)]"
            }`}
          />
          <div
            className={`absolute left-1/2 top-[48%] h-[18rem] w-[18rem] max-w-[58vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[56px] animate-[orbPulse_12s_ease-in-out_infinite_reverse] ${
              isLight
                ? "bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_68%)]"
                : "bg-[radial-gradient(circle,rgba(29,221,255,0.02),transparent_68%)]"
            }`}
          />
        </div>

        <div
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center transition-all duration-700 ease-out ${
            mounted ? "opacity-100" : "opacity-0"
          } ${isLeaving ? "scale-[1.03] opacity-0 blur-md" : "scale-100 blur-0"}`}
        >
          <Reveal inView={heroInView} delay={70}>
            <div className="mx-auto max-w-3xl pt-2">
              <h1
                className={`mx-auto max-w-3xl text-[clamp(2rem,5vw,4.3rem)] font-bold leading-[0.95] tracking-[-0.045em] ${
                  isLight ? "text-slate-950" : "text-white"
                }`}
              >
                Vibe code without giving up independent thinking
              </h1>

              <p
                className={`mx-auto mt-4 max-w-xl text-[0.88rem] leading-6 md:text-[0.95rem] md:leading-7 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                With the new age of AI-coding tools, TRACE helps non-coders gain confidence in core programming concepts and build algorithmic thinking without needing to know any structured coding language.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleGetStarted}
                className={`group relative overflow-hidden rounded-full border px-6 py-3 text-sm uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_rgba(66,146,255,0)] transition-all duration-300 ${
                  isLight
                    ? "border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:text-slate-900 hover:shadow-[0_16px_32px_rgba(59,130,246,0.12)]"
                    : "border-blue-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] text-neutral-300 hover:border-blue-300/28 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(66,146,255,0.07)]"
                }`}
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.05)_38%,rgba(23,111,255,0.15)_50%,rgba(23,223,255,0.12)_60%,rgba(255,255,255,0.05)_68%,transparent_82%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[metalSweep_1.15s_ease]" />
                <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.004))]" />
                <span className="relative z-10 transition-all duration-300 group-hover:tracking-[0.28em] group-hover:text-[#eef8ff]">
                  {isAuthed ? "Open Dashboard" : "Get Started"}
                </span>
              </button>

              <button
                onClick={handleScrollToOverview}
                className={`rounded-full border px-5 py-3 text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    : "border-white/10 bg-white/[0.025] text-neutral-300 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                Learn More
              </button>
              </div>
            </div>
          </Reveal>

          <TraceHeroStage isLight={isLight} inView={heroInView} />
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 ${
            isLight ? "bg-[#eef3f9]" : "bg-black"
          } ${
            isLeaving ? "opacity-100" : "opacity-0"
          }`}
        />
      </section>

      <section
        className="relative order-4 px-6 pb-24 pt-24 md:pt-28"
      >
        <div ref={overviewRevealRef} className="mx-auto w-full max-w-7xl">
          <Reveal inView={overviewRevealInView} className="text-center">
            <div
              className={`mb-3 text-[9px] uppercase tracking-[0.24em] md:text-[10px] ${
                isLight ? "text-slate-500" : "text-neutral-500"
              }`}
            >
              Testimonials
            </div>
            <h2
              className={`text-4xl font-bold leading-[0.95] tracking-[-0.045em] md:text-5xl ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            >
              Hear What Others Say
            </h2>
            <p
              className={`mx-auto mt-4 max-w-xl text-sm leading-7 md:text-base ${
                isLight ? "text-slate-600" : "text-neutral-400"
              }`}
            >
              T.R.A.C.E. has been used in classrooms, workshops, and tutoring sessions with a wide range of learners. Here’s some of the feedback we’ve heard most often about the experience of using the product in those settings.
            </p>
          </Reveal>

          <Reveal inView={overviewRevealInView} delay={120} className="mt-12">
            <div className="relative">
              <div
                className={`pointer-events-none absolute inset-x-[10%] top-1/2 h-56 -translate-y-1/2 rounded-full blur-3xl ${
                  isLight
                    ? "bg-[radial-gradient(circle,rgba(14,165,233,0.08),transparent_68%)]"
                    : "bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_68%)]"
                }`}
              />
                <div className="relative grid max-h-[44rem] gap-5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)] md:grid-cols-2 lg:grid-cols-3">
                  <TestimonialsColumn
                    testimonials={firstTestimonialColumn}
                    duration={16}
                    isLight={isLight}
                    inView={overviewRevealInView}
                    entranceDelay={180}
                  />
                  <TestimonialsColumn
                    testimonials={secondTestimonialColumn}
                    duration={20}
                    isLight={isLight}
                    className="hidden md:block"
                    inView={overviewRevealInView}
                    entranceDelay={280}
                  />
                  <TestimonialsColumn
                    testimonials={thirdTestimonialColumn}
                    duration={18}
                    isLight={isLight}
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
                isLight={isLight}
                title="Create any Program Without the Syntax"
                description="With TRACE’s intuitive interface and powerful AI assistance, you can turn plain-English mock-ups into actual working programs without needing to write a single line of code. Focus on the logic and creativity of programming while TRACE handles the syntax and structure for you."
                ctaLabel={isAuthed ? "Open Dashboard" : "Get Started"}
                onCtaClick={handleGetStarted}
                items={creatorAccordionItems}
              />
            </Reveal>

            <Reveal inView={creatorRevealInView} className="hidden">
              <div className={`mb-3 text-[11px] uppercase tracking-[0.28em] ${traceLabelClass}`}>
                Snapshot
              </div>
              <h2 className={`text-3xl font-bold md:text-4xl ${traceTitleClass}`}>
                {typedCreatorHeading}
                <span
                  className={`ml-1 inline-block h-[0.88em] w-[2px] bg-[#73cfff]/90 align-[-0.08em] shadow-[0_0_10px_rgba(82,183,255,0.28)] ${
                    creatorInView
                      ? "animate-[cursorBlink_1s_steps(1)_infinite]"
                      : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
              </h2>
              <p className={`mx-auto mt-4 max-w-2xl text-sm leading-6 md:text-[15px] ${traceBodyClass}`}>
                A quick read on what Trace is designed to do, where early feedback is
                coming from, and which parts of programming it is helping learners
                approach with more confidence.
              </p>
            </Reveal>

            <Reveal inView={creatorRevealInView} delay={140} className="hidden">
              <div className="relative">
                <div
                  className={`pointer-events-none absolute inset-x-[10%] top-1/2 h-52 -translate-y-1/2 rounded-full blur-3xl ${
                    isLight
                      ? "bg-[radial-gradient(circle,rgba(14,165,233,0.08),transparent_68%)]"
                      : "bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_68%)]"
                  }`}
                />

                <div className="relative grid grid-cols-6 items-stretch gap-3 lg:gap-4">
                  <CardEntrance inView={creatorRevealInView} delay={180} className="col-span-full lg:col-span-2">
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-5 ${traceCardClass}`}>
                      <div className={`absolute inset-x-8 top-0 h-16 rounded-b-full blur-2xl ${traceAccentFillClass}`} />
                      <div className={`mb-4 text-[10px] uppercase tracking-[0.22em] ${traceLabelClass}`}>
                        Early signal
                      </div>
                      <div className="relative mx-auto flex h-20 w-full max-w-[12rem] items-center justify-center">
                        <div className={`absolute inset-0 rounded-[999px] border ${isLight ? "border-slate-300/90" : "border-white/8"}`} />
                        <div className={`absolute inset-[8px] rounded-[999px] border ${isLight ? "border-cyan-300/55" : "border-cyan-300/20"}`} />
                        <div className="text-center">
                          <div className={`text-4xl font-semibold tracking-[-0.06em] ${traceTitleClass}`}>
                            9
                          </div>
                          <div className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${traceAccentTextClass}`}>
                            educator perspectives
                          </div>
                        </div>
                      </div>
                      <h3 className={`mt-5 text-center text-2xl font-semibold tracking-[-0.04em] ${traceTitleClass}`}>
                        Learning-first feedback
                      </h3>
                      <p className={`mx-auto mt-3 max-w-sm text-center text-sm leading-6 ${traceBodyClass}`}>
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
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-5 ${traceCardClass}`}>
                      <div className={`mb-4 text-[10px] uppercase tracking-[0.22em] ${traceLabelClass}`}>
                        Workflow
                      </div>
                      <div className={`relative mx-auto flex aspect-square size-28 items-center justify-center rounded-full border ${tracePanelClass}`}>
                        <div className={`absolute h-px w-20 ${traceAccentLineClass}`} />
                        <div className={`absolute left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full ${isLight ? "bg-slate-700" : "bg-white"}`} />
                        <div className={`absolute left-1/2 top-5 size-2.5 -translate-x-1/2 rounded-full ${isLight ? "bg-cyan-600" : "bg-cyan-300"}`} />
                        <div className={`absolute bottom-5 left-1/2 size-2.5 -translate-x-1/2 rounded-full ${isLight ? "bg-sky-500" : "bg-sky-300"}`} />
                        <div className={`absolute right-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full ${isLight ? "bg-slate-700" : "bg-white"}`} />
                        <div className={`absolute inset-5 rounded-full border ${isLight ? "border-slate-300/70" : "border-white/8"}`} />
                        <div className={`absolute inset-9 rounded-full border ${isLight ? "border-cyan-300/40" : "border-cyan-400/14"}`} />
                        <div className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${traceAccentTextClass} ${traceAccentFillClass}`}>
                          logic first
                        </div>
                      </div>
                      <div className="mt-5 space-y-2 text-center">
                        <h3 className={`text-lg font-semibold ${traceTitleClass}`}>
                          Structure before syntax
                        </h3>
                        <p className={`text-sm leading-6 ${traceBodyClass}`}>
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
                    <div className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-5 ${traceCardClass}`}>
                      <div className={`mb-4 text-[10px] uppercase tracking-[0.22em] ${traceLabelClass}`}>
                        Settings
                      </div>
                      <div className="space-y-2.5">
                        {traceLearningSettings.map((setting, index) => (
                          <div
                            key={setting.title}
                            className={`relative overflow-hidden rounded-[1.1rem] border px-3.5 py-3 ${tracePanelClass}`}
                          >
                            <div
                              className={`absolute inset-y-0 left-0 w-1 ${
                                index === 0
                                  ? isLight
                                    ? "bg-cyan-500/70"
                                    : "bg-cyan-300/70"
                                  : index === 1
                                    ? isLight
                                      ? "bg-sky-500/60"
                                      : "bg-sky-300/60"
                                    : isLight
                                      ? "bg-blue-500/55"
                                      : "bg-blue-300/55"
                              }`}
                            />
                            <div className={`text-sm font-semibold ${traceTitleClass}`}>
                              {setting.title}
                            </div>
                            <div className={`mt-1 text-[13px] leading-5 ${traceBodyClass}`}>
                              {setting.subtitle}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <div className={`text-xl font-semibold tracking-[-0.04em] ${traceTitleClass}`}>
                          3 learning contexts
                        </div>
                        <p className={`mt-2 text-sm leading-6 ${traceBodyClass}`}>
                          Used across classrooms, workshops, and tutoring.
                        </p>
                      </div>
                    </div>
                  </CardEntrance>

                  <CardEntrance inView={creatorRevealInView} delay={420} className="col-span-full lg:col-span-3">
                    <div className={`relative h-full overflow-hidden rounded-[2rem] border ${traceCardClass}`}>
                      <div className="grid h-full gap-4 p-5 sm:grid-cols-[0.95fr_1.05fr]">
                        <div className="flex flex-col justify-between space-y-5">
                          <div className={`relative flex size-11 items-center justify-center rounded-full border ${tracePanelClass}`}>
                            <div className={`absolute inset-[-8px] rounded-full border ${isLight ? "border-slate-300/60" : "border-white/6"}`} />
                            <div className={`h-4 w-6 rounded-md border ${isLight ? "border-slate-700" : "border-white"}`} />
                          </div>
                          <div className="space-y-3">
                            <h3 className={`text-xl font-semibold tracking-[-0.03em] ${traceTitleClass}`}>
                              Browser-based from the first session
                            </h3>
                            <p className={`text-sm leading-6 ${traceBodyClass}`}>
                              Browser-based onboarding keeps the focus on reasoning,
                              examples, and review instead of setup.
                            </p>
                          </div>
                        </div>

                        <div className={`relative rounded-[1.35rem] border p-4 sm:ml-2 ${tracePanelClass}`}>
                          <div className="absolute left-4 top-3 flex gap-2">
                            <span className={`block size-2.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/12"}`} />
                            <span className={`block size-2.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/12"}`} />
                            <span className={`block size-2.5 rounded-full ${isLight ? "bg-slate-300" : "bg-white/12"}`} />
                          </div>
                          <div className="mt-4 grid gap-2">
                            {traceWorkflowStages.map((stage, index) => (
                              <div
                                key={stage.title}
                                className={`relative overflow-hidden rounded-[1rem] border px-3 py-2.5 ${tracePanelClass}`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <div className={`text-[10px] uppercase tracking-[0.18em] ${traceLabelClass}`}>
                                      Step {index + 1}
                                    </div>
                                    <div className={`mt-1 text-sm font-semibold ${traceTitleClass}`}>
                                      {stage.title}
                                    </div>
                                  </div>
                                  <div className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${traceAccentTextClass} ${traceAccentFillClass}`}>
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
                    <div className={`relative h-full overflow-hidden rounded-[2rem] border ${traceCardClass}`}>
                      <div className="grid h-full gap-4 p-5 sm:grid-cols-[0.9fr_1.1fr]">
                        <div className="flex flex-col justify-between space-y-5">
                          <div className={`relative flex size-11 items-center justify-center rounded-full border ${tracePanelClass}`}>
                            <div className={`absolute inset-[-8px] rounded-full border ${isLight ? "border-slate-300/60" : "border-white/6"}`} />
                            <div className="flex items-center gap-1">
                              <span className={`block size-1.5 rounded-full ${isLight ? "bg-slate-700" : "bg-white"}`} />
                              <span className={`block size-1.5 rounded-full ${isLight ? "bg-cyan-600" : "bg-cyan-300"}`} />
                              <span className={`block size-1.5 rounded-full ${isLight ? "bg-sky-500" : "bg-sky-300"}`} />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className={`text-xl font-semibold tracking-[-0.03em] ${traceTitleClass}`}>
                              Built around early programming confidence
                            </h3>
                            <p className={`text-sm leading-6 ${traceBodyClass}`}>
                              Trace is tuned for beginner-friendly concepts and
                              guided instruction.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center gap-3 sm:pl-2">
                          <div className="flex flex-wrap gap-2">
                            {traceFocusAreas.map((area, index) => (
                              <div
                                key={area}
                                className={`rounded-full border px-3 py-1.5 text-[13px] ${tracePanelClass} ${
                                  index === 0 ? traceAccentTextClass : traceBodyClass
                                }`}
                              >
                                {area}
                              </div>
                            ))}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {traceProjectSignals.map((signal) => (
                              <div
                                key={signal.label}
                                className={`rounded-[1rem] border px-3 py-3 ${tracePanelClass}`}
                              >
                                <div className={`text-[10px] uppercase tracking-[0.18em] ${traceLabelClass}`}>
                                  {signal.label}
                                </div>
                                <div className={`mt-1.5 text-[13px] leading-5 ${traceTitleClass}`}>
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
              <div className={`rounded-[2.2rem] border p-8 md:p-10 ${isLight ? "border-slate-200 bg-white/92 shadow-[0_18px_44px_rgba(15,23,42,0.08)]" : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.012))]"}`}>
                <div className={`mb-3 text-[11px] uppercase tracking-[0.28em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  About
                </div>
                <h2
                  className={`text-4xl font-bold md:text-5xl ${isLight ? "text-slate-900" : "text-white"}`}
                >
                  {typedCreatorHeading}
                  <span
                    className={`ml-1 inline-block h-[0.88em] w-[2px] bg-[#73cfff]/90 align-[-0.08em] shadow-[0_0_10px_rgba(82,183,255,0.28)] ${
                      creatorInView
                        ? "animate-[cursorBlink_1s_steps(1)_infinite]"
                        : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </h2>
                <div className="mt-4 text-sm uppercase tracking-[0.22em] text-cyan-300">
                  Matthew Wilmot · MIT Undergraduate
                </div>
                <p className={`mt-6 max-w-2xl text-sm leading-8 md:text-base ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  T.R.A.C.E. began as an attempt to rethink the relationship between human intent and software creation. Rather than forcing users to begin with syntax, the idea is to let them begin with logic, structure, and thought. The goal is not to remove rigor from programming, but to lower the surface-level friction so that more attention can go toward actual problem solving.
                </p>
                <p className={`mt-6 max-w-2xl text-sm leading-8 md:text-base ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  The motivation behind the product is both practical and educational: make programming feel more direct for builders, while also making computational thinking more accessible for beginners. T.R.A.C.E. is meant to sit at that intersection, where software creation feels cleaner, more intentional, and more human.
                </p>
              </div>
            </Reveal>

            <Reveal inView={creatorRevealInView} delay={140}>
              <div className={`rounded-[2rem] border p-7 ${isLight ? "border-slate-200 bg-white/92 shadow-[0_18px_44px_rgba(15,23,42,0.08)]" : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))]"}`}>
                <div className={`mb-4 text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  Contact
                </div>

                <div className="space-y-5">
                  <div>
                    <div className={`text-[11px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      Email
                    </div>
                    <div className={`mt-2 text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                      hello@id8.dev
                    </div>
                  </div>

                  <div>
                    <div className={`text-[11px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      Phone
                    </div>
                    <div className={`mt-2 text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                      +1 (555) 281-9042
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/[0.06] pt-5 text-xs uppercase tracking-[0.18em] text-neutral-500">
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
              <div
                className={`pointer-events-none absolute left-1/2 top-[-4rem] h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${
                  isLight
                    ? "bg-[radial-gradient(circle,rgba(14,165,233,0.18),transparent_70%)]"
                    : "bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_70%)]"
                }`}
              />

              <div className="relative z-10 mx-auto max-w-6xl">
                <div
                  className={`mb-4 text-center text-[10px] uppercase tracking-[0.26em] ${traceLabelClass}`}
                >
                  Learning Center
                </div>
                <h2
                  className={`mx-auto max-w-3xl text-center text-4xl font-bold leading-[0.95] tracking-[-0.045em] md:text-5xl ${traceTitleClass}`}
                >
                  Learn Computer Science Concepts Like Never Before
                </h2>
                <p
                  className={`mx-auto mt-5 max-w-2xl text-center text-sm leading-7 md:text-[15px] ${traceBodyClass}`}
                >
                  Explore guided computer science pathways built for the TRACE
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
                      <button
                        type="button"
                        onClick={() =>
                          handleLearningCenterCardClick(topic.destination)
                        }
                        className={`group relative flex min-h-[29rem] w-full overflow-hidden rounded-[2rem] border text-left transition-all duration-300 ${
                          isLight
                            ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.94))] shadow-[0_18px_46px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 hover:border-sky-300/70 hover:shadow-[0_26px_60px_rgba(59,130,246,0.14)]"
                            : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.034),rgba(255,255,255,0.012))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)] hover:-translate-y-1.5 hover:border-cyan-300/25 hover:shadow-[0_24px_56px_rgba(0,0,0,0.3),0_0_34px_rgba(56,189,248,0.05)]"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 overflow-hidden ${
                            isLight
                              ? "bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.28),rgba(255,255,255,0.78)_48%,rgba(241,245,249,0.94)_100%)]"
                              : "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(13,19,32,0.74)_48%,rgba(8,8,8,0.98)_100%)]"
                          }`}
                        >
                          <Image
                            src={topic.imageSrc}
                            alt={topic.title}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div
                            className={`pointer-events-none absolute inset-0 ${
                              isLight
                                ? "[background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)]"
                                : "[background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]"
                            } [background-position:center] [background-size:32px_32px] opacity-70`}
                          />
                          <div
                            className={`pointer-events-none absolute inset-0 ${
                              isLight
                                ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,23,42,0.04)_56%,rgba(15,23,42,0.84)_100%)]"
                                : "bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.84)_100%)]"
                            }`}
                          />
                        </div>

                        <div className="relative z-10 mt-auto flex flex-col p-6">
                          <h3
                            className={`text-2xl font-bold leading-tight tracking-[-0.03em] ${
                              isLight ? "text-white" : "text-white"
                            }`}
                          >
                            {topic.title}
                          </h3>
                          <p
                            className={`mt-4 flex-1 text-sm leading-7 ${
                              isLight ? "text-white/80" : "text-neutral-300"
                            }`}
                          >
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

        @keyframes metalSweep {
          0% {
            transform: translateX(-35%);
          }
          100% {
            transform: translateX(35%);
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

        @keyframes orbPulse {
          0%,
          100% {
            opacity: 0.38;
            scale: 1;
          }
          50% {
            opacity: 0.58;
            scale: 1.04;
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

        @keyframes cardSweep {
          0%,
          64%,
          100% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          72% {
            opacity: 0.42;
          }
          88% {
            transform: translateX(320%) skewX(-16deg);
            opacity: 0.05;
          }
        }

        @keyframes testimonialScroll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        .testimonial-scroll {
          animation-name: testimonialScroll;
          animation-duration: var(--scroll-duration, 18s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-scroll {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
