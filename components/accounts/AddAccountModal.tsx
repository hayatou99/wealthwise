'use client'
import { useState } from 'react'
import { Modal, Button, Input, Select } from '@/components/ui'
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES, CATEGORY_META, AccountCategory, AccountType } from '@/types'
import { createAccount } from '@/lib/db'
import { useWealthStore } from '@/store/wealth'

interface Props { open: boolean; onClose: () => void; userId: string }

export default function AddAccountModal({ open, onClose, userId }: Props) {
  const addAccount = useWealthStore(s => s.addAccount)
  const [type, setType] = useState<AccountType>('asset')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AccountCategory>('cash')
  const [institution, setInst] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryOptions = (type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES)
    .map(c => ({ value: c, label: CATEGORY_META[c].label }))

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    const numVal = parseFloat(value)
    if (isNaN(numVal) || numVal < 0) { setError('Enter a valid value'); return }
    setLoading(true); setError('')
    try {
      const account = await createAccount(userId, { name: name.trim(), category, type, institution: institution.trim() || undefined, value: numVal })
      addAccount({ ...account, balance: numVal, recorded_at: new Date().toISOString() })
      handleClose()
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  function handleClose() {
    setName(''); setCategory('cash'); setInst(''); setValue(''); setError(''); onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add account">
      <div className="space-y-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['asset', 'liability'] as AccountType[]).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory(t === 'asset' ? 'cash' : 'mortgage') }}
              className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-all ${type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {t === 'asset' ? 'Asset' : 'Liability'}
            </button>
          ))}
        </div>
        <Input label="Account name" placeholder="e.g. Chase Savings" value={name} onChange={e => setName(e.target.value)} />
        <Select label="Category" options={categoryOptions} value={category} onChange={e => setCategory(e.target.value as AccountCategory)} />
        <Input label="Institution (optional)" placeholder="e.g. Chase, Vanguard" value={institution} onChange={e => setInst(e.target.value)} />
        <Input label="Current value" prefix="$" type="number" min="0" placeholder="0" value={value} onChange={e => setValue(e.target.value)} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={handleSave}>Save account</Button>
        </div>
      </div>
    </Modal>
  )
}
