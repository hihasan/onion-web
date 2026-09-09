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
import { cn } from "cn"

const EMPTY_FORM = { name: "", key: "", description: "", leadId: "", category: "" }

const MAX_DESCRIPTION_WORDS = 2500

/** Jira-style default: uppercase first few letters of the name's first word, e.g. "Customer Portal" -> "CUS". */
function deriveKeyFromName(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? ""
  return firstWord.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

/** Truncates to the first `maxWords` words, keeping each word's trailing whitespace so formatting survives. */
function limitWords(text: string, maxWords: number): string {
  const tokens = text.match(/\S+\s*/g) ?? []
  if (tokens.length <= maxWords) return text
  return tokens.slice(0, maxWords).join("")
}

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
  const [keyEdited, setKeyEdited] = useState(false)

  const isValid = form.name.trim() && form.key.trim() && form.leadId && form.category
  const descriptionWordCount = countWords(form.description)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(EMPTY_FORM)
      setKeyEdited(false)
    }
    onOpenChange(next)
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, key: keyEdited ? f.key : deriveKeyFromName(name) }))
  }

  function handleKeyChange(key: string) {
    setKeyEdited(true)
    setForm((f) => ({ ...f, key: key.toUpperCase().slice(0, 5) }))
  }

  function handleDescriptionChange(description: string) {
    setForm((f) => ({ ...f, description: limitWords(description, MAX_DESCRIPTION_WORDS) }))
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
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-xl border border-black bg-white p-0 text-black"
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
              onChange={(e) => handleNameChange(e.target.value)}
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
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="e.g. CUS"
              className="border-black uppercase focus-visible:ring-black/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="project-description" className="text-black">
                Description
              </Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  descriptionWordCount >= MAX_DESCRIPTION_WORDS ? "text-red-600" : "text-neutral-500"
                )}
              >
                {descriptionWordCount} / {MAX_DESCRIPTION_WORDS} words
              </span>
            </div>
            <Textarea
              id="project-description"
              value={form.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
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
