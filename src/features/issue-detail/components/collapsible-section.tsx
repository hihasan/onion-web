import { cn } from "cn"
import { ChevronRight } from "lucide-react"
import { useState, type ReactNode } from "react"

export function CollapsibleSection({
  title,
  defaultOpen = false,
  collapsedHint,
  headerRight,
  children,
}: {
  title: string
  defaultOpen?: boolean
  /** Muted hint shown next to the title only while collapsed (e.g. a field-name summary). */
  collapsedHint?: ReactNode
  /** Control pinned to the far right of the header, shown open or collapsed (e.g. a settings icon). */
  headerRight?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <ChevronRight
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        <span className="shrink-0 text-sm font-semibold">{title}</span>
        {!open && collapsedHint ? (
          <span className="truncate text-xs text-muted-foreground">{collapsedHint}</span>
        ) : null}
        {headerRight ? <span className="ml-auto flex items-center">{headerRight}</span> : null}
      </button>
      {open ? <div className="border-t px-3 py-3">{children}</div> : null}
    </div>
  )
}
