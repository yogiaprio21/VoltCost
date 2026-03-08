import { api } from './api'
import type { Material } from '@app-types/index'

export async function getMaterials() {
  const { data } = await api.get<Material[]>('/materials')
  return data
}

export async function createMaterial(payload: Omit<Material, 'id'>) {
  const { data } = await api.post<Material>('/materials', payload)
  return data
}

export async function updateMaterial(id: number, payload: Omit<Material, 'id'>) {
  const { data } = await api.put<Material>(`/materials/${id}`, payload)
  return data
}

export async function deleteMaterial(id: number) {
  await api.delete(`/materials/${id}`)
}
