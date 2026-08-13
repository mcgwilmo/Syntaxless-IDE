/**
 * Where the backend lives, and how we talk to it.
 *
 * `NEXT_PUBLIC_BACKEND_URL` is read at build time, not runtime -- a missing or
 * wrong value fails the build rather than degrading in production.
 */

const RAW_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/** Base URL with any trailing slash removed, so path joins never double up. */
export const BACKEND_URL = RAW_BASE_URL.replace(/\/$/, "");

/** The same origin as a WebSocket URL. http -> ws, https -> wss. */
export const BACKEND_WS_URL = BACKEND_URL.replace(/^http/, "ws");

/**
 * Thrown when the backend could not be reached at all -- as opposed to reached
 * and refusing. The IDE distinguishes the two: "the server is down" needs a
 * different message than "your program was blocked".
 */
export class BackendUnreachableError extends Error {
  constructor(readonly cause: unknown) {
    super(
      `Could not reach the server at ${BACKEND_URL}. Check that the backend is running, then try again.`,
    );
    this.name = "BackendUnreachableError";
  }
}

/** Thrown when the backend answered, but with an error status. */
export class BackendResponseError extends Error {
  constructor(
    readonly status: number,
    readonly detail?: string,
  ) {
    super(detail || `The server returned an error (${status}).`);
    this.name = "BackendResponseError";
  }
}

/**
 * A fetch that fails in two distinguishable ways.
 *
 * A network-level failure becomes BackendUnreachableError; a non-2xx response
 * becomes BackendResponseError carrying the backend's own `detail` when it sent
 * one -- which is how a subscription-gate refusal reaches the student as the
 * reason it was refused rather than a bare status code.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, init);
  } catch (error) {
    throw new BackendUnreachableError(error);
  }

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = typeof body?.detail === "string" ? body.detail : undefined;
    } catch {
      // A non-JSON error body is not worth failing over.
    }
    throw new BackendResponseError(response.status, detail);
  }

  return (await response.json()) as T;
}

/** POST JSON and parse the response. */
export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
