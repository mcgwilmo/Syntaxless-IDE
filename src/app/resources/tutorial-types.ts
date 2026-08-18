/**
 * The Learning Center's tabs.
 *
 * Lesson content types live in `@/content/lessons/lesson-schema` alongside the
 * content itself. What remains here is the tab list, which is app navigation
 * rather than authored content.
 */

import type { TabId } from "@/content/lessons/lesson-schema";

export type { TabId };

export type TutorialTab = {
  id: TabId;
  title: string;
  shortTitle: string;
  description: string;
  /** "planned" tabs appear in the UI but have no lessons behind them yet. */
  status: "ready" | "planned";
};
