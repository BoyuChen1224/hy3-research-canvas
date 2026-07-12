import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

function safeUrl(url: string): string {
  if (/^(https?:|mailto:)/i.test(url) || url.startsWith("#") || url.startsWith("/")) {
    return defaultUrlTransform(url);
  }
  return "";
}

export function MarkdownReport({ content }: { content: string }) {
  return (
    <article className="markdown-report">
      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrl}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
