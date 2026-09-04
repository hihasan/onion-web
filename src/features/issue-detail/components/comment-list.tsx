import { useState } from "react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAddComment, useComments } from "@/features/issue-detail/hooks/useComments"
import { useCurrentUser } from "@/hooks/useUsers"
import { getUserById } from "@/mocks/users"

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function CommentList({ issueId }: { issueId: string }) {
  const { data: comments, isLoading } = useComments(issueId)
  const { data: currentUser } = useCurrentUser()
  const addComment = useAddComment(issueId)
  const [draft, setDraft] = useState("")

  function handleSubmit() {
    if (!draft.trim() || !currentUser) return
    addComment.mutate(
      { authorId: currentUser.id, body: draft.trim() },
      { onSuccess: () => setDraft("") }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Comments</h3>

      <div className="flex gap-2">
        <UserAvatar user={currentUser} size="sm" />
        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            placeholder="Add a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            className="self-end"
            disabled={!draft.trim() || addComment.isPending}
            onClick={handleSubmit}
          >
            Comment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments?.map((comment) => {
            const author = getUserById(comment.authorId)
            return (
              <li key={comment.id} className="flex gap-2">
                <UserAvatar user={author} size="sm" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{author?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.body}</p>
                </div>
              </li>
            )
          })}
          {comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : null}
        </ul>
      )}
    </div>
  )
}
