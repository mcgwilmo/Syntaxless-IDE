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
import {
  Badge,
  Button,
  Callout,
  Card,
  Field,
  Modal,
  Scrim,
} from "@/design/primitives";
import { cn } from "@/lib/cn";

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

/*
 * The caption above each stat card's value.
 *
 * Muted rather than soft: these sit on a raised card, and soft is tuned for the
 * page behind it, not for a surface a step closer to the light.
 */
const CARD_LABEL_CLASS = cn(
  "mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase",
  "tracking-[var(--tracking-label)] text-[var(--text-muted)]"
);

/*
 * The sort control.
 *
 * Recessed, like every other form control in the app: the migrated select in
 * the IDE's bug-report modal is a sunken well, and Field is too, so a raised
 * select here would make the same control look like two different objects on
 * two screens. It also sits in the same row as the search Field -- on a card
 * whose fill is already --surface-raised, so a raised select would have had no
 * fill contrast against its own container at all.
 */
const SELECT_CLASS = cn(
  "w-full rounded-[var(--radius-md)] border border-[var(--border-strong)]",
  "bg-[var(--surface-sunken)]",
  "px-[var(--space-4)] py-[var(--space-3)]",
  "text-[length:var(--text-base)] text-[var(--text-primary)]",
  "shadow-[var(--recessed)]",
  "hover:border-[color-mix(in_srgb,var(--border-strong)_140%,transparent)]",
  "outline-none focus:border-[var(--accent-solid)]",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)]"
);

/*
 * A link wearing the primary Button's material.
 *
 * These stay anchors rather than becoming <Button>: they navigate, so
 * cmd-click, middle-click and "open in new tab" all have to keep working. The
 * classes mirror Button's primary variant so the two never drift apart on
 * screen even though they cannot share an element.
 */
const ACCENT_LINK_CLASS = cn(
  "relative inline-flex items-center justify-center font-medium",
  "border border-[color-mix(in_srgb,var(--accent-solid)_70%,black)]",
  "bg-[var(--accent-solid)] bg-[image:var(--material-sheen)]",
  "text-[var(--text-inverted)] hover:bg-[var(--accent-hover)]",
  "shadow-[var(--raised)] hover:shadow-[var(--lifted)] active:shadow-[var(--pressed)]",
  "hover:-translate-y-[var(--lift-travel)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none",
  "transition-[background-color,box-shadow,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]"
);

const ACCENT_LINK_SIZES = {
  sm: "px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-sm)] rounded-[var(--radius-sm)]",
  md: "px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-base)] rounded-[var(--radius-md)]",
} as const;

/*
 * The material both kinds of grid tile share.
 *
 * Every tile in the grid opens something when clicked, so every tile travels:
 * up toward the light on hover, down and inverted while held. Nothing inside
 * them moves -- a card that both lifts and animates its own contents reads as
 * two objects rather than one.
 */
