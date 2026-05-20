'use client'
import { AccountWithBalance, ASSET_CATEGORIES } from '@/types'

interface Insight { icon: string; text: string; type: 'tip' | 'warning' | 'good' }

function generateInsights(accounts: AccountWithBalance[]): Insight[] {
  const insights: Insight[] = []
  const assets = accounts.filter(a => ASSET_CATEGORIES.includes(a.category))
  const liabs  = accounts.filter(a => !ASSET_CATEGORIES.includes(a.category))
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0)
  const totalLiabs  = liabs.reduce((s, a) => s + a.balance, 0)

  const investTotal = assets.filter(a => ['investment','retirement','crypto'].includes(a.category)).reduce((s, a) => s + a.balance, 0)
  const investPct = totalAssets ? (investTotal / totalAssets) * 100 : 0
  if (investPct < 20 && totalAssets > 10000)
    insights.push({ icon: '📈', text: `Only ${investPct.toFixed(0)}% of your assets are invested. Most people your age target 40–60%.`, type: 'tip' })
  else if (investPct >= 40)
    insights.push({ icon: '✅', text: `${investPct.toFixed(0)}% of your assets are invested — you're building wealth the right way.`, type: 'good' })

  const debtRatio = totalAssets ? (totalLiabs / totalAssets) * 100 : 0
  if (debtRatio > 50)
    insights.push({ icon: '⚠️', text: `Debt is ${debtRatio.toFixed(0)}% of your assets. Focus on paying down high-interest debt first.`, type: 'warning' })
  else if (totalLiabs > 0)
    insights.push({ icon: '💪', text: `Debt-to-asset ratio is ${debtRatio.toFixed(0)}% — healthy. Keep it below 50%.`, type: 'good' })

  const crypto = assets.filter(a => a.category === 'crypto').reduce((s, a) => s + a.balance, 0)
  const cryptoPct = totalAssets ? (crypto / totalAssets) * 100 : 0
  if (cryptoPct > 20)
    insights.push({ icon: '₿', text: `Crypto is ${cryptoPct.toFixed(0)}% of your assets. High concentration — consider rebalancing.`, type: 'warning' })

  if (!insights.length)
    insights.push({ icon: '🎯', text: 'Add more accounts to get personalized insights about your financial health.', type: 'tip' })

  return insights.slice(0, 3)
}

const colors = { tip: 'bg-blue-50 text-blue-800 border-blue-100', warning: 'bg-amber-50 text-amber-800 border-amber-100', good: 'bg-emerald-50 text-emerald-800 border-emerald-100' }

export default function AIInsights({ accounts, netWorth }: { accounts: AccountWithBalance[]; netWorth: number }) {
  return (
    <div className="space-y-2">
      {generateInsights(accounts).map((insight, i) => (
        <div key={i} className={`flex gap-3 p-3 rounded-xl border text-sm ${colors[insight.type]}`}>
          <span className="flex-shrink-0">{insight.icon}</span>
          <p className="leading-relaxed">{insight.text}</p>
        </div>
      ))}
    </div>
  )
}
