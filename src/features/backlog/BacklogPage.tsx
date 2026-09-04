import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ALL,
  BacklogFilters,
  EMPTY_FILTERS,
  UNASSIGNED,
  type BacklogFilterState,
} from "@/features/backlog/components/backlog-filters"
import { BacklogRow } from "@/features/backlog/components/backlog-row"
import { useBacklogIssues, useReorderBacklog } from "@/features/backlog/hooks/useBacklogIssues"
import { IssueDetailDialog } from "@/features/issue-detail/IssueDetailDialog"
import { useIssueDetailRoute } from "@/features/issue-detail/hooks/useIssueDetailRoute"

export function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: issues, isLoading } = useBacklogIssues(projectId)
  const reorder = useReorderBacklog(projectId)
  const { openIssueKey, openIssue, closeIssue } = useIssueDetailRoute()
  const [filters, setFilters] = useState<BacklogFilterState>(EMPTY_FILTERS)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const filteredIssues = useMemo(() => {
    if (!issues) return []
    return issues.filter((issue) => {
      if (filters.statusId !== ALL && issue.statusId !== filters.statusId) return false
      if (filters.assigneeId !== ALL) {
        if (filters.assigneeId === UNASSIGNED ? issue.assigneeId !== null : issue.assigneeId !== filters.assigneeId)
          return false
      }
      if (filters.priority !== ALL && issue.priority !== filters.priority) return false
      return true
    })
  }, [issues, filters])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = filteredIssues.findIndex((i) => i.id === active.id)
    const newIndex = filteredIssues.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(filteredIssues, oldIndex, newIndex)
    reorder.mutate(reordered.map((i) => i.id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <BacklogFilters
          projectId={projectId as string}
          filters={filters}
          onChange={setFilters}
        />
        <span className="text-sm text-muted-foreground">{filteredIssues.length} issues</span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-6 py-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-md bg-muted/40" />
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No backlog issues match these filters.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={filteredIssues.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col rounded-md border">
                  {filteredIssues.map((issue) => (
                    <BacklogRow key={issue.id} issue={issue} onOpen={openIssue} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      <IssueDetailDialog issueKey={openIssueKey} onClose={closeIssue} />
    </div>
  )
}
