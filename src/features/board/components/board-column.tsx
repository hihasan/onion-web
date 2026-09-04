import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { IssueCard } from "@/features/board/components/issue-card"
import type { Issue, Status } from "@/types"
import { cn } from "cn"

export function BoardColumn({
  status,
  issues,
  onOpenIssue,
}: {
  status: Status
  issues: Issue[]
  onOpenIssue: (key: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id, data: { statusId: status.id } })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/40">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {status.name}
        </h3>
        <span className="text-xs text-muted-foreground">{issues.length}</span>
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
