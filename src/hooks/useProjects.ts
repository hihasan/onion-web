import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { getProjectById, getProjects } from "@/services/projectService"

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
  })
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ""),
    queryFn: () => getProjectById(projectId as string),
    enabled: Boolean(projectId),
  })
}
