import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { useParams } from "react-router-dom"

import { BoardColumn } from "@/features/board/components/board-column"
import { computeOrderBetween, useBoardIssues, useMoveIssue } from "@/features/board/hooks/useBoardIssues"
import { IssueDetailDialog } from "@/features/issue-detail/IssueDetailDialog"
import { useIssueDetailRoute } from "@/features/issue-detail/hooks/useIssueDetailRoute"
import { useActiveSprint, useStatuses } from "@/hooks/useProjectWorkflow"

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: sprint } = useActiveSprint(projectId)
  const { data: statuses } = useStatuses(projectId)
  const { data: issues, isLoading } = useBoardIssues(projectId, sprint?.id)
  const moveIssue = useMoveIssue(projectId, sprint?.id)
  const { openIssueKey, openIssue, closeIssue } = useIssueDetailRoute()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || !issues || !statuses) return

    const activeIssue = issues.find((i) => i.id === active.id)
    if (!activeIssue) return

    const overIsColumn = statuses.some((s) => s.id === over.id)
    const targetStatusId = overIsColumn ? (over.id as string) : issues.find((i) => i.id === over.id)?.statusId

    if (!targetStatusId) return

    const columnIssues = issues
      .filter((i) => i.statusId === targetStatusId && i.id !== activeIssue.id)
      .sort((a, b) => a.order - b.order)

    const overIndex = overIsColumn
      ? columnIssues.length
      : columnIssues.findIndex((i) => i.id === over.id)
    const insertAt = overIndex === -1 ? columnIssues.length : overIndex

    const newOrder = computeOrderBetween(columnIssues[insertAt - 1], columnIssues[insertAt])

    if (targetStatusId === activeIssue.statusId && newOrder === activeIssue.order) return

    moveIssue.mutate({ issueId: activeIssue.id, statusId: targetStatusId, order: newOrder })
  }

  if (!sprint && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No active sprint for this project. Start a sprint from the backlog to see it on the board.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {sprint ? (
        <div className="border-b px-6 py-3">
          <p className="text-sm font-medium">{sprint.name}</p>
          {sprint.goal ? <p className="text-xs text-muted-foreground">{sprint.goal}</p> : null}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-x-auto p-4">
        {isLoading || !statuses ? (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 w-72 shrink-0 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4">
              {statuses.map((status) => (
                <BoardColumn
                  key={status.id}
                  status={status}
                  issues={(issues ?? [])
                    .filter((i) => i.statusId === status.id)
                    .sort((a, b) => a.order - b.order)}
                  onOpenIssue={openIssue}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>

      <IssueDetailDialog issueKey={openIssueKey} onClose={closeIssue} />
    </div>
  )
}
