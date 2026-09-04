import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { getBoardIssues, updateIssueStatus } from "@/services/issueService"
import type { Issue } from "@/types"

export function useBoardIssues(projectId: string | undefined, sprintId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.issues.board(projectId ?? "", sprintId),
    queryFn: () => getBoardIssues(projectId as string, sprintId),
    enabled: Boolean(projectId) && Boolean(sprintId),
  })
}

/** Computes a fractional order that sorts an issue between its new neighbors. */
export function computeOrderBetween(prev: Issue | undefined, next: Issue | undefined): number {
  if (prev && next) return (prev.order + next.order) / 2
  if (prev) return prev.order + 1
  if (next) return next.order - 1
  return Date.now()
}

export function useMoveIssue(projectId: string | undefined, sprintId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.issues.board(projectId ?? "", sprintId)

  return useMutation({
    mutationFn: ({ issueId, statusId, order }: { issueId: string; statusId: string; order: number }) =>
      updateIssueStatus(issueId, statusId, order),
    onMutate: async ({ issueId, statusId, order }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Issue[]>(queryKey)

      queryClient.setQueryData<Issue[]>(queryKey, (old) =>
        old?.map((issue) => (issue.id === issueId ? { ...issue, statusId, order } : issue))
      )

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
