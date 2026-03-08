import { api } from './api'
import type { EstimateInput, EstimateResponse } from '@app-types/index'

export async function createEstimate(payload: EstimateInput) {
  const { data } = await api.post<EstimateResponse>('/estimate', payload)
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

export function downloadPdf(id: number) {
  const url = `${api.defaults.baseURL}/estimate/${id}/pdf`
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.click()
}
