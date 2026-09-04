import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { getBacklogIssues, reorderIssues } from "@/services/issueService"
import type { Issue } from "@/types"

export function useBacklogIssues(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issues.backlog(projectId ?? ""),
    queryFn: () => getBacklogIssues(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useReorderBacklog(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.issues.backlog(projectId ?? "")

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderIssues(orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Issue[]>(queryKey)

      queryClient.setQueryData<Issue[]>(queryKey, (old) => {
        if (!old) return old
        const byId = new Map(old.map((i) => [i.id, i]))
        return orderedIds.map((id) => byId.get(id)).filter((i): i is Issue => Boolean(i))
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
