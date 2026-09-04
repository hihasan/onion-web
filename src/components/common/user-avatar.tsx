import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "cn"
import type { User } from "@/types"

const SIZE_CLASSES = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
}

export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: User | null | undefined
  size?: keyof typeof SIZE_CLASSES
  className?: string
}) {
  if (!user) {
    return (
      <Avatar className={cn(SIZE_CLASSES[size], className)} title="Unassigned">
        <AvatarFallback className="border border-dashed text-muted-foreground">?</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)} title={user.name}>
      {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  )
}
