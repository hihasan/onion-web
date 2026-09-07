import {
  AlignLeft,
  Archive,
  BarChart2,
  Calendar,
  ChevronRight,
  Code2,
  Component,
  FileText,
  GitBranch,
  ListChecks,
  Maximize2,
  MessageSquare,
  Milestone,
  MoreHorizontal,
  Rocket,
  Rows3,
  Settings,
  Share2,
  Shield,
  SquareKanban,
  Star,
  Target,
  UploadCloud,
  UserPlus,
  Users,
} from "lucide-react"
import { Link, NavLink, Navigate, Outlet, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProject } from "@/hooks/useProjects"
import { cn } from "cn"

const tabs = [
  { to: "summary", label: "Summary", icon: AlignLeft },
  { to: "timeline", label: "Timeline", icon: Milestone },
  { to: "backlog", label: "Backlog", icon: ListChecks },
  { to: "board", label: "Active sprints", icon: SquareKanban },
  { to: "releases", label: "Releases", icon: Rocket },
  { to: "calendar", label: "Calendar", icon: Calendar },
  { to: "reports", label: "Reports", icon: BarChart2 },
  { to: "list", label: "List", icon: FileText },
  { to: "forms", label: "Forms", icon: FileText },
  { to: "goals", label: "Goals", icon: Target },
  { to: "components", label: "Components", icon: Component },
  { to: "development", label: "Development", icon: GitBranch },
  { to: "code", label: "Code", icon: Code2 },
  { to: "security", label: "Security", icon: Shield },
  { to: "deployments", label: "Deployments", icon: UploadCloud },
  { to: "archived", label: "Archived work items", icon: Archive },
]

const IMPLEMENTED_TABS = new Set(["backlog", "board"])

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading } = useProject(projectId)

  if (!isLoading && !project) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground hover:underline">
                Projects
              </Link>
              <ChevronRight className="size-3.5" />
              <span>{project?.category ?? "…"}</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-semibold">
                {project?.name ?? "Loading…"}
              </h1>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Team"
              >
                <Users className="size-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:border data-[state=open]:border-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
                    aria-label="More"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem>
                    <Star className="size-4" />
                    Add to starred
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="size-4" />
                    Add people
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="size-4" />
                    Board settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Rows3 className="size-4" />
                    Create a plan with this board
                    <Badge className="ml-auto border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50">
                      Try
                    </Badge>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Share"
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Comments"
            >
              <MessageSquare className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Expand"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            if (!IMPLEMENTED_TABS.has(tab.to)) {
              return (
                <span
                  key={tab.to}
                  className="flex shrink-0 cursor-default items-center gap-1.5 border-b-2 border-transparent py-2 text-sm font-medium text-muted-foreground"
                >
                  <Icon className="size-4" />
                  {tab.label}
                </span>
              )
            }
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="size-4" />
                {tab.label}
              </NavLink>
            )
          })}
          <span className="flex shrink-0 cursor-default items-center gap-1 border-b-2 border-transparent py-2 text-sm font-medium text-muted-foreground">
            <MoreHorizontal className="size-4" />
            More
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs">4</span>
          </span>
        </nav>
      </div>
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
