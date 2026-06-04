import { useCallback, useMemo, useState } from 'react'
import { Button, Card, EmptyState, ErrorAlert, Field, Input, Loader, Modal, PageHeader, Select, StatCard, toast } from '@components/UI'
import { useAuth } from '../hooks/useAuth'
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '@services/materials'
import { getAnalytics } from '@services/analytics'
import { getLogs } from '@services/log'
import type { Material, MaterialType } from '@app-types/index'
import TrendsLine from '@components/charts/TrendsLine'
import { formatCurrency, formatDate } from '@utils/format'
import { invalidateApiQuery, useApiQuery } from '../hooks/useApi'
import Icon from '@components/Icon'

type Tab = 'overview' | 'materials' | 'logs'
type MaterialForm = Omit<Material, 'id'>

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'materials', label: 'Material' },
  { id: 'logs', label: 'Log' }
]

const materialTypes: MaterialType[] = ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit']
const sourceTypeOptions: NonNullable<Material['sourceType']>[] = ['admin', 'vendor', 'market_survey', 'seed']
const emptyMaterial: MaterialForm = {
  name: '',
  type: 'cable',
  unit: 'meter',
  pricePerUnit: 0,
  specification: '',
  brand: '',
  sourceName: '',
  sourceUrl: '',
  sourceType: 'admin',
  priceUpdatedAt: '',
  standardRef: '',
  notes: ''
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const normalizeOptional = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [mFilter, setMFilter] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'delete' | null; material?: Material | null }>({ mode: null })
  const [form, setForm] = useState<MaterialForm>(emptyMaterial)
  const [saving, setSaving] = useState(false)

  const analyticsQuery = useApiQuery('admin:analytics', useCallback(() => getAnalytics(), []), activeTab === 'overview' && user?.role === 'ADMIN')
  const materialsQuery = useApiQuery('admin:materials', useCallback(() => getMaterials(), []), activeTab === 'materials' && user?.role === 'ADMIN')
  const logsQuery = useApiQuery('admin:logs', useCallback(() => getLogs(), []), activeTab === 'logs' && user?.role === 'ADMIN')

  const filteredMaterials = useMemo(() => {
    const rows = materialsQuery.data || []
    const query = mFilter.trim().toLowerCase()
    return query ? rows.filter((m) => `${m.name} ${m.type} ${m.unit} ${m.specification || ''} ${m.sourceName || ''} ${m.standardRef || ''}`.toLowerCase().includes(query)) : rows
  }, [mFilter, materialsQuery.data])

  const openCreate = () => {
    setForm(emptyMaterial)
    setModal({ mode: 'create' })
  }

  const openEdit = (material: Material) => {
    setForm({
      name: material.name,
      type: material.type,
      unit: material.unit,
      pricePerUnit: Number(material.pricePerUnit),
      specification: material.specification || '',
      brand: material.brand || '',
      sourceName: material.sourceName || '',
      sourceUrl: material.sourceUrl || '',
      sourceType: material.sourceType || 'admin',
      priceUpdatedAt: toDateInputValue(material.priceUpdatedAt),
      standardRef: material.standardRef || '',
      notes: material.notes || ''
    })
    setModal({ mode: 'edit', material })
  }

  const closeModal = () => {
    if (!saving) setModal({ mode: null })
  }

  const refreshMaterials = async () => {
    invalidateApiQuery('admin:materials')
    await materialsQuery.refetch()
  }

  const saveMaterial = async () => {
    if (!form.name.trim() || !form.unit.trim()) {
      toast.error('Nama dan satuan wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        unit: form.unit.trim(),
        pricePerUnit: Number(form.pricePerUnit),
        specification: normalizeOptional(form.specification),
        brand: normalizeOptional(form.brand),
        sourceName: normalizeOptional(form.sourceName),
        sourceUrl: normalizeOptional(form.sourceUrl),
        sourceType: form.sourceType || 'admin',
        priceUpdatedAt: form.priceUpdatedAt ? new Date(form.priceUpdatedAt).toISOString() : null,
        standardRef: normalizeOptional(form.standardRef),
        notes: normalizeOptional(form.notes)
      }
      if (modal.mode === 'edit' && modal.material) {
        await updateMaterial(modal.material.id, payload)
        toast.success('Material diperbarui.')
      } else {
        await createMaterial(payload)
        toast.success('Material ditambahkan.')
      }
      setModal({ mode: null })
      await refreshMaterials()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan material.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!modal.material) return
    setSaving(true)
    try {
      await deleteMaterial(modal.material.id)
      toast.success('Material dihapus.')
      setModal({ mode: null })
      await refreshMaterials()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus material.')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <EmptyState
        icon="lock"
        title="Akses admin ditolak"
        description="Halaman ini hanya tersedia untuk akun dengan role ADMIN."
      />
    )
  }

  const analytics = analyticsQuery.data
  const logs = logsQuery.data || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin control center"
        description="Pantau analytics, kelola harga material, dan audit aktivitas penting dari satu tempat."
      />

      <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="Admin tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-28 rounded-md px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <section className="space-y-5" role="tabpanel">
          {analyticsQuery.error && <ErrorAlert message={analyticsQuery.error} />}
          {analyticsQuery.loading && <Loader />}
          {analytics && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Total estimasi" value={analytics.totalEstimations} icon="clipboard" />
                <StatCard label="Rata-rata biaya" value={formatCurrency(analytics.averageCost)} icon="activity" tone="success" />
                <StatCard label="Daya populer" value={analytics.mostCommonPowerCapacity ? `${analytics.mostCommonPowerCapacity} VA` : '-'} icon="zap" tone="neutral" />
              </div>
              <Card className="p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Tren estimasi bulanan</h2>
                    <p className="mt-1 text-sm text-slate-600">Jumlah estimasi dan rata-rata biaya per bulan.</p>
                  </div>
                  <Button tone="ghost" icon="refresh" onClick={() => analyticsQuery.refetch()}>Refresh</Button>
                </div>
                <div className="h-[320px]">
                  <TrendsLine data={analytics.monthlyTrends.map((item) => ({ month: item.month, count: item.count, averageCost: item.averageCost }))} />
                </div>
              </Card>
            </>
          )}
        </section>
      )}

      {activeTab === 'materials' && (
        <section className="space-y-5" role="tabpanel">
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
              <Field label="Cari material">
                <Input placeholder="Nama, kategori, satuan..." value={mFilter} onChange={(e) => setMFilter(e.target.value)} />
              </Field>
              <Button tone="ghost" icon="refresh" onClick={refreshMaterials}>Refresh</Button>
              <Button icon="plus" onClick={openCreate}>Tambah material</Button>
            </div>
          </Card>

          {materialsQuery.error && <ErrorAlert message={materialsQuery.error} />}
          {materialsQuery.loading && <Loader />}

          {!materialsQuery.loading && filteredMaterials.length === 0 ? (
            <EmptyState icon="package" title="Material tidak ditemukan" description="Ubah pencarian atau tambahkan material baru." action={<Button icon="plus" onClick={openCreate}>Tambah material</Button>} />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="border-b border-slate-200 px-4 py-3">Nama item</th>
                      <th className="border-b border-slate-200 px-4 py-3">Kategori</th>
                      <th className="border-b border-slate-200 px-4 py-3">Satuan</th>
                      <th className="border-b border-slate-200 px-4 py-3 text-right">Harga</th>
                      <th className="border-b border-slate-200 px-4 py-3">Sumber</th>
                      <th className="border-b border-slate-200 px-4 py-3">Update</th>
                      <th className="border-b border-slate-200 px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMaterials.map((material) => (
                      <tr key={material.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-slate-900">{material.name}</div>
                          {material.specification && <div className="mt-1 max-w-md text-xs leading-5 text-slate-500">{material.specification}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{material.type}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{material.unit}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(Number(material.pricePerUnit))}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-700">{material.sourceName || 'Belum diisi'}</div>
                          <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{material.sourceType || 'admin'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{material.priceUpdatedAt ? formatDate(material.priceUpdatedAt) : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button tone="ghost" icon="edit" onClick={() => openEdit(material)}>Edit</Button>
                            <Button tone="danger" icon="trash" onClick={() => setModal({ mode: 'delete', material })}>Hapus</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      )}

      {activeTab === 'logs' && (
        <section className="space-y-5" role="tabpanel">
          {logsQuery.error && <ErrorAlert message={logsQuery.error} />}
          {logsQuery.loading && <Loader />}
          {!logsQuery.loading && logs.length === 0 ? (
            <EmptyState icon="activity" title="Belum ada log" description="Aktivitas create, update, delete, dan login akan tampil di sini." />
          ) : (
            <Card className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg ${log.action === 'DELETE' ? 'bg-red-50 text-red-600' : log.action === 'UPDATE' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icon name={log.action === 'DELETE' ? 'trash' : log.action === 'UPDATE' ? 'edit' : 'check'} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-950">{log.action} {log.entity}</div>
                    <div className="mt-1 text-sm text-slate-600">ID: {log.entityId || '-'} / Oleh: {log.user?.name || log.userId || '-'}</div>
                    {log.details && <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{JSON.stringify(log.details, null, 2)}</pre>}
                  </div>
                  <div className="text-sm font-medium text-slate-500 sm:text-right">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </Card>
          )}
        </section>
      )}

      <Modal
        isOpen={modal.mode === 'create' || modal.mode === 'edit'}
        onClose={closeModal}
        title={modal.mode === 'edit' ? 'Edit material' : 'Tambah material'}
        description="Perubahan harga material akan memengaruhi estimasi baru."
        size="lg"
      >
        <div className="space-y-4">
          <Field label="Nama item">
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Contoh: Kabel NYM 3x2.5" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as MaterialType }))}>
                {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Satuan">
              <Input value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} placeholder="meter/pcs/unit" />
            </Field>
          </div>
          <Field label="Harga per satuan">
            <Input type="number" min={0} value={form.pricePerUnit} onChange={(e) => setForm((prev) => ({ ...prev, pricePerUnit: Math.max(0, Number(e.target.value) || 0) }))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Spesifikasi">
              <Input value={form.specification || ''} onChange={(e) => setForm((prev) => ({ ...prev, specification: e.target.value }))} placeholder="Contoh: NYM 2x1.5 mm2" />
            </Field>
            <Field label="Merek">
              <Input value={form.brand || ''} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Umum/vendor" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sumber harga">
              <Input value={form.sourceName || ''} onChange={(e) => setForm((prev) => ({ ...prev, sourceName: e.target.value }))} placeholder="Nama toko/vendor/katalog" />
            </Field>
            <Field label="Jenis sumber">
              <Select value={form.sourceType || 'admin'} onChange={(e) => setForm((prev) => ({ ...prev, sourceType: e.target.value as Material['sourceType'] }))}>
                {sourceTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="URL sumber" hint="Opsional">
              <Input value={form.sourceUrl || ''} onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))} placeholder="https://..." />
            </Field>
            <Field label="Tanggal update harga" hint="Opsional">
              <Input type="date" value={form.priceUpdatedAt || ''} onChange={(e) => setForm((prev) => ({ ...prev, priceUpdatedAt: e.target.value }))} />
            </Field>
          </div>
          <Field label="Referensi teknis">
            <Input value={form.standardRef || ''} onChange={(e) => setForm((prev) => ({ ...prev, standardRef: e.target.value }))} placeholder="Contoh: PUIL 2011, SLO ESDM" />
          </Field>
          <Field label="Catatan">
            <Input value={form.notes || ''} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Keterangan asumsi harga dan batas penggunaan" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button tone="ghost" disabled={saving} onClick={closeModal}>Batal</Button>
            <Button icon="check" loading={saving} onClick={saveMaterial}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modal.mode === 'delete'}
        onClose={closeModal}
        title="Hapus material?"
        description={modal.material ? `${modal.material.name} akan dihapus dari katalog material.` : undefined}
      >
        <div className="flex justify-end gap-3">
          <Button tone="ghost" disabled={saving} onClick={closeModal}>Batal</Button>
          <Button tone="danger" icon="trash" loading={saving} onClick={confirmDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
