import api from '../api/axios';

export interface AuthResponse {
    token: string;
    user: {
        userId: string;
        role: 'student' | 'librarian' | 'administrator';
        profile: {
            firstName: string;
            paternalLastName: string;
            maternalLastName: string;
            documentType: string;
            documentNumber: string;
            email: string | null;
            birthDate?: string | null;
            mobilePhone?: string | null;
            landlinePhone?: string | null;
            address?: string | null;
            district?: string | null;
        };
    };
}

export const authService = {
    login: async (code: string, pass: string) => {
        const response = await api.post<AuthResponse>('/auth/login', { code, password: pass });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('library_user');
    },
    verifyPassword: async (password: string) => {
        const response = await api.post<{ valid: boolean }>('/auth/verify-password', { password });
        return response.data;
    }
};
