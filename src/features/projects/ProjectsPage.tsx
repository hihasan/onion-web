import { useQuery } from "@tanstack/react-query"

import { ProjectCard } from "@/features/projects/components/project-card"
import { useProjects } from "@/hooks/useProjects"
import { getIssues } from "@/services/issueService"

export function ProjectsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => getIssues({}),
  })

  const isLoading = projectsLoading || issuesLoading

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your projects</h1>
        <p className="text-sm text-muted-foreground">Pick a project to open its board.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              issues={issues?.filter((i) => i.projectId === project.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  )
}
