# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`onion` — a Jira-style project management tool, currently in a **design/UI-first
phase**. There is no backend: all data comes from an in-memory mock layer.
Do not add `fetch`/`axios` calls or environment variables for API URLs unless
explicitly asked to start the real-backend integration.

## Commands

```bash
npm install
npm run dev -- --host   # Vite dev server, also exposed on the LAN
npm run build            # tsc -b type-check, then production build
npm run lint              # oxlint
npm run preview           # serve the production build locally
```

There is no test runner configured yet.

## Architecture

The seam for a future real backend is `src/services/`: every function there
(`getIssues`, `updateIssueStatus`, `addComment`, ...) already has the
signature a real API client would have. Bodies currently read/write an
in-memory store (`src/services/db.ts`) seeded from `src/mocks/`. Swapping in
HTTP calls later means editing only `src/services/*.ts` — component and hook
code should not need to change.

Data flow: page → TanStack Query hook (in `src/hooks/` or a feature's
`hooks/` folder) → `src/services/*` function → `src/services/db.ts`. Mutations
(drag-and-drop status changes, backlog reorder, editing an issue, adding a
comment) use optimistic updates against the query cache; see
`src/features/board/hooks/useBoardIssues.ts` and
`src/features/backlog/hooks/useBacklogIssues.ts` for the pattern. Query keys
are centralized in `src/lib/queryKeys.ts` — extend that registry rather than
hand-typing key arrays in new hooks.

`src/features/` is organized one folder per feature area (`board`, `backlog`,
`issue-detail`, `projects`), each owning its own components and query hooks.
Cross-cutting hooks (projects, users, statuses, sprints) live in `src/hooks/`.

The issue detail panel is a dialog driven by a `?issue=<KEY>` search param
(`useIssueDetailRoute`), not a route param — this is what makes it shareable
and openable from both the board and the backlog without duplicating the
dialog. Route structure itself lives in `src/routes/router.tsx`, with
`src/routes/ProjectLayout.tsx` rendering the Board/Backlog tab nav for a given
project.

The Kanban board (`src/features/board`) and backlog (`src/features/backlog`)
both use `@dnd-kit`: `DndContext` + `PointerSensor` + `closestCenter`
collision detection, `useSortable` per row/card. Reordering computes a
fractional `order` between the two new neighbors (`computeOrderBetween` in
`useBoardIssues.ts`) rather than reindexing the whole list.

`src/mocks/` holds all seed data as typed TS (not JSON) — users, projects,
statuses, sprints, issues, comments. Every project shares the same four
statuses (To Do / In Progress / In Review / Done) but each has its own
`Status` rows, matching how a real per-project workflow would be modeled.

## UI components

shadcn/ui components live in `src/components/ui/`. This project's shadcn
setup uses the newer `cn` npm package (not a local `src/lib/utils.ts`) for
the `cn()` className helper, and the unified `radix-ui` package rather than
individual `@radix-ui/react-*` packages — `npx shadcn@latest add <component>`
follows that same convention. The `@/*` path alias maps to `src/*` (declared
in both `tsconfig.app.json` and `vite.config.ts` — keep them in sync if it
changes).

Small shared display components (avatars, priority/issue-type icons) live in
`src/components/common/`; app chrome (top nav, project switcher, user menu)
lives in `src/components/layout/`.
