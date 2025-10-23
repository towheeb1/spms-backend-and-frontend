import { create } from 'zustand'

export type Role =
  | 'Pharmacist' | 'Supervisor' | 'Manager' | 'InventoryClerk'
  | 'Doctor' | 'Patient'

type User = { id: string; name: string; phone?: string; role: Role }
type State = {
  user: User | null
  isAuthed: boolean
  setUser: (u: User) => void
  logout: () => void
}

export const useAuth = create<State>((set) => ({
  user: null,
  isAuthed: false,
  setUser: (u) => set({ user: u, isAuthed: true }),
  logout: () => set({ user: null, isAuthed: false }),
}))
