'use client'
import { useEffect, useState } from 'react'
import { useWealthStore } from '@/store/wealth'
import { getAccountsWithBalances, getSnapshots, saveSnapshot } from '@/lib/db'
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Card, StatCard, Button, EmptyState } from '@/components/ui'
import AddAccountModal from '@/components/accounts/AddAccountModal'
import AccountRow from '@/components/accounts/AccountRow'
import NetWorthChart from '@/components/dashboard/NetWorthChart'
import AIInsights from '@/components/dashboard/AIInsights'
import ConnectBankButton from '@/components/accounts/ConnectBankButton'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const { accounts, snapshots, loading, setAccounts, setSnapshots, setLoading, totalAssets, totalLiabilities, netWorth } = useWealthStore()
  const [userId, setUserId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview'|'assets'|'liabilities'|'history'>('overview')
  const [snapshotting, setSnapshotting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUserId(user.id)
      const [accs, snaps] = await Promise.all([getAccountsWithBalances(user.id), getSnapshots(user.id)])
      setAccounts(accs); setSnapshots(snaps); setLoading(false)
    }
    load()
  }, [])

  async function handleSnapshot() {
    if (!userId) return
    setSnapshotting(true)
    await saveSnapshot(userId, totalAssets(), totalLiabilities())
    setSnapshots(await getSnapshots(userId))
    setSnapshotting(false)
  }

  const assets = accounts.filter(a => ASSET_CATEGORIES.includes(a.category))
  const liabs  = accounts.filter(a => LIABILITY_CATEGORIES.includes(a.category))
  const nw = netWorth()
  const prevNW = snapshots.length >= 2 ? snapshots[snapshots.length - 2].net_worth : null
  const change = prevNW !== null ? nw - prevNW : null
  const changePct = prevNW ? ((nw - prevNW) / Math.abs(prevNW)) * 100 : null

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assets', label: 'Assets (' + assets.length + ')' },
    { id: 'liabilities', label: 'Liabilities (' + liabs.length + ')' },
    { id: 'history', label: 'History' },
  ] as const

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading your finances...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-semibold text-gray-900">Wealthwise</span>
          </div>
          <div className="flex items-center gap-2">
            {userId && <ConnectBankButton userId={userId} />}
            <Button variant="ghost" size="sm" onClick={handleSnapshot} loading={snapshotting}>Snapshot</Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total net worth</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(nw)}</p>
          {change !== null && (
            <p className={change >= 0 ? 'text-sm font-medium text-emerald-600' : 'text-sm font-medium text-red-500'}>
              {change >= 0 ? 'up' : 'down'} {formatCurrency(Math.abs(change))} vs last snapshot
            </p>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total assets" value={formatCurrency(totalAssets(), true)} />
          <StatCard label="Total liabilities" value={formatCurrency(totalLiabilities(), true)} />
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={t.id === activeTab ? 'flex-1 text-xs font-medium py-2 px-1 rounded-xl bg-white text-gray-900 shadow-sm' : 'flex-1 text-xs font-medium py-2 px-1 rounded-xl text-gray-500'}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Assets</h2>
                <button onClick={() => setAddOpen(true)} className="text-xs text-gray-400 hover:text-gray-600">+ Add manually</button>
              </div>
              {assets.length ? assets.map(a => <AccountRow key={a.id} account={a} />) : (
                <EmptyState icon="📦" title="No assets yet" description="Connect your bank or add manually." />
              )}
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Liabilities</h2>
                <button onClick={() => setAddOpen(true)} className="text-xs text-gray-400 hover:text-gray-600">+ Add manually</button>
              </div>
              {liabs.length ? liabs.map(a => <AccountRow key={a.id} account={a} />) : (
                <EmptyState icon="🎉" title="No liabilities" description="Debt-free! Or add loans, mortgages, credit cards." />
              )}
            </Card>
            <Card>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Insights</h2>
              <AIInsights accounts={accounts} netWorth={nw} />
            </Card>
          </div>
        )}

        {activeTab === 'assets' && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">All assets</h2>
              <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)}>+ Add</Button>
            </div>
            {assets.length ? assets.map(a => <AccountRow key={a.id} account={a} />) : (
              <EmptyState icon="📦" title="No assets yet" description="Connect your bank or add manually."
                action={<Button size="sm" onClick={() => setAddOpen(true)}>Add manually</Button>} />
            )}
          </Card>
        )}

        {activeTab === 'liabilities' && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">All liabilities</h2>
              <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)}>+ Add</Button>
            </div>
            {liabs.length ? liabs.map(a => <AccountRow key={a.id} account={a} />) : (
              <EmptyState icon="🎉" title="No liabilities" description="Add mortgages, loans, and credit cards."
                action={<Button size="sm" onClick={() => setAddOpen(true)}>Add liability</Button>} />
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Net worth over time</h2>
              <Button size="sm" variant="secondary" onClick={handleSnapshot} loading={snapshotting}>Snapshot</Button>
            </div>
            <NetWorthChart snapshots={snapshots} />
            {snapshots.length > 0 && (
              <div className="mt-4">
                {[...snapshots].reverse().slice(0, 6).map(s => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.net_worth)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>

      {userId && <AddAccountModal open={addOpen} onClose={() => setAddOpen(false)} userId={userId} />}
    </div>
  )
}
