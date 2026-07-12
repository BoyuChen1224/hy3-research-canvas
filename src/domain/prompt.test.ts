import { describe, expect, it } from "vitest";
import { REPORT_SECTIONS, type ReportRequest } from "./report";
import { buildMessages } from "./prompt";

const request: ReportRequest = {
  material: "收入增长 12%，但样本只覆盖一个季度。",
  reportType: "market",
  language: "zh-CN",
  depth: "deep",
};

describe("buildMessages", () => {
  it("requires every report section", () => {
    const system = String(buildMessages(request)[0]?.content);
    for (const section of REPORT_SECTIONS) expect(system).toContain(section);
  });

  it("sets evidence and inference boundaries", () => {
    const system = String(buildMessages(request)[0]?.content);
    expect(system).toContain("唯一事实来源");
    expect(system).toContain("明确标记为推断");
    expect(system).toContain("不得伪造");
  });

  it("delimits untrusted material", () => {
    const user = String(buildMessages(request)[1]?.content);
    expect(user).toContain("<material>\n收入增长 12%");
    expect(user).toContain("\n</material>");
  });

  it("requests English output when selected", () => {
    const system = String(buildMessages({ ...request, language: "en" })[0]?.content);
    expect(system).toContain("Write the complete report in English");
  });
});
