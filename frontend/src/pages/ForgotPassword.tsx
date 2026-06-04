import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, EmptyState, Field, Input, toast } from '@components/UI'
import { api } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setIsSent(true)
      toast.success('Instruksi pemulihan dikirim.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim instruksi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      {!isSent ? (
        <div className="space-y-7">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Pulihkan password</h1>
            <p className="text-sm leading-6 text-slate-600">Masukkan email akun. Jika terdaftar, tautan reset akan dikirim ke inbox Anda.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email akun">
              <Input type="email" required autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button type="submit" className="w-full" icon="mail" loading={loading}>Kirim tautan reset</Button>
          </form>
          <Link to="/login" className="block text-center text-sm font-semibold text-sky-700 hover:text-sky-800">Kembali ke login</Link>
        </div>
      ) : (
        <EmptyState
          icon="mail"
          title="Instruksi sudah dikirim"
          description="Silakan cek email Anda dan ikuti tautan pemulihan. Tautan reset hanya berlaku sementara."
          action={<Link to="/login" className="text-sm font-semibold text-sky-700 hover:text-sky-800">Kembali ke login</Link>}
        />
      )}
    </Card>
  )
}
