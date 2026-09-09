import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { IssueToolbar, type IssueGroupBy } from "@/components/common/issue-toolbar"
import { UserAvatar } from "@/components/common/user-avatar"
import { BoardColumn } from "@/features/board/components/board-column"
import { computeOrderBetween, useBoardIssues, useMoveIssue } from "@/features/board/hooks/useBoardIssues"
import { IssueDetailDialog } from "@/features/issue-detail/IssueDetailDialog"
import { useIssueDetailRoute } from "@/features/issue-detail/hooks/useIssueDetailRoute"
import { useIssueFilters } from "@/hooks/useIssueFilters"
import { useActiveSprint, useStatuses } from "@/hooks/useProjectWorkflow"
import { useCurrentUser, useUsers } from "@/hooks/useUsers"
import type { Issue, User } from "@/types"

const UNASSIGNED_KEY = "unassigned"

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: sprint } = useActiveSprint(projectId)
  const { data: statuses } = useStatuses(projectId)
  const { data: issues, isLoading, isFetching, refetch } = useBoardIssues(projectId, sprint?.id)
  const { data: users } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const moveIssue = useMoveIssue(projectId, sprint?.id)
  const { openIssueKey, openIssue, closeIssue } = useIssueDetailRoute()

  const [groupBy, setGroupBy] = useState<IssueGroupBy>("none")

  const filters = useIssueFilters(issues, currentUser?.id)
  const { filteredIssues } = filters

  const epics = useMemo(() => (issues ?? []).filter((issue) => issue.type === "epic"), [issues])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const swimlanes = useMemo(() => {
    if (groupBy !== "assignee") return null

    const lanes: { key: string; user: User | null; issues: Issue[] }[] = (users ?? []).map(
      (user) => ({
        key: user.id,
        user,
        issues: filteredIssues.filter((issue) => issue.assigneeId === user.id),
      })
    )

    return lanes
      .concat({
        key: UNASSIGNED_KEY,
        user: null,
        issues: filteredIssues.filter((issue) => !issue.assigneeId),
      })
      .filter((lane) => lane.issues.length > 0)
  }, [filteredIssues, groupBy, users])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || !issues || !statuses) return

    const activeIssue = issues.find((i) => i.id === active.id)
    if (!activeIssue) return

    const overData = over.data.current as { statusId?: string; issue?: Issue } | undefined
    const overIsColumn = Boolean(overData?.statusId)
    const targetStatusId = overData?.statusId ?? overData?.issue?.statusId

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
      <IssueToolbar
        search={filters.search}
        onSearchChange={filters.setSearch}
        users={users ?? []}
        assigneeIds={filters.assigneeIds}
        onToggleAssignee={filters.toggleAssignee}
        types={filters.types}
        onToggleType={filters.toggleType}
        labels={filters.labels}
        availableLabels={filters.availableLabels}
        onToggleLabel={filters.toggleLabel}
        quickFilters={filters.quickFilters}
        onToggleQuickFilter={filters.toggleQuickFilter}
        epics={epics}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-4">
        {isLoading || !statuses ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 min-w-60 flex-1 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {swimlanes ? (
              <div className="flex flex-col gap-6">
                {swimlanes.map((lane) => (
                  <div key={lane.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={lane.user} size="sm" />
                      <span className="text-sm font-medium">{lane.user?.name ?? "Unassigned"}</span>
                      <span className="text-xs text-muted-foreground">{lane.issues.length}</span>
                    </div>
                    <div className="flex gap-4">
                      {statuses.map((status) => (
                        <BoardColumn
                          key={status.id}
                          status={status}
                          droppableId={`${status.id}::${lane.key}`}
                          issues={lane.issues
                            .filter((i) => i.statusId === status.id)
                            .sort((a, b) => a.order - b.order)}
                          onOpenIssue={openIssue}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full gap-4">
                {statuses.map((status) => (
                  <BoardColumn
                    key={status.id}
                    status={status}
                    issues={filteredIssues
                      .filter((i) => i.statusId === status.id)
                      .sort((a, b) => a.order - b.order)}
                    onOpenIssue={openIssue}
                  />
                ))}
              </div>
            )}
          </DndContext>
        )}
      </div>

      <IssueDetailDialog issueKey={openIssueKey} onClose={closeIssue} />
    </div>
  )
}
