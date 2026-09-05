// In-memory "database" for the mock data layer. Modules under src/services/
// read and write through here instead of touching src/mocks/ arrays directly,
// so mutations (status changes, new comments, reordering, new projects) persist
// for the lifetime of the tab without a backend.
//
// This is the seam that gets replaced by real HTTP calls later — every
// function in src/services/ keeps the same signature either way.

import { comments as seedComments } from "@/mocks/comments"
import { issues as seedIssues } from "@/mocks/issues"
import { projects as seedProjects } from "@/mocks/projects"
import { statuses as seedStatuses } from "@/mocks/statuses"
import type { Comment, Issue, Project, Status } from "@/types"

let issues: Issue[] = seedIssues.map((i) => ({ ...i }))
let comments: Comment[] = seedComments.map((c) => ({ ...c }))
let projects: Project[] = seedProjects.map((p) => ({ ...p }))
let statuses: Status[] = seedStatuses.map((s) => ({ ...s }))

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
  projects: {
    all: () => projects,
    set: (next: Project[]) => {
      projects = next
    },
  },
  statuses: {
    all: () => statuses,
    set: (next: Status[]) => {
      statuses = next
    },
  },
}

/** Simulates network latency so loading states are exercised like a real API. */
export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
