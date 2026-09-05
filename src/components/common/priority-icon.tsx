import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Equal } from "lucide-react"
import { cn } from "cn"

import type { Priority } from "@/types"

const config: Record<Priority, { icon: typeof ArrowUp; className: string; label: string }> = {
  highest: { icon: ChevronsUp, className: "text-foreground", label: "Highest" },
  high: { icon: ArrowUp, className: "text-foreground", label: "High" },
  medium: { icon: Equal, className: "text-foreground/70", label: "Medium" },
  low: { icon: ArrowDown, className: "text-muted-foreground", label: "Low" },
  lowest: { icon: ChevronsDown, className: "text-muted-foreground", label: "Lowest" },
}

export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  const { icon: Icon, className: colorClass, label } = config[priority]
  return (
    <span title={`Priority: ${label}`} className="inline-flex">
      <Icon className={cn("size-4", colorClass, className)} aria-label={label} />
    </span>
  )
}
