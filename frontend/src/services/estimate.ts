import { api } from './api'
import type { EstimateInput, EstimateResponse } from '@app-types/index'

export type EstimateListResponse = {
  data: Array<EstimateResponse & {
    createdAt: string
    houseArea: number
    lampPoints: number
    socketPoints: number
    acCount: number
    pumpCount: number
    powerCapacity: number
    installationType: string
  }>
  page: number
  limit: number
  total: number
  totalPages: number
}

export async function createEstimate(payload: EstimateInput) {
  const { data } = await api.post<EstimateResponse>('/estimate', payload)
  return data
}

export async function listMyEstimates(page = 1, limit = 8) {
  const { data } = await api.get<EstimateListResponse>(`/estimate/my?page=${page}&limit=${limit}`)
  return data
}

export async function updateEstimate(id: number, payload: { lines: any[], installationType: string }) {
  const { data } = await api.put<EstimateResponse>(`/estimate/${id}`, payload)
  return data
}

export async function deleteEstimate(id: number) {
  const { data } = await api.delete<{ message: string }>(`/estimate/${id}`)
  return data
}

export async function downloadPdf(id: number) {
  const response = await api.get<Blob>(`/estimate/${id}/pdf`, { responseType: 'blob' as any })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `VoltCost-Estimate-${id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
