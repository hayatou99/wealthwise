export type AccountCategory =
  | 'cash'
  | 'investment'
  | 'real_estate'
  | 'retirement'
  | 'vehicle'
  | 'crypto'
  | 'other_asset'
  | 'mortgage'
  | 'loan'
  | 'credit'
  | 'other_liability'

export type AccountType = 'asset' | 'liability'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  onboarded: boolean
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  category: AccountCategory
  type: AccountType
  institution: string | null
  notes: string | null
  is_manual: boolean
  created_at: string
  updated_at: string
}

export interface Balance {
  id: string
  account_id: string
  user_id: string
  value: number
  recorded_at: string
}

export interface AccountWithBalance extends Account {
  balance: number
  recorded_at: string | null
}

export interface Snapshot {
  id: string
  user_id: string
  total_assets: number
  total_liabilities: number
  net_worth: number
  snapshot_date: string
  created_at: string
}

export interface CategoryMeta {
  label: string
  icon: string
  color: string
  bg: string
}

export const ASSET_CATEGORIES: AccountCategory[] = [
  'cash', 'investment', 'real_estate', 'retirement', 'vehicle', 'crypto', 'other_asset'
]

export const LIABILITY_CATEGORIES: AccountCategory[] = [
  'mortgage', 'loan', 'credit', 'other_liability'
]

export const CATEGORY_META: Record<AccountCategory, CategoryMeta> = {
  cash:            { label: 'Cash & savings',  icon: '🏦', color: '#1D9E75', bg: '#E1F5EE' },
  investment:      { label: 'Investments',      icon: '📈', color: '#378ADD', bg: '#E6F1FB' },
  real_estate:     { label: 'Real estate',      icon: '🏠', color: '#7F77DD', bg: '#EEEDFE' },
  retirement:      { label: 'Retirement',       icon: '🛡️', color: '#639922', bg: '#EAF3DE' },
  vehicle:         { label: 'Vehicles',         icon: '🚗', color: '#888780', bg: '#F1EFE8' },
  crypto:          { label: 'Crypto',           icon: '₿',  color: '#EF9F27', bg: '#FAEEDA' },
  other_asset:     { label: 'Other asset',      icon: '📦', color: '#888780', bg: '#F1EFE8' },
  mortgage:        { label: 'Mortgage',         icon: '🏠', color: '#E24B4A', bg: '#FCEBEB' },
  loan:            { label: 'Loan',             icon: '📄', color: '#D85A30', bg: '#FAECE7' },
  credit:          { label: 'Credit cards',     icon: '💳', color: '#D4537E', bg: '#FBEAF0' },
  other_liability: { label: 'Other liability',  icon: '➖', color: '#888780', bg: '#F1EFE8' },
}
