"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import {
  SubscriptionRecord,
  SubscriptionTier,
  SUBSCRIPTION_META,
  canCreateProject,
  getOrCreateSubscription,
  getProjectLimit,
  getProjectLimitLabel,
  getSynthFileLimitLabel,
} from "@/lib/subscriptions";
import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  TypingHeading,
} from "@/components/site-shell";
import { SiteFooter } from "@/components/site-footer";
import { useTheme } from "@/components/theme-provider";

type ExplorerNode =
  | {
      id: string;
      type: "file";
      name: string;
      content: string;
    }
  | {
      id: string;
      type: "folder";
      name: string;
      isOpen: boolean;
      children: ExplorerNode[];
    };

type ProjectRow = {
  id: string;
  name: string;
  updated_at: string;
  tree_json?: ExplorerNode[];
};

type SortMode = "recent" | "oldest" | "name";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function starterTree(): ExplorerNode[] {
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
          content: `here is a list of numbers 9, 3, 12, 1, 5
sort the numbers
print the numbers`,
        },
      ],
    },
  ];
}

function collectSynthFiles(nodes: ExplorerNode[]): { name: string; content: string }[] {
  const files: { name: string; content: string }[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      if (node.name.toLowerCase().endsWith(".synth")) {
        files.push({ name: node.name, content: node.content });
      }
    } else {
      files.push(...collectSynthFiles(node.children));
    }
  }

  return files;
}

function countSynthFiles(nodes?: ExplorerNode[]): number {
  if (!nodes || nodes.length === 0) return 0;
  return collectSynthFiles(nodes).length;
}

function getProjectPreview(tree?: ExplorerNode[]): string {
  if (!tree || tree.length === 0) return "No preview available yet.";

  const files = collectSynthFiles(tree);
  if (files.length === 0) return "No preview available yet.";

  const mainLike =
    files.find((file) => file.name.toLowerCase().includes("main")) || files[0];

  const cleaned = mainLike.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" • ");

  return cleaned || "No preview available yet.";
}

