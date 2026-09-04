import { Link, useParams } from "react-router-dom"

import logo from "@/assets/ic_onion.png"
import { ProjectSwitcher } from "@/components/layout/project-switcher"
import { TicketSearch } from "@/components/layout/ticket-search"
import { UserMenu } from "@/components/layout/user-menu"

export function TopNav() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-1 justify-self-start">
        <Link
          to="/"
          className="font-heading flex items-center gap-2 rounded-md px-2 py-1.5 text-base font-semibold"
        >
          <img src={logo} alt="" className="size-6 rounded-sm" />
          onion
        </Link>
        {projectId ? (
          <>
            <span className="text-muted-foreground">/</span>
            <ProjectSwitcher />
          </>
        ) : null}
      </div>

      <TicketSearch />

      <div className="justify-self-end">
        <UserMenu />
      </div>
    </header>
  )
}
