"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggleButton, useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";
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

const ENTRY_MODE_ACCENTS: Record<
  EntryMode,
  {
    text: string;
    border: string;
    bg: string;
    hoverBorder: string;
    hoverBg: string;
    bar: string;
    shadow: string;
    borderColor: string;
    glowColor: string;
  }
> = {
  strict: {
    text: "text-rose-100",
    border: "border-rose-400/35",
    bg: "bg-rose-500/10",
    hoverBorder: "hover:border-rose-300/50",
    hoverBg: "hover:bg-rose-500/15",
    bar: "bg-rose-400",
    shadow: "shadow-[0_0_34px_rgba(244,63,94,0.16)]",
    borderColor: "rgba(244,63,94,0.32)",
    glowColor: "rgba(244,63,94,0.18)",
  },
  standard: {
    text: "text-blue-100",
    border: "border-blue-300/35",
    bg: "bg-blue-500/10",
    hoverBorder: "hover:border-blue-300/50",
    hoverBg: "hover:bg-blue-500/15",
    bar: "bg-blue-400",
    shadow: "shadow-[0_0_34px_rgba(79,141,253,0.16)]",
    borderColor: "rgba(96,165,250,0.34)",
    glowColor: "rgba(79,141,253,0.2)",
  },
  abstraction: {
    text: "text-purple-100",
    border: "border-purple-300/35",
    bg: "bg-purple-500/10",
    hoverBorder: "hover:border-purple-300/50",
    hoverBg: "hover:bg-purple-500/15",
    bar: "bg-purple-400",
    shadow: "shadow-[0_0_34px_rgba(168,85,247,0.16)]",
    borderColor: "rgba(192,132,252,0.34)",
    glowColor: "rgba(168,85,247,0.2)",
  },
  pseudocode: {
    text: "text-yellow-100",
    border: "border-yellow-300/35",
    bg: "bg-yellow-400/10",
    hoverBorder: "hover:border-yellow-300/50",
    hoverBg: "hover:bg-yellow-400/15",
    bar: "bg-yellow-300",
    shadow: "shadow-[0_0_34px_rgba(250,204,21,0.16)]",
    borderColor: "rgba(250,204,21,0.34)",
    glowColor: "rgba(250,204,21,0.18)",
  },
};

const ENTRY_MODE_LIGHT_ACCENTS: typeof ENTRY_MODE_ACCENTS = {
  strict: {
    text: "text-rose-700",
    border: "border-rose-300/80",
    bg: "bg-rose-50",
    hoverBorder: "hover:border-rose-400",
    hoverBg: "hover:bg-rose-100",
    bar: "bg-rose-500",
    shadow: "shadow-[0_18px_44px_rgba(244,63,94,0.08)]",
    borderColor: "rgba(244,63,94,0.26)",
    glowColor: "rgba(244,63,94,0.12)",
  },
  standard: {
    text: "text-blue-700",
    border: "border-blue-300/80",
    bg: "bg-blue-50",
    hoverBorder: "hover:border-blue-400",
    hoverBg: "hover:bg-blue-100",
    bar: "bg-blue-500",
    shadow: "shadow-[0_18px_44px_rgba(37,99,235,0.08)]",
    borderColor: "rgba(37,99,235,0.26)",
    glowColor: "rgba(37,99,235,0.12)",
  },
  abstraction: {
    text: "text-purple-700",
    border: "border-purple-300/80",
    bg: "bg-purple-50",
    hoverBorder: "hover:border-purple-400",
    hoverBg: "hover:bg-purple-100",
    bar: "bg-purple-500",
    shadow: "shadow-[0_18px_44px_rgba(147,51,234,0.08)]",
    borderColor: "rgba(147,51,234,0.26)",
    glowColor: "rgba(147,51,234,0.12)",
  },
  pseudocode: {
    text: "text-amber-700",
    border: "border-amber-300/80",
    bg: "bg-amber-50",
    hoverBorder: "hover:border-amber-400",
    hoverBg: "hover:bg-amber-100",
    bar: "bg-amber-500",
    shadow: "shadow-[0_18px_44px_rgba(217,119,6,0.08)]",
    borderColor: "rgba(217,119,6,0.26)",
    glowColor: "rgba(217,119,6,0.12)",
  },
};

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

