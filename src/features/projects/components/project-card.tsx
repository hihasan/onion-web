import { Link } from "react-router-dom"

import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { getUserById } from "@/mocks/users"
import type { Issue, Project } from "@/types"
import { cn } from "cn"

export function ProjectCard({ project, issues }: { project: Project; issues: Issue[] }) {
  const lead = getUserById(project.leadId)
  const doneCount = issues.filter((i) => i.statusId.endsWith("done")).length
  const total = issues.length

  return (
    <Link
      to={`/projects/${project.id}/board`}
      className="group flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
            project.avatarColor
          )}
        >
          {project.key[0]}
        </span>
        <div className="min-w-0">
          <h3 className="font-heading truncate font-semibold group-hover:text-primary">{project.name}</h3>
          <Badge variant="secondary" className="mt-0.5">
            {project.key}
          </Badge>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>

      <div className="mt-auto flex items-center justify-between pt-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserAvatar user={lead} size="sm" />
          <span>{lead?.name}</span>
        </div>
        <span className="text-muted-foreground">
          {doneCount}/{total} done
        </span>
      </div>
    </Link>
  )
}
