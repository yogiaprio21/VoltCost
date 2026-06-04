import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import type { EstimateResponse } from '@app-types/index'
import { Button, Card, EmptyState, ErrorAlert, PageHeader, StatCard, toast } from '@components/UI'
import BreakdownTable from '@components/BreakdownTable'
import { formatCurrency } from '@utils/format'
import CostPie from '@components/charts/CostPie'
import { downloadPdf, updateEstimate } from '@services/estimate'
import { useAuth } from '../hooks/useAuth'
import Icon from '@components/Icon'

function calculatePreview(lines: EstimateResponse['breakdown']['cost']['lines'], isPremium: boolean) {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const labor = Math.round(subtotal * 0.15)
  const premium = isPremium ? Math.round((subtotal + labor) * 0.2) : 0
  return { subtotal, labor, premium, total: subtotal + labor + premium }
}

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const initialData = location.state as EstimateResponse | undefined

  const [data, setData] = useState<EstimateResponse | undefined>(initialData)
  const [draftLines, setDraftLines] = useState(initialData?.breakdown.cost.lines || [])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cost = data?.breakdown.cost
  const isPremium = Boolean(cost && cost.premium > 0)
  const preview = useMemo(() => calculatePreview(draftLines, isPremium), [draftLines, isPremium])

  if (!data || !cost) {
    return (
      <EmptyState
        icon="clipboard"
        title="Belum ada hasil estimasi"
        description="Buat estimasi terlebih dahulu agar VoltCost dapat menampilkan rincian biaya dan PDF."
        action={<Button icon="arrowLeft" onClick={() => navigate('/')}>Ke form estimasi</Button>}
      />
    )
  }

  const metrics = data.breakdown.metrics || {}

  const handleEditLine = (index: number, newQty: number) => {
    setDraftLines((prev) => prev.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: newQty } : line))
  }

  const handleStartEdit = () => {
    setDraftLines(cost.lines)
    setIsEditing(true)
    setError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateEstimate(data.id, {
        lines: draftLines,
        installationType: isPremium ? 'premium' : 'standard'
      })
      setData(updated)
      setDraftLines(updated.breakdown.cost.lines)
      setIsEditing(false)
      toast.success('Rincian estimasi tersimpan.')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan perubahan.'
      setError(message)
      toast.error('Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadPdf(data.id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengunduh PDF')
    } finally {
      setDownloading(false)
    }
  }

  const displayedCost = isEditing ? preview : cost

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hasil estimasi #${data.id}`}
        description="Rincian biaya berikut disimpan dari calculation engine backend. Jika Anda mengubah kuantitas, simpan dulu agar PDF dan database ikut diperbarui."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button tone="ghost" icon="arrowLeft" onClick={() => navigate('/')}>Buat baru</Button>
            <Button icon="download" loading={downloading} onClick={handleDownload}>Unduh PDF</Button>
          </div>
        }
      />

      {error && <ErrorAlert message={error} />}

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label={isEditing ? 'Total pratinjau' : 'Total estimasi'} value={formatCurrency(displayedCost.total)} icon="zap" subtext={isEditing ? 'Belum tersimpan' : 'Tersimpan'} />
        <StatCard label="Material" value={formatCurrency(displayedCost.subtotal)} icon="package" tone="neutral" />
        <StatCard label="Jasa 15%" value={formatCurrency(displayedCost.labor)} icon="user" tone="success" />
        <StatCard label="Premium" value={formatCurrency(displayedCost.premium)} icon="spark" tone={displayedCost.premium > 0 ? 'primary' : 'neutral'} />
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Breakdown material dan jasa</h2>
            <p className="mt-1 text-sm text-slate-600">Kuantitas dapat disesuaikan untuk akun yang sudah login.</p>
          </div>
          {user && (
            <div className="flex gap-2">
              {isEditing && <Button tone="ghost" onClick={() => { setDraftLines(cost.lines); setIsEditing(false) }}>Batal</Button>}
              <Button tone={isEditing ? 'success' : 'primary'} icon={isEditing ? 'check' : 'edit'} loading={saving} onClick={isEditing ? handleSave : handleStartEdit}>
                {isEditing ? 'Simpan rincian' : 'Sesuaikan'}
              </Button>
            </div>
          )}
        </div>
        <div className="p-5">
          <BreakdownTable lines={isEditing ? draftLines : cost.lines} isEditable={isEditing} onEdit={handleEditLine} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-950">
            <Icon name="barChart" className="h-5 w-5 text-sky-600" />
            Komposisi biaya
          </h2>
          <div className="h-[280px]">
            <CostPie subtotal={displayedCost.subtotal} labor={displayedCost.labor} premium={displayedCost.premium} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-950">Metrik teknis</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Kabel</dt><dd className="font-semibold text-slate-950">{metrics.cableLength ?? '-'} m</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Conduit</dt><dd className="font-semibold text-slate-950">{metrics.conduitLength ?? '-'} m</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Sirkuit</dt><dd className="font-semibold text-slate-950">{metrics.circuits ?? '-'} grup</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Panel</dt><dd className="font-semibold text-slate-950">{metrics.panelCount ?? '-'} unit</dd></div>
            </dl>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5 text-white">
            <h2 className="text-lg font-semibold">Butuh validasi lapangan?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Bagikan PDF ke teknisi untuk survei, cek ukuran kabel, proteksi, dan kondisi bangunan.</p>
            <div className="mt-5 grid gap-2">
              <Button icon="download" loading={downloading} onClick={handleDownload}>Unduh PDF</Button>
              <a
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                href="https://wa.me/6282249238906"
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="phone" className="h-4 w-4" />
                Hubungi via WhatsApp
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
