import { currentUser, users } from "@/mocks/users"
import type { User } from "@/types"

import { delay } from "./db"

// Mock implementations today; swap the bodies for `fetch`/`axios` calls
// later without touching any component or hook that calls these.

export function getUsers(): Promise<User[]> {
  return delay(users)
}

export function getUserById(id: string): Promise<User | undefined> {
  return delay(users.find((u) => u.id === id))
}

export function getCurrentUser(): Promise<User> {
  return delay(currentUser)
}
