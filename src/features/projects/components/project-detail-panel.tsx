import { Search, SquareArrowOutUpRight, UserRoundPlus, X } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PROJECT_STATUSES } from "@/mocks/projects"
import { useProject, useUpdateProject } from "@/hooks/useProjects"
import { useUsers } from "@/hooks/useUsers"
import type { ProjectStatus } from "@/types"

/**
 * Non-modal project detail panel that docks to the right of the project
 * list, mirroring the issue detail panel's split-view pattern.
 */
export function ProjectDetailPanel({
  projectId,
  onClose,
}: {
  projectId: string | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(projectId ?? undefined)
  const { data: users } = useUsers()
  const updateProject = useUpdateProject()
  const [addOpen, setAddOpen] = useState(false)
  const [memberQuery, setMemberQuery] = useState("")

  if (!projectId) return null

  const lead = users?.find((u) => u.id === project?.leadId) ?? null
  const members = (project?.memberIds ?? [])
    .map((id) => users?.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
  const availableUsers = (users ?? []).filter((u) => !project?.memberIds.includes(u.id))
  const matchingUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(memberQuery.trim().toLowerCase())
  )

  function handleRemoveMember(memberId: string) {
    if (!project) return
    updateProject.mutate({
      id: project.id,
      patch: { memberIds: project.memberIds.filter((id) => id !== memberId) },
    })
  }

  function handleAddMember(memberId: string) {
    if (!project) return
    updateProject.mutate({
      id: project.id,
      patch: { memberIds: [...project.memberIds, memberId] },
    })
  }

  return (
    <div className="flex h-full w-full max-w-sm shrink-0 flex-col border-l bg-background lg:max-w-md">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">Project</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Open active sprint"
            onClick={() => project && navigate(`/projects/${project.id}/board`)}
          >
            <SquareArrowOutUpRight className="size-4" />
            <span className="sr-only">Open active sprint</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {isLoading || !project ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <Select
                value={project.status}
                onValueChange={(status: ProjectStatus) =>
                  updateProject.mutate({ id: project.id, patch: { status } })
                }
              >
                <SelectTrigger className="h-8 w-auto shrink-0 rounded-full text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {PROJECT_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Description</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {project.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Lead</h3>
              <div className="flex items-center gap-2">
                <UserAvatar user={lead} size="sm" />
                <span className="text-sm">{lead?.name ?? "Unknown"}</span>
              </div>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Team Members</h3>
              <div className="flex flex-wrap items-center gap-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1.5 rounded-full border py-0.5 pr-1 pl-0.5"
                  >
                    <UserAvatar user={member} size="sm" />
                    <span className="text-xs">{member.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      aria-label={`Remove ${member.name} from team`}
                      title={`Remove ${member.name}`}
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

                <Popover
                  open={addOpen}
                  onOpenChange={(open) => {
                    setAddOpen(open)
                    if (!open) setMemberQuery("")
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Add team member"
                      title="Add team member"
                      className="flex size-6 items-center justify-center rounded-full border border-dashed text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <UserRoundPlus className="size-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-0">
                    <div className="relative border-b p-1.5">
                      <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        autoFocus
                        value={memberQuery}
                        onChange={(e) => setMemberQuery(e.target.value)}
                        placeholder="Search people…"
                        aria-label="Search people to add"
                        className="h-7 w-full rounded-sm bg-transparent pl-6 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {availableUsers.length === 0 ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          Everyone is already on the team
                        </p>
                      ) : matchingUsers.length === 0 ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>
                      ) : (
                        matchingUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleAddMember(user.id)}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            <UserAvatar user={user} size="sm" />
                            {user.name}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Category</h3>
              <Badge variant="secondary">{project.category}</Badge>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
