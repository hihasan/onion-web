import { PROJECT_AVATAR_COLORS } from "@/mocks/projects"
import { getActiveSprint, getSprintsByProject } from "@/mocks/sprints"
import { statusesForProject } from "@/mocks/statuses"
import type { Project, Sprint, Status } from "@/types"

import { db, delay } from "./db"

export function getProjects(): Promise<Project[]> {
  return delay(db.projects.all())
}

export function getProjectById(id: string): Promise<Project | undefined> {
  return delay(db.projects.all().find((p) => p.id === id))
}

export interface CreateProjectInput {
  name: string
  key: string
  description: string
  leadId: string
  category: string
}

export function createProject(input: CreateProjectInput): Promise<Project> {
  const allProjects = db.projects.all()
  const project: Project = {
    id: `proj-${crypto.randomUUID()}`,
    avatarColor: PROJECT_AVATAR_COLORS[allProjects.length % PROJECT_AVATAR_COLORS.length],
    ...input,
  }
  db.projects.set([...allProjects, project])
  db.statuses.set([...db.statuses.all(), ...statusesForProject(project.id, project.key.toLowerCase())])
  return delay(project)
}

export function getStatuses(projectId: string): Promise<Status[]> {
  const result = db.statuses
    .all()
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => a.order - b.order)
  return delay(result)
}

export function getSprints(projectId: string): Promise<Sprint[]> {
  return delay(getSprintsByProject(projectId))
}

export function getCurrentSprint(projectId: string): Promise<Sprint | undefined> {
  return delay(getActiveSprint(projectId))
}
