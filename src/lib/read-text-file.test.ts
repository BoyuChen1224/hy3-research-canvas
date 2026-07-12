import { describe, expect, it } from "vitest";
import { MAX_MATERIAL_CHARS } from "@/domain/report";
import { readTextFile } from "./read-text-file";

describe("readTextFile", () => {
  it.each(["notes.txt", "notes.md"])("reads UTF-8 %s files", async (name) => {
    await expect(readTextFile(new File(["Hello, 世界"], name))).resolves.toBe("Hello, 世界");
  });

  it("rejects unsupported extensions", async () => {
    await expect(readTextFile(new File(["text"], "notes.pdf"))).rejects.toThrow("UNSUPPORTED_FILE");
  });

  it("rejects invalid UTF-8", async () => {
    await expect(readTextFile(new File([new Uint8Array([0xff, 0xfe])], "notes.txt"))).rejects.toThrow("INVALID_UTF8");
  });

  it("uses the shared material character limit", async () => {
    await expect(readTextFile(new File(["x".repeat(MAX_MATERIAL_CHARS + 1)], "notes.md"))).rejects.toThrow("FILE_TOO_LARGE");
  });
});
