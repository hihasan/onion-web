import type { Sprint } from "@/types"

export const sprints: Sprint[] = [
  {
    id: "sprint-oni-1",
    projectId: "proj-oni",
    name: "ONI Sprint 12",
    goal: "Ship the drag-and-drop board and issue detail panel.",
    startDate: "2026-08-25",
    endDate: "2026-09-08",
    state: "active",
  },
  {
    id: "sprint-oni-0",
    projectId: "proj-oni",
    name: "ONI Sprint 11",
    goal: "Backlog grooming and project dashboard.",
    startDate: "2026-08-11",
    endDate: "2026-08-24",
    state: "completed",
  },
  {
    id: "sprint-web-1",
    projectId: "proj-web",
    name: "WEB Sprint 4",
    goal: "Relaunch pricing page.",
    startDate: "2026-08-25",
    endDate: "2026-09-08",
    state: "active",
  },
  {
    id: "sprint-mob-1",
    projectId: "proj-mob",
    name: "MOB Sprint 2",
    goal: "Offline triage mode.",
    startDate: "2026-08-25",
    endDate: "2026-09-08",
    state: "active",
  },
]

export function getSprintsByProject(projectId: string): Sprint[] {
  return sprints.filter((s) => s.projectId === projectId)
}

export function getActiveSprint(projectId: string): Sprint | undefined {
  return sprints.find((s) => s.projectId === projectId && s.state === "active")
}
