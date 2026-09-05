import { Search, X } from "lucide-react"
import { useRef } from "react"

import { cn } from "cn"

export function ProjectSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = value.length > 0

  return (
    <div className="relative w-full max-w-xs">
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
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search projects"
        aria-label="Search projects"
        className="h-9 w-full rounded-full border bg-transparent pr-9 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      {hasValue ? (
        <button
          type="button"
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
