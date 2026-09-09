# Database Schema — PostgreSQL

Derived from the current frontend data model (`src/types/index.ts` + `src/mocks/*.ts`)
in this repo, for building the Go + PostgreSQL backend that will eventually replace
`src/services/db.ts` (see `CLAUDE.md` — the service layer already has the exact
function signatures a real API client needs; only `src/services/*.ts` should change
when this backend goes live).

## 1. Scope & assumptions

- Every table below has a direct counterpart in `src/types/index.ts`. Nothing here
  invents new product features — it only normalizes what the UI already reads/writes.
- Frontend mock IDs are human-readable strings (`"proj-oni"`, `"user-1"`). This schema
  switches every `id` to a server-generated `UUID`. That's an internal detail — the
  frontend already treats `id` as an opaque string, so no component code needs to
  change. Human-readable identifiers the UI actually *displays* (`Project.key`,
  `Issue.key`) stay as plain unique text columns.
- `Issue.order` / backlog & board drag-and-drop use **fractional ordering**
  (`computeOrderBetween` in `useBoardIssues.ts` picks the midpoint between two
  neighbors' order values), so the DB column must be `NUMERIC`, not `INTEGER`.
- `Project.description` word-count limit (2500 words, see the create-project dialog)
  and any other input-length rules are UI/API-layer validation, not DB constraints —
  not modeled here.
- Not modeled (no UI for these yet — see §7): auth/sessions, attachments, activity/
  history log, "Development"/"Automation" panels, labels-as-a-managed-entity.

## 2. Entity-relationship diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : leads
    USERS ||--o{ PROJECT_MEMBERS : "is a member via"
    PROJECTS ||--o{ PROJECT_MEMBERS : has
    PROJECTS ||--o{ STATUSES : "owns workflow"
    PROJECTS ||--o{ SPRINTS : has
    PROJECTS ||--o{ ISSUES : has
    STATUSES ||--o{ ISSUES : "current status of"
    SPRINTS ||--o{ ISSUES : "contains (nullable)"
    USERS ||--o{ ISSUES : "assigned to"
    USERS ||--o{ ISSUES : "reported by"
    ISSUES ||--o{ ISSUE_LABELS : tagged
    ISSUES ||--o{ COMMENTS : has
    USERS ||--o{ COMMENTS : authors

    USERS {
        uuid id PK
        text name
        text email UK
        text avatar_url
        text initials
    }
    PROJECTS {
        uuid id PK
        text key UK
        text name
        text description
        uuid lead_id FK
        project_status status
        text category
        text avatar_color
        int last_issue_number
    }
    PROJECT_MEMBERS {
        uuid project_id PK_FK
        uuid user_id PK_FK
    }
    STATUSES {
        uuid id PK
        uuid project_id FK
        text name
        status_category category
        int position
    }
    SPRINTS {
        uuid id PK
        uuid project_id FK
        text name
        text goal
        date start_date
        date end_date
        sprint_state state
    }
    ISSUES {
        uuid id PK
        text key UK
        uuid project_id FK
        issue_type type
        text title
        text description
        uuid status_id FK
        issue_priority priority
        uuid assignee_id FK
        uuid reporter_id FK
        numeric story_points
        uuid sprint_id FK
        numeric position
    }
    ISSUE_LABELS {
        uuid issue_id PK_FK
        text label PK
    }
    COMMENTS {
        uuid id PK
        uuid issue_id FK
        uuid author_id FK
        text body
    }
```

## 3. Enum types

| Enum | Values | Frontend source |
|---|---|---|
| `issue_type` | `epic`, `story`, `task`, `bug` | `IssueType` |
| `issue_priority` | `lowest`, `low`, `medium`, `high`, `highest` | `Priority` |
| `status_category` | `todo`, `in_progress`, `done` | `StatusCategory` |
| `project_status` | `start_progress`, `in_progress`, `done`, `paused` | `ProjectStatus` |
| `sprint_state` | `planned`, `active`, `completed` | `Sprint.state` |

## 4. Full DDL

```sql
-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE issue_type      AS ENUM ('epic', 'story', 'task', 'bug');
CREATE TYPE issue_priority  AS ENUM ('lowest', 'low', 'medium', 'high', 'highest');
CREATE TYPE status_category AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE project_status  AS ENUM ('start_progress', 'in_progress', 'done', 'paused');
CREATE TYPE sprint_state    AS ENUM ('planned', 'active', 'completed');

-- ── updated_at helper ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── users ───────────────────────────────────────────────────────────────────
-- Frontend: User
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  avatar_url  TEXT,               -- User.avatarUrl (nullable)
  initials    TEXT NOT NULL,      -- avatar fallback, e.g. "HM"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── projects ────────────────────────────────────────────────────────────────
-- Frontend: Project
CREATE TABLE projects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                VARCHAR(10) NOT NULL UNIQUE,   -- e.g. "ONI" — used as issue-key prefix
  name               TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  lead_id            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status             project_status NOT NULL DEFAULT 'start_progress',
  category           TEXT NOT NULL,                 -- free-form grouping label
  avatar_color       TEXT NOT NULL DEFAULT 'bg-black', -- Tailwind class the UI applies as-is
  last_issue_number  INTEGER NOT NULL DEFAULT 0,     -- see §6, issue key generation
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_lead_id ON projects(lead_id);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── project_members ─────────────────────────────────────────────────────────
-- Frontend: Project.memberIds[] (many-to-many roster shown in the project panel)
CREATE TABLE project_members (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- ── statuses ────────────────────────────────────────────────────────────────
-- Frontend: Status — each project owns its own 6 workflow rows (see CLAUDE.md)
CREATE TABLE statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    status_category NOT NULL,
  position    INTEGER NOT NULL,   -- Status.order — board column order, left to right
  UNIQUE (project_id, name)
);

CREATE INDEX idx_statuses_project_id ON statuses(project_id);

-- ── sprints ─────────────────────────────────────────────────────────────────
-- Frontend: Sprint
CREATE TABLE sprints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  goal        TEXT,               -- Sprint.goal (nullable)
  start_date  DATE,                -- Sprint.startDate (nullable)
  end_date    DATE,                -- Sprint.endDate (nullable)
  state       sprint_state NOT NULL DEFAULT 'planned',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprints_project_id ON sprints(project_id);

-- Recommended (not enforced by the current mock layer, but the UI only ever
-- reads a single "active" sprint per project via useActiveSprint):
CREATE UNIQUE INDEX uq_sprints_one_active_per_project
  ON sprints(project_id) WHERE state = 'active';

CREATE TRIGGER trg_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── issues ──────────────────────────────────────────────────────────────────
-- Frontend: Issue
CREATE TABLE issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           VARCHAR(20) NOT NULL UNIQUE,  -- e.g. "ONI-42"
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type          issue_type NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  status_id     UUID NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,
  priority      issue_priority NOT NULL DEFAULT 'medium',
  assignee_id   UUID REFERENCES users(id) ON DELETE SET NULL,   -- nullable = unassigned
  reporter_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  story_points  NUMERIC(5,2),      -- nullable
  sprint_id     UUID REFERENCES sprints(id) ON DELETE SET NULL, -- NULL = backlog
  position      NUMERIC NOT NULL, -- Issue.order — fractional, see §6
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_issues_project_id  ON issues(project_id);
CREATE INDEX idx_issues_status_id   ON issues(status_id);
CREATE INDEX idx_issues_sprint_id   ON issues(sprint_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
-- Board/backlog queries always filter by project (+ sprint) then sort by position:
CREATE INDEX idx_issues_project_status_position ON issues(project_id, status_id, position);

CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── issue_labels ────────────────────────────────────────────────────────────
-- Frontend: Issue.labels[] (freeform tags, no separate management UI today)
CREATE TABLE issue_labels (
  issue_id  UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  PRIMARY KEY (issue_id, label)
);

CREATE INDEX idx_issue_labels_label ON issue_labels(label); -- powers the "Label" filter dropdown

-- ── comments ────────────────────────────────────────────────────────────────
-- Frontend: Comment
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_issue_id ON comments(issue_id);
```

## 5. Table → frontend type mapping

### `users` ← `User`

| Column | Frontend field | Notes |
|---|---|---|
| `id` | `id` | `UUID`, was a string like `"user-1"` |
| `name` | `name` | |
| `email` | `email` | unique |
| `avatar_url` | `avatarUrl` | nullable |
| `initials` | `initials` | |

### `projects` ← `Project`

| Column | Frontend field | Notes |
|---|---|---|
| `id` | `id` | |
| `key` | `key` | unique, e.g. `"ONI"` |
| `name` | `name` | |
| `description` | `description` | |
| `lead_id` | `leadId` | FK → `users.id` |
| `status` | `status` | `project_status` enum |
| `category` | `category` | free text, seeded from `PROJECT_CATEGORIES` client-side |
| `avatar_color` | `avatarColor` | stored Tailwind class, passed through as-is |
| `last_issue_number` | *(new, backend-only)* | see §6 |

### `project_members` ← `Project.memberIds[]`

Join table; `SELECT user_id FROM project_members WHERE project_id = $1` reconstructs
`memberIds`. Adding/removing a member (the panel's `+`/`×` controls) is a single
`INSERT`/`DELETE` row, not a full-project update.

### `statuses` ← `Status`

| Column | Frontend field |
|---|---|
| `id` | `id` |
| `project_id` | `projectId` |
| `name` | `name` |
| `category` | `category` |
| `position` | `order` |

### `sprints` ← `Sprint`

| Column | Frontend field |
|---|---|
| `id` | `id` |
| `project_id` | `projectId` |
| `name` | `name` |
| `goal` | `goal` |
| `start_date` / `end_date` | `startDate` / `endDate` |
| `state` | `state` |

### `issues` ← `Issue`

| Column | Frontend field | Notes |
|---|---|---|
| `id` | `id` | |
| `key` | `key` | globally unique (`project.key` prefix + per-project counter) |
| `project_id` | `projectId` | |
| `type` | `type` | |
| `title` | `title` | |
| `description` | `description` | |
| `status_id` | `statusId` | |
| `priority` | `priority` | |
| `assignee_id` | `assigneeId` | nullable = unassigned |
| `reporter_id` | `reporterId` | |
| `story_points` | `storyPoints` | nullable |
| `sprint_id` | `sprintId` | `NULL` = backlog issue |
| `position` | `order` | `NUMERIC`, fractional — see §6 |
| `created_at` / `updated_at` | `createdAt` / `updatedAt` | |

### `issue_labels` ← `Issue.labels[]`

`SELECT label FROM issue_labels WHERE issue_id = $1 ORDER BY label` reconstructs
`labels[]`. `DISTINCT label` per project backs the toolbar's "Label" filter
(`availableLabels` in `useIssueFilters`).

### `comments` ← `Comment`

| Column | Frontend field |
|---|---|
| `id` | `id` |
| `issue_id` | `issueId` |
| `author_id` | `authorId` |
| `body` | `body` |
| `created_at` | `createdAt` |

## 6. Two implementation notes worth flagging to whoever builds the Go boilerplate

**Fractional ordering (`issues.position`).** The board and backlog do drag-and-drop
reordering by computing a value strictly between two neighbors
(`computeOrderBetween` in `src/features/board/hooks/useBoardIssues.ts`), never a
full re-index of the list. The API's "move/reorder" endpoints should do the same —
compute the new fractional position server-side (or accept it from the client) and
write a single row, not the whole column. `NUMERIC` (arbitrary precision) avoids the
float-precision drift `DOUBLE PRECISION` would eventually hit after many inserts
between the same two neighbors.

**Issue key generation (`ONI-42`).** The mock service (`createIssue` in
`issueService.ts`) currently derives the next number by scanning all of a project's
issues for the max suffix — fine for an in-memory mock, not safe under concurrent
writes. `projects.last_issue_number` is here so the real implementation can do an
atomic `UPDATE projects SET last_issue_number = last_issue_number + 1 WHERE id = $1
RETURNING last_issue_number` inside the same transaction as the `INSERT INTO
issues`, then build the key as `key || '-' || last_issue_number`.

## 7. Not modeled (no corresponding UI yet)

These show up as placeholders in the frontend (`ProjectLayout.tsx`'s unimplemented
tabs, `IssueDetailPage.tsx`'s "Development"/"Automation"/"History"/"Work log"
sections) but have no read/write behavior today, so there's nothing to derive a
schema from yet:

- Auth/sessions/roles/permissions
- File attachments
- Issue activity/history log, work log
- "Development" (linked branches/PRs) and "Automation" panel data
- A managed `labels` catalog (labels are currently freeform per-issue tags only)
- Issue links/relations ("Linked work items" is a static placeholder today)
- Subtasks (placeholder "Add subtask" link only)

Add tables for these when their frontend features actually land, rather than
speculatively now.
