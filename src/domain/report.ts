import { z } from "zod";

export const MAX_MATERIAL_CHARS = 120_000;

export const REPORT_SECTIONS = [
  "执行摘要",
  "材料概览",
  "关键发现",
  "证据与依据",
  "不确定性及信息缺口",
  "风险与机会",
  "可执行建议",
] as const;

export const reportRequestSchema = z.object({
  material: z
    .string({ error: "请输入研究材料" })
    .trim()
    .min(1, "请输入研究材料")
    .max(MAX_MATERIAL_CHARS, `研究材料不能超过 ${MAX_MATERIAL_CHARS} 个字符`),
  reportType: z.enum(["general", "market", "technical"]),
  language: z.enum(["zh-CN", "en"]),
  depth: z.enum(["brief", "standard", "deep"]),
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;

export function parseReportRequest(input: unknown): ReportRequest {
  return reportRequestSchema.parse(input);
}
