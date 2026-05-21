import { NextRequest, NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[(process.env.PLAID_ENV as keyof typeof PlaidEnvironments) || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}))

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: items } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', user.id)

    if (!items?.length) return NextResponse.json({ updated: 0 })

    let updated = 0
    for (const item of items) {
      const { data: balanceData } = await plaidClient.accountsBalanceGet({
        access_token: item.access_token
      })

      for (const plaidAccount of balanceData.accounts) {
        const { data: account } = await supabase
          .from('accounts')
          .select('id')
          .eq('plaid_account_id', plaidAccount.account_id)
          .eq('user_id', user.id)
          .single()

        if (account) {
          await supabase.from('balances').insert({
            account_id: account.id,
            user_id: user.id,
            value: plaidAccount.balances.current || 0,
          })
          updated++
        }
      }
    }

    return NextResponse.json({ updated })
  } catch (error: any) {
    console.error('Plaid sync error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