function getRelativeUpdatedLabel(dateString: string) {
  const updated = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - updated);

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  if (hours < 24) return `Updated ${hours} hr${hours === 1 ? "" : "s"} ago`;
  if (days < 30) return `Updated ${days} day${days === 1 ? "" : "s"} ago`;

  return `Updated ${new Date(dateString).toLocaleDateString()}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { isLight } = useTheme();

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [status, setStatus] = useState("Loading projects...");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [sessionEmail, setSessionEmail] = useState("");

  async function loadProjects() {
    const session = await getSupabaseSession(supabase);

    if (!session) {
      router.replace("/login");
      return;
    }

    setSessionEmail(session.user.email ?? "");

    try {
      const record = await getOrCreateSubscription(
        supabase,
        session.user.id,
        session.user.email ?? ""
      );
      setSubscription(record);
    } catch (error) {
      console.error(error);
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, updated_at, tree_json")
      .order("updated_at", { ascending: false });

    if (error) {
      setStatus(error.message);
      return;
    }

    setProjects((data as ProjectRow[]) || []);
    setStatus(data && data.length > 0 ? "Projects loaded." : "No projects yet.");
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const activeTier: SubscriptionTier = subscription?.tier ?? "free";
  const projectLimit = getProjectLimit(activeTier);
  const projectCount = projects.length;
  const atProjectLimit = !canCreateProject(activeTier, projectCount);

  async function handleCreateProject() {
    const name = newProjectName.trim() || "Untitled Project";

    if (atProjectLimit) {
      setShowCreateModal(false);
      setShowLimitModal(true);
      return;
    }

    setIsCreating(true);

    const session = await getSupabaseSession(supabase);

    if (!session) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: session.user.id,
        name,
        tree_json: starterTree(),
      })
      .select("id")
      .single();

    setIsCreating(false);

    if (error || !data) {
      setStatus(error?.message || "Could not create project.");
      return;
    }

    setShowCreateModal(false);
    setNewProjectName("");
    router.push(`/ide?project=${data.id}`);
  }

  async function handleDeleteProject(projectId: string) {
    const ok = window.confirm("Delete this project?");
    if (!ok) return;

    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      setStatus(error.message);
      return;
    }

    await loadProjects();
  }

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const preview = getProjectPreview(project.tree_json).toLowerCase();
      return project.name.toLowerCase().includes(query) || preview.includes(query);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === "oldest") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return sorted;
  }, [projects, searchQuery, sortMode]);

  function openCreateModal() {
    if (atProjectLimit) {
      setShowLimitModal(true);
      return;
    }

    setNewProjectName("");
    setShowCreateModal(true);
  }

  const remainingProjects =
    projectLimit === null ? null : Math.max(projectLimit - projectCount, 0);
  const statCardClass = isLight
    ? "rounded-[2rem] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
    : "rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01))] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]";
  const inputClass = isLight
    ? "w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400/60"
    : "w-full rounded-[1.5rem] border border-white/[0.08] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-blue-400/40";
  const modalSurfaceClass = isLight
    ? "relative z-10 w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
    : "relative z-10 w-full rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_30px_rgba(56,189,248,0.04)]";
  const modalGhostButtonClass = isLight
    ? "rounded-[1.4rem] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    : "rounded-[1.4rem] border border-white/[0.08] bg-[#0b0b0b] px-4 py-2 text-sm text-neutral-300 transition-all duration-300 hover:border-white/12 hover:bg-[#111111] hover:text-white";
  const projectCountBadgeClass = isLight
    ? "mb-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
    : "mb-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400";
  const createCardClass = atProjectLimit
    ? "border-dashed border-amber-400/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.06),rgba(255,255,255,0.006))] hover:border-amber-300/30 hover:bg-[linear-gradient(180deg,rgba(245,158,11,0.1),rgba(255,255,255,0.01))]"
    : isLight
    ? "border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_18px_46px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-blue-300/40 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.98))] hover:shadow-[0_24px_54px_rgba(59,130,246,0.12)]"
    : "border-dashed border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.006))] hover:-translate-y-1 hover:border-blue-400/30 hover:bg-[linear-gradient(180deg,rgba(14,165,233,0.08),rgba(255,255,255,0.01))] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3),0_0_28px_rgba(56,189,248,0.04)]";
  const projectCardClass = isLight
    ? "page-enter-soft group min-h-[250px] cursor-pointer rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-[0_18px_46px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:shadow-[0_24px_54px_rgba(59,130,246,0.12)]"
    : "page-enter-soft group min-h-[250px] cursor-pointer rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:shadow-[0_18px_50px_rgba(0,0,0,0.28),0_0_30px_rgba(56,189,248,0.04)]";
  const projectPreviewClass = isLight
    ? "rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] px-5 py-4 transition-colors duration-300 group-hover:border-slate-300 group-hover:bg-white"
    : "rounded-[1.5rem] border border-white/[0.04] bg-black/25 px-5 py-4 transition-colors duration-300 group-hover:border-white/[0.05]";
  const emptySearchClass = isLight
    ? "page-enter-soft mt-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-10 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
    : "page-enter-soft mt-5 rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.006))] p-10 text-center";

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f4f7fb] text-slate-900" : "bg-[#0f0f10] text-white"
      }`}
    >
      <AppPageBackground />

      <SiteHeader
        tierLabel={SUBSCRIPTION_META[activeTier].label}
        authHref="/dashboard"
        authLabel="Dashboard"
        showSignOut
        className="page-enter-soft"
      />

      <PageFrame>
        <section className="page-enter mb-8">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Dashboard"
              as="h1"
              className={`mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.045em] ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            />

            <p
              className={`mx-auto mt-4 max-w-2xl text-[0.88rem] leading-6 md:text-[0.95rem] md:leading-7 ${
                isLight ? "text-slate-600" : "text-neutral-400"
              }`}
            >
              Manage your projects, jump back into recent work, and keep building inside a cleaner syntaxless workflow.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-blue-300">
                {SUBSCRIPTION_META[activeTier].label}
              </div>
              <div className={projectCountBadgeClass}>
                {projectCount} Project{projectCount === 1 ? "" : "s"}
              </div>
            </div>

            {sessionEmail ? (
              <div className={`mt-4 text-sm ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {sessionEmail}
              </div>
            ) : null}
          </div>
        </section>

        <div
          className="page-enter-soft mb-7 grid gap-4 lg:grid-cols-4"
          style={{ animationDelay: "120ms" }}
        >
          <div className={statCardClass}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Search Projects
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or preview text..."
              className={inputClass}
            />
          </div>

          <div className={statCardClass}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Sort
            </div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className={inputClass}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          <div className={statCardClass}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Project Cap
            </div>
            <div className={`text-sm leading-7 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {getProjectLimitLabel(activeTier)}
            </div>
            <div className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              {remainingProjects === null
                ? "Unlimited remaining"
                : `${remainingProjects} remaining`}
            </div>
          </div>

          <div className={statCardClass}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Synth File Cap
            </div>
            <div className={`text-sm leading-7 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {getSynthFileLimitLabel(activeTier)} / project
            </div>
            <div className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Enforced in IDE file actions
            </div>
          </div>
        </div>

        {projectCount === 0 ? (
          <div
            className={`page-enter-soft rounded-[2rem] border p-12 text-center ${
              isLight
                ? "border-slate-200 bg-white/92 shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
                : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.006))]"
            }`}
            style={{ animationDelay: "220ms" }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-blue-400/20 bg-blue-500/10 text-3xl text-blue-300 shadow-[0_0_30px_rgba(56,189,248,0.08)]">
              +
            </div>
            <TypingHeading
              text="No projects yet"
              as="h2"
              className={isLight ? "text-2xl text-slate-900" : "text-2xl text-white"}
            />
            <p className={`mx-auto mt-3 max-w-xl text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Create your first project to start building in T.R.A.C.E.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-6 rounded-[1.5rem] border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm text-blue-300 transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/15 hover:text-white"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={openCreateModal}
                className={`page-enter-soft group min-h-[250px] rounded-[2rem] border p-6 text-left transition-all duration-300 ${createCardClass}`}
                style={{ animationDelay: "180ms" }}
              >
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-1 flex-col justify-center">
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border text-3xl transition-all duration-300 ${
                      atProjectLimit
                        ? "border-amber-400/20 bg-amber-500/8 text-amber-300"
                        : "border-blue-400/20 bg-blue-500/10 text-blue-300 shadow-[0_0_28px_rgba(56,189,248,0.08)] group-hover:scale-105 group-hover:text-white"
                    }`}
                  >
                    {atProjectLimit ? "!" : "+"}
                  </div>
                  <div className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {atProjectLimit ? "Upgrade to Create More" : "Create New Project"}
                  </div>
                  <p className={`mt-3 max-w-sm text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {atProjectLimit
                      ? `Your ${SUBSCRIPTION_META[activeTier].label} plan has reached its project cap.`
                      : "Start a fresh syntaxless workspace and jump straight into building."}
                  </p>
                </div>

                <div
                  className={`text-xs uppercase tracking-[0.22em] ${
                    atProjectLimit ? "text-amber-300" : "text-neutral-500 group-hover:text-blue-300"
                  }`}
                >
                  {atProjectLimit ? "See pricing" : "New workspace"}
                </div>
              </div>
            </button>

            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => router.push(`/ide?project=${project.id}`)}
                className={projectCardClass}
                style={{ animationDelay: `${220 + index * 55}ms` }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-300/80 shadow-[0_0_14px_rgba(125,211,252,0.4)]" />
                          <div className={`text-2xl font-bold transition-colors duration-300 ${isLight ? "text-slate-900 group-hover:text-blue-900" : "text-white group-hover:text-[#eaf5ff]"}`}>
                            {project.name}
                          </div>
                        </div>

                        <div className={`flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                          <span>{getRelativeUpdatedLabel(project.updated_at)}</span>
                          <span className={`h-1 w-1 rounded-full ${isLight ? "bg-slate-300" : "bg-neutral-700"}`} />
                          <span>
                            {countSynthFiles(project.tree_json)} synth file
                            {countSynthFiles(project.tree_json) === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={projectPreviewClass}>
                      <div className={`mb-2 text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                        Preview
                      </div>
                      <p className={`text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {getProjectPreview(project.tree_json)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/ide?project=${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-[1.4rem] border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 transition-all duration-300 hover:bg-blue-500/15 hover:text-white"
                    >
                      Open
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="rounded-[1.4rem] border border-rose-400/20 bg-rose-500/5 px-4 py-2 text-sm text-rose-300 transition-all duration-300 hover:bg-rose-500/10 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {projectCount > 0 && filteredProjects.length === 0 && (
          <div
            className={emptySearchClass}
            style={{ animationDelay: "220ms" }}
          >
            <div className={`mx-auto mb-3 h-10 w-10 rounded-full border ${isLight ? "border-slate-200 bg-white" : "border-white/[0.08] bg-[#0b0b0b]"}`} />
            <TypingHeading
              text="No matching projects"
              as="h2"
              className={isLight ? "text-xl text-slate-900" : "text-xl text-white"}
            />
            <p className={`mt-2 text-sm ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Try a different search term or clear the filter.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className={`mt-5 rounded-[1.4rem] border px-4 py-2 text-sm transition-all duration-300 ${
                isLight
                  ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  : "border-white/[0.08] bg-[#0b0b0b] text-neutral-300 hover:border-white/12 hover:bg-[#111111] hover:text-white"
              }`}
            >
              Clear Search
            </button>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/70"}`}
              onClick={() => setShowCreateModal(false)}
            />
            <div className={`${modalSurfaceClass} max-w-md`}>
              <div className={`mb-2 text-[11px] uppercase tracking-[0.26em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                T.R.A.C.E.
              </div>
              <TypingHeading
                text="New Project"
                as="h2"
                className={isLight ? "text-3xl text-slate-900" : "text-3xl text-white"}
              />
              <p className={`mt-3 text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Give your new project a name and start with a fresh syntaxless workspace.
              </p>

              <div className="mt-6">
                <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  Project Name
                </label>
                <input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreating) {
                      void handleCreateProject();
                    }
                  }}
                  placeholder="Untitled Project"
                  className={inputClass}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={modalGhostButtonClass}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleCreateProject()}
                  disabled={isCreating}
                  className="rounded-[1.4rem] border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/15 hover:text-white disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/70"}`}
              onClick={() => setShowLimitModal(false)}
            />
            <div className={`${modalSurfaceClass} max-w-lg`}>
              <div className={`mb-2 text-[11px] uppercase tracking-[0.26em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                Subscription Required
              </div>
              <TypingHeading
                text="Project limit reached"
                as="h2"
                className={isLight ? "text-3xl text-slate-900" : "text-3xl text-white"}
              />
              <p className={`mt-3 text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Your {SUBSCRIPTION_META[activeTier].label} plan allows{" "}
                {getProjectLimitLabel(activeTier)} project
                {projectLimit === 1 ? "" : "s"}.
                Upgrade your subscription to unlock more capacity.
              </p>

              <div className="mt-5 rounded-[1.5rem] border border-amber-400/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300">
                Current plan: {SUBSCRIPTION_META[activeTier].label}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className={modalGhostButtonClass}
                >
                  Close
                </button>
                <Link
                  href="/subscriptions"
                  className="rounded-[1.4rem] border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/15 hover:text-white"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        )}
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
