"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface ReadOnlyContentProps {
  content: string
}

export function ReadOnlyContent({ content }: ReadOnlyContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    editable: false,
    content: content,
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="dark:prose-invert max-w-none [&>p]:m-0">
      <EditorContent editor={editor} />
    </div>
  )
} 