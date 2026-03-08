import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Input, Select, Modal, toast } from '@components/UI'
import { useAuth } from '../hooks/useAuth'
import { getMaterials, updateMaterial, createMaterial, deleteMaterial } from '@services/materials'
import { getAnalytics } from '@services/analytics'
import { getLogs, AuditLog as LogEntry } from '@services/log'
import type { Material, MaterialType, AnalyticsResponse } from '@app-types/index'
import TrendsLine from '@components/charts/TrendsLine'
import { formatCurrency, formatDate } from '@utils/format'

type Tab = 'overview' | 'materials' | 'logs'

const materialTypes: MaterialType[] = ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit']

export default function AdminDashboardPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    // Materials state
    const [materials, setMaterials] = useState<Material[]>([])
    const [mLoading, setMLoading] = useState(false)
    const [mFilter, setMFilter] = useState('')

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newMaterial, setNewMaterial] = useState({
        name: '',
        type: 'cable' as MaterialType,
        unit: 'meter',
        pricePerUnit: 0
    })

    // Analytics state
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
    const [aLoading, setALoading] = useState(false)

    // Logs state
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [lLoading, setLLoading] = useState(false)

    const filteredMaterials = useMemo(() =>
        materials.filter(m => m.name.toLowerCase().includes(mFilter.toLowerCase()) || m.type.includes(mFilter as any)),
        [materials, mFilter]
    )

    useEffect(() => {
        if (activeTab === 'materials') loadMaterials()
        if (activeTab === 'overview') loadAnalytics()
        if (activeTab === 'logs') loadLogs()
    }, [activeTab])

    async function loadMaterials() {
        setMLoading(true)
        try {
            const data = await getMaterials()
            setMaterials(data)
        } finally { setMLoading(false) }
    }

    async function loadAnalytics() {
        setALoading(true)
        try {
            const data = await getAnalytics()
            setAnalytics(data)
        } finally { setALoading(false) }
    }

    async function loadLogs() {
        setLLoading(true)
        try {
            const data = await getLogs()
            setLogs(data)
        } finally { setLLoading(false) }
    }

    async function handleUpdate(id: number, payload: Omit<Material, 'id'>) {
        try {
            await updateMaterial(id, payload)
            toast.success('Pembaruan berhasil')
            await loadMaterials()
        } catch (error) {
            toast.error('Gagal memperbarui material.')
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Hapus material ini?')) return
        try {
            await deleteMaterial(id)
            toast.success('Material dihapus')
            await loadMaterials()
        } catch (error) {
            toast.error('Gagal menghapus material.')
        }
    }

    async function handleConfirmAdd() {
        if (!newMaterial.name) return toast.error('Nama wajib diisi')
        try {
            await createMaterial(newMaterial as any)
            toast.success('Material ditambahkan')
            setIsAddModalOpen(false)
            setNewMaterial({ name: '', type: 'cable', unit: 'meter', pricePerUnit: 0 })
            await loadMaterials()
        } catch (error) {
            toast.error('Gagal menambah material.')
        }
    }

    if (user?.role !== 'ADMIN') {
        return <Card className="p-8 text-center text-red-600 font-bold">Akses Ditolak. Khusus Admin.</Card>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['overview', 'materials', 'logs'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid gap-6">
                    {aLoading ? <div className="text-center py-10">Memuat data...</div> : analytics && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                                    <div className="text-blue-100 text-sm font-medium">Total Estimasi</div>
                                    <div className="text-3xl font-bold mt-1">{analytics.totalEstimations}</div>
                                </Card>
                                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
                                    <div className="text-indigo-100 text-sm font-medium">Rata-rata Biaya</div>
                                    <div className="text-3xl font-bold mt-1">{formatCurrency(analytics.averageCost)}</div>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                                    <div className="text-purple-100 text-sm font-medium">Kapasitas Populer</div>
                                    <div className="text-3xl font-bold mt-1">{analytics.mostCommonPowerCapacity || '-'} VA</div>
                                </Card>
                            </div>
                            <Card>
                                <h3 className="text-lg font-bold mb-4">Tren Estimasi Bulanan</h3>
                                <div className="h-[300px]">
                                    <TrendsLine data={analytics.monthlyTrends.map(t => ({ month: t.month, count: t.count }))} />
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'materials' && (
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Daftar Harga Material</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Cari material..."
                                className="max-w-xs"
                                value={mFilter}
                                onChange={e => setMFilter(e.target.value)}
                            />
                            <Button className="px-8" onClick={() => setIsAddModalOpen(true)}>Tambah</Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 border-b">Nama Item</th>
                                    <th className="px-4 py-3 border-b">Kategori</th>
                                    <th className="px-4 py-3 border-b">Satuan</th>
                                    <th className="px-4 py-3 border-b text-right">Harga</th>
                                    <th className="px-4 py-3 border-b"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mLoading ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Memuat rincian material...</td></tr>
                                ) : filteredMaterials.map(m => (
                                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                defaultValue={m.name}
                                                className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full font-medium"
                                                onBlur={async (e) => {
                                                    if (e.target.value !== m.name) {
                                                        await handleUpdate(m.id, { ...m, name: e.target.value });
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                defaultValue={m.type}
                                                className="bg-transparent border-0 outline-none cursor-pointer"
                                                onChange={async (e) => {
                                                    await handleUpdate(m.id, { ...m, type: e.target.value as MaterialType });
                                                }}
                                            >
                                                {materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                defaultValue={Number(m.pricePerUnit)}
                                                className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-24 text-right font-bold"
                                                onBlur={async (e) => {
                                                    const newPrice = Number(e.target.value);
                                                    if (newPrice !== Number(m.pricePerUnit)) {
                                                        await handleUpdate(m.id, { ...m, pricePerUnit: newPrice as any });
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="text-red-600 hover:text-red-800 font-bold text-sm transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'logs' && (
                <Card>
                    <h3 className="text-lg font-bold mb-6">Aktivitas Sistem</h3>
                    <div className="space-y-4">
                        {lLoading ? <div className="text-center py-10">Memuat log...</div> : logs.map(log => (
                            <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className={`p-2 rounded-xl ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {log.action === 'CREATE' ? '+' : log.action === 'UPDATE' ? '✎' : '×'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-slate-800 uppercase tracking-tight text-sm">
                                            {log.action} {log.entity}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-50 shadow-sm">
                                            {formatDate(log.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ID: {log.entityId} • Oleh: {log.user?.name || log.userId}
                                    </p>
                                    {log.details && (
                                        <div className="mt-2 p-2 bg-white rounded-lg border border-slate-100 text-[10px] text-slate-400 font-mono overflow-hidden truncate">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Material Baru"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nama Item</label>
                        <Input
                            placeholder="Contoh: Kabel NYM 3x2.5"
                            value={newMaterial.name}
                            onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Kategori</label>
                            <Select
                                value={newMaterial.type}
                                onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value as MaterialType })}
                            >
                                {materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Satuan</label>
                            <Input
                                placeholder="meter/pcs"
                                value={newMaterial.unit}
                                onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Harga per Satuan</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={newMaterial.pricePerUnit}
                            onChange={e => setNewMaterial({ ...newMaterial, pricePerUnit: Number(e.target.value) })}
                        />
                    </div>
                    <Button className="w-full mt-4 py-4" onClick={handleConfirmAdd}>Simpan Material</Button>
                </div>
            </Modal>
        </div>
    )
}
