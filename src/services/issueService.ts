import type { Issue } from "@/types"

import { db, delay } from "./db"

export interface IssueFilters {
  projectId?: string
  /** Pass `null` explicitly to fetch backlog-only issues (no sprint). */
  sprintId?: string | null
  statusId?: string
  assigneeId?: string | null
  priority?: Issue["priority"]
}

function applyFilters(issues: Issue[], filters: IssueFilters = {}): Issue[] {
  return issues.filter((issue) => {
    if (filters.projectId && issue.projectId !== filters.projectId) return false
    if (filters.sprintId !== undefined && issue.sprintId !== filters.sprintId) return false
    if (filters.statusId && issue.statusId !== filters.statusId) return false
    if (filters.assigneeId !== undefined && issue.assigneeId !== filters.assigneeId) return false
    if (filters.priority && issue.priority !== filters.priority) return false
    return true
  })
}

/** Mock implementations today; every function here keeps the signature a real API client would have. */

export function getIssues(filters: IssueFilters = {}): Promise<Issue[]> {
  const result = applyFilters(db.issues.all(), filters).sort((a, b) => a.order - b.order)
  return delay(result)
}

export function getIssueById(id: string): Promise<Issue | undefined> {
  return delay(db.issues.all().find((i) => i.id === id))
}

export function getIssueByKey(key: string): Promise<Issue | undefined> {
  return delay(db.issues.all().find((i) => i.key === key))
}

/** Issues on the board for a project: the active sprint's issues, grouped by caller via statusId. */
export function getBoardIssues(projectId: string, sprintId: string | undefined): Promise<Issue[]> {
  if (!sprintId) return delay([])
  return getIssues({ projectId, sprintId })
}

/** Backlog issues: everything not assigned to a sprint. */
export function getBacklogIssues(projectId: string): Promise<Issue[]> {
  return getIssues({ projectId, sprintId: null })
}

export function updateIssue(id: string, patch: Partial<Omit<Issue, "id">>): Promise<Issue> {
  const all = db.issues.all()
  const index = all.findIndex((i) => i.id === id)
  if (index === -1) return Promise.reject(new Error(`Issue not found: ${id}`))

  const updated: Issue = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...all]
  next[index] = updated
  db.issues.set(next)
  return delay(updated)
}

/** Moves an issue to a new status/order — what the board's drag-and-drop calls on drop. */
export function updateIssueStatus(id: string, statusId: string, order: number): Promise<Issue> {
  return updateIssue(id, { statusId, order })
}

/**
 * Persists a new relative order for a set of issues (e.g. after a
 * drag-and-drop reorder within a board column or the backlog list).
 * `orderedIds` should already be in the desired top-to-bottom order.
 */
export function reorderIssues(orderedIds: string[]): Promise<Issue[]> {
  const all = db.issues.all()
  const byId = new Map(all.map((i) => [i.id, i]))
  const baseOrder = Math.min(...orderedIds.map((id) => byId.get(id)?.order ?? 0))

  const next = all.map((issue) => {
    const position = orderedIds.indexOf(issue.id)
    if (position === -1) return issue
    return { ...issue, order: baseOrder + position, updatedAt: new Date().toISOString() }
  })
  db.issues.set(next)

  const updated = orderedIds
    .map((id) => next.find((i) => i.id === id))
    .filter((i): i is Issue => Boolean(i))
  return delay(updated)
}

export function moveIssueToSprint(id: string, sprintId: string | null): Promise<Issue> {
  return updateIssue(id, { sprintId })
}
