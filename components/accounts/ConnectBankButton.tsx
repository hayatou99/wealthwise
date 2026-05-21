'use client'
import { useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from '@/components/ui'
import { useWealthStore } from '@/store/wealth'
import { getAccountsWithBalances } from '@/lib/db'
import { createClient } from '@/lib/supabase'

interface Props { userId: string }

export default function ConnectBankButton({ userId }: Props) {
  const setAccounts = useWealthStore(s => s.setAccounts)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function getLinkToken() {
    setLoading(true)
    const res = await fetch('/api/plaid/create-link-token', { method: 'POST' })
    const data = await res.json()
    if (data.link_token) {
      setLinkToken(data.link_token)
    } else {
      console.error('Failed to get link token:', data)
    }
    setLoading(false)
  }

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    setLoading(true)
    const res = await fetch('/api/plaid/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_token,
        institution_name: metadata.institution?.name,
        accounts: metadata.accounts,
      }),
    })
    const data = await res.json()
    console.log('Exchange result:', data)

    // Refresh accounts from database
    const updated = await getAccountsWithBalances(userId)
    setAccounts(updated)
    setLoading(false)

    // Force full page refresh to show new accounts
    window.location.reload()
  }, [userId])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  })

  if (!linkToken) {
    return (
      <Button variant="secondary" size="sm" loading={loading} onClick={getLinkToken}>
        🏦 Connect bank
      </Button>
    )
  }

  return (
    <Button variant="secondary" size="sm" loading={loading || !ready} onClick={() => open()}>
      🏦 Connect bank
    </Button>
  )
}
