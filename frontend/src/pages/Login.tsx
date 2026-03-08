import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, PasswordInput, toast, Card } from '@components/UI'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    // Real-time validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPasswordValid = password.length >= 8
    const isFormValid = isEmailValid && isPasswordValid

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        setError('')
        setLoading(true)
        try {
            await login({ email, password })
            toast.success('Selamat Datang Kembali!')
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
            toast.error('Gagal Masuk')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-0 overflow-hidden border-0 shadow-2xl shadow-blue-100/50 flex flex-col lg:flex-row min-h-[600px]">
                {/* Sisi Kiri: Branding Visual (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-900/60 z-0"></div>
                    <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

                    <div className="relative z-10 w-full space-y-8">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter leading-none italic">
                                Volt<span className="text-blue-500">Cost.</span>
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-md">
                                Platform estimasi biaya instalasi listrik tercanggih untuk kebutuhan Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                                <div className="text-blue-400 font-bold text-2xl mb-1">99%</div>
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Akurasi</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                                <div className="text-indigo-400 font-bold text-2xl mb-1">&lt; 1 Menit</div>
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Kecepatan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sisi Kanan: Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
                    <div className="w-full max-w-sm space-y-10">
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Masuk Kembali</h2>
                            <p className="text-slate-500 font-medium">Lanjutkan progres estimasi Anda sekarang.</p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
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
                                    className={`h-12 px-5 bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 transition-all font-medium ${email && !isEmailValid ? 'border-red-200 ring-4 ring-red-50' : 'focus:ring-blue-50'}`}
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Password</label>
                                        {password && (
                                            <span className={`text-[10px] font-bold ${isPasswordValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {isPasswordValid ? '✓' : 'Min. 8 Karakter'}
                                            </span>
                                        )}
                                    </div>
                                    <Link to="/forgot-password" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Lupa Password?</Link>
                                </div>
                                <PasswordInput
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    className={`h-12 px-5 bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 transition-all font-medium ${password && !isPasswordValid ? 'border-amber-200 ring-4 ring-amber-50' : 'focus:ring-blue-50'}`}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`w-full py-4 font-black tracking-widest uppercase rounded-2xl transition-all ${!isFormValid ? 'opacity-50 grayscale' : '!bg-slate-900 !text-white hover:!bg-blue-600 shadow-xl shadow-blue-100'}`}
                            >
                                {loading ? 'Mengautentikasi...' : 'MULAI KELOLA'}
                            </Button>
                        </form>

                        <div className="pt-8 text-center border-t border-slate-50">
                            <p className="text-slate-500 font-medium">
                                Baru di VoltCost?{' '}
                                <Link to="/register" className="text-blue-600 font-extrabold hover:underline uppercase tracking-tight text-sm">
                                    Daftar Sekarang
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
