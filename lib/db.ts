import { createClient } from './supabase'
import type { AccountCategory, AccountType, AccountWithBalance, Snapshot } from '@/types'

export async function getAccountsWithBalances(userId: string): Promise<AccountWithBalance[]> {
  const supabase = createClient()
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (!accounts?.length) return []

  const { data: balances } = await supabase
    .from('balances')
    .select('*')
    .in('account_id', accounts.map(a => a.id))
    .order('recorded_at', { ascending: false })

  const latestBalances: Record<string, number> = {}
  const latestDates: Record<string, string> = {}
  for (const b of balances || []) {
    if (!latestBalances[b.account_id]) {
      latestBalances[b.account_id] = b.value
      latestDates[b.account_id] = b.recorded_at
    }
  }
  return accounts.map(a => ({
    ...a,
    balance: latestBalances[a.id] ?? 0,
    recorded_at: latestDates[a.id] ?? null,
  }))
}

export async function createAccount(
  userId: string,
  data: { name: string; category: AccountCategory; type: AccountType; institution?: string; value: number }
) {
  const supabase = createClient()
  const { data: account, error } = await supabase
    .from('accounts')
    .insert({ user_id: userId, name: data.name, category: data.category, type: data.type, institution: data.institution })
    .select()
    .single()
  if (error || !account) throw error
  await supabase.from('balances').insert({ account_id: account.id, user_id: userId, value: data.value })
  return account
}

export async function updateBalance(accountId: string, userId: string, value: number) {
  const supabase = createClient()
  return supabase.from('balances').insert({ account_id: accountId, user_id: userId, value })
}

export async function deleteAccount(accountId: string) {
  const supabase = createClient()
  return supabase.from('accounts').delete().eq('id', accountId)
}

export async function getSnapshots(userId: string): Promise<Snapshot[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: true })
    .limit(24)
  return data || []
}

export async function saveSnapshot(userId: string, totalAssets: number, totalLiabilities: number) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  return supabase.from('snapshots').upsert({
    user_id: userId,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: totalAssets - totalLiabilities,
    snapshot_date: today,
  }, { onConflict: 'user_id,snapshot_date' })
}

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function updateProfile(userId: string, updates: { full_name?: string; onboarded?: boolean }) {
  const supabase = createClient()
  return supabase.from('profiles').update(updates).eq('id', userId)
}
