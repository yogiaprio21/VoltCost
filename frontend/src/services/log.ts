import { api } from './api'

export interface AuditLog {
    id: number
    action: string
    entity: string
    entityId: string
    details: any
    userId: string
    createdAt: string
    user?: {
        name: string
        email: string
    }
}

export async function getLogs() {
    const { data } = await api.get<AuditLog[]>('/logs')
    return data
}
