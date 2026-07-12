import { ZodError } from "zod";
import { AppError, mapUpstreamError } from "@/domain/errors";
import { buildMessages } from "@/domain/prompt";
import { parseReportRequest } from "@/domain/report";
import { createHy3Stream } from "@/server/hy3-client";

type StreamFactory = typeof createHy3Stream;

function errorResponse(error: AppError): Response {
  return Response.json(
    { code: error.code, message: error.message },
    { status: error.status, headers: { "Cache-Control": "no-store" } },
  );
}

export function createReportHandler(streamFactory: StreamFactory = createHy3Stream) {
  return async function handleReport(request: Request): Promise<Response> {
    try {
      const input = parseReportRequest(await request.json());
      const upstream = await streamFactory(buildMessages(input), request.signal);
      const encoder = new TextEncoder();
      const body = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of upstream) controller.enqueue(encoder.encode(chunk));
            controller.close();
          } catch (error) {
            controller.error(mapUpstreamError(error));
          }
        },
      });

      return new Response(body, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError) {
        return errorResponse(new AppError("INVALID_INPUT", "请求参数无效，请检查研究材料和选项。", 400));
      }
      return errorResponse(mapUpstreamError(error));
    }
  };
}
