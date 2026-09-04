import { projects } from "@/mocks/projects"
import { getActiveSprint, getSprintsByProject } from "@/mocks/sprints"
import { getStatusesByProject } from "@/mocks/statuses"
import type { Project, Sprint, Status } from "@/types"

import { delay } from "./db"

export function getProjects(): Promise<Project[]> {
  return delay(projects)
}

export function getProjectById(id: string): Promise<Project | undefined> {
  return delay(projects.find((p) => p.id === id))
}

export function getStatuses(projectId: string): Promise<Status[]> {
  return delay(getStatusesByProject(projectId))
}

export function getSprints(projectId: string): Promise<Sprint[]> {
  return delay(getSprintsByProject(projectId))
}

export function getCurrentSprint(projectId: string): Promise<Sprint | undefined> {
  return delay(getActiveSprint(projectId))
}
