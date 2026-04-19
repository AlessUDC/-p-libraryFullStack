import React, { createContext, useContext, useState } from 'react';

type UserRole = 'student' | 'librarian' | 'administrator' | null;

export interface UserProfile {
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
}

export interface User {
    id: string;
    role: UserRole;
    profile: UserProfile;
}

interface AuthContextType {
    user: User | null;
    login: (id: string, role: UserRole, profile: UserProfile) => void;
    logout: () => void;
    isAuthenticated: boolean;
    getFullName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('library_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (id: string, role: UserRole, profile: UserProfile) => {
        const newUser = { id, role, profile };
        setUser(newUser);
        localStorage.setItem('library_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('library_user');
        localStorage.removeItem('auth_token');
    };

    const isAuthenticated = !!user;

    const getFullName = () => {
        if (!user) return '';
        const { firstName, paternalLastName, maternalLastName } = user.profile;
        return `${firstName} ${paternalLastName} ${maternalLastName}`;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, getFullName }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
