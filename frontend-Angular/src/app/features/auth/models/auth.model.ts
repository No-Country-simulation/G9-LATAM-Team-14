// app/core/auth/models/auth.model.ts
export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserInfo {
    id: number;
    email: string;
    nombreUsuario: string;
}

export interface AuthResponse {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: UserInfo;
}