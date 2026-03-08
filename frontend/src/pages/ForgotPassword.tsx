import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, toast, Card } from '@components/UI'
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
            toast.success('Instruksi dikirim!')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal mengirim.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-8 space-y-8 shadow-2xl border-0">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Lupa Password</h2>
                    <p className="text-slate-500 font-medium text-center">Kami akan mengirimkan tautan pemulihan.</p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Anda</label>
                            <Input
                                type="email"
                                required
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 px-5 bg-slate-50 border-slate-100"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-sm font-black tracking-widest uppercase"
                        >
                            {loading ? 'Mengirim...' : 'KIRIM TAUTAN'}
                        </Button>
                    </form>
                ) : (
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="font-bold text-blue-900">Email Terkirim</h3>
                        <p className="text-blue-700 text-sm">Cek kotak masuk email Anda untuk instruksi selanjutnya.</p>
                    </div>
                )}

                <div className="pt-6 text-center border-t border-slate-50">
                    <Link to="/login" className="text-blue-600 font-bold text-sm">
                        Kembali ke Login
                    </Link>
                </div>
            </Card>
        </div>
    )
}
