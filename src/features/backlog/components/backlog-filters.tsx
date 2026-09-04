import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStatuses } from "@/hooks/useProjectWorkflow"
import { useUsers } from "@/hooks/useUsers"
import type { Priority } from "@/types"

export interface BacklogFilterState {
  statusId: string
  assigneeId: string
  priority: string
}

export const ALL = "all"
export const UNASSIGNED = "unassigned"

const PRIORITIES: Priority[] = ["highest", "high", "medium", "low", "lowest"]

export const EMPTY_FILTERS: BacklogFilterState = {
  statusId: ALL,
  assigneeId: ALL,
  priority: ALL,
}

export function BacklogFilters({
  projectId,
  filters,
  onChange,
}: {
  projectId: string
  filters: BacklogFilterState
  onChange: (filters: BacklogFilterState) => void
}) {
  const { data: statuses } = useStatuses(projectId)
  const { data: users } = useUsers()

  const hasActiveFilters =
    filters.statusId !== ALL || filters.assigneeId !== ALL || filters.priority !== ALL

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.statusId}
        onValueChange={(statusId) => onChange({ ...filters, statusId })}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {statuses?.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assigneeId}
        onValueChange={(assigneeId) => onChange({ ...filters, assigneeId })}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All assignees</SelectItem>
          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
          {users?.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(priority) => onChange({ ...filters, priority })}
      >
        <SelectTrigger size="sm" className="w-32 capitalize">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority} className="capitalize">
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X /> Clear
        </Button>
      ) : null}
    </div>
  )
}
