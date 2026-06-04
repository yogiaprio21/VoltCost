import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Card, ErrorAlert, Field, Input, PasswordInput, toast } from '@components/UI'
import Icon from '@components/Icon'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const emailError = useMemo(() => email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Format email belum valid.' : null, [email])
  const passwordError = useMemo(() => password && password.length < 8 ? 'Password minimal 8 karakter.' : null, [password])
  const nameError = useMemo(() => name && name.trim().length < 2 ? 'Nama terlalu pendek.' : null, [name])
  const isFormValid = Boolean(name.trim() && email && password && !nameError && !emailError && !passwordError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setError('')
    setLoading(true)
    try {
      await register({ name: name.trim(), email, password })
      toast.success('Akun dibuat. Anda sudah masuk.')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal membuat akun.'
      setError(message)
      toast.error('Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="hidden bg-slate-950 p-10 text-white lg:block">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-6">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <Icon name="shield" className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Bangun portfolio estimasi yang terlihat matang.</h1>
              <p className="text-sm leading-6 text-slate-300">
                Akun gratis menyimpan histori proyek, mengaktifkan penyesuaian rincian, dan menjaga PDF tetap konsisten.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Riwayat estimasi pribadi</div>
            <div className="flex items-center gap-3"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Export PDF proposal</div>
            <div className="flex items-center gap-3"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Edit breakdown material</div>
          </div>
        </div>
      </aside>

      <section className="bg-white p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Buat akun VoltCost</h2>
            <p className="text-sm leading-6 text-slate-600">Setelah akun dibuat, Anda akan langsung masuk ke dashboard.</p>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Nama lengkap" error={nameError}>
              <Input
                type="text"
                autoComplete="name"
                required
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

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
                autoComplete="new-password"
                required
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button type="submit" className="w-full" icon="user" loading={loading} disabled={!isFormValid}>
              Buat akun dan masuk
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Sudah punya akun? <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800">Masuk</Link>
          </p>
        </div>
      </section>
    </Card>
  )
}
