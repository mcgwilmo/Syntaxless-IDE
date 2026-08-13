"use client";

/**
 * Context wiring for the IDE.
 *
 * `useIdeState` owns the state; this makes it reachable from the panels without
 * threading it through props. Panels need 46-59 identifiers each, so props were
 * never a real option -- see `restructure/phase-4-plan.md`.
 *
 * Everything re-renders together on any state change. That is not a regression:
 * it was already one component, so it already did. If a panel later needs to be
 * insulated from that, the fix is to split this into per-concern contexts, not
 * to memoize around a single one.
 */

import { createContext, useContext, type ReactNode } from "react";

import { useIdeState } from "./use-ide-state";

export type IdeContextValue = ReturnType<typeof useIdeState>;

const IdeContext = createContext<IdeContextValue | null>(null);

export function IdeProvider({
  value,
  children,
}: {
  value: IdeContextValue;
  children: ReactNode;
}) {
  return <IdeContext.Provider value={value}>{children}</IdeContext.Provider>;
}

/**
 * Read the IDE's state. Throws outside the provider rather than returning
 * undefined, because a panel rendered outside it is a wiring mistake, and a
 * clear error beats a cascade of "cannot read property of null".
 */
export function useIde(): IdeContextValue {
  const value = useContext(IdeContext);
  if (!value) {
    throw new Error("useIde must be used inside <IdeProvider>.");
  }
  return value;
}
