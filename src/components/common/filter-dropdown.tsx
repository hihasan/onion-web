import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "cn"

export function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
  emptyText,
  readOnly = false,
}: {
  label: string
  options: { value: T; label: string; icon?: ReactNode }[]
  selected?: Set<T>
  onToggle?: (value: T) => void
  emptyText?: string
  /** No selection state — just a browsable list, for filters we don't have data to wire up yet. */
  readOnly?: boolean
}) {
  const count = readOnly ? 0 : (selected?.size ?? 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 items-center gap-1 rounded-md border bg-background px-3 text-sm transition-colors hover:bg-accent",
            count > 0 && "border-primary/40 bg-primary/5 text-primary"
          )}
        >
          {label}
          {count > 0 ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {count}
            </span>
          ) : null}
          <ChevronDown className="size-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">{emptyText ?? "Nothing to show"}</p>
        ) : readOnly ? (
          options.map((opt) => (
            <DropdownMenuItem key={opt.value}>
              {opt.icon}
              {opt.label}
            </DropdownMenuItem>
          ))
        ) : (
          options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={selected?.has(opt.value) ?? false}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onToggle?.(opt.value)}
            >
              {opt.icon}
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
