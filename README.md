# onion

A Jira-style project management tool. **This is a design/UI-first build**: every
screen is fully clickable, but all data comes from an in-memory mock layer —
there is no backend, no `fetch`/`axios`, and no environment variables yet.

## Getting started

```bash
npm install
npm run dev -- --host   # exposes the dev server on your local network too
```

Other scripts: `npm run build` (type-check + production build), `npm run lint`
(oxlint), `npm run preview` (serve the production build locally).

## Project structure

```
src/
  types/        Domain interfaces: Issue, Project, User, Status, Sprint, Comment, etc.
  mocks/        Static, typed mock data (users, projects, statuses, sprints, issues, comments)
  services/     Mock "data service" layer — issueService, projectService, userService,
                commentService. Functions here (getIssues, updateIssueStatus, ...) have
                the same shape a real API client would have; db.ts holds the in-memory
                store they read/write and simulates network latency. THIS is the seam
                to swap in real HTTP calls later — component/hook code shouldn't need
                to change.
  hooks/        Cross-cutting TanStack Query hooks (projects, users, statuses, sprints)
  features/     One folder per feature area, each owning its query hooks and components:
    board/          Kanban board (columns per status, drag-and-drop via @dnd-kit)
    backlog/         Sortable, filterable flat issue list
    issue-detail/    Issue detail dialog (description, status/assignee/priority, comments)
    projects/        Project list / dashboard
  components/
    ui/          shadcn/ui primitives (button, dialog, dropdown-menu, select, tabs, ...)
    layout/      App shell, top nav, project switcher, user menu
    common/      Small shared display components (avatars, priority/type icons)
  routes/        React Router route tree (routes/router.tsx) and the project layout
                 (board/backlog tabs) that wraps board & backlog pages
  lib/           QueryClient instance and query key registry
```

## Data flow

Every screen reads through a TanStack Query hook (e.g. `useBoardIssues`,
`useBacklogIssues`, `useProjects`) whose `queryFn` calls a function in
`src/services/`. Mutations (drag-and-drop status changes, backlog reordering,
editing an issue, adding a comment) go through the same service functions and
use optimistic updates via the query cache.

To wire up a real backend later: replace the bodies of the functions in
`src/services/*.ts` with real HTTP calls (keeping their signatures), and
delete `src/services/db.ts` and the mock data under `src/mocks/`. No component
or hook code should need to change.

## Issue detail

The issue detail dialog is driven by a `?issue=<KEY>` search param
(`useIssueDetailRoute`), so it's shareable/bookmarkable and works the same way
whether it's opened from the board or the backlog.
