import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Card, ErrorAlert, Field, Input, PasswordInput, toast } from '@components/UI'
import Icon from '@components/Icon'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const emailError = useMemo(() => email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Format email belum valid.' : null, [email])
  const passwordError = useMemo(() => password && password.length < 8 ? 'Password minimal 8 karakter.' : null, [password])
  const isFormValid = Boolean(email && password && !emailError && !passwordError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Selamat datang kembali.')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal masuk. Periksa kembali email dan password Anda.'
      setError(message)
      toast.error('Gagal masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="hidden bg-slate-950 p-10 text-white lg:block">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-6">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-sky-500/15 text-sky-300">
              <Icon name="zap" className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Estimasi biaya listrik yang lebih rapi dan dapat diaudit.</h1>
              <p className="text-sm leading-6 text-slate-300">
                Simpan riwayat proyek, sesuaikan rincian material, dan unduh proposal PDF dari satu tempat.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-sky-300">15%</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Jasa terpisah</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-emerald-300">PDF</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Siap dibagikan</div>
            </div>
          </div>
        </div>
      </aside>

      <section className="bg-white p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Masuk ke akun</h2>
            <p className="text-sm leading-6 text-slate-600">Gunakan akun VoltCost untuk membuka riwayat estimasi dan fitur penyesuaian.</p>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email" error={emailError}>
              <Input
                type="email"
                autoComplete="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Password" hint="Minimal 8 karakter" error={passwordError}>
              <PasswordInput
                autoComplete="current-password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between gap-3 text-sm">
              <Link to="/forgot-password" className="font-semibold text-sky-700 hover:text-sky-800">Lupa password?</Link>
              <span className="text-slate-500">Belum punya akun?</span>
            </div>

            <Button type="submit" className="w-full" icon="logIn" loading={loading} disabled={!isFormValid}>
              Masuk
            </Button>
          </form>

          <Button type="button" tone="ghost" className="w-full" onClick={() => navigate('/register')}>
            Buat akun baru
          </Button>
        </div>
      </section>
    </Card>
  )
}
