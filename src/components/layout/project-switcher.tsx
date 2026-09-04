import { ChevronsUpDown } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProjects } from "@/hooks/useProjects"
import { cn } from "cn"

export function ProjectSwitcher() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { data: projects } = useProjects()
  const current = projects?.find((p) => p.id === projectId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none">
        {current ? (
          <>
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white",
                current.avatarColor
              )}
            >
              {current.key[0]}
            </span>
            <span className="max-w-[10rem] truncate">{current.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select a project</span>
        )}
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects?.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => navigate(`/projects/${project.id}/board`)}
            className="gap-2"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white",
                project.avatarColor
              )}
            >
              {project.key[0]}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate">{project.name}</span>
              <span className="text-xs text-muted-foreground">{project.key}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
