import type { Project } from "@/types"

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

export const projects: Project[] = [
  {
    id: "proj-oni",
    key: "ONI",
    name: "Onion Platform",
    description:
      "Core product: the layered project-management app itself — boards, backlog, and issue workflows.",
    leadId: "user-1",
    category: "Software",
    avatarColor: "bg-black",
  },
  {
    id: "proj-web",
    key: "WEB",
    name: "Marketing Site",
    description: "Public marketing site, pricing pages, and blog.",
    leadId: "user-4",
    category: "Marketing",
    avatarColor: "bg-neutral-700",
  },
  {
    id: "proj-mob",
    key: "MOB",
    name: "Mobile App",
    description: "iOS and Android companion app for on-the-go triage.",
    leadId: "user-3",
    category: "Mobile",
    avatarColor: "bg-neutral-500",
  },
]

export function getProjectById(id: string | undefined): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}
