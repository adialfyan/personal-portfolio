import { marked } from "marked";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = marked.parse(content, { async: false }) as string;

  return (
    <div
      className={`editorial-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
