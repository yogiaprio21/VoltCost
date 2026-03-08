import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, LoginDto, RegisterDto } from '../types/auth'
import { authService } from '../services/auth'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (data: LoginDto) => Promise<void>
    register: (data: RegisterDto) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authService.me()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = async (data: LoginDto) => {
        const res = await authService.login(data)
        if (res.token) {
            localStorage.setItem('token', res.token)
        }
        setUser(res.user)
    }

    const register = async (data: RegisterDto) => {
        await authService.register(data)
        // Automatically login after register
        await login({ email: data.email, password: data.password })
    }

    const logout = async () => {
        localStorage.removeItem('token')
        await authService.logout()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
