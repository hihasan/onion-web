import { useState } from "react"
import { Plus } from "lucide-react"

import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { useCreateIssue } from "@/features/backlog/hooks/useBacklogIssues"
import type { IssueType } from "@/types"

const TYPE_OPTIONS: IssueType[] = ["task", "story", "bug"]

export function InlineCreateIssue({
  targetSprintId,
  statusId,
  projectKey,
  reporterId,
  createIssue,
}: {
  targetSprintId: string | null
  statusId: string | undefined
  projectKey: string | undefined
  reporterId: string | undefined
  createIssue: ReturnType<typeof useCreateIssue>
}) {
  const [creating, setCreating] = useState(false)
  const [type, setType] = useState<IssueType>("task")
  const [title, setTitle] = useState("")

  const canCreate = Boolean(title.trim() && statusId && projectKey && reporterId)

  function handleCreate() {
    if (!canCreate) return
    createIssue.mutate(
      {
        projectKey: projectKey as string,
        title: title.trim(),
        type,
        statusId: statusId as string,
        reporterId: reporterId as string,
        targetSprintId,
      },
      { onSuccess: () => setTitle("") }
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleCreate()
    if (e.key === "Escape") setCreating(false)
  }

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex items-center gap-1.5 self-start px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" />
        Create
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      <Select value={type} onValueChange={(v: IssueType) => setType(v)}>
        <SelectTrigger className="h-8 w-fit border-none px-1.5 shadow-none">
          <SelectValue>
            <IssueTypeIcon type={type} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              <IssueTypeIcon type={option} />
              <span className="capitalize">{option}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) setCreating(false)
        }}
        placeholder="What needs to be done?"
        className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />

      <Button size="sm" disabled={!canCreate || createIssue.isPending} onClick={handleCreate}>
        Create
      </Button>
    </div>
  )
}
