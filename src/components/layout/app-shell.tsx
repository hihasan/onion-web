import { Outlet } from "react-router-dom"

import { TopNav } from "@/components/layout/top-nav"

export function AppShell() {
  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
