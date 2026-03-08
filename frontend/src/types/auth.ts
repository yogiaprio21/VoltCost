export type UserRole = 'USER' | 'ADMIN'

export interface User {
    id: string
    email: string
    name: string | null
    role: UserRole
}

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto extends LoginDto {
    name: string
}
