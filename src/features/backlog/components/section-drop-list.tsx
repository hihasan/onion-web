import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { BacklogRow } from "@/features/backlog/components/backlog-row"
import type { Issue } from "@/types"
import { cn } from "cn"

export function SectionDropList({
  id,
  targetSprintId,
  issues,
  onOpen,
  emptyText,
}: {
  id: string
  targetSprintId: string | null
  issues: Issue[]
  onOpen: (key: string) => void
  emptyText: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { targetSprintId } })

  return (
    <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-16 flex-col rounded-md border transition-colors",
          isOver && "bg-accent/40"
        )}
      >
        {issues.map((issue) => (
          <BacklogRow key={issue.id} issue={issue} onOpen={onOpen} />
        ))}
        {issues.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
        ) : null}
      </div>
    </SortableContext>
  )
}
