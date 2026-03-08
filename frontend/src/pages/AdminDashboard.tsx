import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Input, Select } from '@components/UI'
import { useAuth } from '../hooks/useAuth'
import { getMaterials, updateMaterial, createMaterial, deleteMaterial } from '@services/materials'
import { getAnalytics } from '@services/analytics'
import type { Material, MaterialType, AnalyticsResponse } from '@app-types/index'
import TrendsLine from '@components/charts/TrendsLine'
import { formatCurrency } from '@utils/format'

type Tab = 'overview' | 'materials' | 'logs'

const materialTypes: MaterialType[] = ['cable', 'mcb', 'switch', 'socket', 'panel', 'conduit']

export default function AdminDashboardPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    // Materials state
    const [materials, setMaterials] = useState<Material[]>([])
    const [mLoading, setMLoading] = useState(false)
    const [mFilter, setMFilter] = useState('')

    // Analytics state
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
    const [aLoading, setALoading] = useState(false)

    const filteredMaterials = useMemo(() =>
        materials.filter(m => m.name.toLowerCase().includes(mFilter.toLowerCase()) || m.type.includes(mFilter as any)),
        [materials, mFilter]
    )

    useEffect(() => {
        if (activeTab === 'materials') loadMaterials()
        if (activeTab === 'overview') loadAnalytics()
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
                            <Button className="px-8" onClick={() => {/* create implementation */ }}>Tambah</Button>
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
                                        <td className="px-4 py-3"><Input value={m.name} className="bg-transparent border-0 font-medium" /></td>
                                        <td className="px-4 py-3">
                                            <Select value={m.type} className="bg-transparent border-0">
                                                {materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </Select>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(m.pricePerUnit)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-4 transition-colors">Update</button>
                                            <button className="text-red-600 hover:text-red-800 font-bold text-sm transition-colors">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'logs' && (
                <Card className="p-20 text-center text-gray-400 italic">
                    Fitur Log Global segera hadir.
                </Card>
            )}
        </div>
    )
}
