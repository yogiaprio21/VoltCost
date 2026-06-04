import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Field, PasswordInput, toast } from '@components/UI'
import { api } from '../services/api'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordError = password && password.length < 8 ? 'Password minimal 8 karakter.' : null
  const confirmError = confirmPassword && password !== confirmPassword ? 'Konfirmasi password belum sama.' : null
  const isValid = Boolean(password && confirmPassword && !passwordError && !confirmError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password berhasil diperbarui.')
      navigate('/login', { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <div className="space-y-7">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Atur password baru</h1>
          <p className="text-sm leading-6 text-slate-600">Gunakan password minimal 8 karakter agar akses akun tetap aman.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Password baru" error={passwordError}>
            <PasswordInput autoComplete="new-password" required placeholder="Password baru" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Konfirmasi password" error={confirmError}>
            <PasswordInput autoComplete="new-password" required placeholder="Ulangi password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" icon="lock" loading={loading} disabled={!isValid}>Simpan password</Button>
        </form>
      </div>
    </Card>
  )
}
