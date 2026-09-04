// Central registry of TanStack Query keys, so cache invalidation after a
// mutation doesn't rely on hand-typed arrays scattered across hooks.
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  users: {
    all: ["users"] as const,
    current: ["users", "current"] as const,
  },
  statuses: (projectId: string) => ["statuses", projectId] as const,
  sprints: {
    all: (projectId: string) => ["sprints", projectId] as const,
    active: (projectId: string) => ["sprints", projectId, "active"] as const,
  },
  issues: {
    board: (projectId: string, sprintId?: string) =>
      ["issues", "board", projectId, sprintId] as const,
    backlog: (projectId: string) => ["issues", "backlog", projectId] as const,
    detail: (id: string) => ["issues", "detail", id] as const,
  },
  comments: (issueId: string) => ["comments", issueId] as const,
}
