import { Link, useParams } from "react-router-dom"

import logo from "@/assets/ic_onion.png"
import { ProjectSwitcher } from "@/components/layout/project-switcher"
import { UserMenu } from "@/components/layout/user-menu"

export function TopNav() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-1">
        <Link to="/" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold">
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
      <UserMenu />
    </header>
  )
}
