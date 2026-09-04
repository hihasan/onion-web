import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { getCurrentSprint, getSprints, getStatuses } from "@/services/projectService"

export function useStatuses(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.statuses(projectId ?? ""),
    queryFn: () => getStatuses(projectId as string),
    enabled: Boolean(projectId),
    staleTime: Infinity,
  })
}

export function useSprints(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sprints.all(projectId ?? ""),
    queryFn: () => getSprints(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useActiveSprint(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sprints.active(projectId ?? ""),
    queryFn: () => getCurrentSprint(projectId as string),
    enabled: Boolean(projectId),
  })
}
