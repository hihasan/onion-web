import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { IssueToolbar, type IssueGroupBy } from "@/components/common/issue-toolbar"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BacklogRow } from "@/features/backlog/components/backlog-row"
import {
  useBacklogIssues,
  useCreateIssue,
  useMoveIssueSprint,
  useReorderBacklog,
  useReorderSprint,
} from "@/features/backlog/hooks/useBacklogIssues"
import { InlineCreateIssue } from "@/features/backlog/components/inline-create-issue"
import { SectionDropList } from "@/features/backlog/components/section-drop-list"
import { SprintSectionMenu } from "@/features/backlog/components/sprint-section-menu"
import { computeOrderBetween, useBoardIssues } from "@/features/board/hooks/useBoardIssues"
import { IssueDetailPanel } from "@/features/issue-detail/IssueDetailPanel"
import { useIssueDetailRoute } from "@/features/issue-detail/hooks/useIssueDetailRoute"
import { useIssueFilters } from "@/hooks/useIssueFilters"
import { useActiveSprint, useStatuses } from "@/hooks/useProjectWorkflow"
import { useProject } from "@/hooks/useProjects"
import { useCurrentUser, useUsers } from "@/hooks/useUsers"
import type { Issue, StatusCategory, User } from "@/types"

const UNASSIGNED_KEY = "unassigned"

const POINT_PILL_STYLES: Record<StatusCategory, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start || !end) return null
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
}

interface AssigneeGroup {
  key: string
  user: User | null
  issues: Issue[]
}

function groupByAssignee(issues: Issue[], users: User[]): AssigneeGroup[] {
  const lanes: AssigneeGroup[] = users.map((user) => ({
    key: user.id,
    user,
    issues: issues.filter((issue) => issue.assigneeId === user.id),
  }))

  return lanes
    .concat({ key: UNASSIGNED_KEY, user: null, issues: issues.filter((issue) => !issue.assigneeId) })
    .filter((lane) => lane.issues.length > 0)
}

