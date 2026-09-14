'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
    content: string
    className?: string
}

interface MarkdownCodeBlockProps {
    code: string
    language?: string
}

// Keep useful HTML support while still sanitizing untrusted content before it
// reaches the browser. The align attribute is retained for existing posts.
const markdownSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        '*': [...(defaultSchema.attributes?.['*'] || []), 'align'],
        img: [
            ...(defaultSchema.attributes?.img || []),
            'src',
            'alt',
            'title',
            'width',
            'height',
            'loading',
        ],
        a: [...(defaultSchema.attributes?.a || []), 'href', 'title', 'target', 'rel'],
        p: [...(defaultSchema.attributes?.p || []), 'align'],
        div: [...(defaultSchema.attributes?.div || []), 'align'],
        h1: [...(defaultSchema.attributes?.h1 || []), 'align'],
        h2: [...(defaultSchema.attributes?.h2 || []), 'align'],
        h3: [...(defaultSchema.attributes?.h3 || []), 'align'],
        h4: [...(defaultSchema.attributes?.h4 || []), 'align'],
        h5: [...(defaultSchema.attributes?.h5 || []), 'align'],
        h6: [...(defaultSchema.attributes?.h6 || []), 'align'],
    },
}

function normalizeEntities(value: string): string {
    // Some content was saved by editors as HTML entities. Decode one level so
    // it renders consistently without recursively decoding user content.
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&quot;': '"',
        '&apos;': "'",
        '&#39;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#61;': '=',
        '&#60;': '<',
        '&#62;': '>',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
    }

    return value.replace(
        /&(?:nbsp|quot|apos|amp|lt|gt);|&#(?:39|x27|x2F|x60|61|60|62);/g,
        (entity) => entities[entity] || entity,
    )
}

function getLanguage(className?: string): string | undefined {
    const match = /language-([\w+-]+)/i.exec(className || '')
    if (!match) return undefined

    const aliases: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        sh: 'bash',
        shell: 'bash',
        yml: 'yaml',
        md: 'markdown',
        plaintext: 'text',
        txt: 'text',
    }

    return aliases[match[1].toLowerCase()] || match[1].toLowerCase()
}

