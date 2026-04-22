import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mark {
  type: string
  attrs?: Record<string, string | null>
}

interface TipTapNode {
  type: string
  text?: string
  marks?: Mark[]
  attrs?: Record<string, string | number | null>
  content?: TipTapNode[]
}

// ─── Mark application ─────────────────────────────────────────────────────────
// Applies ProseMirror marks from outside-in: bold(italic(text))

function applyMarks(text: string, marks: Mark[], key: string): React.ReactNode {
  if (!marks.length) return text

  const [first, ...rest] = marks
  const inner = rest.length ? applyMarks(text, rest, key) : text

  switch (first.type) {
    case 'bold':
      return <strong key={key} className="font-bold text-[#1A1A2E]">{inner}</strong>
    case 'italic':
      return <em key={key} className="italic">{inner}</em>
    case 'strike':
      return <s key={key} className="line-through text-[#9CA3AF]">{inner}</s>
    case 'code':
      return (
        <code
          key={key}
          className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[0.875em] text-[#914c00]"
        >
          {inner}
        </code>
      )
    case 'link': {
      const href = first.attrs?.href ?? '#'
      const target = first.attrs?.target ?? '_self'
      const isExternal = typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))
      return (
        <a
          key={key}
          href={href as string}
          target={isExternal ? '_blank' : target as string}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#105fa3] font-medium underline-offset-2 hover:underline transition-colors"
        >
          {inner}
        </a>
      )
    }
    default:
      return <span key={key}>{inner}</span>
  }
}

// ─── Node renderer ────────────────────────────────────────────────────────────

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  const key = `node-${index}`

  switch (node.type) {
    case 'doc':
      return (
        <React.Fragment key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </React.Fragment>
      )

    case 'paragraph': {
      const children = node.content?.map((child, i) => renderNode(child, i))
      return (
        <p key={key} className="mb-6 text-[1.0625rem] leading-[1.85] text-[#374151]">
          {children?.length ? children : <br />}
        </p>
      )
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2
      const children = node.content?.map((child, i) => renderNode(child, i))
      const baseClass = 'font-bold text-[#1A1A2E] leading-tight mt-10 mb-4'
      const style: React.CSSProperties = { fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }
      if (level === 1)
        return <h1 key={key} className={`${baseClass} text-[2rem] sm:text-[2.25rem]`} style={style}>{children}</h1>
      if (level === 2)
        return <h2 key={key} className={`${baseClass} text-[1.625rem] sm:text-[1.75rem]`} style={style}>{children}</h2>
      return <h3 key={key} className={`${baseClass} text-[1.25rem] sm:text-[1.375rem]`} style={style}>{children}</h3>
    }

    case 'bulletList':
      return (
        <ul key={key} className="mb-6 ml-6 list-disc space-y-2 text-[1.0625rem] text-[#374151]">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={key} className="mb-6 ml-6 list-decimal space-y-2 text-[1.0625rem] text-[#374151]">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      )

    case 'listItem':
      return (
        <li key={key} className="leading-relaxed pl-1">
          {node.content?.map((child, i) => {
            // Unwrap the inner paragraph of a list item so it's inline
            if (child.type === 'paragraph') {
              return child.content?.map((c, j) => renderNode(c, j))
            }
            return renderNode(child, i)
          })}
        </li>
      )

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="my-8 border-l-4 border-[#D4A017] pl-6 py-1"
        >
          <div className="text-[1.125rem] italic leading-relaxed text-[#4B5563]">
            {node.content?.map((child, i) => {
              if (child.type === 'paragraph') {
                return child.content?.map((c, j) => renderNode(c, j))
              }
              return renderNode(child, i)
            })}
          </div>
        </blockquote>
      )

    case 'codeBlock':
      return (
        <pre
          key={key}
          className="my-8 overflow-x-auto rounded-2xl bg-[#1A1A2E] px-6 py-5 font-mono text-[0.875rem] leading-relaxed text-[#E5E7EB]"
        >
          <code>
            {node.content?.map((child, i) => renderNode(child, i))}
          </code>
        </pre>
      )

    case 'image': {
      const src = node.attrs?.src as string | undefined
      const alt = (node.attrs?.alt as string | undefined) ?? ''
      if (!src) return null
      return (
        <figure key={key} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl object-cover shadow-[0_4px_24px_rgba(26,28,28,0.08)]"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-sm italic text-[#9CA3AF]">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'horizontalRule':
      return (
        <hr
          key={key}
          className="my-10 h-px border-0 bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent"
        />
      )

    case 'hardBreak':
      return <br key={key} />

    case 'text': {
      const marks = node.marks ?? []
      const text = node.text ?? ''
      if (!marks.length) return text
      return applyMarks(text, marks, key)
    }

    default:
      // Unknown node — render children if any
      return (
        <React.Fragment key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </React.Fragment>
      )
  }
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  content: Record<string, unknown>
  className?: string
}

export default function TipTapRenderer({ content, className }: Props) {
  return (
    <div className={className}>
      {renderNode(content as unknown as TipTapNode, 0)}
    </div>
  )
}
