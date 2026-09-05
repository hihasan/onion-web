import { Bookmark, Bug, CheckSquare2, Rocket } from "lucide-react"
import { cn } from "cn"

import type { IssueType } from "@/types"

const config: Record<IssueType, { icon: typeof Bug; label: string }> = {
  epic: { icon: Rocket, label: "Epic" },
  story: { icon: Bookmark, label: "Story" },
  task: { icon: CheckSquare2, label: "Task" },
  bug: { icon: Bug, label: "Bug" },
}

export function IssueTypeIcon({ type, className }: { type: IssueType; className?: string }) {
  const { icon: Icon, label } = config[type]
  return (
    <span title={label} className="inline-flex">
      <Icon className={cn("size-4 text-foreground", className)} aria-label={label} />
    </span>
  )
}
