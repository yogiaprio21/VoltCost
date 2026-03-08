import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, PasswordInput, toast, Card } from '@components/UI'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    // Real-time validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPasswordValid = password.length >= 8
    const isFormValid = name.trim() !== '' && isEmailValid && isPasswordValid

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        setError('')
        setLoading(true)
        try {
            await register({ name, email, password })
            toast.success('Pendaftaran Berhasil! Silakan Masuk.')
            navigate('/login')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mendaftar.')
            toast.error('Gagal Mendaftar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-0 overflow-hidden border-0 shadow-2xl shadow-indigo-100/50 flex flex-col lg:flex-row min-h-[600px]">
                {/* Sisi Kiri: Visual Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden text-white">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 to-blue-600/40 z-0"></div>

                    <div className="relative z-10 w-full space-y-10">
                        <div className="space-y-6">
                            <div className="w-16 h-1.5 bg-blue-500 rounded-full"></div>
                            <h2 className="text-5xl font-black tracking-tighter leading-tight italic">
                                Efisiensi Tanpa Batas.
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed">
                                Gabunglah dengan ribuan teknisi yang menghemat waktu dan biaya dengan platform kami.
                            </p>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <div className="text-sm font-bold text-slate-200 uppercase tracking-widest text-[10px]">Data Terenkripsi Aman</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <div className="text-sm font-bold text-slate-200 uppercase tracking-widest text-[10px]">Laporan PDF Instan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sisi Kanan: Register Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
                    <div className="w-full max-w-sm space-y-8">
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Buat Akun Baru</h2>
                            <p className="text-slate-500 font-medium whitespace-nowrap">Nikmati akses penuh ke semua fitur laporan.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Nama Lengkap</label>
                                <Input
                                    type="text"
                                    required
                                    placeholder="Joko Widodo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 px-5 bg-slate-50 border-slate-100"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Email Address</label>
                                    {email && (
                                        <span className={`text-[10px] font-bold ${isEmailValid ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isEmailValid ? 'Email Valid' : 'Format Email Salah'}
                                        </span>
                                    )}
                                </div>
                                <Input
                                    type="email"
                                    required
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`h-12 px-5 bg-slate-50 border-slate-100 ${email && !isEmailValid ? 'border-red-200 ring-2 ring-red-50' : ''}`}
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Password</label>
                                    {password && (
                                        <span className={`text-[10px] font-bold ${isPasswordValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {isPasswordValid ? 'Password Cukup' : 'Min. 8 Karakter'}
                                        </span>
                                    )}
                                </div>
                                <PasswordInput
                                    required
                                    placeholder="Min. 8 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`h-12 px-5 bg-slate-50 border-slate-100 ${password && !isPasswordValid ? 'border-amber-200 ring-2 ring-amber-50' : ''}`}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`w-full py-4 font-black tracking-widest uppercase rounded-2xl transition-all ${!isFormValid ? 'opacity-50 grayscale' : '!bg-indigo-600 !text-white hover:!bg-indigo-700'}`}
                            >
                                {loading ? 'Mendaftar...' : 'DAFTAR SEKARANG'}
                            </Button>
                        </form>

                        <div className="pt-8 text-center border-t border-slate-50">
                            <p className="text-slate-500 font-medium">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-blue-600 font-extrabold hover:underline uppercase tracking-tight text-sm">
                                    Masuk Saja
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
