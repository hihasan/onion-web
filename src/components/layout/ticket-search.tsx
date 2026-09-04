import { Search, X } from "lucide-react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { issues } from "@/mocks/issues"
import { cn } from "cn"

export function TicketSearch() {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const hasValue = value.trim().length > 0

  function handleClear() {
    setValue("")
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const key = value.trim().toUpperCase()
    if (!key) return

    const issue = issues.find((i) => i.key === key)
    if (!issue) return

    navigate(`/projects/${issue.projectId}/board?issue=${issue.key}`)
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-sm">
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors",
          hasValue ? "text-foreground" : "text-muted-foreground"
        )}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by ticket number"
        aria-label="Search by ticket number"
        className="h-9 w-full rounded-full border bg-transparent pr-9 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      {hasValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </form>
  )
}
