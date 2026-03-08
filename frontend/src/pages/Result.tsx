import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { EstimateResponse, CostLine } from '@app-types/index'
import { Card, Button } from '@components/UI'
import BreakdownTable from '@components/BreakdownTable'
import { formatCurrency } from '@utils/format'
import CostPie from '@components/charts/CostPie'
import { downloadPdf, updateEstimate } from '@services/estimate'
import { useAuth } from '../hooks/useAuth'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const initialData = location.state as EstimateResponse | undefined

  const [data, setData] = useState<EstimateResponse | undefined>(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!data) {
    return (
      <Card>
        <div className="mb-4 text-gray-600">Belum ada hasil. Silakan buat estimasi terlebih dahulu.</div>
        <Button onClick={() => navigate('/')}>Ke Form Estimasi</Button>
      </Card>
    )
  }

  const handleEditLine = (index: number, newQty: number) => {
    if (!data) return
    const newLines = [...data.breakdown.cost.lines]
    newLines[index] = { ...newLines[index], quantity: newQty }

    // Recalculate locally
    const subtotal = newLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
    const labor = Math.round(subtotal * 0.15)
    const premium = data.breakdown.cost.premium > 0 ? Math.round((subtotal + labor) * 0.2) : 0
    const total = subtotal + labor + premium

    setData({
      ...data,
      breakdown: {
        ...data.breakdown,
        cost: { ...data.breakdown.cost, lines: newLines, subtotal, labor, premium, total }
      }
    })
  }

  const handleSave = async () => {
    if (!data) return
    setLoading(true)
    try {
      const updated = await updateEstimate(data.id, {
        lines: data.breakdown.cost.lines,
        installationType: data.breakdown.cost.premium > 0 ? 'premium' : 'standard'
      })
      setData(updated)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save override:', err)
      alert('Gagal menyimpan perubahan.')
    } finally {
      setLoading(false)
    }
  }

  const cost = data.breakdown.cost

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="overflow-hidden border-0 shadow-xl shadow-blue-100/50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Estimasi Biaya</h2>
            <div className="text-4xl font-bold mt-1">{formatCurrency(cost.total)}</div>
          </div>
          {user && (
            <Button
              className={isEditing ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200/50 text-white px-6 py-2" : "bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10 px-6 py-2 flex items-center gap-2 border-0"}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              )}
              {isEditing ? 'Simpan Perubahan' : 'Sesuaikan Rincian'}
            </Button>
          )}
        </div>

        <div className="p-6">
          <BreakdownTable
            lines={cost.lines}
            isEditable={isEditing}
            onEdit={handleEditLine}
          />

          <div className="mt-8 flex flex-col md:flex-row justify-between gap-8 border-t pt-8">
            <div className="space-y-4 flex-1">
              <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Metrik Kebutuhan</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-xl"><span className="text-gray-500 block">Kabel (m)</span> <span className="font-bold text-gray-900 text-lg">{data.breakdown.metrics.cableLength}</span></div>
                <div className="bg-gray-50 p-3 rounded-xl"><span className="text-gray-500 block">Titik Lampu</span> <span className="font-bold text-gray-900 text-lg">{data.breakdown.metrics.lampPoints}</span></div>
                <div className="bg-gray-50 p-3 rounded-xl"><span className="text-gray-500 block">Sirkuit (Grup)</span> <span className="font-bold text-gray-900 text-lg">{data.breakdown.metrics.circuits}</span></div>
                <div className="bg-gray-50 p-3 rounded-xl"><span className="text-gray-500 block">Conduit (m)</span> <span className="font-bold text-gray-900 text-lg">{data.breakdown.metrics.conduitLength}</span></div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl min-w-[300px] border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600"><span>Subtotal Material</span> <span>{formatCurrency(cost.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Jasa Instalasi (15%)</span> <span>{formatCurrency(cost.labor)}</span></div>
                {cost.premium > 0 && <div className="flex justify-between text-blue-600 font-medium"><span>Premium Surcharge (20%)</span> <span>{formatCurrency(cost.premium)}</span></div>}
                <div className="pt-4 border-t border-gray-200 mt-2 flex justify-between items-end">
                  <span className="text-gray-900 font-bold uppercase text-xs">Total Akhir</span>
                  <span className="text-3xl font-black text-blue-700 leading-none">{formatCurrency(cost.total)}</span>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full py-4 shadow-xl shadow-blue-200 flex items-center justify-center gap-3" onClick={() => downloadPdf(data.id)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Cetak PDF Estimasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Komposisi Biaya
          </h3>
          <div className="h-[250px] flex items-center justify-center">
            <CostPie subtotal={cost.subtotal} labor={cost.labor} premium={cost.premium} />
          </div>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold">Butuh Bantuan Instalasi?</h3>
          <p className="text-gray-400 text-sm max-w-[200px]">Konsultasikan hasil ini dengan teknisi bersertifikat kami untuk akurasi lokasi.</p>
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <Button
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black px-8 py-5 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
              onClick={() => downloadPdf(data.id)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Cetak PDF Estimasi
            </Button>
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100 font-black px-8 py-5 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
              onClick={() => window.open('https://wa.me/6282249238906', '_blank')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              Hubungi Kami
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
