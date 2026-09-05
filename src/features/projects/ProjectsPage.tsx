import { ArrowRight, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog"
import { ProjectSearch } from "@/features/projects/components/project-search"
import { useProjects } from "@/hooks/useProjects"
import { getUserById } from "@/mocks/users"
import { cn } from "cn"

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) || project.key.toLowerCase().includes(query)
    )
  }, [projects, search])

  return (
    <div className="w-full flex-1 px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">Your Projects</h1>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-full bg-black px-6 text-white hover:bg-neutral-800"
        >
          Create Project
          <ArrowRight className="text-white" />
        </Button>
      </div>

      <ProjectSearch value={search} onChange={setSearch} />

      <div className="mt-4 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="h-8 animate-pulse rounded bg-muted/40" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center whitespace-normal text-muted-foreground">
                  No projects match your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const lead = getUserById(project.leadId)
                return (
                  <TableRow
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}/board`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white",
                            project.avatarColor
                          )}
                        >
                          {project.key[0]}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-heading truncate font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">{project.key}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={lead} size="sm" />
                        <span className="text-sm">{lead?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
