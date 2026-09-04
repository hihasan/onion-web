import type { User } from "@/types"

export const users: User[] = [
  {
    id: "user-1",
    name: "Hasan Mamun",
    email: "hasan@onion.dev",
    initials: "HM",
  },
  {
    id: "user-2",
    name: "Priya Natarajan",
    email: "priya@onion.dev",
    initials: "PN",
  },
  {
    id: "user-3",
    name: "Marcus Webb",
    email: "marcus@onion.dev",
    initials: "MW",
  },
  {
    id: "user-4",
    name: "Lena Ortiz",
    email: "lena@onion.dev",
    initials: "LO",
  },
  {
    id: "user-5",
    name: "Sam Okafor",
    email: "sam@onion.dev",
    initials: "SO",
  },
]

/** The mock "logged in" user shown in the top nav. */
export const currentUser: User = users[0]

export function getUserById(id: string | null): User | undefined {
  if (!id) return undefined
  return users.find((u) => u.id === id)
}
