import { Fragment, type ReactNode } from "react";

/**
 * A deliberately small Markdown renderer that builds React elements (never raw
 * HTML), so model output and member text can't inject markup. Supports
 * paragraphs, ## and ### headings, bullet and numbered lists, blockquotes,
 * **bold**, *italic* and _italic_.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) out.push(<strong key={`${keyBase}-${i++}`}>{token.slice(2, -2)}</strong>);
    else out.push(<em key={`${keyBase}-${i++}`}>{token.slice(1, -1)}</em>);
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const nodes: ReactNode[] = [];
  blocks.forEach((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) return;
    const key = `b${bi}`;
    const first = lines[0]!;
    if (/^###\s+/.test(first)) {
      nodes.push(<h3 key={key}>{inline(first.replace(/^###\s+/, ""), key)}</h3>);
      if (lines.length > 1) nodes.push(<p key={key + "p"}>{inline(lines.slice(1).join(" "), key + "p")}</p>);
    } else if (/^##?\s+/.test(first)) {
      nodes.push(<h2 key={key}>{inline(first.replace(/^##?\s+/, ""), key)}</h2>);
      if (lines.length > 1) nodes.push(<p key={key + "p"}>{inline(lines.slice(1).join(" "), key + "p")}</p>);
    } else if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
      nodes.push(
        <ul key={key}>
          {lines.map((l, li) => (
            <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${key}-${li}`)}</li>
          ))}
        </ul>,
      );
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      nodes.push(
        <ol key={key}>
          {lines.map((l, li) => (
            <li key={li}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), `${key}-${li}`)}</li>
          ))}
        </ol>,
      );
    } else if (lines.every((l) => /^>\s?/.test(l))) {
      nodes.push(<blockquote key={key}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), key)}</blockquote>);
    } else {
      nodes.push(
        <p key={key}>
          {lines.map((l, li) => (
            <Fragment key={li}>
              {li > 0 ? <br /> : null}
              {inline(l, `${key}-${li}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
  });
  return <div className={className}>{nodes}</div>;
}
