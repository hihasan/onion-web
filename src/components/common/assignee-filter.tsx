import { UserRoundPlus } from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/types"
import { cn } from "cn"

const UNASSIGNED = "unassigned"
const MAX_VISIBLE = 5

export function AssigneeFilter({
  users,
  selected,
  onToggle,
}: {
  users: User[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const visible = users.slice(0, MAX_VISIBLE)

  return (
    <div className="flex shrink-0 items-center">
      {visible.map((user, i) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onToggle(user.id)}
          style={{ zIndex: visible.length - i }}
          aria-pressed={selected.has(user.id)}
          title={user.name}
          className={cn(
            "-ml-2 rounded-full ring-2 ring-background transition-transform first:ml-0 hover:z-10 hover:scale-110",
            selected.has(user.id) && "ring-2 ring-primary"
          )}
        >
          <UserAvatar
            user={user}
            size="sm"
            className={cn(selected.size > 0 && !selected.has(user.id) && "opacity-40")}
          />
        </button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Filter by assignee"
            className="-ml-2 flex size-6 items-center justify-center rounded-full border border-dashed bg-background text-muted-foreground ring-2 ring-background hover:bg-accent"
          >
            <UserRoundPlus className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuCheckboxItem
            checked={selected.has(UNASSIGNED)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => onToggle(UNASSIGNED)}
          >
            <UserAvatar user={null} size="sm" />
            Unassigned
          </DropdownMenuCheckboxItem>
          {users.map((user) => (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={selected.has(user.id)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onToggle(user.id)}
            >
              <UserAvatar user={user} size="sm" />
              {user.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
