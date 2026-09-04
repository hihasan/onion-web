import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { addComment, getCommentsByIssue } from "@/services/commentService"

export function useComments(issueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments(issueId ?? ""),
    queryFn: () => getCommentsByIssue(issueId as string),
    enabled: Boolean(issueId),
  })
}

export function useAddComment(issueId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorId, body }: { authorId: string; body: string }) =>
      addComment(issueId as string, authorId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(issueId ?? "") })
    },
  })
}