function isExternalLink(href?: string): boolean {
    return Boolean(href && /^(?:https?:)?\/\//i.test(href))
}

function getTextAlign(node: any): React.CSSProperties['textAlign'] | undefined {
    const align = node?.properties?.align
    return ['left', 'center', 'right', 'justify'].includes(align) ? align : undefined
}

function hasBlockChild(node: any): boolean {
    const blockTags = new Set([
        'article',
        'aside',
        'blockquote',
        'div',
        'figure',
        'footer',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'header',
        'hr',
        'main',
        'nav',
        'ol',
        'pre',
        'section',
        'table',
        'ul',
    ])

    return Boolean(
        node?.children?.some(
            (child: any) => child.type === 'element' && blockTags.has(child.tagName),
        ),
    )
}

function MarkdownCodeBlock({ code, language }: MarkdownCodeBlockProps) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return

        const timeout = window.setTimeout(() => setCopied(false), 1800)
        return () => window.clearTimeout(timeout)
    }, [copied])

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
        } catch {
            // Clipboard access may be unavailable in embedded or insecure
            // contexts. The code remains selectable as a fallback.
        }
    }

    return (
        <div className="markdown-code-block">
            <div className="markdown-code-header">
                <span className="markdown-code-language">{language || 'code'}</span>
                <button
                    type="button"
                    className="markdown-code-copy"
                    onClick={copyCode}
                    aria-label={copied ? 'Code copied' : 'Copy code'}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <pre className="markdown-code">
                <code className={language ? `language-${language}` : undefined}>{code}</code>
            </pre>
        </div>
    )
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    const normalizedContent = normalizeEntities(content || '')

    return (
        <div className={cn('markdown-body overflow-x-hidden', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
                components={{
                    // The code renderer owns the complete code block so the
                    // header and copy action stay outside the <pre> element.
                    pre({ children }) {
                        return <>{children}</>
                    },
                    code({ node, className: codeClassName, children, ...props }: any) {
                        const language = getLanguage(codeClassName)
                        const code = String(children).replace(/\n$/, '')
                        const isBlock = node?.parent?.tagName === 'pre' || Boolean(language) || code.includes('\n')

                        if (isBlock) {
                            return <MarkdownCodeBlock code={code} language={language} />
                        }

                        return (
                            <code className="markdown-inline-code" {...props}>
                                {children}
                            </code>
                        )
                    },
                    h1({ children, node }) {
                        return (
                            <h1 className="markdown-heading markdown-h1" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h1>
                        )
                    },
                    h2({ children, node }) {
                        return (
                            <h2 className="markdown-heading markdown-h2" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h2>
                        )
                    },
                    h3({ children, node }) {
                        return (
                            <h3 className="markdown-heading markdown-h3" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h3>
                        )
                    },
                    h4({ children, node }) {
                        return (
                            <h4 className="markdown-heading markdown-h4" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h4>
                        )
                    },
                    h5({ children, node }) {
                        return (
                            <h5 className="markdown-heading markdown-h5" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h5>
                        )
                    },
                    h6({ children, node }) {
                        return (
                            <h6 className="markdown-heading markdown-h6" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </h6>
                        )
                    },
                    p({ children, node }) {
                        const align = getTextAlign(node)
                        const Tag = hasBlockChild(node) ? 'div' : 'p'

                        return (
                            <Tag className="markdown-paragraph" style={{ textAlign: align }}>
                                {children}
                            </Tag>
                        )
                    },
                    div({ children, node }) {
                        return (
                            <div className="markdown-html-block" style={{ textAlign: getTextAlign(node) }}>
                                {children}
                            </div>
                        )
                    },
                    ul({ children }) {
                        return <ul className="markdown-list markdown-list-unordered">{children}</ul>
                    },
                    ol({ children }) {
                        return <ol className="markdown-list markdown-list-ordered">{children}</ol>
                    },
                    li({ children }) {
                        return <li className="markdown-list-item">{children}</li>
                    },
                    blockquote({ children }) {
                        return <blockquote className="markdown-blockquote">{children}</blockquote>
                    },
                    table({ children }) {
                        return (
                            <div className="markdown-table-wrap">
                                <table className="markdown-table">{children}</table>
                            </div>
                        )
                    },
                    thead({ children }) {
                        return <thead className="markdown-table-head">{children}</thead>
                    },
                    tbody({ children }) {
                        return <tbody>{children}</tbody>
                    },
                    tr({ children }) {
                        return <tr className="markdown-table-row">{children}</tr>
                    },
                    th({ children }) {
                        return <th className="markdown-table-cell markdown-table-heading-cell">{children}</th>
                    },
                    td({ children }) {
                        return <td className="markdown-table-cell">{children}</td>
                    },
                    a({ children, href, title }) {
                        const external = isExternalLink(href)

                        return (
                            <a
                                href={href}
                                title={title}
                                className="markdown-link"
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                            >
                                {children}
                            </a>
                        )
                    },
                    img({ src, alt, title }) {
                        return (
                            <img
                                src={src || undefined}
                                alt={alt || ''}
                                title={title}
                                loading="lazy"
                                className="markdown-image"
                            />
                        )
                    },
                    hr() {
                        return <hr className="markdown-rule" />
                    },
                    strong({ children }) {
                        return <strong className="markdown-strong">{children}</strong>
                    },
                    em({ children }) {
                        return <em className="markdown-emphasis">{children}</em>
                    },
                    del({ children }) {
                        return <del className="markdown-strikethrough">{children}</del>
                    },
                    input({ checked, type }) {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={Boolean(checked)}
                                    readOnly
                                    aria-label="Task item"
                                    className="markdown-checkbox"
                                />
                            )
                        }

                        return <input type={type} readOnly />
                    },
                }}
            >
                {normalizedContent}
            </ReactMarkdown>
        </div>
    )
}
