import type { Status } from "@/types"

// Every project shares the same four-column workflow for simplicity, but
// each has its own Status rows (mirrors how a real workflow-per-project
// scheme would be modeled) so per-project customization is a non-issue later.
export function statusesForProject(projectId: string, prefix: string): Status[] {
  return [
    { id: `${prefix}-todo`, projectId, name: "To Do", category: "todo", order: 0 },
    {
      id: `${prefix}-in-progress`,
      projectId,
      name: "In Progress",
      category: "in_progress",
      order: 1,
    },
    {
      id: `${prefix}-in-review`,
      projectId,
      name: "In Review",
      category: "in_progress",
      order: 2,
    },
    { id: `${prefix}-done`, projectId, name: "Done", category: "done", order: 3 },
  ]
}

export const statuses: Status[] = [
  ...statusesForProject("proj-oni", "oni"),
  ...statusesForProject("proj-web", "web"),
  ...statusesForProject("proj-mob", "mob"),
]

export function getStatusesByProject(projectId: string): Status[] {
  return statuses
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => a.order - b.order)
}

export function getStatusById(id: string | undefined): Status | undefined {
  if (!id) return undefined
  return statuses.find((s) => s.id === id)
}
