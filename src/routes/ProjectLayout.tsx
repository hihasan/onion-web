import { NavLink, Navigate, Outlet, useParams } from "react-router-dom"

import { useProject } from "@/hooks/useProjects"
import { cn } from "cn"

const tabs = [
  { to: "board", label: "Board" },
  { to: "backlog", label: "Backlog" },
]

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading } = useProject(projectId)

  if (!isLoading && !project) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">{project?.name ?? "Loading…"}</h1>
          {project ? <p className="text-sm text-muted-foreground">{project.description}</p> : null}
        </div>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
