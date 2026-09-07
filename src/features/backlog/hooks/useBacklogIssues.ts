import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { createIssue, getBacklogIssues, moveIssueToSprint, reorderIssues } from "@/services/issueService"
import type { Issue, IssueType } from "@/types"

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

export function useReorderSprint(projectId: string | undefined, sprintId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.issues.board(projectId ?? "", sprintId)

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

/** Moves an issue between the backlog and the active sprint — what dragging a card across the two sections calls on drop. */
export function useMoveIssueSprint(projectId: string | undefined, sprintId: string | undefined) {
  const queryClient = useQueryClient()
  const boardKey = queryKeys.issues.board(projectId ?? "", sprintId)
  const backlogKey = queryKeys.issues.backlog(projectId ?? "")

  return useMutation({
    mutationFn: ({
      issueId,
      targetSprintId,
      order,
    }: {
      issueId: string
      targetSprintId: string | null
      order: number
    }) => moveIssueToSprint(issueId, targetSprintId, order),
    onMutate: async ({ issueId, targetSprintId, order }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      await queryClient.cancelQueries({ queryKey: backlogKey })

      const previousBoard = queryClient.getQueryData<Issue[]>(boardKey)
      const previousBacklog = queryClient.getQueryData<Issue[]>(backlogKey)
      const moving =
        previousBoard?.find((i) => i.id === issueId) ?? previousBacklog?.find((i) => i.id === issueId)

      if (moving) {
        const updated: Issue = { ...moving, sprintId: targetSprintId, order }
        queryClient.setQueryData<Issue[]>(boardKey, (old) => {
          const rest = (old ?? []).filter((i) => i.id !== issueId)
          return targetSprintId ? [...rest, updated] : rest
        })
        queryClient.setQueryData<Issue[]>(backlogKey, (old) => {
          const rest = (old ?? []).filter((i) => i.id !== issueId)
          return targetSprintId === null ? [...rest, updated] : rest
        })
      }

      return { previousBoard, previousBacklog }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBoard) queryClient.setQueryData(boardKey, context.previousBoard)
      if (context?.previousBacklog) queryClient.setQueryData(backlogKey, context.previousBacklog)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey })
      queryClient.invalidateQueries({ queryKey: backlogKey })
    },
  })
}

/** Creates an issue from the inline "+ Create" row, into either the given sprint or the backlog. */
export function useCreateIssue(projectId: string | undefined, sprintId: string | undefined) {
  const queryClient = useQueryClient()
  const boardKey = queryKeys.issues.board(projectId ?? "", sprintId)
  const backlogKey = queryKeys.issues.backlog(projectId ?? "")

  return useMutation({
    mutationFn: (input: {
      projectKey: string
      title: string
      type: IssueType
      statusId: string
      reporterId: string
      targetSprintId: string | null
    }) =>
      createIssue({
        projectId: projectId as string,
        projectKey: input.projectKey,
        title: input.title,
        type: input.type,
        statusId: input.statusId,
        reporterId: input.reporterId,
        sprintId: input.targetSprintId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey })
      queryClient.invalidateQueries({ queryKey: backlogKey })
    },
  })
}
