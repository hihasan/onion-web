import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { cn } from "cn"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react"
import { useEditorState } from "@tiptap/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useUpdateIssue } from "@/features/issue-detail/hooks/useIssue"
import type { Issue } from "@/types"
import type { Editor } from "@tiptap/react"

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      {children}
    </Button>
  )
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor.isActive("bold"),
      italic: ctx.editor.isActive("italic"),
      strike: ctx.editor.isActive("strike"),
      bulletList: ctx.editor.isActive("bulletList"),
      orderedList: ctx.editor.isActive("orderedList"),
      blockquote: ctx.editor.isActive("blockquote"),
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
    }),
  })

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
      <ToolbarButton title="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        title="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton title="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  )
}

/**
 * Rich-text description field (Tiptap). Keeps a single editor instance for
 * the component's life and toggles `editable` rather than mounting/unmounting
 * the editor, which avoids tearing down the ProseMirror view mid-interaction.
 */
export function IssueDescriptionEditor({ issue }: { issue: Issue }) {
  const updateIssue = useUpdateIssue()
  const [editing, setEditing] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Add a description…", showOnlyWhenEditable: false }),
    ],
    content: issue.description || "",
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap min-h-8 px-1.5 py-1 text-sm outline-none",
      },
    },
  })

  function startEditing() {
    if (!editor) return
    editor.commands.setContent(issue.description || "")
    editor.setEditable(true)
    editor.commands.focus("end")
    setEditing(true)
  }

  function handleSave() {
    if (!editor) return
    const html = editor.isEmpty ? "" : editor.getHTML()
    updateIssue.mutate(
      { id: issue.id, patch: { description: html } },
      {
        onSuccess: () => {
          editor.setEditable(false)
          setEditing(false)
        },
      }
    )
  }

  function handleCancel() {
    if (!editor) return
    editor.commands.setContent(issue.description || "")
    editor.setEditable(false)
    setEditing(false)
  }

  if (!editor) return null

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => !editing && startEditing()}
        className={cn(
          "rounded-md",
          editing
            ? "border focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
            : "-mx-1.5 cursor-text hover:bg-accent"
        )}
      >
        {editing ? <EditorToolbar editor={editor} /> : null}
        <EditorContent editor={editor} />
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={updateIssue.isPending}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  )
}
