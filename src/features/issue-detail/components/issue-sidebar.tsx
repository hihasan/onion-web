import { UserAvatar } from "@/components/common/user-avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateIssue } from "@/features/issue-detail/hooks/useIssue"
import { useStatuses } from "@/hooks/useProjectWorkflow"
import { useUsers } from "@/hooks/useUsers"
import type { Issue, Priority } from "@/types"

const PRIORITIES: Priority[] = ["highest", "high", "medium", "low", "lowest"]
const UNASSIGNED = "unassigned"

export function IssueSidebar({ issue }: { issue: Issue }) {
  const { data: statuses } = useStatuses(issue.projectId)
  const { data: users } = useUsers()
  const updateIssue = useUpdateIssue()

  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 border-l pl-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Status</span>
        <Select
          value={issue.statusId}
          onValueChange={(statusId) => updateIssue.mutate({ id: issue.id, patch: { statusId } })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses?.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Assignee</span>
        <Select
          value={issue.assigneeId ?? UNASSIGNED}
          onValueChange={(assigneeId) =>
            updateIssue.mutate({
              id: issue.id,
              patch: { assigneeId: assigneeId === UNASSIGNED ? null : assigneeId },
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>
              <UserAvatar user={null} size="sm" /> Unassigned
            </SelectItem>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <UserAvatar user={user} size="sm" /> {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Priority</span>
        <Select
          value={issue.priority}
          onValueChange={(priority: Priority) =>
            updateIssue.mutate({ id: issue.id, patch: { priority } })
          }
        >
          <SelectTrigger className="w-full capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority} className="capitalize">
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Story points</span>
        <span className="text-sm">{issue.storyPoints ?? "—"}</span>
      </div>

      {issue.labels.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Labels</span>
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <span key={label} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
