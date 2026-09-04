import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

/**
 * Drives the issue detail panel from a `?issue=KEY` search param so it's
 * shareable/bookmarkable and survives a refresh, without needing a
 * dedicated nested route per issue.
 */
export function useIssueDetailRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const openIssueKey = searchParams.get("issue")

  const openIssue = useCallback(
    (key: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("issue", key)
        return next
      })
    },
    [setSearchParams]
  )

  const closeIssue = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("issue")
      return next
    })
  }, [setSearchParams])

  return { openIssueKey, openIssue, closeIssue }
}
