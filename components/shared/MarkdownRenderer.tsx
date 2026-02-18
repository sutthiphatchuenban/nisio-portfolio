'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Root } from 'hast';

// Custom schema that allows align attribute and more for GitHub-style rendering
const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'style', 'align'],
    'img': [...(defaultSchema.attributes?.['img'] || []), 'src', 'alt', 'title', 'width', 'height'],
    'a': [...(defaultSchema.attributes?.['a'] || []), 'href', 'title', 'target', 'rel'],
    'p': [...(defaultSchema.attributes?.['p'] || []), 'align'],
    'div': [...(defaultSchema.attributes?.['div'] || []), 'align'],
    'h1': [...(defaultSchema.attributes?.['h1'] || []), 'align'],
    'h2': [...(defaultSchema.attributes?.['h2'] || []), 'align'],
    'h3': [...(defaultSchema.attributes?.['h3'] || []), 'align'],
    'h4': [...(defaultSchema.attributes?.['h4'] || []), 'align'],
    'h5': [...(defaultSchema.attributes?.['h5'] || []), 'align'],
    'h6': [...(defaultSchema.attributes?.['h6'] || []), 'align'],
    'span': [...(defaultSchema.attributes?.['span'] || []), 'align'],
  },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Decode HTML entities like < to <, > to >, & to &, etc.
// Works on both server and client
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, '`')
    .replace(/&#61;/g, '=')
    .replace(/&#62;/g, '>')
    .replace(/&#60;/g, '<');
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Decode HTML entities so that <p> becomes <p>
  const decodedContent = decodeHtmlEntities(content);

  return (
    <div className={`markdown-body ${className} overflow-x-hidden`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
        components={{
          // Pre blocks (code blocks)
          pre({ children }: any) {
            return <>{children}</>;
          },
          // Code blocks with syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            // Block-level code (```code```)
            if (!inline) {
              return (
                <figure className="my-4 rounded-lg overflow-hidden">
                  {match && (
                    <figcaption className="bg-zinc-800 px-4 py-2 text-xs text-zinc-400 font-mono border-b border-zinc-700 flex items-center justify-between">
                      <span>{match[1]}</span>
                      <span className="text-[10px] opacity-50">code</span>
                    </figcaption>
                  )}
                  <div className="overflow-x-auto bg-zinc-900">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: '0.8rem',
                        background: 'transparent',
                        padding: match ? undefined : '1rem'
                      }}
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </figure>
              );
            }
            // Inline code (`code`)
            return (
              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-200" {...props}>
                {children}
              </code>
            );
          },
          // Headings - GitHub style with align support
          h1({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h1
                className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-border/60 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h1>
            );
          },
          h2({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h2
                className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b border-border/60 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h2>
            );
          },
          h3({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h3
                className="text-xl font-semibold mt-6 mb-3 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h3>
            );
          },
          h4({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h4
                className="text-lg font-semibold mt-4 mb-2 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h4>
            );
          },
          h5({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h5
                className="text-base font-semibold mt-4 mb-2 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h5>
            );
          },
          h6({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <h6
                className="text-sm font-semibold mt-4 mb-2 text-muted-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </h6>
            );
          },
          // Paragraphs - support align attribute
          p({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <p
                className="mb-4 leading-7 text-foreground"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </p>
            );
          },
          // Div - support align attribute
          div({ children, node }: any) {
            const align = node?.properties?.align;
            return (
              <div
                className="mb-4"
                style={align ? { textAlign: align } : undefined}
              >
                {children}
              </div>
            );
          },
          // Lists - GitHub style with better nesting
          ul({ children }) {
            return (
              <ul className="list-disc pl-6 mb-4 space-y-1 text-foreground">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-6 mb-4 space-y-1 text-foreground">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          // Blockquotes - GitHub style
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg text-foreground">
                {children}
              </blockquote>
            );
          },
          // Tables - GitHub style
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="w-full border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/80 border-b border-border">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="even:bg-muted/30">{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-foreground text-sm">
                {children}
              </td>
            );
          },
          // Links - GitHub style
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          // Horizontal rule
          hr() {
            return <hr className="my-8 border-border/60" />;
          },
          // Images - GitHub style with shadow
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-4 border border-border/50 shadow-sm"
              />
            );
          },
          // Strong and emphasis
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-foreground">{children}</em>;
          },
          // Strikethrough
          del({ children }) {
            return <del className="line-through text-muted-foreground">{children}</del>;
          },
          // Checkboxes for task lists
          input({ checked, type }) {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-border"
                />
              );
            }
            return <input type={type} />;
          },
        }}
      >
        {decodedContent}
      </ReactMarkdown>
    </div>
  );
}
