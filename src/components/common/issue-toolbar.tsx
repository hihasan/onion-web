import { BarChart2, MoreHorizontal, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react"
import { useRef } from "react"

import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssigneeFilter } from "@/components/common/assignee-filter"
import { FilterDropdown } from "@/components/common/filter-dropdown"
import type { QuickFilterKey } from "@/hooks/useIssueFilters"
import type { Issue, IssueType, User } from "@/types"
import { cn } from "cn"

export type IssueGroupBy = "none" | "assignee"

const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: "epic", label: "Epic" },
  { value: "story", label: "Story" },
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
]

const QUICK_FILTERS: { value: QuickFilterKey; label: string }[] = [
  { value: "myIssues", label: "Only My Issues" },
  { value: "recentlyUpdated", label: "Recently Updated" },
]

export function IssueToolbar({
  search,
  onSearchChange,
  users,
  assigneeIds,
  onToggleAssignee,
  types,
  onToggleType,
  labels,
  availableLabels,
  onToggleLabel,
  quickFilters,
  onToggleQuickFilter,
  epics,
  groupBy,
  onGroupByChange,
  onRefresh,
  isRefreshing,
}: {
  search: string
  onSearchChange: (value: string) => void
  users: User[]
  assigneeIds: Set<string>
  onToggleAssignee: (id: string) => void
  types: Set<IssueType>
  onToggleType: (type: IssueType) => void
  labels: Set<string>
  availableLabels: string[]
  onToggleLabel: (label: string) => void
  quickFilters: Set<QuickFilterKey>
  onToggleQuickFilter: (key: QuickFilterKey) => void
  epics: Issue[]
  groupBy: IssueGroupBy
  onGroupByChange: (value: IssueGroupBy) => void
  onRefresh: () => void
  isRefreshing: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = search.length > 0

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b px-4 py-3">
      <div className="relative w-full max-w-56 shrink-0">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors",
            hasValue ? "text-foreground" : "text-muted-foreground"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search board"
          aria-label="Search board"
          className="h-9 w-full rounded-full border bg-transparent pr-9 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {hasValue ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange("")
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <AssigneeFilter users={users} selected={assigneeIds} onToggle={onToggleAssignee} />

      <FilterDropdown label="Version" readOnly options={[]} emptyText="No versions available" />

      <FilterDropdown
        label="Epic"
        readOnly
        options={epics.map((epic) => ({ value: epic.id, label: epic.title }))}
        emptyText="No epics in this sprint"
      />

      <FilterDropdown
        label="Type"
        options={ISSUE_TYPES.map((t) => ({
          value: t.value,
          label: t.label,
          icon: <IssueTypeIcon type={t.value} />,
        }))}
        selected={types}
        onToggle={onToggleType}
      />

      <FilterDropdown
        label="Label"
        options={availableLabels.map((l) => ({ value: l, label: l }))}
        selected={labels}
        onToggle={onToggleLabel}
        emptyText="No labels in this sprint"
      />

      <FilterDropdown
        label="Quick filters"
        options={QUICK_FILTERS}
        selected={quickFilters}
        onToggle={onToggleQuickFilter}
      />

      <Button className="ml-auto shrink-0 rounded-full">Complete sprint</Button>

      <Button
        variant="outline"
        size="icon-sm"
        className="shrink-0 rounded-full"
        aria-label="Refresh board"
        onClick={onRefresh}
      >
        <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
      </Button>

      <Select value={groupBy} onValueChange={(v) => onGroupByChange(v as IssueGroupBy)}>
        <SelectTrigger className="shrink-0" aria-label="Group by">
          <span className="text-muted-foreground">Group</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="assignee">Assignee</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Insights">
        <BarChart2 className="size-4" />
      </Button>

      <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Board settings">
        <SlidersHorizontal className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="More options">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Board settings</DropdownMenuItem>
          <DropdownMenuItem>Export board</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
