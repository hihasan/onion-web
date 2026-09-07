import { PROJECT_AVATAR_COLORS } from "@/mocks/projects"
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
  const result = db.sprints.all().filter((s) => s.projectId === projectId)
  return delay(result)
}

export function getCurrentSprint(projectId: string): Promise<Sprint | undefined> {
  const result = db.sprints.all().find((s) => s.projectId === projectId && s.state === "active")
  return delay(result)
}

export function updateSprint(id: string, patch: Partial<Omit<Sprint, "id" | "projectId">>): Promise<Sprint> {
  const all = db.sprints.all()
  const index = all.findIndex((s) => s.id === id)
  if (index === -1) return Promise.reject(new Error(`Sprint not found: ${id}`))

  const updated: Sprint = { ...all[index], ...patch }
  const next = [...all]
  next[index] = updated
  db.sprints.set(next)
  return delay(updated)
}

/** Deletes a sprint and returns its issues to the backlog. */
export function deleteSprint(id: string): Promise<void> {
  db.sprints.set(db.sprints.all().filter((s) => s.id !== id))

  const issues = db.issues.all()
  db.issues.set(
    issues.map((issue) =>
      issue.sprintId === id
        ? { ...issue, sprintId: null, updatedAt: new Date().toISOString() }
        : issue
    )
  )

  return delay(undefined)
}
