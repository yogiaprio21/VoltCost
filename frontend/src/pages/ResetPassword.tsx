import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, toast, Card } from '@components/UI'
import { api } from '../services/api'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return toast.error('Password tidak cocok')
        }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password })
            toast.success('Password diperbarui!')
            navigate('/login')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-8 space-y-8 shadow-2xl border-0">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Password Baru</h2>
                    <p className="text-slate-500 font-medium text-center">Atur ulang akses akun Anda.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                        <Input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 px-5 bg-slate-50 border-slate-100"
                        />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                        <Input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 px-5 bg-slate-50 border-slate-100"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-sm font-black tracking-widest uppercase"
                    >
                        {loading ? 'Memperbarui...' : 'UPDATE PASSWORD'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
