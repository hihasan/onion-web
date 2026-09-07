import {
  Eye,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Share2,
  Sparkles,
  SquareArrowOutUpRight,
  X,
} from "lucide-react"

import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollapsibleSection } from "@/features/issue-detail/components/collapsible-section"
import { CommentList } from "@/features/issue-detail/components/comment-list"
import { IssueDescriptionEditor } from "@/features/issue-detail/components/issue-description-editor"
import { IssueDetailsFields } from "@/features/issue-detail/components/issue-details-fields"
import { useIssueByKey, useUpdateIssue } from "@/features/issue-detail/hooks/useIssue"
import { useStatuses } from "@/hooks/useProjectWorkflow"
import { formatRelativeTime } from "@/lib/formatRelativeTime"

/**
 * Non-modal issue detail panel that docks to the right of the backlog list,
 * mirroring Jira's split-view work item panel rather than a centered dialog.
 */
export function IssueDetailPanel({
  issueKey,
  onClose,
}: {
  issueKey: string | null
  onClose: () => void
}) {
  const { data: issue, isLoading } = useIssueByKey(issueKey)
  const { data: statuses } = useStatuses(issue?.projectId)
  const updateIssue = useUpdateIssue()

  if (!issueKey) return null

  return (
    <div className="flex h-full w-full max-w-md shrink-0 flex-col border-l bg-background">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">Work item</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Open in new tab"
            onClick={() => {
              if (!issue) return
              window.open(
                `/projects/${issue.projectId}/issues/${issue.key}`,
                "_blank",
                "noopener,noreferrer"
              )
            }}
          >
            <SquareArrowOutUpRight className="size-4" />
            <span className="sr-only">Open in new tab</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {isLoading || !issue ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
                Add epic
              </button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" className="rounded-md">
                  <Lock className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-md px-2 text-xs">
                  <Eye className="size-3.5" />1
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Share2 className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </div>

            <div className="-mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <IssueTypeIcon type={issue.type} />
              {issue.key}
            </div>

            <h2 className="-mt-2 text-xl font-semibold">{issue.title}</h2>

            <div className="flex items-center gap-2">
              <Select
                value={issue.statusId}
                onValueChange={(statusId) => updateIssue.mutate({ id: issue.id, patch: { statusId } })}
              >
                <SelectTrigger className="h-8 rounded-md text-sm font-medium">
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
              <Button variant="outline" size="icon-sm" className="rounded-md">
                <Sparkles className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon-sm" className="rounded-md">
                <MoreHorizontal className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" className="rounded-md">
                <Plus className="size-4" />
              </Button>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Description</h3>
              <IssueDescriptionEditor issue={issue} />
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Subtasks</h3>
              <p className="text-sm text-muted-foreground">Add subtask</p>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Linked work items</h3>
              <p className="text-sm text-muted-foreground">Add linked work item</p>
            </div>

            <CollapsibleSection
              title="Details"
              defaultOpen
              headerRight={<Settings className="size-4 text-muted-foreground" />}
            >
              <IssueDetailsFields issue={issue} />
            </CollapsibleSection>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>Created {formatRelativeTime(issue.createdAt)}</span>
              <span>Updated {formatRelativeTime(issue.updatedAt)}</span>
            </div>

            <CommentList issueId={issue.id} />
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
