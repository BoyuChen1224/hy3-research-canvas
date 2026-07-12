import { expect, test } from "@playwright/test";

const markdown = `# Executive Summary

The material shows a measurable setup success rate.

## Material Overview
Evidence is limited to one quarter.

## Key Findings
- 18 of 24 participants completed setup.

## Evidence and Rationale
The finding is directly stated in the supplied material.

## Uncertainties and Information Gaps
Long-term retention data is missing.

## Risks and Opportunities
Export discoverability is a risk.

## Actionable Recommendations
1. Improve export navigation.`;

test.beforeEach(async ({ page }) => {
  await page.route("**/api/report", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/markdown; charset=utf-8", body: markdown });
  });
  await page.goto("/");
});

test("generates, switches UI language, and downloads Markdown", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Research material" })).toBeVisible();
  await page.getByRole("button", { name: "Use sample" }).click();
  await page.getByRole("combobox", { name: "Report language" }).selectOption("en");
  await page.getByRole("button", { name: "Generate report" }).click();
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .md" }).click();
  await expect((await downloadPromise).suggestedFilename()).toMatch(/^hy3-research-report-\d{4}-\d{2}-\d{2}\.md$/);

  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.getByRole("heading", { name: "研究材料" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "报告语言" })).toHaveValue("en");
});

test("keeps input before report on mobile", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only assertion");
  const order = await page.locator(".panel").evaluateAll((panels) => panels.map((panel) => panel.className));
  expect(order[0]).toContain("input-panel");
  expect(order[1]).toContain("report-panel");
});
