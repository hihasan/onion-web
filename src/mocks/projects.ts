import type { Project, ProjectStatus } from "@/types"

/** Preset options offered in the "Create Project" dialog. */
export const PROJECT_CATEGORIES = ["Software", "Marketing", "Mobile", "Design", "Operations"] as const

export const PROJECT_AVATAR_COLORS = [
  "bg-black",
  "bg-neutral-700",
  "bg-neutral-500",
  "bg-neutral-800",
  "bg-neutral-600",
  "bg-neutral-900",
]

/** Options offered in the project detail panel's status dropdown. */
export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "start_progress", label: "Start Progress" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "paused", label: "Paused" },
]

export const projects: Project[] = [
  {
    id: "proj-oni",
    key: "ONI",
    name: "Onion Platform",
    description:
      "Core product: the layered project-management app itself — boards, backlog, and issue workflows.",
    leadId: "user-1",
    memberIds: ["user-1", "user-2", "user-3", "user-5"],
    status: "in_progress",
    category: "Software",
    avatarColor: "bg-black",
  },
  {
    id: "proj-web",
    key: "WEB",
    name: "Marketing Site",
    description: "Public marketing site, pricing pages, and blog.",
    leadId: "user-4",
    memberIds: ["user-4", "user-2"],
    status: "start_progress",
    category: "Marketing",
    avatarColor: "bg-neutral-700",
  },
  {
    id: "proj-mob",
    key: "MOB",
    name: "Mobile App",
    description: "iOS and Android companion app for on-the-go triage.",
    leadId: "user-3",
    memberIds: ["user-3", "user-1"],
    status: "paused",
    category: "Mobile",
    avatarColor: "bg-neutral-500",
  },
]

export function getProjectById(id: string | undefined): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}