const PRESSABLE_CARD_CLASS = cn(
  "shadow-[var(--raised)] hover:shadow-[var(--lifted)] active:shadow-[var(--pressed)]",
  "hover:-translate-y-[var(--lift-travel)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none",
  "transition-[background-color,border-color,box-shadow,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]"
);

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

  /*
   * Escape closes whichever modal is open.
   *
   * Both dialogs could already be dismissed by clicking the scrim, which is a
   * pointer-only affordance -- so a keyboard user who opened one had no way out
   * except tabbing around to find Cancel. Escape is the expected exit from a
   * dialog, and the mobile nav in SiteHeader already handles it the same way.
   */
  useEffect(() => {
    if (!showCreateModal && !showLimitModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setShowCreateModal(false);
      setShowLimitModal(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCreateModal, showLimitModal]);

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

  /*
   * The create tile stops being an invitation once the plan is full, so it
   * swaps the accent for the warning tone rather than just dimming: amber here
   * means "look at this", and the tile now leads to pricing, not to a project.
   */
  const createCardClass = atProjectLimit
    ? "border-[color-mix(in_srgb,var(--state-warning)_35%,transparent)] bg-[var(--state-warning-subtle)] bg-[image:var(--material-sheen)]"
    : "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppPageBackground />

      <SiteHeader
        tierLabel={SUBSCRIPTION_META[activeTier].label}
        authHref="/dashboard"
        authLabel="Dashboard"
        showSignOut
      />

      <PageFrame>
        <section className="mb-[var(--space-8)]">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Dashboard"
              as="h1"
              className="mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]"
            />

            <p className="mx-auto mt-[var(--space-4)] max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--text-muted)] md:text-[length:var(--text-base)] md:leading-[var(--leading-relaxed)]">
              Manage your projects, jump back into recent work, and keep building inside a cleaner syntaxless workflow.
            </p>

            <div className="mt-[var(--space-5)] flex flex-wrap items-center justify-center gap-[var(--space-3)]">
              <Badge tone="accent" className="uppercase tracking-[var(--tracking-label)]">
                {SUBSCRIPTION_META[activeTier].label}
              </Badge>
              <Badge tone="neutral" className="uppercase tracking-[var(--tracking-label)]">
                {projectCount} Project{projectCount === 1 ? "" : "s"}
              </Badge>
            </div>

            {sessionEmail ? (
              <div className="mt-[var(--space-4)] text-[length:var(--text-sm)] text-[var(--text-soft)]">
                {sessionEmail}
              </div>
            ) : null}
          </div>
        </section>

        <div className="mb-[var(--space-8)] grid gap-[var(--space-4)] lg:grid-cols-4">
          <Card>
            {/* The visible caption names the field, so the Field's own label is
                kept for screen readers only rather than shown twice. */}
            <div className={CARD_LABEL_CLASS}>Search Projects</div>
            <Field
              label="Search Projects"
              hideLabel
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or preview text..."
            />
          </Card>

          <Card>
            <div className={CARD_LABEL_CLASS}>Sort</div>
            <select
              aria-label="Sort projects"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className={SELECT_CLASS}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
            </select>
          </Card>

          <Card>
            <div className={CARD_LABEL_CLASS}>Project Cap</div>
            <div className="text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--text-primary)]">
              {getProjectLimitLabel(activeTier)}
            </div>
            <div className="mt-[var(--space-1)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
              {remainingProjects === null
                ? "Unlimited remaining"
                : `${remainingProjects} remaining`}
            </div>
          </Card>

          <Card>
            <div className={CARD_LABEL_CLASS}>Synth File Cap</div>
            <div className="text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--text-primary)]">
              {getSynthFileLimitLabel(activeTier)} / project
            </div>
            <div className="mt-[var(--space-1)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
              Enforced in IDE file actions
            </div>
          </Card>
        </div>

        {projectCount === 0 ? (
          <Card className="text-center">
            <div className="py-[var(--space-8)]">
              {/* Inlaid, not raised: the glyph is a mark on the card, and a
                  second pressable-looking object here would compete with the
                  button underneath it. */}
              <div className="mx-auto mb-[var(--space-4)] flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[length:var(--text-3xl)] text-[var(--accent-text)] shadow-[var(--inlaid)]">
                +
              </div>
              <TypingHeading
                text="No projects yet"
                as="h2"
                className="text-[length:var(--text-2xl)] text-[var(--text-primary)]"
              />
              <p className="mx-auto mt-[var(--space-3)] max-w-xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                Create your first project to start building in T.R.A.C.E.
              </p>
              <div className="mt-[var(--space-6)]">
                <Button onClick={openCreateModal} size="lg">
                  Create Project
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-[var(--space-5)] md:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={openCreateModal}
              className={cn(
                "group min-h-[250px] rounded-[var(--radius-lg)] border border-dashed",
                "p-[var(--space-6)] text-left",
                PRESSABLE_CARD_CLASS,
                createCardClass
              )}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-1 flex-col justify-center">
                  <div
                    className={cn(
                      "mb-[var(--space-5)] flex h-14 w-14 items-center justify-center",
                      "rounded-[var(--radius-lg)] border text-[length:var(--text-3xl)]",
                      "shadow-[var(--inlaid)]",
                      atProjectLimit
                        ? "border-[color-mix(in_srgb,var(--state-warning)_35%,transparent)] bg-[var(--state-warning-subtle)] text-[var(--state-warning)]"
                        : "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)]"
                    )}
                  >
                    {atProjectLimit ? "!" : "+"}
                  </div>
                  <div className="text-[length:var(--text-2xl)] font-bold text-[var(--text-primary)]">
                    {atProjectLimit ? "Upgrade to Create More" : "Create New Project"}
                  </div>
                  <p className="mt-[var(--space-3)] max-w-sm text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                    {atProjectLimit
                      ? `Your ${SUBSCRIPTION_META[activeTier].label} plan has reached its project cap.`
                      : "Start a fresh syntaxless workspace and jump straight into building."}
                  </p>
                </div>

                <div
                  className={cn(
                    "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
                    atProjectLimit
                      ? "text-[var(--state-warning)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--accent-text)]"
                  )}
                >
                  {atProjectLimit ? "See pricing" : "New workspace"}
                </div>
              </div>
            </button>

            {filteredProjects.map((project) => (
              /*
               * The card-wide click is a pointer shortcut, not the only way in:
               * the Open link inside it is a real anchor, so the keyboard path
               * and cmd-click both already work and this stays a <div> rather
               * than becoming a button wrapping a link.
               *
               * What was missing is that the card dresses itself as a pressable
               * object -- it lifts on hover and pushes in when held -- while
               * showing nothing at all when the keyboard is inside it. The
               * focus-within ring gives the tile the same "you are here" the
               * mouse already got, using the same colour as the global
               * :focus-visible ring so the two read as one system.
               */
              <div
                key={project.id}
                onClick={() => router.push(`/ide?project=${project.id}`)}
                className={cn(
                  "group min-h-[250px] cursor-pointer rounded-[var(--radius-lg)]",
                  "border border-[var(--border-subtle)]",
                  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                  "p-[var(--space-6)]",
                  "focus-within:outline focus-within:outline-2",
                  "focus-within:outline-offset-2 focus-within:outline-[var(--accent-solid)]",
                  PRESSABLE_CARD_CLASS
                )}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-[var(--space-4)] flex items-start justify-between gap-[var(--space-4)]">
                      <div>
                        <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-3)]">
                          <div className="h-2.5 w-2.5 rounded-[var(--radius-full)] bg-[var(--accent-solid)]" />
                          <div className="text-[length:var(--text-2xl)] font-bold text-[var(--text-primary)] transition-colors duration-[var(--duration-fast)] group-hover:text-[var(--accent-text)]">
                            {project.name}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-[var(--space-3)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                          <span>{getRelativeUpdatedLabel(project.updated_at)}</span>
                          <span className="h-1 w-1 rounded-[var(--radius-full)] bg-[var(--border-strong)]" />
                          <span>
                            {countSynthFiles(project.tree_json)} synth file
                            {countSynthFiles(project.tree_json) === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* The preview is a window cut into the card showing the
                        file underneath, so it takes the same recess as the
                        editor it is quoting -- not the raised material of the
                        card around it. */}
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-[var(--space-5)] py-[var(--space-4)] shadow-[var(--recessed)]">
                      <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                        Preview
                      </div>
                      <p className="text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                        {getProjectPreview(project.tree_json)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-[var(--space-5)] flex gap-[var(--space-2)]">
                    <Link
                      href={`/ide?project=${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(ACCENT_LINK_CLASS, ACCENT_LINK_SIZES.sm)}
                    >
                      Open
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {projectCount > 0 && filteredProjects.length === 0 && (
          <Card className="mt-[var(--space-5)] text-center">
            <div className="py-[var(--space-6)]">
              <div className="mx-auto mb-[var(--space-3)] h-10 w-10 rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] shadow-[var(--inlaid)]" />
              <TypingHeading
                text="No matching projects"
                as="h2"
                className="text-[length:var(--text-xl)] text-[var(--text-primary)]"
              />
              <p className="mt-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
                Try a different search term or clear the filter.
              </p>
              <div className="mt-[var(--space-5)]">
                <Button variant="secondary" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            </div>
          </Card>
        )}

        {showCreateModal && (
          <Scrim>
            {/* Click-outside target. It sits behind the modal rather than
                wrapping it, so a click inside the dialog never reaches it. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              onClick={() => setShowCreateModal(false)}
            />
            <Modal label="New Project" className="relative z-10 w-full max-w-md">
              <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                T.R.A.C.E.
              </div>
              <TypingHeading
                text="New Project"
                as="h2"
                className="text-[length:var(--text-3xl)] text-[var(--text-primary)]"
              />
              <p className="mt-[var(--space-3)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                Give your new project a name and start with a fresh syntaxless workspace.
              </p>

              <div className="mt-[var(--space-6)]">
                <Field
                  label="Project Name"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreating) {
                      void handleCreateProject();
                    }
                  }}
                  placeholder="Untitled Project"
                />
              </div>

              <div className="mt-[var(--space-6)] flex justify-end gap-[var(--space-2)]">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleCreateProject()}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </Modal>
          </Scrim>
        )}

        {showLimitModal && (
          <Scrim>
            <div
              aria-hidden="true"
              className="absolute inset-0"
              onClick={() => setShowLimitModal(false)}
            />
            <Modal
              label="Project limit reached"
              className="relative z-10 w-full max-w-lg"
            >
              <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                Subscription Required
              </div>
              <TypingHeading
                text="Project limit reached"
                as="h2"
                className="text-[length:var(--text-3xl)] text-[var(--text-primary)]"
              />
              <p className="mt-[var(--space-3)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                Your {SUBSCRIPTION_META[activeTier].label} plan allows{" "}
                {getProjectLimitLabel(activeTier)} project
                {projectLimit === 1 ? "" : "s"}.
                Upgrade your subscription to unlock more capacity.
              </p>

              {/* Warning, not blocked: the plan is doing what it is meant to,
                  and there is a way forward one button away. */}
              <Callout tone="warning" className="mt-[var(--space-5)]">
                Current plan: {SUBSCRIPTION_META[activeTier].label}
              </Callout>

              <div className="mt-[var(--space-6)] flex justify-end gap-[var(--space-2)]">
                <Button variant="secondary" onClick={() => setShowLimitModal(false)}>
                  Close
                </Button>
                <Link
                  href="/subscriptions"
                  className={cn(ACCENT_LINK_CLASS, ACCENT_LINK_SIZES.md)}
                >
                  View Pricing
                </Link>
              </div>
            </Modal>
          </Scrim>
        )}
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
