import { describe, expect, it } from "vitest";
import { MAX_MATERIAL_CHARS, REPORT_SECTIONS, parseReportRequest } from "./report";

const validRequest = {
  material: "  evidence  ",
  reportType: "general",
  language: "zh-CN",
  depth: "standard",
};

describe("parseReportRequest", () => {
  it("trims and accepts a valid request", () => {
    expect(parseReportRequest(validRequest).material).toBe("evidence");
  });

  it("rejects blank material", () => {
    expect(() => parseReportRequest({ ...validRequest, material: "   " })).toThrow("请输入研究材料");
  });

  it("rejects overlong material", () => {
    expect(() => parseReportRequest({ ...validRequest, material: "x".repeat(MAX_MATERIAL_CHARS + 1) })).toThrow();
  });

  it("defines the complete report structure", () => {
    expect(REPORT_SECTIONS).toHaveLength(7);
    expect(REPORT_SECTIONS).toContain("不确定性及信息缺口");
  });
});
