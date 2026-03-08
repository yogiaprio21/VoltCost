import { useEffect, useMemo, useState } from 'react'
import { Card, Button, Input, Select } from '@components/UI'
import type { Material, MaterialType } from '@app-types/index'
import { getMaterials, updateMaterial, createMaterial, deleteMaterial } from '@services/materials'

const types: MaterialType[] = ['cable','mcb','switch','socket','panel','conduit']

export default function AdminPage() {
  const [items, setItems] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [filter, setFilter] = useState<string>('')
  const filtered = useMemo(()=>items.filter((i: Material)=>i.name.toLowerCase().includes(filter.toLowerCase()) || i.type.includes(filter as any)),[items,filter])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getMaterials()
      setItems(data)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() },[])

  async function onUpdate(item: Material) {
    const payload = { name: item.name, type: item.type, unit: item.unit, pricePerUnit: item.pricePerUnit }
    const updated = await updateMaterial(item.id, payload)
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
  }

  async function onCreate() {
    const payload = { name: 'New', type: 'cable' as MaterialType, unit: 'unit', pricePerUnit: 0 }
    const created = await createMaterial(payload)
    setItems(prev => [...prev, created])
  }

  async function onDelete(id: number) {
    await deleteMaterial(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium">Materials</div>
        <div className="flex gap-2">
          <Input placeholder="Filter" value={filter} onChange={e=>setFilter(e.target.value)} />
          <Button onClick={onCreate} disabled={loading}>Add</Button>
        </div>
      </div>
      {error && <div className="mb-2 text-red-700">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-2 py-2 border">Name</th>
              <th className="text-left px-2 py-2 border">Type</th>
              <th className="text-left px-2 py-2 border">Unit</th>
              <th className="text-right px-2 py-2 border">Price/Unit</th>
              <th className="px-2 py-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(it=>(
              <tr key={it.id} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">
                  <Input value={it.name} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setItems((prev: Material[])=>prev.map((p: Material)=>p.id===it.id?{...p,name:e.target.value}:p))} />
                </td>
                <td className="border px-2 py-1">
                  <Select value={it.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setItems((prev: Material[])=>prev.map((p: Material)=>p.id===it.id?{...p,type:e.target.value as MaterialType}:p))}>
                    {types.map(t=><option key={t} value={t}>{t}</option>)}
                  </Select>
                </td>
                <td className="border px-2 py-1">
                  <Input value={it.unit} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setItems((prev: Material[])=>prev.map((p: Material)=>p.id===it.id?{...p,unit:e.target.value}:p))} />
                </td>
                <td className="border px-2 py-1">
                  <Input type="number" min={0} value={it.pricePerUnit} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setItems((prev: Material[])=>prev.map((p: Material)=>p.id===it.id?{...p,pricePerUnit:Number(e.target.value)}:p))} />
                </td>
                <td className="border px-2 py-1 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button onClick={()=>onUpdate(it)}>Save</Button>
                    <Button className="bg-red-600" onClick={()=>onDelete(it.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
