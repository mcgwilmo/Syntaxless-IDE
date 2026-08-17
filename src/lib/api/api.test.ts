import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BACKEND_URL,
  BACKEND_WS_URL,
  BackendResponseError,
  BackendUnreachableError,
  postJson,
  request,
} from "./config";
import { artifactUrl, getRun, interpretDocument, listRuns, startRun } from "./index";

/*
 * Mocked at the network boundary -- global `fetch` and global `WebSocket` --
 * and nowhere else. Stubbing our own modules would leave the thing under test
 * untested and pass anyway.
 *
 * The distinction these tests care most about is unreachable vs refused. The
 * IDE shows different copy for each, and getting them backwards tells a student
 * their program was blocked when in fact the server is simply not running --
 * sending them off to debug code that was never the problem.
 */

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function nonJsonResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError("Unexpected token < in JSON");
    },
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("configuration", () => {
  it("has no trailing slash to double up on path joins", () => {
    expect(BACKEND_URL.endsWith("/")).toBe(false);
  });

  it("derives the websocket origin from the http one", () => {
    expect(BACKEND_WS_URL).toBe(BACKEND_URL.replace(/^http/, "ws"));
    expect(BACKEND_WS_URL.startsWith("ws")).toBe(true);
  });
});

describe("request", () => {
  it("returns the parsed body on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await expect(request("/health")).resolves.toEqual({ ok: true });
  });

  it("prefixes the backend origin", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await request("/health");

    expect(fetchMock).toHaveBeenCalledWith(`${BACKEND_URL}/health`, undefined);
  });

  it("reports a network failure as unreachable, not as a response error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(request("/health")).rejects.toBeInstanceOf(BackendUnreachableError);
  });

  it("tells the student what to do about an unreachable backend", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(request("/health")).rejects.toThrow(/backend is running/i);
  });

  it("keeps the underlying cause for debugging", async () => {
    const cause = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValue(cause);

    await expect(request("/health")).rejects.toMatchObject({ cause });
  });

  it("reports a refusal as a response error carrying the status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "nope" }, 403));

    const error: unknown = await request("/run/start").catch((e) => e);

    expect(error).toBeInstanceOf(BackendResponseError);
    expect((error as BackendResponseError).status).toBe(403);
  });

  it("surfaces the backend's own detail as the message", async () => {
    // This is how a subscription-gate refusal reaches the student as the
    // reason, instead of as "the server returned an error (403)".
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: "Vibe mode is only available on the Pro plan." }, 403)
    );

    await expect(request("/run/start")).rejects.toThrow(
      "Vibe mode is only available on the Pro plan."
    );
  });

  it("falls back to a readable message when there is no detail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    await expect(request("/run/start")).rejects.toThrow("The server returned an error (500).");
  });

  it("does not fail over a non-JSON error body", async () => {
    // A proxy or gateway returning HTML must still produce a usable error.
    fetchMock.mockResolvedValue(nonJsonResponse(502));

    const error: unknown = await request("/run/start").catch((e) => e);

    expect(error).toBeInstanceOf(BackendResponseError);
    expect((error as BackendResponseError).status).toBe(502);
  });

  it("ignores a non-string detail rather than rendering an object", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: { msg: "structured" } }, 422));

    await expect(request("/run/start")).rejects.toThrow("The server returned an error (422).");
  });

  it.each([200, 201, 204])("treats %i as success", async (status) => {
    fetchMock.mockResolvedValue(jsonResponse({ fine: true }, status));

    await expect(request("/health")).resolves.toEqual({ fine: true });
  });
});

describe("postJson", () => {
  it("sends JSON with the matching content type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await postJson("/interpret", { active_document: "print hello" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ active_document: "print hello" });
  });

  it("classifies failures the same way request does", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(postJson("/interpret", {})).rejects.toBeInstanceOf(BackendUnreachableError);
  });
});

describe("endpoints", () => {
  beforeEach(() => fetchMock.mockResolvedValue(jsonResponse({})));

  it("interpret posts to /interpret", async () => {
    await interpretDocument({ active_document: "print hello" } as never);

    expect(fetchMock.mock.calls[0][0]).toBe(`${BACKEND_URL}/interpret`);
  });

  it("startRun posts to /run/start", async () => {
    await startRun({ active_document: "print hello" } as never);

    expect(fetchMock.mock.calls[0][0]).toBe(`${BACKEND_URL}/run/start`);
  });

  it("listRuns encodes the project id into the query", async () => {
    await listRuns("my project/#1");

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BACKEND_URL}/runs?project_id=my%20project%2F%231`
    );
  });

  it("getRun encodes both the run id and the project id", async () => {
    await getRun("run/1", "proj#2");

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BACKEND_URL}/runs/run%2F1?project_id=proj%232`
    );
  });
});

describe("artifactUrl", () => {
  it("builds a URL under the run's artifacts", () => {
    expect(artifactUrl("run-1", "plot.png", "proj-1")).toBe(
      `${BACKEND_URL}/run/run-1/artifacts/plot.png?project_id=proj-1`
    );
  });

  it("escapes a filename that would otherwise change the path", () => {
    // An artifact called "../secret" must not walk out of the run directory.
    expect(artifactUrl("run-1", "../secret", "proj-1")).toContain("..%2Fsecret");
  });

  it("escapes a run id with a slash in it", () => {
    expect(artifactUrl("a/b", "plot.png", "p")).toContain("/run/a%2Fb/");
  });

  it("adds a cache-busting parameter only when given one", () => {
    expect(artifactUrl("r", "a.png", "p")).not.toContain("v=");
    expect(artifactUrl("r", "a.png", "p", "abc123")).toContain("v=abc123");
  });

  it("escapes a project id with query characters", () => {
    expect(artifactUrl("r", "a.png", "p&x=1")).toContain("project_id=p%26x%3D1");
  });
});
