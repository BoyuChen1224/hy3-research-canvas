import OpenAI from "openai";
import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AppError } from "@/domain/errors";

type Hy3Params = ChatCompletionCreateParamsStreaming & {
  extra_body: { chat_template_kwargs: { reasoning_effort: "high" } };
};

export async function createHy3Stream(
  messages: ChatCompletionMessageParam[],
  signal: AbortSignal,
): Promise<AsyncIterable<string>> {
  const apiKey = process.env.HY3_API_KEY;
  const baseURL = process.env.HY3_BASE_URL;
  const model = process.env.HY3_MODEL;

  if (!apiKey || !baseURL || !model) {
    throw new AppError("CONFIG_MISSING", "Hy3 服务尚未配置，请联系管理员。", 500);
  }

  const client = new OpenAI({ apiKey, baseURL });
  const params: Hy3Params = {
    model,
    messages,
    stream: true,
    temperature: 0.3,
    extra_body: { chat_template_kwargs: { reasoning_effort: "high" } },
  };
  const completion = await client.chat.completions.create(params, { signal });

  return (async function* () {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta.content;
      if (content) yield content;
    }
  })();
}
