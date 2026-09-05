// Domain model — mirrors the shape a real Jira-like REST API would return.
// Keeping these close to what the backend will eventually send means the
// mock service layer and the UI don't need to change when it's swapped in.

export type Priority = "lowest" | "low" | "medium" | "high" | "highest"

export type IssueType = "epic" | "story" | "task" | "bug"

export type StatusCategory = "todo" | "in_progress" | "done"

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  /** Fallback initials shown when there's no avatar image. */
  initials: string
}

export interface Project {
  id: string
  key: string // short code used in issue keys, e.g. "ONI"
  name: string
  description: string
  leadId: string
  category: string // e.g. "Software", "Marketing" — a free-form grouping label
  avatarColor: string // tailwind bg-* class for the project's avatar chip
}

export interface Status {
  id: string
  projectId: string
  name: string
  category: StatusCategory
  /** Column order on the board. */
  order: number
}

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal?: string
  startDate: string | null // ISO date
  endDate: string | null // ISO date
  state: "planned" | "active" | "completed"
}

export interface Comment {
  id: string
  issueId: string
  authorId: string
  body: string
  createdAt: string // ISO datetime
}

export interface Issue {
  id: string
  key: string // e.g. "ONI-42"
  projectId: string
  type: IssueType
  title: string
  description: string
  statusId: string
  priority: Priority
  assigneeId: string | null
  reporterId: string
  labels: string[]
  storyPoints: number | null
  /** null/undefined means the issue lives in the backlog, not a sprint. */
  sprintId: string | null
  /** Position within its status column / backlog rank, lower sorts first. */
  order: number
  createdAt: string
  updatedAt: string
}
