import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditSprintDialog } from "@/features/backlog/components/edit-sprint-dialog"
import { useDeleteSprint } from "@/hooks/useProjectWorkflow"
import type { Issue, Priority, Sprint } from "@/types"

const PRIORITY_RANK: Record<Priority, number> = {
  highest: 0,
  high: 1,
  medium: 2,
  low: 3,
  lowest: 4,
}

export function SprintSectionMenu({
  sprint,
  projectId,
  issues,
  onReorder,
}: {
  sprint: Sprint
  projectId: string | undefined
  issues: Issue[]
  onReorder: (orderedIds: string[]) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteSprint = useDeleteSprint(projectId)

  function handleReorderByPriority() {
    const sorted = [...issues].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    onReorder(sorted.map((i) => i.id))
  }

  function handleDelete() {
    deleteSprint.mutate(sprint.id, { onSuccess: () => setDeleteOpen(false) })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Sprint actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleReorderByPriority}>Reorder work items</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit sprint</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            Delete sprint
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSprintDialog sprint={sprint} projectId={projectId} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes "{sprint.name}" and moves its {issues.length} work item
              {issues.length === 1 ? "" : "s"} back to the backlog. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteSprint.isPending}
              onClick={handleDelete}
            >
              Delete sprint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
