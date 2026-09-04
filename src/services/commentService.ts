import type { Comment } from "@/types"

import { db, delay } from "./db"

export function getCommentsByIssue(issueId: string): Promise<Comment[]> {
  const result = db.comments
    .all()
    .filter((c) => c.issueId === issueId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return delay(result)
}

export function addComment(issueId: string, authorId: string, body: string): Promise<Comment> {
  const comment: Comment = {
    id: `cmt-${crypto.randomUUID()}`,
    issueId,
    authorId,
    body,
    createdAt: new Date().toISOString(),
  }
  db.comments.set([...db.comments.all(), comment])
  return delay(comment)
}
