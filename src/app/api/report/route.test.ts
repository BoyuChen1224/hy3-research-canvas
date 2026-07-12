import { describe, expect, it } from "vitest";
import { AppError } from "@/domain/errors";
import { createReportHandler } from "./handler";

const validBody = {
  material: "一段有证据的研究材料",
  reportType: "general",
  language: "zh-CN",
  depth: "standard",
};

function request(body: unknown) {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function* chunks(...values: string[]) {
  for (const value of values) yield value;
}

describe("POST /api/report", () => {
  it("rejects invalid input without calling upstream", async () => {
    let calls = 0;
    const POST = createReportHandler(async () => {
      calls += 1;
      return chunks();
    });
    const response = await POST(request({ ...validBody, material: " " }));
    expect(response.status).toBe(400);
    expect(calls).toBe(0);
    expect(await response.json()).toMatchObject({ code: "INVALID_INPUT" });
  });

  it("streams upstream Markdown unchanged", async () => {
    const POST = createReportHandler(async () => chunks("# 执行", "摘要"));
    const response = await POST(request(validBody));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(await response.text()).toBe("# 执行摘要");
  });

  it("maps configuration errors safely", async () => {
    const POST = createReportHandler(async () => {
      throw new AppError("CONFIG_MISSING", "Hy3 服务尚未配置，请联系管理员。", 500);
    });
    const response = await POST(request(validBody));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "CONFIG_MISSING", message: "Hy3 服务尚未配置，请联系管理员。" });
  });

  it("maps rate limits without leaking upstream details", async () => {
    const POST = createReportHandler(async () => {
      throw { status: 429, body: "secret upstream response" };
    });
    const response = await POST(request(validBody));
    const text = await response.text();
    expect(response.status).toBe(429);
    expect(text).toContain("RATE_LIMITED");
    expect(text).not.toContain("secret");
  });
});
