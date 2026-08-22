"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggleButton } from "@/components/theme-provider";
import { Button } from "@/design/primitives";
import { cn } from "@/lib/cn";
import { getSupabaseSession } from "@/lib/supabase/client";
import {
  canCreateProject,
  type IdeModeName,
  SUBSCRIPTION_META,
  tierAllowsMode,
} from "@/lib/subscriptions";
import {
  TUTORIAL_TABS,
  findTopicById,
  getFirstTopicId,
  getLessonsForTab,
  type TabId,
} from "./tutorial-data";
import { LEARNING_CENTER_TAB_ROUTES } from "./resource-routes";
import { useLearningCenterAccess } from "./use-learning-center-access";

type ResourceFileNode = {
  id: string;
  type: "file";
  name: string;
  content: string;
};

type ResourceFolderNode = {
  id: string;
  type: "folder";
  name: string;
  isOpen: boolean;
  children: ResourceExplorerNode[];
};

type ResourceExplorerNode = ResourceFileNode | ResourceFolderNode;

type PlayableEntryMode = "strict" | "standard" | "abstraction";
type EntryMode = PlayableEntryMode | "pseudocode";

const PLAYABLE_ENTRY_MODES: Array<{
  id: PlayableEntryMode;
  label: string;
}> = [
  { id: "strict", label: "Strict" },
  { id: "standard", label: "Standard" },
  { id: "abstraction", label: "Abstraction" },
];

const ENTRY_MODE_OPTIONS: Array<{
  id: EntryMode;
  label: string;
}> = [
  { id: "strict", label: "Strict" },
  { id: "standard", label: "Standard" },
  { id: "abstraction", label: "Abstraction" },
  { id: "pseudocode", label: "Pseudocode" },
];

/*
 * The four entry modes used to own a colour each -- rose, blue, purple, amber --
 * in two parallel tables, one per theme, which the whole page then read from.
 * Both tables are gone.
 *
 * A mode is a choice, not a status, and the system keeps colour for meaning: one
 * accent for what is selected, and the state tokens reserved for success,
 * warning and blocked. Selection is now carried by depth instead -- the chosen
 * mode sits pressed into the toolbar while the others stay proud of it -- and by
 * the label, which is what a student reads first and the only part of the cue
 * that survives a washed-out projector.
 */

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildExampleStarterTree(content: string): ResourceExplorerNode[] {
  return [
    {
      id: uid("folder"),
      type: "folder",
      name: "root",
      isOpen: true,
      children: [
        {
          id: uid("file"),
          type: "file",
          name: "main.synth",
          content,
        },
      ],
    },
  ];
}

/* ---- Surfaces -----------------------------------------------------------
 *
 * The lighting rule from design/tokens.css holds throughout this page: things
 * you press sit raised, wells you read or scroll into are recessed, and labels
 * set into a surface are inlaid. Every colour is a token, so nothing here
 * branches on the theme -- the tokens swap on their own.
 */

const dividerClass = "border-[var(--border-subtle)]";

/*
 * A lesson row in the syllabus. It rests on the sunken sidebar, so it takes the
 * base rung -- but it never travels, because it is a container wrapping two
 * separate controls (open the lesson, toggle its topics). Lifting the whole row
 * on hover would claim both were under the cursor.
 */
const softSurfaceClass =
  "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised)]";

const activeItemClass =
  "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--text-primary)] shadow-[var(--raised)]";

/*
 * --text-soft is deliberately absent from this page. It clears AA against the
 * page itself with room to spare, but only barely against the two grounds this
 * layout actually puts secondary text on: 4.63:1 on a sheened raised card in
 * dark, 4.60:1 in a sunken well in light. Both are nominally AA and neither has
 * a tenth of a point of margin, so this page uses muted throughout.
 */
const mutedTextClass = "text-[var(--text-muted)]";

