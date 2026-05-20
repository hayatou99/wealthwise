'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    setError(''); setLoading(true)
    const supabase = createClient()
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) { setError(error.message); setLoading(false); return }
      setSent(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">We sent a confirmation link to <strong>{email}</strong></p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Wealthwise</h1>
          <p className="text-sm text-gray-500 mt-1">Your complete financial picture</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-all ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>
          {mode === 'signup' && <Input label="Full name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />}
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button className="w-full" loading={loading} onClick={handleSubmit}>
            {mode === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400">Simple, private net worth tracking. No ads. No upsells.</p>
      </div>
    </div>
  )
}
