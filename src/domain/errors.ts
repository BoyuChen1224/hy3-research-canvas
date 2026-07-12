export type AppErrorCode =
  | "CONFIG_MISSING"
  | "INVALID_INPUT"
  | "AUTH_FAILED"
  | "RATE_LIMITED"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "UNKNOWN";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

type UpstreamLike = { status?: number; name?: string };

export function mapUpstreamError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const candidate = error as UpstreamLike | null;
  if (candidate?.status === 401 || candidate?.status === 403) {
    return new AppError("AUTH_FAILED", "Hy3 鉴权失败，请检查 API Key。", 401);
  }
  if (candidate?.status === 429) {
    return new AppError("RATE_LIMITED", "请求过于频繁，请稍后重试。", 429);
  }
  if (candidate?.name === "AbortError" || candidate?.name === "APIConnectionTimeoutError") {
    return new AppError("UPSTREAM_TIMEOUT", "Hy3 请求超时，请稍后重试。", 504);
  }
  if (candidate?.status && candidate.status >= 500) {
    return new AppError("UPSTREAM_UNAVAILABLE", "Hy3 服务暂时不可用，请稍后重试。", 503);
  }
  return new AppError("UNKNOWN", "生成报告时发生未知错误，请稍后重试。", 500);
}
