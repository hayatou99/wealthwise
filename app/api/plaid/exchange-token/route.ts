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

function mapPlaidType(type: string, subtype: string | null): string {
  if (type === 'depository') return 'cash'
  if (type === 'investment') return 'investment'
  if (type === 'loan' && subtype === 'mortgage') return 'mortgage'
  if (type === 'loan') return 'loan'
  if (type === 'credit') return 'credit'
  return 'other_asset'
}

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution_name, accounts } = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await plaidClient.itemPublicTokenExchange({ public_token })
    const access_token = data.access_token
    const item_id = data.item_id

    await supabase.from('plaid_items').insert({
      user_id: user.id,
      access_token,
      item_id,
      institution_name,
    })

    const balanceResponse = await plaidClient.accountsBalanceGet({ access_token })

    for (const plaidAccount of balanceResponse.data.accounts) {
      const category = mapPlaidType(plaidAccount.type, plaidAccount.subtype)
      const type = ['mortgage', 'loan', 'credit', 'other_liability'].includes(category) ? 'liability' : 'asset'

      const { data: account } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: plaidAccount.name,
        category,
        type,
        institution: institution_name,
        is_manual: false,
        plaid_account_id: plaidAccount.account_id,
      }).select().single()

      if (account) {
        await supabase.from('balances').insert({
          account_id: account.id,
          user_id: user.id,
          value: plaidAccount.balances.current || 0,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Plaid exchange token error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