/*
 * The example listing is a well. Code is read into it and it scrolls sideways,
 * so it takes the opposite lighting to anything pressable.
 */
const codeSurfaceClass =
  "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-primary)] shadow-[var(--recessed)]";

/*
 * Every standalone control on the page: proud at rest, rising toward the light
 * on hover, then pushed in and inverted when held. Motion-reduce keeps the
 * depth and drops only the travel, so a press is never signalled by movement
 * alone.
 */
const pressableClass = cn(
  "transition-[background-color,border-color,box-shadow,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
  "shadow-[var(--raised)] hover:shadow-[var(--lifted)] hover:-translate-y-[var(--lift-travel)]",
  "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none"
);

/* A disabled control is not a thing you can press, so the depth goes with it. */
const pressableDisabledClass = cn(
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
  "disabled:hover:shadow-none disabled:hover:translate-y-0",
  "disabled:active:shadow-none disabled:active:translate-y-0"
);

/*
 * Rows inside a card -- syllabus segments and topic links. They press in rather
 * than travelling: they are flush parts of the card, and moving one would drag
 * its neighbours out of alignment.
 */
const flushRowClass =
  "transition-[background-color,color,box-shadow] duration-[var(--duration-press)] active:shadow-[var(--pressed)]";

export function LearningCenterLessonPage({ tabId }: { tabId: TabId }) {
  const router = useRouter();
  const {
    authResolved,
    currentTier,
    isAuthed,
    projectCount,
    setProjectCount,
    supabase,
  } = useLearningCenterAccess();
  const lessons = useMemo(() => getLessonsForTab(tabId), [tabId]);
  const [activeTopicId, setActiveTopicId] = useState(() => getFirstTopicId(tabId));
  const [expandedLessonIds, setExpandedLessonIds] = useState<string[]>([]);
  const [entryMode, setEntryMode] = useState<EntryMode>("strict");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creatingExampleId, setCreatingExampleId] = useState<string | null>(null);
  const [exampleActionState, setExampleActionState] = useState<{
    id: string;
    message: string;
    tone: "error" | "info";
  } | null>(null);

  useEffect(() => {
    const firstLesson = lessons[0];
    setActiveTopicId(getFirstTopicId(tabId));
    setExpandedLessonIds(firstLesson ? [firstLesson.id] : []);
  }, [lessons, tabId]);

  const activeTopic = useMemo(
    () => findTopicById(tabId, activeTopicId),
    [activeTopicId, tabId]
  );
  const flatTopics = useMemo(
    () =>
      lessons.flatMap((lesson) =>
        lesson.topics.map((topic) => ({
          lesson,
          topic,
        }))
      ),
    [lessons]
  );
  const activeTabMeta =
    TUTORIAL_TABS.find((tab) => tab.id === tabId) ?? TUTORIAL_TABS[0];
  const activeTopicIndex = flatTopics.findIndex(
    (item) => item.topic.id === activeTopic.topic.id
  );
  const previousTopic =
    activeTopicIndex > 0 ? flatTopics[activeTopicIndex - 1] : null;
  const nextTopic =
    activeTopicIndex >= 0 && activeTopicIndex < flatTopics.length - 1
      ? flatTopics[activeTopicIndex + 1]
      : null;
  const currentTopicPosition =
    activeTopicIndex >= 0 ? activeTopicIndex + 1 : 1;
  const totalTopicCount = flatTopics.length;
  const courseProgressPercent =
    totalTopicCount > 0
      ? Math.round((currentTopicPosition / totalTopicCount) * 100)
      : 0;
  const courseSwitchHref =
    tabId === "operators"
      ? LEARNING_CENTER_TAB_ROUTES["data-structures-algorithms"]
      : LEARNING_CENTER_TAB_ROUTES.operators;
  const courseSwitchLabel =
    tabId === "operators"
      ? "Data Structures and Algorithms"
      : "Operators, Primitives and Logic Structures";
  const activeExampleMode =
    entryMode === "pseudocode" ? null : (entryMode as PlayableEntryMode);
  const projectLimitReached =
    isAuthed &&
    projectCount !== null &&
    !canCreateProject(currentTier, projectCount);

  if (!authResolved || !isAuthed) {
    return (
      <main
        className={cn(
          "flex h-screen w-screen items-center justify-center overflow-hidden",
          "bg-[var(--surface-page)] text-[length:var(--text-sm)]",
          mutedTextClass
        )}
      >
        Loading lessons...
      </main>
    );
  }

  function toggleLesson(lessonId: string) {
    setExpandedLessonIds((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId]
    );
  }

  function openLesson(lessonId: string) {
    setExpandedLessonIds((current) =>
      current.includes(lessonId) ? current : [...current, lessonId]
    );
    setActiveTopicId(getFirstTopicId(tabId, lessonId));
  }

  function selectTopic(topicId: string) {
    const owningLesson = flatTopics.find((item) => item.topic.id === topicId);

    if (owningLesson) {
      setExpandedLessonIds((current) =>
        current.includes(owningLesson.lesson.id)
          ? current
          : [...current, owningLesson.lesson.id]
      );
    }

    setActiveTopicId(topicId);
  }

  async function handleTryItYourself(
    exampleId: string,
    mode: PlayableEntryMode,
    content: string[],
    topicTitle: string,
    exampleNumber: number
  ) {
    setExampleActionState(null);

    if (!isAuthed) {
      router.push("/login");
      return;
    }

    if (!tierAllowsMode(currentTier, mode as IdeModeName)) {
      setExampleActionState({
        id: exampleId,
        message: `${PLAYABLE_ENTRY_MODES.find((item) => item.id === mode)?.label} mode is locked on your current plan.`,
        tone: "error",
      });
      return;
    }

    setCreatingExampleId(exampleId);

    try {
      const session = await getSupabaseSession(supabase);

      if (!session) {
        router.push("/login");
        return;
      }

      const { count, error: countError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (countError) {
        throw countError;
      }

      const nextProjectCount = count ?? 0;
      setProjectCount(nextProjectCount);

      if (!canCreateProject(currentTier, nextProjectCount)) {
        setExampleActionState({
          id: exampleId,
          message: `Your ${SUBSCRIPTION_META[currentTier].label} plan has reached its project cap.`,
          tone: "error",
        });
        return;
      }

      const projectName = `${topicTitle} ${PLAYABLE_ENTRY_MODES.find((item) => item.id === mode)?.label} Example ${exampleNumber}`;
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: session.user.id,
          name: projectName,
          tree_json: buildExampleStarterTree(content.join("\n")),
        })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Could not create project.");
      }

      setProjectCount(nextProjectCount + 1);
      router.push(`/ide?project=${data.id}&mode=${mode}`);
    } catch (error) {
      console.error(error);
      setExampleActionState({
        id: exampleId,
        message:
          error instanceof Error ? error.message : "Could not create project.",
        tone: "error",
      });
    } finally {
      setCreatingExampleId(null);
    }
  }

  function getExampleButtonState(mode: PlayableEntryMode) {
    if (!isAuthed) {
      if (mode !== "strict") {
        return {
          disabled: true,
          message: `Upgrade after login to unlock ${PLAYABLE_ENTRY_MODES.find((item) => item.id === mode)?.label} mode.`,
        };
      }

      return {
        disabled: false,
        message: "Log in to create a project from this example.",
      };
    }

    if (!tierAllowsMode(currentTier, mode as IdeModeName)) {
      return {
        disabled: true,
        message: `${PLAYABLE_ENTRY_MODES.find((item) => item.id === mode)?.label} mode is locked on the ${SUBSCRIPTION_META[currentTier].label} plan.`,
      };
    }

    if (projectLimitReached) {
      return {
        disabled: true,
        message: `Your ${SUBSCRIPTION_META[currentTier].label} plan has reached its project cap.`,
      };
    }

    return {
      disabled: false,
      message:
        projectCount === null
          ? "Checking project capacity..."
          : `${projectCount} project${projectCount === 1 ? "" : "s"} in your workspace.`,
    };
  }

  return (
    <main className="relative flex h-screen w-screen overflow-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-30 h-screen shrink-0 overflow-y-auto border-r p-4 lg:relative",
          "transition-[width,transform,opacity,padding] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          // Chrome beside the work rather than part of it, so the syllabus sits
          // back into the page instead of competing with the lesson for depth.
          "bg-[var(--surface-sunken)]",
          dividerClass,
          sidebarOpen
            ? "w-[18rem] translate-x-0 opacity-100"
            : "pointer-events-none w-0 -translate-x-full overflow-hidden p-0 opacity-0 lg:translate-x-0"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className={cn("mb-4 border-b pb-4", dividerClass)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={cn(
                  "text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)]",
                  mutedTextClass
                )}
              >
                Lessons
              </div>
              <div className="mt-2 text-[length:var(--text-lg)] font-semibold leading-tight text-[var(--text-primary)]">
                {activeTabMeta.shortTitle}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse syllabus"
              className={cn(
                "group flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border",
                "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                pressableClass
              )}
            >
              <div className="relative h-4 w-5">
                <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
                <span className="absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
                <span className="absolute bottom-0 left-0 h-[2px] w-5 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
              </div>
            </button>
          </div>
          <div className={cn("mt-2 text-[length:var(--text-xs)]", mutedTextClass)}>
            {lessons.length} lessons / {totalTopicCount} topics
          </div>
        </div>

        <div className="space-y-2">
          {lessons.map((lesson) => {
            const isExpanded = expandedLessonIds.includes(lesson.id);
            const isLessonActive = activeTopic.lesson.id === lesson.id;

            return (
              <div
                key={lesson.id}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-lg)] border transition-colors duration-[var(--duration-base)]",
                  isLessonActive ? activeItemClass : softSurfaceClass
                )}
              >
                <div className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => openLesson(lesson.id)}
                    // Which lesson is open was carried entirely by the accent
                    // tint and the inlaid number badge. Both are invisible to a
                    // screen reader, and the tint alone is the sole signal for
                    // anyone who cannot separate it from the resting surface.
                    aria-current={isLessonActive ? "true" : undefined}
                    className={cn(
                      "min-w-0 flex-1 px-3 py-3 text-left",
                      // An active card is accent-tinted, and an opaque sunken
                      // hover would paint that tint out -- the card would stop
                      // reading as active exactly while the cursor is on it.
                      // Restating the translucent tint deepens it instead.
                      isLessonActive
                        ? "hover:bg-[var(--accent-subtle)]"
                        : "hover:bg-[var(--surface-sunken)]",
                      flushRowClass
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          // The lesson number is a label set into the row, not a
                          // control, so it is inlaid rather than raised.
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                          "text-[length:var(--text-xs)] font-semibold shadow-[var(--inlaid)]",
                          isLessonActive
                            // Raised surface, not accent-subtle: the card behind
                            // it is already tinted, and stacking the two tints
                            // over the sunken row drops accent text to 4.36:1
                            // in light -- still under the 4.5:1 AA floor.
                            ? "border-[var(--accent-border)] bg-[var(--surface-raised)] text-[var(--accent-text)]"
                            : "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]"
                        )}
                      >
                        {String(lesson.number).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[length:var(--text-sm)] font-medium">
                          {lesson.title}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-[length:var(--text-xs)]",
                            mutedTextClass
                          )}
                        >
                          {lesson.topics.length} topics
                        </span>
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `Collapse ${lesson.title}`
                        : `Expand ${lesson.title}`
                    }
                    onClick={() => toggleLesson(lesson.id)}
                    className={cn(
                      "flex w-11 items-center justify-center border-l",
                      "border-[var(--border-subtle)] text-[var(--text-muted)]",
                      "hover:text-[var(--text-primary)]",
                      // Same reason as the row beside it: keep the active card's
                      // tint rather than covering it with an opaque hover.
                      isLessonActive
                        ? "hover:bg-[var(--accent-subtle)]"
                        : "hover:bg-[var(--surface-sunken)]",
                      flushRowClass
                    )}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )}
                      aria-hidden="true"
                    >
                      <path d="m5 7 5 6 5-6" />
                    </svg>
                  </button>
                </div>

                {isExpanded ? (
                  <div className={cn("mx-3 mb-3 space-y-1 border-l pl-3", dividerClass)}>
                    {lesson.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => selectTopic(topic.id)}
                        // "You are here" was the inlaid recess plus an accent
                        // dot -- depth and colour, and nothing else. aria-current
                        // is what makes the selection survive both.
                        aria-current={activeTopicId === topic.id ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left",
                          "text-[length:var(--text-sm)]",
                          flushRowClass,
                          activeTopicId === topic.id
                            // "You are here": set into the card and held there.
                            // The inlaid shading is what keeps it distinct from
                            // a hovered row -- both used to land on the same
                            // fill, so hovering any topic looked like selecting
                            // it.
                            ? "bg-[var(--surface-sunken)] shadow-[var(--inlaid)] text-[var(--text-primary)]"
                            : cn(
                                mutedTextClass,
                                "hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]"
                              )
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            activeTopicId === topic.id
                              ? "bg-[var(--accent-solid)]"
                              : "bg-[var(--border-strong)]"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{topic.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-[var(--surface-page)]">
        {/*
          The workspace bar rests on the page rather than floating over it: it
          scrolls nothing and covers nothing, so --raised is the honest rung. The
          old inline accent glow is gone with the per-mode palettes it came from.
        */}
        <header
          className={cn(
            "border-b px-4 py-3",
            "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised)]",
            dividerClass
          )}
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label={sidebarOpen ? "Collapse syllabus" : "Expand syllabus"}
                className={cn(
                  "group flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border",
                  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                  pressableClass,
                  // A collapsed syllabus is the one state worth flagging, so the
                  // toggle borrows the accent border until it is opened again.
                  sidebarOpen
                    ? "border-[var(--border-strong)]"
                    : "border-[var(--accent-border)]"
                )}
              >
                <div className="relative h-4 w-5">
                  <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
                  <span className="absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
                  <span className="absolute bottom-0 left-0 h-[2px] w-5 rounded-full bg-[var(--text-muted)] transition-colors duration-[var(--duration-base)] group-hover:bg-[var(--text-primary)]" />
                </div>
              </button>

              <div className="min-w-0">
                <div className="text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--accent-text)]">
                  Learning workspace
                </div>
                <h1 className="mt-1 truncate text-[length:var(--text-xl)] font-semibold leading-tight text-[var(--text-primary)]">
                  {activeTabMeta.title}
                </h1>
                <div className={cn("mt-1 text-[length:var(--text-xs)]", mutedTextClass)}>
                  Topic {currentTopicPosition} of {totalTopicCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <ThemeToggleButton variant="ide" />
              <Link
                href="/resources"
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2 text-[length:var(--text-sm)]",
                  "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  pressableClass
                )}
              >
                Back
              </Link>
              <Link
                href={courseSwitchHref}
                aria-label={`Open ${courseSwitchLabel}`}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2 text-[length:var(--text-sm)]",
                  "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  pressableClass
                )}
              >
                Switch course
              </Link>
            </div>
          </div>

          {/* The track is a groove cut into the bar; only the fill sits in it. */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-sunken)] shadow-[var(--recessed)]">
            <div
              className="h-full rounded-full bg-[var(--accent-solid)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]"
              style={{ width: `${courseProgressPercent}%` }}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <article className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-5 py-6 md:px-7 lg:px-8">
              <header className={cn("border-b pb-6", dividerClass)}>
                <div
                  className={cn(
                    "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
                    mutedTextClass
                  )}
                >
                  Lesson {activeTopic.lesson.number} - {activeTopic.lesson.title}
                </div>
                <h2 className="mt-2 text-[length:var(--text-2xl)] font-bold tracking-normal text-[var(--text-primary)] md:text-[length:var(--text-3xl)]">
                  {activeTopic.topic.title}
                </h2>
                <p
                  className={cn(
                    "mt-3 max-w-3xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)]",
                    mutedTextClass
                  )}
                >
                  {activeTopic.lesson.overview}
                </p>
              </header>

              <div className="mt-6 space-y-6">
                <div className="grid gap-4 xl:grid-cols-2">
                  <section className={cn("rounded-[var(--radius-lg)] border p-5", softSurfaceClass)}>
                    <div
                      className={cn(
                        "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
                        mutedTextClass
                      )}
                    >
                      Concept
                    </div>
                    <p
                      className={cn(
                        "mt-3 text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)]",
                        mutedTextClass
                      )}
                    >
                      {activeTopic.topic.definition}
                    </p>
                  </section>

                  <section className={cn("rounded-[var(--radius-lg)] border p-5", softSurfaceClass)}>
                    <div
                      className={cn(
                        "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
                        mutedTextClass
                      )}
                    >
                      When to use it
                    </div>
                    <p
                      className={cn(
                        "mt-3 text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] md:text-[length:var(--text-base)]",
                        mutedTextClass
                      )}
                    >
                      {activeTopic.topic.howAndWhy}
                    </p>
                  </section>
                </div>

                {/*
                  The examples panel is the largest object in the column and the
                  only one carrying its own toolbar, so it sits a rung above the
                  concept cards rather than level with them.
                */}
                <section
                  className={cn(
                    "rounded-[var(--radius-xl)] border",
                    "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                    "shadow-[var(--raised-lg)]"
                  )}
                >
                  <div className={cn("border-b px-4 py-4 md:px-5", dividerClass)}>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--accent-text)]">
                        Examples
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ENTRY_MODE_OPTIONS.map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setEntryMode(mode.id)}
                            aria-pressed={entryMode === mode.id}
                            className={cn(
                              "rounded-full border px-3 py-2 text-[length:var(--text-xs)]",
                              "transition-[background-color,border-color,box-shadow,transform]",
                              "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
                              entryMode === mode.id
                                ? cn(
                                    // The selected mode stays held down. Depth is
                                    // what tells the four chips apart now that
                                    // they no longer own a colour each.
                                    "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)]",
                                    "shadow-[var(--pressed)] translate-y-[var(--press-travel)]",
                                    // Held down, so there is no depth left to
                                    // give on hover -- the border firms up
                                    // instead, so the chip still answers the
                                    // cursor like every other control here.
                                    "hover:border-[var(--accent-solid)]",
                                    "motion-reduce:transform-none"
                                  )
                                : cn(
                                    "border-[var(--border-strong)] bg-[var(--surface-raised)]",
                                    "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                                    "shadow-[var(--raised)] hover:shadow-[var(--lifted)]",
                                    "hover:-translate-y-[var(--lift-travel)]",
                                    "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
                                    "motion-reduce:transform-none motion-reduce:hover:transform-none",
                                    "motion-reduce:active:transform-none"
                                  )
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-4 md:p-5">
                    {activeTopic.topic.examples.map((example, index) => {
                      const displayedExampleLines =
                        entryMode === "strict"
                          ? example.strict
                          : entryMode === "standard"
                          ? example.standard
                          : entryMode === "abstraction"
                          ? example.abstraction
                          : example.pseudocode;
                      const buttonState = activeExampleMode
                        ? getExampleButtonState(activeExampleMode)
                        : null;
                      const exampleLines =
                        activeExampleMode === "strict"
                          ? example.strict
                          : activeExampleMode === "standard"
                          ? example.standard
                          : activeExampleMode === "abstraction"
                          ? example.abstraction
                          : [];
                      const isCreating = creatingExampleId === example.id;
                      const inlineMessage =
                        activeExampleMode && buttonState
                          ? exampleActionState?.id === example.id
                            ? exampleActionState.message
                            : buttonState.message
                          : null;

                      return (
                        <div key={example.id}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div
                              className={cn(
                                "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
                                mutedTextClass
                              )}
                            >
                              Example {index + 1}
                            </div>

                            {activeExampleMode && buttonState ? (
                              // The one action on the panel, so it takes the
                              // accent. Button already carries the press.
                              <Button
                                type="button"
                                variant="primary"
                                size="md"
                                disabled={buttonState.disabled || isCreating}
                                onClick={() =>
                                  void handleTryItYourself(
                                    example.id,
                                    activeExampleMode,
                                    exampleLines,
                                    activeTopic.topic.title,
                                    index + 1
                                  )
                                }
                              >
                                {isCreating ? "Creating..." : "Try it Yourself"}
                              </Button>
                            ) : null}
                          </div>

                          <pre
                            className={cn(
                              "mt-3 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-lg)] border px-4 py-4",
                              /* The lesson's worked example is the same code the
                                 learner is about to type into the editor, so it
                                 is set in the editor's face -- indentation is
                                 the thing being taught here, and it only lines
                                 up in a monospace. */
                              "font-mono text-[length:var(--text-sm)] leading-[var(--leading-relaxed)]",
                              codeSurfaceClass
                            )}
                          >
                            {displayedExampleLines.join("\n")}
                          </pre>

                          {inlineMessage ? (
                            <p
                              className={cn(
                                "mt-2 text-[length:var(--text-xs)] leading-[var(--leading-normal)]",
                                exampleActionState?.id === example.id &&
                                  exampleActionState.tone === "error"
                                  ? "text-[var(--state-blocked)]"
                                  : mutedTextClass
                              )}
                            >
                              {inlineMessage}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <nav
                  className={cn("grid gap-3 border-t pt-5 sm:grid-cols-2", dividerClass)}
                  aria-label="Lesson topic navigation"
                >
                  <button
                    type="button"
                    disabled={!previousTopic}
                    onClick={() => previousTopic && selectTopic(previousTopic.topic.id)}
                    className={cn(
                      "rounded-[var(--radius-lg)] border p-4 text-left",
                      "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                      "text-[var(--text-primary)]",
                      pressableClass,
                      pressableDisabledClass
                    )}
                  >
                    <span className={cn("block text-[length:var(--text-xs)]", mutedTextClass)}>
                      Previous topic
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[length:var(--text-sm)] font-medium">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M12 5 7 10l5 5" />
                        <path d="M7.5 10H16" />
                      </svg>
                      <span>{previousTopic ? previousTopic.topic.title : "Start of course"}</span>
                    </span>
                  </button>

                  {/* Forward is the expected move, so it is the one that gets the accent. */}
                  <button
                    type="button"
                    disabled={!nextTopic}
                    onClick={() => nextTopic && selectTopic(nextTopic.topic.id)}
                    className={cn(
                      "rounded-[var(--radius-lg)] border p-4 text-left sm:text-right",
                      pressableClass,
                      pressableDisabledClass,
                      nextTopic
                        ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)]"
                        : "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--text-primary)]"
                    )}
                  >
                    <span className={cn("block text-[length:var(--text-xs)]", mutedTextClass)}>
                      Next topic
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[length:var(--text-sm)] font-medium sm:justify-end">
                      <span>{nextTopic ? nextTopic.topic.title : "Course complete"}</span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="m8 5 5 5-5 5" />
                        <path d="M4 10h8.5" />
                      </svg>
                    </span>
                  </button>
                </nav>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