export function LearningCenterLessonPage({ tabId }: { tabId: TabId }) {
  const router = useRouter();
  const { isLight } = useTheme();
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
  const accentSet = isLight ? ENTRY_MODE_LIGHT_ACCENTS : ENTRY_MODE_ACCENTS;
  const modeAccent = accentSet[entryMode];
  const headerGlowStyle = {
    boxShadow: `inset 0 -1px 0 ${modeAccent.borderColor}, 0 0 42px ${modeAccent.glowColor}`,
  };
  const projectLimitReached =
    isAuthed &&
    projectCount !== null &&
    !canCreateProject(currentTier, projectCount);

  const sidebarBorderClass = isLight ? "border-slate-200/90" : "border-white/[0.08]";
  const sidebarBackgroundClass = isLight ? "bg-[#f6f9fc]" : "bg-[#090909]";
  const softSurfaceClass = isLight
    ? "border-slate-200/90 bg-white/90"
    : "border-white/[0.08] bg-white/[0.025]";
  const mutedTextClass = isLight ? "text-slate-600" : "text-neutral-400";
  const activeItemClass = isLight
    ? "border-blue-300 bg-blue-50 text-slate-950"
    : "border-blue-300/30 bg-blue-400/10 text-white";
  const inactiveItemClass =
    isLight
      ? "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950"
      : "border-transparent text-neutral-400 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white";
  const codeSurfaceClass = isLight
    ? "border-slate-200/90 bg-white text-slate-700"
    : "border-white/[0.08] bg-[#050505] text-neutral-300";

  if (!authResolved || !isAuthed) {
    return (
      <main
        className={cn(
          "flex h-screen w-screen items-center justify-center overflow-hidden text-sm",
          isLight ? "bg-[#eef3f9] text-slate-500" : "bg-[#020202] text-neutral-400"
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
    <main
      className={cn(
        "relative flex h-screen w-screen overflow-hidden",
        isLight ? "bg-[#eef3f9] text-slate-900" : "bg-[#020202] text-white"
      )}
    >
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-30 h-screen shrink-0 overflow-y-auto border-r p-4 transition-[width,transform,opacity,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:relative",
          sidebarOpen
            ? "w-[18rem] translate-x-0 opacity-100"
            : "pointer-events-none w-0 -translate-x-full overflow-hidden p-0 opacity-0 lg:translate-x-0",
          sidebarBorderClass,
          sidebarBackgroundClass
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className={cn("mb-4 border-b pb-4", sidebarBorderClass)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", isLight ? "text-slate-500" : "text-neutral-500")}>
                Lessons
              </div>
              <div className={cn("mt-2 text-[1.15rem] font-semibold leading-tight", isLight ? "text-slate-950" : "text-white")}>
                {activeTabMeta.shortTitle}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse syllabus"
              className={cn(
                "group flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border transition-colors",
                isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50"
                  : "border-white/[0.08] bg-[#0b0b0b] hover:bg-[#111111]"
              )}
            >
              <div className="relative h-4 w-5">
                <span className={cn("absolute left-0 top-0 h-[2px] w-5 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
                <span className={cn("absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
                <span className={cn("absolute bottom-0 left-0 h-[2px] w-5 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
              </div>
            </button>
          </div>
          <div className={cn("mt-2 text-xs", isLight ? "text-slate-500" : "text-neutral-500")}>
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
                  "overflow-hidden rounded-[1rem] border transition-colors",
                  isLessonActive ? activeItemClass : softSurfaceClass
                )}
              >
                <div className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => openLesson(lesson.id)}
                    className="min-w-0 flex-1 px-3 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          isLessonActive
                            ? isLight
                              ? "border-blue-300 bg-white text-blue-700"
                              : "border-blue-300/30 bg-blue-400/10 text-blue-200"
                            : isLight
                            ? "border-slate-200 bg-white text-slate-500"
                            : "border-white/[0.08] bg-white/[0.03] text-neutral-500"
                        )}
                      >
                        {String(lesson.number).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {lesson.title}
                        </span>
                        <span className={cn("mt-0.5 block text-xs", isLight ? "text-slate-500" : "text-neutral-500")}>
                          {lesson.topics.length} topics
                        </span>
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label={
                      isExpanded
                        ? `Collapse ${lesson.title}`
                        : `Expand ${lesson.title}`
                    }
                    onClick={() => toggleLesson(lesson.id)}
                    className={cn(
                      "flex w-11 items-center justify-center border-l transition-colors",
                      isLight
                        ? "border-slate-200 text-slate-500 hover:text-slate-950"
                        : "border-white/[0.08] text-neutral-500 hover:text-white"
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
                  <div className={cn("mx-3 mb-3 space-y-1 border-l pl-3", sidebarBorderClass)}>
                    {lesson.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => selectTopic(topic.id)}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-[0.75rem] px-2.5 py-2 text-left text-sm transition-colors",
                          activeTopicId === topic.id
                            ? isLight
                              ? "bg-white text-slate-950"
                              : "bg-white/[0.06] text-white"
                            : isLight
                            ? "text-slate-600 hover:bg-white hover:text-slate-950"
                            : "text-neutral-400 hover:bg-white/[0.035] hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            activeTopicId === topic.id
                              ? "bg-[#4f8dfd]"
                              : isLight
                              ? "bg-slate-300"
                              : "bg-white/20"
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

      <section className={cn("flex min-w-0 flex-1 flex-col", isLight ? "bg-[#f4f8fc]" : "bg-[#050505]")}>
        <header
          className={cn(
            "border-b px-4 py-3 backdrop-blur-md transition-shadow duration-300",
            isLight ? "border-slate-200/90 bg-white/92" : "border-white/[0.08] bg-[#090909]/96"
          )}
          style={headerGlowStyle}
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label={sidebarOpen ? "Collapse syllabus" : "Expand syllabus"}
                className={cn(
                  "group flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border transition-all duration-300",
                  isLight ? "bg-white hover:bg-slate-50" : "bg-[#0b0b0b] hover:bg-[#111111]",
                  sidebarOpen ? sidebarBorderClass : modeAccent.border
                )}
              >
                <div className="relative h-4 w-5">
                  <span className={cn("absolute left-0 top-0 h-[2px] w-5 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
                  <span className={cn("absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
                  <span className={cn("absolute bottom-0 left-0 h-[2px] w-5 rounded-full transition-colors duration-300", isLight ? "bg-slate-500 group-hover:bg-slate-900" : "bg-neutral-400 group-hover:bg-white")} />
                </div>
              </button>

              <div className="min-w-0">
                <div className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", modeAccent.text)}>
                  Learning workspace
                </div>
                <h1 className={cn("mt-1 truncate text-[1.35rem] font-semibold leading-tight", isLight ? "text-slate-950" : "text-white")}>
                  {activeTabMeta.title}
                </h1>
                <div className={cn("mt-1 text-xs", isLight ? "text-slate-500" : "text-neutral-500")}>
                  Topic {currentTopicPosition} of {totalTopicCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <ThemeToggleButton variant="ide" />
              <Link
                href="/resources"
                className={cn(
                  "rounded-[0.95rem] border px-3 py-2 text-sm transition-colors",
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                    : "border-neutral-900 bg-[#0a0a0a] text-neutral-300 hover:border-neutral-700 hover:bg-[#111111] hover:text-white"
                )}
              >
                Back
              </Link>
              <Link
                href={courseSwitchHref}
                aria-label={`Open ${courseSwitchLabel}`}
                className={cn(
                  "rounded-[0.95rem] border px-3 py-2 text-sm transition-colors",
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                    : "border-neutral-900 bg-[#0a0a0a] text-neutral-300 hover:border-neutral-700 hover:bg-[#111111] hover:text-white"
                )}
              >
                Switch course
              </Link>
            </div>
          </div>

          <div className={cn("mt-3 h-1.5 overflow-hidden rounded-full", isLight ? "bg-slate-200" : "bg-white/[0.08]")}>
            <div
              className={cn("h-full rounded-full transition-[width,background-color] duration-500", modeAccent.bar)}
              style={{ width: `${courseProgressPercent}%` }}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <article className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-5 py-6 md:px-7 lg:px-8">
              <header className={cn("border-b pb-6", sidebarBorderClass)}>
                <div className={cn("text-[11px] uppercase tracking-[0.22em]", isLight ? "text-slate-500" : "text-neutral-500")}>
                  Lesson {activeTopic.lesson.number} - {activeTopic.lesson.title}
                </div>
                <h2 className={cn("mt-2 text-3xl font-bold tracking-normal md:text-4xl", isLight ? "text-slate-950" : "text-white")}>
                  {activeTopic.topic.title}
                </h2>
                <p className={cn("mt-3 max-w-3xl text-sm leading-7 md:text-base", mutedTextClass)}>
                  {activeTopic.lesson.overview}
                </p>
              </header>

              <div className="mt-6 space-y-6">
                <div className="grid gap-4 xl:grid-cols-2">
                  <section className={cn("rounded-[1.1rem] border p-5", softSurfaceClass)}>
                    <div className={cn("text-[11px] uppercase tracking-[0.2em]", isLight ? "text-slate-500" : "text-neutral-500")}>
                      Concept
                    </div>
                    <p className={cn("mt-3 text-sm leading-7 md:text-base", mutedTextClass)}>
                      {activeTopic.topic.definition}
                    </p>
                  </section>

                  <section className={cn("rounded-[1.1rem] border p-5", softSurfaceClass)}>
                    <div className={cn("text-[11px] uppercase tracking-[0.2em]", isLight ? "text-slate-500" : "text-neutral-500")}>
                      When to use it
                    </div>
                    <p className={cn("mt-3 text-sm leading-7 md:text-base", mutedTextClass)}>
                      {activeTopic.topic.howAndWhy}
                    </p>
                  </section>
                </div>

                <section
                  className={cn(
                    "rounded-[1.1rem] border transition-colors duration-300",
                    isLight ? "bg-white/90" : "bg-white/[0.025]",
                    modeAccent.border,
                    modeAccent.shadow
                  )}
                >
                  <div
                    className={cn(
                      "border-b px-4 py-4 md:px-5",
                      isLight ? "border-slate-200/90 bg-white" : "border-white/[0.08] bg-[#090909]"
                    )}
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className={cn("text-[11px] uppercase tracking-[0.2em]", modeAccent.text)}>
                        Examples
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ENTRY_MODE_OPTIONS.map((mode) => {
                          const itemAccent = accentSet[mode.id];

                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setEntryMode(mode.id)}
                              className={cn(
                                "rounded-full border px-3 py-2 text-xs transition-colors",
                                entryMode === mode.id
                                  ? `${itemAccent.border} ${itemAccent.bg} ${itemAccent.text}`
                                  : isLight
                                  ? `border-transparent text-slate-600 hover:text-slate-950 ${itemAccent.hoverBorder} ${itemAccent.hoverBg}`
                                  : `border-transparent text-neutral-400 hover:bg-white/[0.035] hover:text-white ${itemAccent.hoverBorder} ${itemAccent.hoverBg}`
                              )}
                            >
                              {mode.label}
                            </button>
                          );
                        })}
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
                            <div className={cn("text-[11px] uppercase tracking-[0.2em]", isLight ? "text-slate-500" : "text-neutral-500")}>
                              Example {index + 1}
                            </div>

                            {activeExampleMode && buttonState ? (
                              <button
                                type="button"
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
                                className={cn(
                                  "rounded-[0.95rem] border px-4 py-2 text-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
                                  modeAccent.border,
                                  modeAccent.bg,
                                  modeAccent.text,
                                  modeAccent.hoverBorder,
                                  modeAccent.hoverBg
                                )}
                              >
                                {isCreating ? "Creating..." : "Try it Yourself"}
                              </button>
                            ) : null}
                          </div>

                          <pre
                            className={cn(
                              "mt-3 overflow-x-auto whitespace-pre-wrap rounded-[1rem] border px-4 py-4 text-sm leading-7",
                              codeSurfaceClass,
                              modeAccent.border
                            )}
                          >
                            {displayedExampleLines.join("\n")}
                          </pre>

                          {inlineMessage ? (
                            <p
                              className={cn(
                                "mt-2 text-xs leading-6",
                                exampleActionState?.id === example.id &&
                                  exampleActionState.tone === "error"
                                  ? "text-rose-300"
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
                  className={cn("grid gap-3 border-t pt-5 sm:grid-cols-2", sidebarBorderClass)}
                  aria-label="Lesson topic navigation"
                >
                  <button
                    type="button"
                    disabled={!previousTopic}
                    onClick={() => previousTopic && selectTopic(previousTopic.topic.id)}
                    className={cn(
                      "rounded-[1rem] border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      previousTopic ? inactiveItemClass : softSurfaceClass
                    )}
                  >
                    <span className={cn("block text-xs", isLight ? "text-slate-500" : "text-neutral-500")}>Previous topic</span>
                    <span className="mt-1 flex items-center gap-2 text-sm font-medium">
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

                  <button
                    type="button"
                    disabled={!nextTopic}
                    onClick={() => nextTopic && selectTopic(nextTopic.topic.id)}
                    className={cn(
                      "rounded-[1rem] border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:text-right",
                      nextTopic
                        ? `${modeAccent.border} ${modeAccent.bg} ${modeAccent.text} ${modeAccent.hoverBorder} ${modeAccent.hoverBg}`
                        : softSurfaceClass
                    )}
                  >
                    <span className={cn("block text-xs", isLight ? "text-slate-500" : "text-neutral-500")}>Next topic</span>
                    <span className="mt-1 flex items-center gap-2 text-sm font-medium sm:justify-end">
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
