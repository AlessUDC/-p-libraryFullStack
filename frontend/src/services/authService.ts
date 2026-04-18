import api from '../api/axios';

export interface AuthResponse {
    token: string;
    user: {
        userId: string;
        role: 'student' | 'librarian' | 'administrator';
        profile: {
            firstName: string;
            lastName: string;
            email: string | null;
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
    }
};
