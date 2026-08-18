/**
 * The backend API, as typed functions.
 *
 * Every call the app makes to the backend goes through here. Components should
 * never call `fetch` directly -- when the wire shape changes, this is the one
 * file that has to change with it.
 *
 * One function per endpoint, named for what the student is doing rather than
 * for the HTTP verb.
 */

import { BACKEND_URL, BACKEND_WS_URL, postJson, request } from "./config";
import type {
  BugReportRequest,
  InterpretResponse,
  PersistedRun,
  PipelineRequest,
  RunDiff,
  RunListResponse,
  RunStartResponse,
} from "./types";

export * from "./types";
export {
  BACKEND_URL,
  BACKEND_WS_URL,
  BackendResponseError,
  BackendUnreachableError,
} from "./config";

/**
 * Analyze the document without running it. Cheap and side-effect free -- the
 * IDE calls this as the student types, so it must stay both.
 */
export function interpretDocument(
  body: PipelineRequest,
): Promise<InterpretResponse> {
  return postJson<InterpretResponse>("/interpret", body);
}

/**
 * Generate and start running. Resolves as soon as the run is *accepted*, not
 * when it finishes -- output arrives over the WebSocket.
 *
 * A `status: "blocked"` response is a normal outcome, not an error: the program
 * was understood and refused. Check `status` before assuming `run_id` exists.
 */
export function startRun(body: PipelineRequest): Promise<RunStartResponse> {
  return postJson<RunStartResponse>("/run/start", body);
}

/** Open the event stream for a run. The caller owns closing it. */
export function openRunStream(runId: string): WebSocket {
  return new WebSocket(`${BACKEND_WS_URL}/run/${encodeURIComponent(runId)}/stream`);
}

/** Every run for a project, newest first. */
export function listRuns(projectId: string): Promise<RunListResponse> {
  return request<RunListResponse>(
    `/runs?project_id=${encodeURIComponent(projectId)}`,
  );
}

/** One run, with its diagnostics and artifacts. */
export function getRun(runId: string, projectId: string): Promise<PersistedRun> {
  return request<PersistedRun>(
    `/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
  );
}

/**
 * What changed between two runs, by meaning rather than by text.
 *
 * Order matters: every sentence in the result describes a change *from*
 * `baseRunId` *to* `compareRunId`, so the older run belongs first. The backend
 * deliberately does not sort them -- comparing backwards is a real question
 * ("what did I undo?") and silently reversing it would answer a different one.
 *
 * Every user-facing sentence comes back already written, because the IDE has no
 * locale catalog to write one with.
 */
export function compareRuns(
  baseRunId: string,
  compareRunId: string,
  projectId: string,
  locale?: string | null,
): Promise<RunDiff> {
  const params = new URLSearchParams({ project_id: projectId });
  if (locale) params.set("locale", locale);
  return request<RunDiff>(
    `/runs/${encodeURIComponent(baseRunId)}` +
      `/diff/${encodeURIComponent(compareRunId)}?${params.toString()}`,
  );
}

/**
 * URL for a run artifact -- a plot, a table, a generated file.
 *
 * Returns a URL rather than fetching, because these are used as `src`
 * attributes and downloading them into memory first would be pointless.
 *
 * `cacheKey` busts the browser cache when a rerun writes a new artifact under
 * a name that was already loaded.
 */
export function artifactUrl(
  runId: string,
  artifactName: string,
  projectId: string,
  cacheKey?: string,
): string {
  const params = new URLSearchParams({ project_id: projectId });
  if (cacheKey) params.set("v", cacheKey);
  return (
    `${BACKEND_URL}/run/${encodeURIComponent(runId)}` +
    `/artifacts/${encodeURIComponent(artifactName)}?${params.toString()}`
  );
}

/** Submit a bug report with a snapshot of what the student was looking at. */
export function reportBug(body: BugReportRequest): Promise<unknown> {
  return postJson<unknown>("/bugs/report", body);
}
