// In-memory "database" for the mock data layer. Modules under src/services/
// read and write through here instead of touching src/mocks/ arrays directly,
// so mutations (status changes, new comments, reordering) persist for the
// lifetime of the tab without a backend.
//
// This is the seam that gets replaced by real HTTP calls later — every
// function in src/services/ keeps the same signature either way.

import { comments as seedComments } from "@/mocks/comments"
import { issues as seedIssues } from "@/mocks/issues"
import type { Comment, Issue } from "@/types"

let issues: Issue[] = seedIssues.map((i) => ({ ...i }))
let comments: Comment[] = seedComments.map((c) => ({ ...c }))

export const db = {
  issues: {
    all: () => issues,
    set: (next: Issue[]) => {
      issues = next
    },
  },
  comments: {
    all: () => comments,
    set: (next: Comment[]) => {
      comments = next
    },
  },
}

/** Simulates network latency so loading states are exercised like a real API. */
export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
