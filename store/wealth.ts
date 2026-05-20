import { create } from 'zustand'
import type { AccountWithBalance, Snapshot } from '@/types'
import { ASSET_CATEGORIES } from '@/types'

interface WealthStore {
  accounts: AccountWithBalance[]
  snapshots: Snapshot[]
  loading: boolean
  setAccounts: (accounts: AccountWithBalance[]) => void
  setSnapshots: (snapshots: Snapshot[]) => void
  setLoading: (loading: boolean) => void
  addAccount: (account: AccountWithBalance) => void
  removeAccount: (id: string) => void
  totalAssets: () => number
  totalLiabilities: () => number
  netWorth: () => number
}

export const useWealthStore = create<WealthStore>((set, get) => ({
  accounts: [],
  snapshots: [],
  loading: true,
  setAccounts: (accounts) => set({ accounts }),
  setSnapshots: (snapshots) => set({ snapshots }),
  setLoading: (loading) => set({ loading }),
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (id) => set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),
  totalAssets: () => get().accounts.filter((a) => ASSET_CATEGORIES.includes(a.category)).reduce((sum, a) => sum + a.balance, 0),
  totalLiabilities: () => get().accounts.filter((a) => !ASSET_CATEGORIES.includes(a.category)).reduce((sum, a) => sum + a.balance, 0),
  netWorth: () => get().totalAssets() - get().totalLiabilities(),
}))
