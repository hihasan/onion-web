import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getIssueByKey, updateIssue } from "@/services/issueService"
import type { Issue } from "@/types"

export function useIssueByKey(key: string | null) {
  return useQuery({
    queryKey: ["issues", "byKey", key ?? ""],
    queryFn: () => getIssueByKey(key as string),
    enabled: Boolean(key),
  })
}

export function useUpdateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Issue, "id">> }) =>
      updateIssue(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] })
    },
  })
}
