import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { IssueCard } from "@/features/board/components/issue-card"
import type { Issue, Status } from "@/types"
import { cn } from "cn"

export function BoardColumn({
  status,
  issues,
  onOpenIssue,
  droppableId = status.id,
}: {
  status: Status
  issues: Issue[]
  onOpenIssue: (key: string) => void
  /** Overridden when the same status renders in multiple swimlanes, so each drop zone stays unique. */
  droppableId?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { statusId: status.id },
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg bg-muted/40">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h3
          title={status.name}
          className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {status.name}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">{issues.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-md p-2 transition-colors",
          isOver && "bg-accent/60"
        )}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))}
        </SortableContext>
        {issues.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">No issues</p>
        ) : null}
      </div>
    </div>
  )
}
