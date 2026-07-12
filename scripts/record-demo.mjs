import { chromium } from "@playwright/test";
import { copyFile, mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: "demo-output",
    size: { width: 1440, height: 900 },
  },
});
const page = await context.newPage();
const video = page.video();
const baseUrl = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3000";

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Use sample" }).click();
  await page.getByRole("combobox", { name: "Report type" }).selectOption("market");
  await page.getByRole("combobox", { name: "Analysis depth" }).selectOption("brief");
  await page.waitForTimeout(800);

  const reportResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/report") && response.request().method() === "POST",
    { timeout: 180_000 },
  );
  await page.getByRole("button", { name: "Generate report" }).click();
  const response = await reportResponse;
  if (!response.ok()) {
    throw new Error(`Report request failed with HTTP ${response.status()}`);
  }

  await page.getByRole("heading", { name: "Executive Summary" }).waitFor({ timeout: 180_000 });
  await page.waitForTimeout(2_000);
  await page.getByRole("button", { name: "切换到中文" }).click();
  await page.waitForTimeout(1_200);
} finally {
  await context.close();
  await browser.close();
}

const source = await video.path();
await mkdir("public", { recursive: true });
await copyFile(source, "public/hy3-research-canvas-demo.webm");
console.log("Demo recorded: public/hy3-research-canvas-demo.webm");
