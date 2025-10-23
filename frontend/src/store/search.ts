import { create } from "zustand"

export type SearchType =
  | "prescriptions"
  | "orders"
  | "invoices"
  | "payments"
  | "profile"
  | "addresses"
  | "insurance"
  | "pharmacies"
  | "settings"

export type SearchFilters = {
  types: Set<SearchType>
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string
  status?: string[] // للوصفات/الطلبات
  minAmount?: number // للفواتير/المدفوعات
  maxAmount?: number
}

export type SearchResult = {
  id: string
  type: SearchType
  title: string
  subtitle?: string
  route: string // إلى أين أذهب إذا نقر المستخدم
  meta?: Record<string, any>
}

type SearchState = {
  query: string
  filters: SearchFilters
  results: SearchResult[]
  open: boolean
  loading: boolean
  setQuery: (q: string) => void
  setFilters: (f: Partial<SearchFilters>) => void
  setOpen: (v: boolean) => void
  setResults: (r: SearchResult[]) => void
  setLoading: (v: boolean) => void
  clear: () => void
}

export const useSearch = create<SearchState>((set, get) => ({
  query: "",
  filters: {
    types: new Set<SearchType>([
      "prescriptions",
      "orders",
      "invoices",
      "payments",
      "profile",
      "addresses",
      "insurance",
      "pharmacies",
      "settings",
    ]),
  },
  results: [],
  open: false,
  loading: false,

  setQuery: (q) => set({ query: q }),
  setFilters: (f) => {
    const cur = get().filters
    set({ filters: { ...cur, ...f } })
  },
  setOpen: (v) => set({ open: v }),
  setResults: (r) => set({ results: r }),
  setLoading: (v) => set({ loading: v }),

  clear: () => set({ query: "", results: [], open: false, loading: false }),
}))
