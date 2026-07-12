import { MAX_MATERIAL_CHARS } from "@/domain/report";

export type FileReadErrorCode = "UNSUPPORTED_FILE" | "INVALID_UTF8" | "FILE_TOO_LARGE";

export class FileReadError extends Error {
  constructor(public readonly code: FileReadErrorCode) {
    super(code);
    this.name = "FileReadError";
  }
}

function readBytes(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("FILE_READ_FAILED"));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("FILE_READ_FAILED"));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function readTextFile(file: File): Promise<string> {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (extension !== ".txt" && extension !== ".md") throw new FileReadError("UNSUPPORTED_FILE");

  let text: string;
  try {
    const bytes = new Uint8Array(await readBytes(file));
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new FileReadError("INVALID_UTF8");
  }
  if (text.length > MAX_MATERIAL_CHARS) throw new FileReadError("FILE_TOO_LARGE");
  return text;
}
