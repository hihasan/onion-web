import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import { PriorityIcon } from "@/components/common/priority-icon"
import { UserAvatar } from "@/components/common/user-avatar"
import { getUserById } from "@/mocks/users"
import type { Issue } from "@/types"
import { cn } from "cn"

export function IssueCard({ issue, onOpen }: { issue: Issue; onOpen: (key: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { issue },
  })

  const assignee = getUserById(issue.assigneeId)

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onOpen(issue.key)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex w-full flex-col gap-2 rounded-md border bg-card p-3 text-left text-sm shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-40"
      )}
    >
      <p className="line-clamp-3 font-medium">{issue.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <IssueTypeIcon type={issue.type} />
          <PriorityIcon priority={issue.priority} />
          <span className="text-xs">{issue.key}</span>
        </div>
        <UserAvatar user={assignee} size="sm" />
      </div>
    </button>
  )
}