export function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project } = useProject(projectId)
  const { data: sprint } = useActiveSprint(projectId)
  const { data: statuses } = useStatuses(projectId)
  const {
    data: sprintIssues,
    isLoading: isSprintIssuesLoading,
    isFetching: isSprintIssuesFetching,
    refetch: refetchSprintIssues,
  } = useBoardIssues(projectId, sprint?.id)
  const {
    data: backlogIssues,
    isLoading: isBacklogLoading,
    isFetching: isBacklogFetching,
    refetch: refetchBacklogIssues,
  } = useBacklogIssues(projectId)
  const { data: users } = useUsers()
  const { data: currentUser } = useCurrentUser()

  const moveIssueSprint = useMoveIssueSprint(projectId, sprint?.id)
  const reorderSprint = useReorderSprint(projectId, sprint?.id)
  const reorderBacklog = useReorderBacklog(projectId)
  const createIssue = useCreateIssue(projectId, sprint?.id)
  const { openIssueKey, openIssue, closeIssue } = useIssueDetailRoute()

  const defaultStatusId = useMemo(
    () => statuses?.find((s) => s.category === "todo")?.id ?? statuses?.[0]?.id,
    [statuses]
  )

  const [groupBy, setGroupBy] = useState<IssueGroupBy>("none")
  const [sprintCollapsed, setSprintCollapsed] = useState(false)

  const allIssues = useMemo(() => [...(sprintIssues ?? []), ...(backlogIssues ?? [])], [sprintIssues, backlogIssues])
  const filters = useIssueFilters(allIssues, currentUser?.id)
  const filteredSprintIssues = filters.filterIssues(sprintIssues ?? [])
  const filteredBacklogIssues = filters.filterIssues(backlogIssues ?? [])

  const epics = useMemo(() => allIssues.filter((issue) => issue.type === "epic"), [allIssues])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const sprintGroups = useMemo(
    () => (groupBy === "assignee" ? groupByAssignee(filteredSprintIssues, users ?? []) : null),
    [groupBy, filteredSprintIssues, users]
  )
  const backlogGroups = useMemo(
    () => (groupBy === "assignee" ? groupByAssignee(filteredBacklogIssues, users ?? []) : null),
    [groupBy, filteredBacklogIssues, users]
  )

  const pointsByCategory = useMemo(() => {
    const categoryByStatusId = new Map((statuses ?? []).map((s) => [s.id, s.category]))
    const totals: Record<StatusCategory, number> = { todo: 0, in_progress: 0, done: 0 }
    for (const issue of sprintIssues ?? []) {
      const category = categoryByStatusId.get(issue.statusId)
      if (category) totals[category] += issue.storyPoints ?? 0
    }
    return totals
  }, [statuses, sprintIssues])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeIssue = allIssues.find((i) => i.id === active.id)
    if (!activeIssue) return

    const overData = over.data.current as { targetSprintId?: string | null; issue?: Issue } | undefined
    const droppedOnContainer = Boolean(overData && "targetSprintId" in overData)
    const targetSprintId = droppedOnContainer
      ? (overData?.targetSprintId ?? null)
      : (overData?.issue?.sprintId ?? null)

    const targetList = (targetSprintId ? (sprintIssues ?? []) : (backlogIssues ?? []))
      .filter((i) => i.id !== activeIssue.id)
      .sort((a, b) => a.order - b.order)

    const overIndex = droppedOnContainer ? targetList.length : targetList.findIndex((i) => i.id === over.id)
    const insertAt = overIndex === -1 ? targetList.length : overIndex
    const newOrder = computeOrderBetween(targetList[insertAt - 1], targetList[insertAt])

    if (targetSprintId === activeIssue.sprintId && newOrder === activeIssue.order) return

    moveIssueSprint.mutate({ issueId: activeIssue.id, targetSprintId, order: newOrder })
  }

  const isLoading = isBacklogLoading || (Boolean(sprint?.id) && isSprintIssuesLoading)
  const sprintDateRange = sprint ? formatDateRange(sprint.startDate, sprint.endDate) : null

  return (
    <div className="flex min-h-0 flex-1">
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
          onRefresh={() => {
            refetchSprintIssues()
            refetchBacklogIssues()
          }}
          isRefreshing={isSprintIssuesFetching || isBacklogFetching}
        />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-6 py-4">
            {isLoading ? (
              <div className="flex flex-col gap-2 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded-md bg-muted/40" />
                ))}
              </div>
            ) : (
              <DndWrapper enabled={groupBy === "none"} sensors={sensors} onDragEnd={handleDragEnd}>
                {sprint ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSprintCollapsed((v) => !v)}
                        aria-label={sprintCollapsed ? "Expand sprint" : "Collapse sprint"}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {sprintCollapsed ? (
                          <ChevronRight className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                      <span className="text-sm font-semibold">{sprint.name}</span>
                      {sprintDateRange ? (
                        <span className="text-xs text-muted-foreground">{sprintDateRange}</span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {filteredSprintIssues.length === (sprintIssues?.length ?? 0)
                          ? `${sprintIssues?.length ?? 0} work items`
                          : `${filteredSprintIssues.length} of ${sprintIssues?.length ?? 0} work items visible`}
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {(["todo", "in_progress", "done"] as const).map((category) =>
                          pointsByCategory[category] > 0 ? (
                            <span
                              key={category}
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${POINT_PILL_STYLES[category]}`}
                            >
                              {pointsByCategory[category]}
                            </span>
                          ) : null
                        )}
                        <Button size="sm" className="rounded-full">
                          Complete sprint
                        </Button>
                        <SprintSectionMenu
                          sprint={sprint}
                          projectId={projectId}
                          issues={sprintIssues ?? []}
                          onReorder={(ids) => reorderSprint.mutate(ids)}
                        />
                      </div>
                    </div>

                    {sprintCollapsed ? null : sprintGroups ? (
                      <GroupedSection groups={sprintGroups} onOpen={openIssue} onReorder={(ids) => reorderSprint.mutate(ids)} />
                    ) : (
                      <>
                        <SectionDropList
                          id="sprint"
                          targetSprintId={sprint.id}
                          issues={filteredSprintIssues}
                          onOpen={openIssue}
                          emptyText="Drag work items here to add them to the sprint."
                        />
                        <InlineCreateIssue
                          targetSprintId={sprint.id}
                          statusId={defaultStatusId}
                          projectKey={project?.key}
                          reporterId={currentUser?.id}
                          createIssue={createIssue}
                        />
                      </>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">Backlog</span>
                    <span className="text-xs text-muted-foreground">
                      {filteredBacklogIssues.length === (backlogIssues?.length ?? 0)
                        ? `${backlogIssues?.length ?? 0} work items`
                        : `${filteredBacklogIssues.length} of ${backlogIssues?.length ?? 0} work items visible`}
                    </span>
                  </div>

                  {backlogGroups ? (
                    <GroupedSection
                      groups={backlogGroups}
                      onOpen={openIssue}
                      onReorder={(ids) => reorderBacklog.mutate(ids)}
                    />
                  ) : (
                    <>
                      <SectionDropList
                        id="backlog"
                        targetSprintId={null}
                        issues={filteredBacklogIssues}
                        onOpen={openIssue}
                        emptyText="No backlog issues match these filters."
                      />
                      <InlineCreateIssue
                        targetSprintId={null}
                        statusId={defaultStatusId}
                        projectKey={project?.key}
                        reporterId={currentUser?.id}
                        createIssue={createIssue}
                      />
                    </>
                  )}
                </div>
              </DndWrapper>
            )}
          </div>
        </ScrollArea>
      </div>

      {openIssueKey ? <IssueDetailPanel issueKey={openIssueKey} onClose={closeIssue} /> : null}
    </div>
  )
}

/**
 * Wraps both sections in one shared DndContext so a card can be dragged
 * between the sprint and backlog. Skipped while grouped by assignee, since
 * each group there owns its own independent context.
 */
function DndWrapper({
  enabled,
  sensors,
  onDragEnd,
  children,
}: {
  enabled: boolean
  sensors: ReturnType<typeof useSensors>
  onDragEnd: (event: DragEndEvent) => void
  children: ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      {children}
    </DndContext>
  )
}

function GroupedSection({
  groups,
  onOpen,
  onReorder,
}: {
  groups: AssigneeGroup[]
  onOpen: (key: string) => void
  onReorder: (orderedIds: string[]) => void
}) {
  if (groups.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground">No work items match these filters.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar user={group.user} size="sm" />
            <span className="text-sm font-medium">{group.user?.name ?? "Unassigned"}</span>
            <span className="text-xs text-muted-foreground">{group.issues.length}</span>
          </div>
          <IndependentSortableList issues={group.issues} onOpen={onOpen} onReorder={onReorder} />
        </div>
      ))}
    </div>
  )
}

/** Owns its own DnD context so grouped sections can reorder independently without dragging across groups or sections. */
function IndependentSortableList({
  issues,
  onOpen,
  onReorder,
}: {
  issues: Issue[]
  onOpen: (key: string) => void
  onReorder: (orderedIds: string[]) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = issues.findIndex((i) => i.id === active.id)
    const newIndex = issues.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(issues, oldIndex, newIndex)
    onReorder(reordered.map((i) => i.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col rounded-md border">
          {issues.map((issue) => (
            <BacklogRow key={issue.id} issue={issue} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
