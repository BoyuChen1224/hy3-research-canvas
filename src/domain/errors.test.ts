import { describe, expect, it } from "vitest";
import { mapUpstreamError } from "./errors";

describe("mapUpstreamError", () => {
  it.each([
    [401, "AUTH_FAILED"],
    [429, "RATE_LIMITED"],
    [503, "UPSTREAM_UNAVAILABLE"],
  ])("maps HTTP %s", (status, code) => {
    expect(mapUpstreamError({ status })).toMatchObject({ code });
  });

  it("maps abort and timeout errors", () => {
    expect(mapUpstreamError({ name: "AbortError" }).code).toBe("UPSTREAM_TIMEOUT");
    expect(mapUpstreamError({ name: "APIConnectionTimeoutError" }).code).toBe("UPSTREAM_TIMEOUT");
  });

  it("hides unknown upstream details", () => {
    expect(mapUpstreamError(new Error("secret response body")).message).not.toContain("secret");
  });
});
