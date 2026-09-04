import { Bookmark, Bug, CheckSquare2, Rocket } from "lucide-react"
import { cn } from "cn"

import type { IssueType } from "@/types"

const config: Record<IssueType, { icon: typeof Bug; className: string; label: string }> = {
  epic: { icon: Rocket, className: "text-purple-600", label: "Epic" },
  story: { icon: Bookmark, className: "text-emerald-600", label: "Story" },
  task: { icon: CheckSquare2, className: "text-blue-600", label: "Task" },
  bug: { icon: Bug, className: "text-red-600", label: "Bug" },
}

export function IssueTypeIcon({ type, className }: { type: IssueType; className?: string }) {
  const { icon: Icon, className: colorClass, label } = config[type]
  return (
    <span title={label} className="inline-flex">
      <Icon className={cn("size-4", colorClass, className)} aria-label={label} />
    </span>
  )
}
