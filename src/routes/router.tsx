import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import { BacklogPage } from "@/features/backlog/BacklogPage"
import { BoardPage } from "@/features/board/BoardPage"
import { ProjectsPage } from "@/features/projects/ProjectsPage"
import { ProjectLayout } from "@/routes/ProjectLayout"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <ProjectsPage /> },
      {
        path: "projects/:projectId",
        element: <ProjectLayout />,
        children: [
          { index: true, element: <Navigate to="board" replace /> },
          { path: "board", element: <BoardPage /> },
          { path: "backlog", element: <BacklogPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
