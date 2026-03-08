import { api } from './api'
import { LoginDto, RegisterDto, User } from '../types/auth'

export const authService = {
    async login(data: LoginDto) {
        const res = await api.post<{ user: User; token: string }>('/auth/login', data)
        return res.data
    },

    async register(data: RegisterDto) {
        const res = await api.post<User>('/auth/register', data)
        return res.data
    },

    async logout() {
        await api.post('/auth/logout')
    },

    async me() {
        const res = await api.get<User>('/auth/me')
        return res.data
    }
}
