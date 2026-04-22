'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Strikethrough, Code, Link2, Image as ImageIcon,
  List, ListOrdered, Quote, Minus, Undo2, Redo2,
  Heading1, Heading2, Heading3, Link2Off,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialContent?: Record<string, unknown> | null
  onChange: (json: Record<string, unknown>) => void
  placeholder?: string
}

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload failed')
  const json = await res.json()
  return json.url as string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
        active
          ? 'bg-[#105fa3] text-white shadow-sm'
          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1A1A2E]',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-[#E5E7EB]" />
}

function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full gap-4 animate-pulse">
      {/* Toolbar ghost */}
      <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-8 w-8 rounded-lg bg-[#F3F4F6]" />
        ))}
      </div>
      {/* Canvas ghost */}
      <div className="flex-1 rounded-2xl bg-white px-10 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] space-y-4">
        <div className="h-6 w-2/3 rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-full rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-5/6 rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-4/5 rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-full rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-3/4 rounded-lg bg-[#F3F4F6]" />
      </div>
    </div>
  )
}

export default function TipTapEditor({ initialContent, onChange, placeholder }: Props) {
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: 'list-disc ml-6' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-6' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-[#105fa3] pl-4 italic text-[#6B7280]' } },
        code: { HTMLAttributes: { class: 'rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-sm text-[#914c00]' } },
        codeBlock: { HTMLAttributes: { class: 'rounded-xl bg-[#1A1A2E] p-4 font-mono text-sm text-[#E5E7EB] overflow-x-auto' } },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full my-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]' },
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Begin writing your story…  Type / for commands',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#105fa3] underline underline-offset-2 hover:opacity-80 transition-opacity' },
      }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] text-[#1A1A2E] leading-relaxed',
        spellcheck: 'true',
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false
        const files = event.dataTransfer?.files
        if (!files?.length) return false
        const file = files[0]
        if (!file.type.startsWith('image/')) return false
        event.preventDefault()

        const { schema } = view.state
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (!coordinates) return false

        uploadImageFile(file)
          .then((url) => {
            const node = schema.nodes.image.create({ src: url })
            const transaction = view.state.tr.insert(coordinates.pos, node)
            view.dispatch(transaction)
          })
          .catch((err) => console.error('[TipTap image drop]', err))

        return true
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (!file) continue
            event.preventDefault()
            const { schema } = view.state
            const pos = view.state.selection.from
            uploadImageFile(file)
              .then((url) => {
                const node = schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.insert(pos, node)
                view.dispatch(transaction)
              })
              .catch((err) => console.error('[TipTap image paste]', err))
            return true
          }
        }
        return false
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current(editor.getJSON() as Record<string, unknown>)
    },
  })

  // Sync initialContent when it changes (e.g. loading saved draft)
  useEffect(() => {
    if (!editor || !initialContent) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(initialContent)
    if (current !== next) {
      editor.commands.setContent(initialContent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, JSON.stringify(initialContent)])

  const addLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', prev ?? 'https://')
    if (!url) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }, [editor])

  const addImageByUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Enter image URL')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return <EditorSkeleton />

  const hasLink = editor.isActive('link')

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sticky top-0 z-10">
        {/* History */}
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 size={14} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={14} />
        </ToolbarButton>

        <Divider />

        {/* Inline marks */}
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={14} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={14} />
        </ToolbarButton>

        <Divider />

        {/* Media & Links */}
        <ToolbarButton
          title={hasLink ? 'Remove link' : 'Add link'}
          active={hasLink}
          onClick={hasLink ? () => editor.chain().focus().unsetLink().run() : addLink}
        >
          {hasLink ? <Link2Off size={14} /> : <Link2 size={14} />}
        </ToolbarButton>
        <ToolbarButton
          title="Insert image"
          onClick={addImageByUrl}
        >
          <ImageIcon size={14} />
        </ToolbarButton>
      </div>

      {/* Editor canvas */}
      <div className="flex-1 overflow-y-auto mt-4">
        <EditorContent
          editor={editor}
          className="min-h-[500px] rounded-2xl bg-white px-10 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-[#1A1A2E] [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-[#1A1A2E] [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-[#374151] [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:text-[#374151] [&_.ProseMirror_p]:leading-[1.8] [&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_li]:mb-1.5 [&_.ProseMirror_li]:text-[#374151] [&_.ProseMirror_blockquote]:my-6 [&_.ProseMirror_hr]:my-6 [&_.ProseMirror_hr]:border-[#E5E7EB] [&_.ProseMirror_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty]:before:text-[#9CA3AF] [&_.ProseMirror_.is-editor-empty]:before:pointer-events-none [&_.ProseMirror_.is-editor-empty]:before:absolute [&_.ProseMirror_.is-editor-empty]:before:top-0 [&_.ProseMirror_.is-editor-empty_p.is-empty]:first:before:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty_p.is-empty]:first:before:text-[#9CA3AF] [&_.ProseMirror_.is-editor-empty_p.is-empty]:first:before:pointer-events-none"
        />
      </div>
    </div>
  )
}
