import { useEffect, useState } from 'react'
import { Card, Button, Modal, toast } from '@components/UI'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import BreakdownTable from '@components/BreakdownTable'
import { formatCurrency } from '@utils/format'
import { downloadPdf, deleteEstimate } from '@services/estimate'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [estimations, setEstimations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEstimations = (page = 1) => {
    setLoading(true)
    api.get(`/estimate/my?page=${page}&limit=5`)
      .then(res => {
        setEstimations(res.data.data)
        setPagination({
          page: res.data.page,
          totalPages: res.data.totalPages,
          total: res.data.total
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) {
      loadEstimations()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    setIsDeleting(true)
    try {
      await deleteEstimate(deleteModal.id)
      toast.success('Estimasi berhasil dihapus')
      loadEstimations(pagination.page)
    } catch (err) {
      toast.error('Gagal menghapus estimasi')
    } finally {
      setIsDeleting(false)
      setDeleteModal({ isOpen: false, id: null })
    }
  }

  const handleAdjust = (est: any) => {
    // Reconstruct the response format expected by ResultPage
    const mockResponse = {
      id: est.id,
      breakdown: est.breakdown
    }
    navigate('/result', { state: mockResponse })
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="text-center p-8 space-y-6 shadow-xl border-0">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Akses Terbatas</h2>
            <p className="text-slate-500 text-sm">Silakan masuk ke akun Anda untuk melihat dan mengelola riwayat estimasi yang telah Anda buat.</p>
          </div>
          <Button onClick={() => navigate('/login')} className="w-full py-4 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Masuk Sekarang
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat <span className="text-blue-600">Proyek</span></h1>
          <p className="text-slate-500 text-sm mt-1">Pantau semua simulasi biaya instalasi yang telah Anda lakukan.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          {pagination.total} ESTIMASI TERSIMPAN
        </div>
      </div>

      <div className="grid gap-8">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>)}
          </div>
        ) : estimations.length > 0 ? (
          <>
            {estimations.map((est) => (
              <Card key={est.id} className="p-0 overflow-hidden border-0 shadow-xl shadow-slate-200/60 hover:shadow-slate-300/60 transition-all group">
                <div className="bg-white p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 transform group-hover:rotate-6 transition-transform">
                        #{est.id}
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900">Simulasi Kediaman</div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Dibuat pada {new Date(est.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl w-full lg:w-auto">
                      <div className="text-left sm:text-right sm:mr-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Biaya</div>
                        <div className="text-2xl font-black text-blue-700">{formatCurrency(est.totalCost)}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => handleAdjust(est)}
                          className="!bg-blue-600 !text-white hover:!bg-blue-700 shadow-lg shadow-blue-200 px-5 py-2.5 text-sm w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          Sesuaikan
                        </Button>
                        <Button
                          onClick={() => downloadPdf(est.id)}
                          className="!bg-indigo-600 !text-white px-4 py-2 flex items-center gap-2 text-sm shadow-md shadow-indigo-100 hover:!bg-indigo-700 font-bold w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          Cetak PDF
                        </Button>
                        <Button
                          onClick={() => handleDelete(est.id)}
                          className="!bg-red-600 !text-white hover:!bg-red-700 shadow-lg shadow-red-200 px-5 py-2.5 text-sm w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Rincian Kebutuhan Teknik
                      </h4>
                    </div>
                    <BreakdownTable lines={est.breakdown.cost.lines} />
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100">
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => loadEstimations(pagination.page - 1)}
                  className="!bg-blue-600 !text-white hover:!bg-blue-700 shadow-xl shadow-blue-200 px-8 h-12 flex items-center gap-2 disabled:!bg-slate-200 disabled:!text-slate-400 w-full md:w-auto order-2 md:order-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-3 bg-blue-50/50 px-6 py-3 rounded-2xl border border-blue-100 text-sm font-black shadow-inner order-1 md:order-2 w-full md:w-auto justify-center">
                  <span className="text-blue-700 tracking-tighter uppercase opacity-50">Halaman</span>
                  <span className="text-blue-600 text-lg tabular-nums">{pagination.page} <span className="text-slate-300 font-light mx-1">/</span> {pagination.totalPages}</span>
                </div>
                <Button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => loadEstimations(pagination.page + 1)}
                  className="!bg-blue-600 !text-white hover:!bg-blue-700 shadow-xl shadow-blue-200 px-8 h-12 flex items-center gap-2 disabled:!bg-slate-200 disabled:!text-slate-400 w-full md:w-auto order-3"
                >
                  Selanjutnya
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 max-w-2xl mx-auto shadow-inner shadow-slate-50">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-700">Belum Ada Estimasi</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Anda belum membuat simulasi apapun. Mulai hitung kebutuhan listrik Anda sekarang!</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="px-10 py-4"
            >
              Buat Estimasi Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
          Tips & Rekomendasi Instalasi
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg shadow-slate-100 bg-gradient-to-br from-white to-slate-50">
            <h3 className="font-bold text-slate-900 mb-2">Keamanan Utama</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Gunakan kabel dengan standar SNI dan pastikan sistem grounding berfungsi dengan baik untuk mencegah arus pendek.</p>
          </Card>
          <Card className="border-0 shadow-lg shadow-slate-100 bg-gradient-to-br from-white to-slate-50">
            <h3 className="font-bold text-slate-900 mb-2">Pembagian Sirkuit</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Bagi instalasi rumah menjadi beberapa grup MCB untuk memudahkan maintenance dan menghindari beban berlebih pada satu jalur.</p>
          </Card>
          <Card className="border-0 shadow-lg shadow-slate-100 bg-gradient-to-br from-white to-slate-50">
            <h3 className="font-bold text-slate-900 mb-2">Material Berkualitas</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Memilih material 'Premium' dalam estimasi kami menjamin durabilitas jangka panjang dan standar keamanan yang lebih tinggi.</p>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, id: null })}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </div>
          <div className="text-center">
            <p className="text-slate-600 font-medium">Apakah Anda yakin ingin menghapus estimasi ini? Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
              disabled={isDeleting}
              className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none px-4 py-3"
            >
              Batal
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 !bg-red-600 !text-white hover:!bg-red-700 shadow-xl shadow-red-100 px-4 py-3"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
