import { useCallback, useMemo, useState } from "react"

import type { Issue, IssueType } from "@/types"

export type QuickFilterKey = "myIssues" | "recentlyUpdated"

const RECENTLY_UPDATED_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

/**
 * Holds the shared filter/search state for a toolbar and applies it to
 * issue lists. `issuesForLabels` only feeds the "available labels" list and
 * the convenience `filteredIssues` result — callers juggling more than one
 * list (e.g. a sprint section plus a backlog section) should call
 * `filterIssues` directly against each list instead.
 */
export function useIssueFilters(issuesForLabels: Issue[] | undefined, currentUserId: string | undefined) {
  const [search, setSearch] = useState("")
  const [assigneeIds, setAssigneeIds] = useState<Set<string>>(new Set())
  const [types, setTypes] = useState<Set<IssueType>>(new Set())
  const [labels, setLabels] = useState<Set<string>>(new Set())
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilterKey>>(new Set())

  const toggleAssignee = (id: string) => setAssigneeIds((prev) => toggleInSet(prev, id))
  const toggleType = (type: IssueType) => setTypes((prev) => toggleInSet(prev, type))
  const toggleLabel = (label: string) => setLabels((prev) => toggleInSet(prev, label))
  const toggleQuickFilter = (key: QuickFilterKey) => setQuickFilters((prev) => toggleInSet(prev, key))

  const availableLabels = useMemo(
    () => Array.from(new Set((issuesForLabels ?? []).flatMap((issue) => issue.labels))).sort(),
    [issuesForLabels]
  )

  const filterIssues = useCallback(
    (issues: Issue[]) => {
      const query = search.trim().toLowerCase()
      const recentCutoff = Date.now() - RECENTLY_UPDATED_WINDOW_MS

      return issues.filter((issue) => {
        if (query && !issue.title.toLowerCase().includes(query)) return false
        if (assigneeIds.size > 0 && !assigneeIds.has(issue.assigneeId ?? "unassigned")) return false
        if (types.size > 0 && !types.has(issue.type)) return false
        if (labels.size > 0 && !issue.labels.some((l) => labels.has(l))) return false
        if (quickFilters.has("myIssues") && issue.assigneeId !== currentUserId) return false
        if (quickFilters.has("recentlyUpdated") && new Date(issue.updatedAt).getTime() < recentCutoff)
          return false
        return true
      })
    },
    [search, assigneeIds, types, labels, quickFilters, currentUserId]
  )

  const filteredIssues = useMemo(
    () => filterIssues(issuesForLabels ?? []),
    [filterIssues, issuesForLabels]
  )

  return {
    search,
    setSearch,
    assigneeIds,
    toggleAssignee,
    types,
    toggleType,
    labels,
    toggleLabel,
    availableLabels,
    quickFilters,
    toggleQuickFilter,
    filterIssues,
    filteredIssues,
  }
}
