import { ChevronRight, MoreHorizontal, Pencil, Plus, Rows3, Settings, Sparkles, Zap } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

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
import { DETAILS_FIELD_SUMMARY, IssueDetailsFields } from "@/features/issue-detail/components/issue-details-fields"
import { useIssueByKey, useUpdateIssue } from "@/features/issue-detail/hooks/useIssue"
import { useProject } from "@/hooks/useProjects"
import { useStatuses } from "@/hooks/useProjectWorkflow"
import { cn } from "cn"
import { formatRelativeTime } from "@/lib/formatRelativeTime"

const ACTIVITY_TABS = [
  { value: "all", label: "All" },
  { value: "comments", label: "Comments" },
  { value: "history", label: "History" },
  { value: "worklog", label: "Work log" },
] as const

type ActivityTab = (typeof ACTIVITY_TABS)[number]["value"]

/** Full-page issue view, opened in a new tab from the docked panel — mirrors Jira's standalone work item page. */
export function IssueDetailPage() {
  const { projectId, issueKey } = useParams<{ projectId: string; issueKey: string }>()
  const { data: issue, isLoading } = useIssueByKey(issueKey ?? null)
  const { data: project } = useProject(projectId)
  const { data: statuses } = useStatuses(issue?.projectId)
  const updateIssue = useUpdateIssue()
  const [activityTab, setActivityTab] = useState<ActivityTab>("comments")

  if (!isLoading && !issue) {
    return <Navigate to={projectId ? `/projects/${projectId}/backlog` : "/"} replace />
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            Projects
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to={`/projects/${projectId}/backlog`} className="hover:text-foreground hover:underline">
            {project?.name ?? "…"}
          </Link>
          <ChevronRight className="size-3.5" />
          <button type="button" className="flex items-center gap-1 hover:text-foreground">
            <Pencil className="size-3.5" />
            Add epic
          </button>
          {issue ? (
            <>
              <ChevronRight className="size-3.5" />
              <span className="flex items-center gap-1 text-foreground">
                <IssueTypeIcon type={issue.type} />
                {issue.key}
              </span>
            </>
          ) : null}
        </div>

        {isLoading || !issue ? (
          <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <h1 className="text-2xl font-semibold">{issue.title}</h1>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon-sm" className="rounded-md">
                  <Plus className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="rounded-md">
                  <MoreHorizontal className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="rounded-md">
                  <Rows3 className="size-4" />
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

              <div>
                <h3 className="mb-3 text-sm font-semibold">Activity</h3>
                <div className="mb-4 flex items-center gap-4 border-b">
                  {ACTIVITY_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActivityTab(tab.value)}
                      className={cn(
                        "-mb-px border-b-2 px-1 py-2 text-sm font-medium transition-colors",
                        activityTab === tab.value
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activityTab === "comments" || activityTab === "all" ? (
                  <CommentList issueId={issue.id} />
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-80 md:shrink-0">
              <div className="flex items-center gap-2">
                <Select
                  value={issue.statusId}
                  onValueChange={(statusId) => updateIssue.mutate({ id: issue.id, patch: { statusId } })}
                >
                  <SelectTrigger className="rounded-md text-sm font-medium">
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
                <Button variant="outline" size="icon" className="rounded-md">
                  <Sparkles className="size-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-md whitespace-nowrap">
                  <Sparkles className="size-3.5" />
                  Improve Task
                </Button>
              </div>

              <CollapsibleSection title="Details" collapsedHint={DETAILS_FIELD_SUMMARY}>
                <IssueDetailsFields issue={issue} />
              </CollapsibleSection>

              <CollapsibleSection title="Development">
                <p className="text-sm text-muted-foreground">No development information.</p>
              </CollapsibleSection>

              <CollapsibleSection
                title="Automation"
                collapsedHint={
                  <span className="inline-flex items-center gap-1">
                    <Zap className="size-3.5" />
                    Rule executions
                  </span>
                }
              >
                <p className="text-sm text-muted-foreground">No automation rules have run.</p>
              </CollapsibleSection>

              <div className="flex items-start justify-between px-1">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>Created {formatRelativeTime(issue.createdAt)}</span>
                  <span>Updated {formatRelativeTime(issue.updatedAt)}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-1.5 text-xs text-muted-foreground">
                  <Settings className="size-3.5" />
                  Configure
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
