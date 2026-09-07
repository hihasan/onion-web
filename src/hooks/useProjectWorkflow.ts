import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { deleteSprint, getCurrentSprint, getSprints, getStatuses, updateSprint } from "@/services/projectService"
import type { Sprint } from "@/types"

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

function invalidateSprintQueries(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all(projectId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.sprints.active(projectId) })
}

export function useUpdateSprint(projectId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Sprint, "id" | "projectId">> }) =>
      updateSprint(id, patch),
    onSuccess: () => {
      if (projectId) invalidateSprintQueries(queryClient, projectId)
    },
  })
}

export function useDeleteSprint(projectId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId),
    onSuccess: () => {
      if (!projectId) return
      invalidateSprintQueries(queryClient, projectId)
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.backlog(projectId) })
      queryClient.invalidateQueries({ queryKey: ["issues", "board", projectId] })
    },
  })
}
