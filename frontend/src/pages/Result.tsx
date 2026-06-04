import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'
import type { EstimateResponse, Material } from '@app-types/index'
import { Button, Card, EmptyState, ErrorAlert, PageHeader, StatCard, toast } from '@components/UI'
import BreakdownTable from '@components/BreakdownTable'
import { formatCurrency, formatDate } from '@utils/format'
import CostPie from '@components/charts/CostPie'
import { downloadPdf, updateEstimate } from '@services/estimate'
import { getMaterialCatalog } from '@services/materials'
import { useAuth } from '../hooks/useAuth'
import { useApiQuery } from '../hooks/useApi'
import Icon from '@components/Icon'

function calculatePreview(lines: EstimateResponse['breakdown']['cost']['lines'], isPremium: boolean) {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const labor = Math.round(subtotal * 0.15)
  const premium = isPremium ? Math.round((subtotal + labor) * 0.2) : 0
  return { subtotal, labor, premium, total: subtotal + labor + premium }
}

const sourceTypeLabels: Record<NonNullable<Material['sourceType']>, string> = {
  admin: 'Input admin',
  vendor: 'Vendor/toko',
  market_survey: 'Survei pasar',
  seed: 'Data awal'
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

  const catalogQuery = useApiQuery('materials:catalog', useCallback(() => getMaterialCatalog(), []))

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
          <div className="min-h-[340px]">
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

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-950">Sumber data & aturan</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>{catalogQuery.data?.meta.disclaimer || 'Harga material menggunakan katalog estimasi VoltCost dan dapat berbeda menurut vendor, merek, wilayah, dan waktu survei.'}</p>
              <p>{catalogQuery.data?.meta.standardNote || 'Rujukan teknis keselamatan mengacu pada prinsip PUIL 2011 dan ketentuan SLO ESDM; standar tersebut bukan sumber harga material.'}</p>
              <p className="font-medium text-slate-800">Perhitungan: material = qty x harga satuan, jasa = 15% material, premium = 20% dari material + jasa.</p>
            </div>
          </Card>

          <Card variant="dark" className="p-5">
            <h2 className="text-lg font-semibold">Butuh validasi lapangan?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">Bagikan PDF ke teknisi untuk survei, cek ukuran kabel, proteksi, dan kondisi bangunan.</p>
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

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Dasar harga material</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Data berikut dibaca dari katalog material yang dikelola admin. Harga adalah estimasi, bukan tarif resmi PLN/PUIL, dan perlu divalidasi ulang terhadap vendor serta kondisi lokasi.
          </p>
        </div>
        {catalogQuery.error ? (
          <div className="p-5">
            <ErrorAlert message={catalogQuery.error} />
          </div>
        ) : catalogQuery.loading ? (
          <div className="p-5 text-sm font-medium text-slate-500">Memuat katalog harga...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3">Material</th>
                  <th className="border-b border-slate-200 px-4 py-3">Tipe</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right">Harga</th>
                  <th className="border-b border-slate-200 px-4 py-3">Sumber</th>
                  <th className="border-b border-slate-200 px-4 py-3">Rujukan teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(catalogQuery.data?.data || []).map((material) => (
                  <tr key={material.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-slate-950">{material.name}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{material.specification || 'Spesifikasi mengikuti kebutuhan estimasi dan verifikasi teknisi.'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{material.type} / {material.unit}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-950">{formatCurrency(Number(material.pricePerUnit))}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-700">{material.sourceName || 'Katalog estimasi VoltCost'}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {sourceTypeLabels[material.sourceType || 'admin']} / {material.priceUpdatedAt ? formatDate(material.priceUpdatedAt) : 'Tanggal belum tersedia'}
                      </div>
                      {material.sourceUrl && (
                        <a className="mt-1 inline-block text-xs font-semibold text-sky-700 hover:text-sky-800" href={material.sourceUrl} target="_blank" rel="noreferrer">Buka sumber</a>
                      )}
                      {material.notes && <div className="mt-1 text-xs leading-5 text-slate-500">{material.notes}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm leading-6 text-slate-600">{material.standardRef || 'PUIL 2011 dan SLO ESDM sebagai rujukan teknis keselamatan instalasi.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
