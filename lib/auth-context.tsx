'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock User Type
export interface User {
    id: string;
    name: string;
    email: string;
    familyId?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    signup: (name: string, email: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('family_app_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
            id: '1',
            name: email.split('@')[0] || 'Family Member',
            email,
            familyId: 'family_123',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };

        setUser(mockUser);
        localStorage.setItem('family_app_user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const signup = async (name: string, email: string) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            familyId: 'family_123', // Default to a new family or existing one
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };

        setUser(mockUser);
        localStorage.setItem('family_app_user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('family_app_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
