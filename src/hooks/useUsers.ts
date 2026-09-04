import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queryKeys"
import { getCurrentUser, getUsers } from "@/services/userService"

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getUsers,
    staleTime: Infinity,
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current,
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })
}
