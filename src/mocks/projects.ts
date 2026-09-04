import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "proj-oni",
    key: "ONI",
    name: "Onion Platform",
    description:
      "Core product: the layered project-management app itself — boards, backlog, and issue workflows.",
    leadId: "user-1",
    avatarColor: "bg-violet-600",
  },
  {
    id: "proj-web",
    key: "WEB",
    name: "Marketing Site",
    description: "Public marketing site, pricing pages, and blog.",
    leadId: "user-4",
    avatarColor: "bg-emerald-600",
  },
  {
    id: "proj-mob",
    key: "MOB",
    name: "Mobile App",
    description: "iOS and Android companion app for on-the-go triage.",
    leadId: "user-3",
    avatarColor: "bg-amber-600",
  },
]

export function getProjectById(id: string | undefined): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}
