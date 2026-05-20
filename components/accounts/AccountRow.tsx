'use client'
import { useState } from 'react'
import { AccountWithBalance, CATEGORY_META } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { deleteAccount } from '@/lib/db'
import { useWealthStore } from '@/store/wealth'

export default function AccountRow({ account }: { account: AccountWithBalance }) {
  const removeAccount = useWealthStore(s => s.removeAccount)
  const [deleting, setDeleting] = useState(false)
  const meta = CATEGORY_META[account.category]

  async function handleDelete() {
    if (!confirm(`Remove "${account.name}"?`)) return
    setDeleting(true)
    await deleteAccount(account.id)
    removeAccount(account.id)
  }

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 ${deleting ? 'opacity-40' : ''}`}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: meta.bg }}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{account.name}</p>
        <p className="text-xs text-gray-400">{meta.label}{account.institution ? ` · ${account.institution}` : ''}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(account.balance)}</p>
      <button onClick={handleDelete} disabled={deleting}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
