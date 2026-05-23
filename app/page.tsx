import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Wealthwise</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-sm text-gray-500 hover:text-gray-900">Log in</Link>
          <Link href="/auth" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          ✨ Free. No ads. No upsells.
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Know your exact<br />net worth today
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          The simplest way to track everything you own and owe in one place. Connect your banks, see your net worth grow, and actually understand your finances.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/auth" className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-base font-medium hover:bg-gray-700 transition-all active:scale-95">
            Start tracking free →
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🏦', title: 'Connect your banks', desc: 'Securely link checking, savings, investments, and loans. Balances update automatically.' },
            { icon: '📈', title: 'Watch your wealth grow', desc: 'Track your net worth over time with beautiful charts. See exactly how far you have come.' },
            { icon: '💡', title: 'Get smart insights', desc: 'AI-powered tips tailored to your financial picture. Know what to focus on next.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for young professionals</h2>
          <p className="text-gray-500 mb-12">Finally a net worth tracker that is simple enough to actually use every week.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { stat: '2 min', label: 'To set up your dashboard' },
              { stat: '$0', label: 'To get started forever' },
              { stat: '100%', label: 'Private — your data is yours' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-6">
                <p className="text-4xl font-bold text-gray-900 mb-1">{s.stat}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to know your net worth?</h2>
          <p className="text-gray-400 mb-8">Join young professionals taking control of their finances.</p>
          <Link href="/auth" className="inline-flex items-center bg-white text-gray-900 px-8 py-3.5 rounded-2xl text-base font-medium hover:bg-gray-100 transition-all active:scale-95">
            Get started free →
          </Link>
          <p className="text-gray-500 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-sm text-gray-500">Wealthwise</span>
        </div>
        <p className="text-sm text-gray-400">Simple, private, free.</p>
      </footer>
    </div>
  )
}
