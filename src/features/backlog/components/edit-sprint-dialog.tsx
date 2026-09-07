import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateSprint } from "@/hooks/useProjectWorkflow"
import type { Sprint } from "@/types"

export function EditSprintDialog({
  sprint,
  projectId,
  open,
  onOpenChange,
}: {
  sprint: Sprint
  projectId: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditSprintForm key={sprint.id} sprint={sprint} projectId={projectId} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  )
}

/** Mounted only while the dialog is open, so its form state always starts fresh from the current sprint. */
function EditSprintForm({
  sprint,
  projectId,
  onOpenChange,
}: {
  sprint: Sprint
  projectId: string | undefined
  onOpenChange: (open: boolean) => void
}) {
  const updateSprint = useUpdateSprint(projectId)
  const [form, setForm] = useState({
    name: sprint.name,
    goal: sprint.goal ?? "",
    startDate: sprint.startDate ?? "",
    endDate: sprint.endDate ?? "",
  })

  const isValid = form.name.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    updateSprint.mutate(
      {
        id: sprint.id,
        patch: {
          name: form.name.trim(),
          goal: form.goal.trim(),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit sprint</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sprint-name">Sprint name</Label>
          <Input
            id="sprint-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sprint-goal">Sprint goal</Label>
          <Textarea
            id="sprint-goal"
            value={form.goal}
            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="sprint-start">Start date</Label>
            <Input
              id="sprint-start"
              type="date"
              value={form.startDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="sprint-end">End date</Label>
            <Input
              id="sprint-end"
              type="date"
              value={form.endDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={!isValid || updateSprint.isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
