import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select } from '@components/UI'
import type { EstimateInput, EstimateResponse } from '@app-types/index'
import { createEstimate } from '@services/estimate'

const capacities: Array<EstimateInput['powerCapacity']> = [900, 1300, 2200, 3500]

export default function EstimateFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<EstimateInput>({
    houseArea: 100,
    lampPoints: 10,
    socketPoints: 10,
    acCount: 1,
    pumpCount: 0,
    powerCapacity: 2200,
    installationType: 'standard'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onChange<K extends keyof EstimateInput>(key: K, val: EstimateInput[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function onSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res: EstimateResponse = await createEstimate(form)
      navigate('/result', { state: res })
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Gagal menghitung estimasi.')
    } finally {
      setLoading(false)
    }
  }

  const numField = (k: keyof EstimateInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    onChange(k, (isNaN(val) ? 0 : val) as any)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mulai <span className="text-blue-600">Estimasi</span> Anda</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Lengkapi detail di bawah ini untuk mendapatkan rincian biaya instalasi listrik yang akurat dan transparan.</p>
      </div>

      <Card className="overflow-hidden border-0 shadow-2xl shadow-blue-100/50 p-0">
        <div className="grid md:grid-cols-12">
          {/* Section Information */}
          <div className="md:col-span-4 bg-slate-900 p-8 text-white space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold italic underline decoration-blue-500 underline-offset-8">Panduan Cepat</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gunakan angka meteran rill untuk luas rumah. Jumlah titik lampu dan stopkontak akan sangat mempengaruhi panjang kabel yang dibutuhkan.
              </p>
            </div>

            <div className="pt-8 border-t border-slate-800">
              <div className="flex items-center gap-4 group cursor-help">
                <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-xs font-black group-hover:border-blue-500 group-hover:text-blue-500 transition-all">01</div>
                <div className="text-xs font-bold text-slate-500 group-hover:text-slate-300">ISI DATA BANGUNAN</div>
              </div>
              <div className="w-px h-8 bg-slate-800 ml-5" />
              <div className="flex items-center gap-4 group cursor-help">
                <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-xs font-black">02</div>
                <div className="text-xs font-bold text-slate-500">HITUNG OTOMATIS</div>
              </div>
              <div className="w-px h-8 bg-slate-800 ml-5" />
              <div className="flex items-center gap-4 group cursor-help">
                <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-xs font-black">03</div>
                <div className="text-xs font-bold text-slate-500">SESUAIKAN RINCIAN</div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="md:col-span-8 p-8 bg-white">
            <div className="grid gap-8">
              {/* Group 1: Area & Main Settings */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                  <span className="w-6 h-px bg-blue-200"></span>
                  Dimensi & Kapasitas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 block">Luas Rumah (m²)</label>
                    <Input type="number" min={1} value={form.houseArea} onChange={numField('houseArea')} className="py-3 px-4 bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 block text-left">Daya Listrik (VA)</label>
                    <Select value={form.powerCapacity} onChange={e => onChange('powerCapacity', Number(e.target.value) as any)} className="py-3 px-4 bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500">
                      {capacities.map(c => <option key={c} value={c}>{c} VA</option>)}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Group 2: Installation Points */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                  <span className="w-6 h-px bg-blue-200"></span>
                  Titik Instalasi Standar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block text-left">Titik Lampu</label>
                    <Input type="number" min={0} value={form.lampPoints} onChange={numField('lampPoints')} className="py-3 px-4 bg-slate-50 border-0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block text-left">Stopkontak</label>
                    <Input type="number" min={0} value={form.socketPoints} onChange={numField('socketPoints')} className="py-3 px-4 bg-slate-50 border-0" />
                  </div>
                </div>
              </div>

              {/* Group 3: Heavy Appliances */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                  <span className="w-6 h-px bg-blue-200"></span>
                  Peralatan Daya Besar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block text-left">Jumlah AC</label>
                    <Input type="number" min={0} value={form.acCount} onChange={numField('acCount')} className="py-3 px-4 bg-slate-50 border-0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block text-left">Pompa Air</label>
                    <Input type="number" min={0} value={form.pumpCount} onChange={numField('pumpCount')} className="py-3 px-4 bg-slate-50 border-0" />
                  </div>
                </div>
              </div>

              {/* Group 4: Quality */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1 w-full text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5 text-left">Quality Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                    {['standard', 'premium'].map(type => (
                      <button
                        key={type}
                        onClick={() => onChange('installationType', type as any)}
                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${form.installationType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full sm:w-auto mt-auto">
                  <Button
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full sm:w-48 py-4 shadow-xl shadow-blue-200"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Menghitung...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Lihat Hasilnya
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 pt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="flex items-center gap-2 font-black text-slate-400 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.616.92v5.352c0 3.37-1.932 6.36-4.992 7.713L10 20l-3.458-1.115C3.482 17.532 1.55 14.54 1.55 11.17V5.82a1 1 0 01.616-.92zM10 3.193L3.55 5.954V11.17a6.666 6.666 0 003.88 6.095L10 18.286l2.57-1.021A6.666 6.666 0 0016.45 11.17V5.954L10 3.193z" clipRule="evenodd"></path></svg>
          STANDAR PLN
        </div>
        <div className="flex items-center gap-2 font-black text-slate-400 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
          AKURASI 98%
        </div>
        <div className="flex items-center gap-2 font-black text-slate-400 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
          CEPAT & RILL
        </div>
      </div>
    </div>
  )
}
