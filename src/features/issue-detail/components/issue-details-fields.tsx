import { UserAvatar } from "@/components/common/user-avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateIssue } from "@/features/issue-detail/hooks/useIssue"
import { useSprints } from "@/hooks/useProjectWorkflow"
import { useCurrentUser, useUsers } from "@/hooks/useUsers"
import type { Issue } from "@/types"

const UNASSIGNED = "unassigned"

export const DETAILS_FIELD_SUMMARY =
  "Assignee, Parent, Due date, Labels, Team, Start date, Sprint, Story point estimate, Reporter"

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function FieldPlaceholder({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-muted-foreground">{children}</span>
}

/** The Assignee/Parent/.../Reporter field list shared by the docked panel and the full issue page. */
export function IssueDetailsFields({ issue }: { issue: Issue }) {
  const { data: sprints } = useSprints(issue.projectId)
  const { data: users } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const updateIssue = useUpdateIssue()

  const assignee = users?.find((u) => u.id === issue.assigneeId) ?? null
  const reporter = users?.find((u) => u.id === issue.reporterId) ?? null
  const sprint = sprints?.find((s) => s.id === issue.sprintId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <DetailField label="Assignee">
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
        {!assignee && currentUser ? (
          <button
            type="button"
            onClick={() => updateIssue.mutate({ id: issue.id, patch: { assigneeId: currentUser.id } })}
            className="self-start text-xs text-primary hover:underline"
          >
            Assign to me
          </button>
        ) : null}
      </DetailField>

      <DetailField label="Parent">
        <FieldPlaceholder>Add parent</FieldPlaceholder>
      </DetailField>

      <DetailField label="Due date">
        <FieldPlaceholder>Add due date</FieldPlaceholder>
      </DetailField>

      <DetailField label="Labels">
        {issue.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <span key={label} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <FieldPlaceholder>Add labels</FieldPlaceholder>
        )}
      </DetailField>

      <DetailField label="Team">
        <FieldPlaceholder>Add team</FieldPlaceholder>
      </DetailField>

      <DetailField label="Start date">
        <FieldPlaceholder>Add date</FieldPlaceholder>
      </DetailField>

      <DetailField label="Sprint">
        {sprint ? (
          <span className="text-sm text-primary">{sprint.name}</span>
        ) : (
          <FieldPlaceholder>None</FieldPlaceholder>
        )}
      </DetailField>

      <DetailField label="Story point estimate">
        {issue.storyPoints != null ? (
          <span className="text-sm">{issue.storyPoints}</span>
        ) : (
          <FieldPlaceholder>Add story points</FieldPlaceholder>
        )}
      </DetailField>

      <DetailField label="Reporter">
        <div className="flex items-center gap-2">
          <UserAvatar user={reporter} size="sm" />
          <span className="text-sm">{reporter?.name ?? "Unknown"}</span>
        </div>
      </DetailField>
    </div>
  )
}
