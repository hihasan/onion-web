import { X } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateProject } from "@/hooks/useProjects"
import { useUsers } from "@/hooks/useUsers"
import { PROJECT_CATEGORIES } from "@/mocks/projects"

const EMPTY_FORM = { name: "", key: "", description: "", leadId: "", category: "" }

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: users } = useUsers()
  const createProject = useCreateProject()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)

  const isValid = form.name.trim() && form.key.trim() && form.leadId && form.category

  function handleOpenChange(next: boolean) {
    if (!next) setForm(EMPTY_FORM)
    onOpenChange(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    createProject.mutate(
      {
        name: form.name.trim(),
        key: form.key.trim().toUpperCase(),
        description: form.description.trim(),
        leadId: form.leadId,
        category: form.category,
      },
      {
        onSuccess: (project) => {
          handleOpenChange(false)
          navigate(`/projects/${project.id}/board`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-screen max-h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-white p-0 text-black sm:max-w-none"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black px-6">
          <DialogTitle className="font-heading text-lg">Create project</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full hover:bg-black hover:text-white"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto px-6 py-10"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name" className="text-black">
              Name
            </Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Customer Portal"
              className="border-black focus-visible:ring-black/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-key" className="text-black">
              Key
            </Label>
            <Input
              id="project-key"
              value={form.key}
              onChange={(e) =>
                setForm((f) => ({ ...f, key: e.target.value.toUpperCase().slice(0, 5) }))
              }
              placeholder="e.g. CUS"
              className="border-black uppercase focus-visible:ring-black/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description" className="text-black">
              Description
            </Label>
            <Textarea
              id="project-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this project for?"
              rows={3}
              className="border-black focus-visible:ring-black/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-black">Lead</Label>
            <Select
              value={form.leadId}
              onValueChange={(leadId) => setForm((f) => ({ ...f, leadId }))}
            >
              <SelectTrigger className="w-full border-black">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-black">Category</Label>
            <Select
              value={form.category}
              onValueChange={(category) => setForm((f) => ({ ...f, category }))}
            >
              <SelectTrigger className="w-full border-black">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!isValid || createProject.isPending}
            className="mt-2 h-11 rounded-full bg-black text-white hover:bg-neutral-800"
          >
            Create project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
