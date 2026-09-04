import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import { PriorityIcon } from "@/components/common/priority-icon"
import { UserAvatar } from "@/components/common/user-avatar"
import { getStatusById } from "@/mocks/statuses"
import { getUserById } from "@/mocks/users"
import type { Issue } from "@/types"
import { cn } from "cn"

export function BacklogRow({ issue, onOpen }: { issue: Issue; onOpen: (key: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  })

  const assignee = getUserById(issue.assigneeId)
  const status = getStatusById(issue.statusId)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 border-b bg-background px-2 py-2.5 text-sm",
        isDragging && "opacity-40"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <IssueTypeIcon type={issue.type} />

      <button
        type="button"
        onClick={() => onOpen(issue.key)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left hover:underline"
      >
        <span className="shrink-0 text-xs text-muted-foreground">{issue.key}</span>
        <span className="truncate font-medium">{issue.title}</span>
      </button>

      {status ? (
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs whitespace-nowrap text-secondary-foreground">
          {status.name}
        </span>
      ) : null}

      <PriorityIcon priority={issue.priority} className="shrink-0" />

      <UserAvatar user={assignee} size="sm" className="shrink-0" />
    </div>
  )
}
