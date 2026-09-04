import { IssueTypeIcon } from "@/components/common/issue-type-icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CommentList } from "@/features/issue-detail/components/comment-list"
import { IssueSidebar } from "@/features/issue-detail/components/issue-sidebar"
import { useIssueByKey } from "@/features/issue-detail/hooks/useIssue"

export function IssueDetailDialog({
  issueKey,
  onClose,
}: {
  issueKey: string | null
  onClose: () => void
}) {
  const { data: issue, isLoading } = useIssueByKey(issueKey)

  return (
    <Dialog open={Boolean(issueKey)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        {isLoading || !issue ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogDescription className="flex items-center gap-1.5 text-xs">
                <IssueTypeIcon type={issue.type} />
                {issue.key}
              </DialogDescription>
              <DialogTitle className="text-xl">{issue.title}</DialogTitle>
            </DialogHeader>

            <div className="flex min-h-0 flex-1 gap-6">
              <ScrollArea className="min-h-0 flex-1 pr-4">
                <div className="flex flex-col gap-6 pb-2">
                  <div>
                    <h3 className="mb-1.5 text-sm font-medium">Description</h3>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {issue.description || "No description provided."}
                    </p>
                  </div>
                  <CommentList issueId={issue.id} />
                </div>
              </ScrollArea>

              <IssueSidebar issue={issue} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
