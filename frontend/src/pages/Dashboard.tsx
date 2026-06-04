import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, EmptyState, ErrorAlert, Field, Input, Loader, Modal, PageHeader, Select, StatCard, toast } from '@components/UI'
import { useAuth } from '../hooks/useAuth'
import { invalidateApiQuery, useApiQuery } from '../hooks/useApi'
import BreakdownTable from '@components/BreakdownTable'
import { formatCurrency } from '@utils/format'
import { deleteEstimate, downloadPdf, listMyEstimates } from '@services/estimate'
import Icon from '@components/Icon'

type SortMode = 'newest' | 'highest' | 'lowest'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const queryFn = useCallback(() => listMyEstimates(page, 8), [page])
  const { data, loading, error, refetch } = useApiQuery(`my-estimates:${page}`, queryFn, Boolean(user))

  const estimates = useMemo(() => {
    const rows = data?.data || []
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = normalizedSearch
      ? rows.filter((est) => [`#${est.id}`, est.powerCapacity, est.installationType, est.totalCost].join(' ').toLowerCase().includes(normalizedSearch))
      : rows
    return [...filtered].sort((a, b) => {
      if (sortMode === 'highest') return Number(b.totalCost) - Number(a.totalCost)
      if (sortMode === 'lowest') return Number(a.totalCost) - Number(b.totalCost)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [data?.data, search, sortMode])

  const totalValue = useMemo(() => (data?.data || []).reduce((sum, est) => sum + Number(est.totalCost || 0), 0), [data?.data])

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    setIsDeleting(true)
    try {
      await deleteEstimate(deleteModal.id)
      invalidateApiQuery('my-estimates')
      toast.success('Estimasi berhasil dihapus.')
      await refetch()
    } catch (err) {
      toast.error('Gagal menghapus estimasi.')
    } finally {
      setIsDeleting(false)
      setDeleteModal({ isOpen: false, id: null })
    }
  }

  const handleAdjust = (est: any) => {
    navigate('/result', { state: { id: est.id, totalCost: Number(est.totalCost), breakdown: est.breakdown } })
  }

  const handleDownload = async (id: number) => {
    setDownloadingId(id)
    try {
      await downloadPdf(id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengunduh PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Masuk untuk melihat riwayat"
        description="Riwayat estimasi disimpan per akun agar Anda dapat membuka, menyesuaikan, menghapus, dan mengunduh PDF kapan saja."
        action={<Button icon="logIn" onClick={() => navigate('/login')}>Masuk sekarang</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat estimasi"
        description="Kelola simulasi yang sudah dibuat, cari berdasarkan ID/daya/jenis instalasi, dan lanjutkan ke halaman hasil."
        action={<Button icon="plus" onClick={() => navigate('/')}>Estimasi baru</Button>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Estimasi tersimpan" value={data?.total || 0} icon="clipboard" />
        <StatCard label="Nilai di halaman ini" value={formatCurrency(totalValue)} icon="activity" tone="success" />
        <StatCard label="Halaman" value={`${data?.page || page}/${data?.totalPages || 1}`} icon="file" tone="neutral" />
      </section>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_120px] md:items-end">
          <Field label="Cari estimasi">
            <Input placeholder="Cari #ID, daya, tipe, total..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field>
          <Field label="Urutkan">
            <Select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">Terbaru</option>
              <option value="highest">Total tertinggi</option>
              <option value="lowest">Total terendah</option>
            </Select>
          </Field>
          <Button tone="ghost" icon="refresh" onClick={() => refetch()}>Refresh</Button>
        </div>
      </Card>

      {error && <ErrorAlert message={error} />}
      {loading && <Loader />}

      {!loading && estimates.length === 0 && (
        <EmptyState
          icon="search"
          title={search ? 'Tidak ada hasil pencarian' : 'Belum ada estimasi'}
          description={search ? 'Coba ubah kata kunci pencarian atau bersihkan filter.' : 'Mulai dari form estimasi untuk membuat simulasi biaya pertama.'}
          action={<Button icon="plus" onClick={() => navigate('/')}>Buat estimasi</Button>}
        />
      )}

      <div className="grid gap-5">
        {estimates.map((est) => (
          <Card key={est.id} className="overflow-hidden">
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-sky-700">
                      <Icon name="file" className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">Estimasi #{est.id}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <Icon name="calendar" className="h-4 w-4" />
                        {new Date(est.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="text-slate-300">/</span>
                        {est.powerCapacity} VA
                        <span className="text-slate-300">/</span>
                        {est.installationType}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 sm:text-right">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total biaya</div>
                    <div className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(est.totalCost)}</div>
                  </div>
                </div>
                <BreakdownTable lines={est.breakdown.cost.lines} />
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:w-40 lg:grid-cols-1">
                <Button icon="edit" onClick={() => handleAdjust(est)}>Sesuaikan</Button>
                <Button tone="ghost" icon="download" loading={downloadingId === est.id} onClick={() => handleDownload(est.id)}>PDF</Button>
                <Button tone="danger" icon="trash" onClick={() => setDeleteModal({ isOpen: true, id: est.id })}>Hapus</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button tone="ghost" icon="chevronLeft" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Sebelumnya</Button>
          <div className="text-center text-sm font-semibold text-slate-700">Halaman {data.page} dari {data.totalPages}</div>
          <Button tone="ghost" icon="chevronRight" disabled={page === data.totalPages} onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}>Selanjutnya</Button>
        </Card>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, id: null })}
        title="Hapus estimasi?"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button tone="ghost" disabled={isDeleting} onClick={() => setDeleteModal({ isOpen: false, id: null })}>Batal</Button>
          <Button tone="danger" icon="trash" loading={isDeleting} onClick={confirmDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
