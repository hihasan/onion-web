import type { Comment } from "@/types"

export const comments: Comment[] = [
  {
    id: "cmt-1",
    issueId: "iss-oni-3",
    authorId: "user-1",
    body: "Using @dnd-kit/sortable's collision detection for this — should handle the reordering-within-column case too.",
    createdAt: "2026-08-26T10:15:00.000Z",
  },
  {
    id: "cmt-2",
    issueId: "iss-oni-3",
    authorId: "user-2",
    body: "Nice, let's make sure the optimistic update rolls back cleanly if the mock mutation ever rejects.",
    createdAt: "2026-08-26T14:02:00.000Z",
  },
  {
    id: "cmt-3",
    issueId: "iss-oni-4",
    authorId: "user-3",
    body: "Repro confirmed. Looks like the `order` field isn't being recalculated when dropping above the first card.",
    createdAt: "2026-08-27T09:41:00.000Z",
  },
  {
    id: "cmt-4",
    issueId: "iss-oni-5",
    authorId: "user-4",
    body: "Going with a right-side sheet instead of a full page for now — faster to wire up with shadcn's Dialog.",
    createdAt: "2026-08-27T16:30:00.000Z",
  },
  {
    id: "cmt-5",
    issueId: "iss-web-3",
    authorId: "user-2",
    body: "Safari's reader mode seems to be hitting the route before the content-type header is set. Investigating.",
    createdAt: "2026-08-28T11:05:00.000Z",
  },
  {
    id: "cmt-6",
    issueId: "iss-mob-1",
    authorId: "user-3",
    body: "Scoping this down to read-only offline access first, sync-on-reconnect is a separate story (MOB-19).",
    createdAt: "2026-08-24T08:50:00.000Z",
  },
]

export function getCommentsByIssue(issueId: string): Comment[] {
  return comments
    .filter((c) => c.issueId === issueId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
