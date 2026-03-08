import { api } from './api'
import type { AnalyticsResponse } from '@app-types/index'

export async function getAnalytics() {
  const { data } = await api.get<AnalyticsResponse>('/analytics')
  return data
}
