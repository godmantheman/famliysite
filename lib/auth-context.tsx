'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend Supabase User with our custom profile fields
export interface User extends SupabaseUser {
    name?: string;
    avatar?: string;
    familyId?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>; // Modified for Magic Link for simplicity or we can update Login page for password
    logout: () => Promise<void>;
    signup: (name: string, email: string) => Promise<void>; // Adjusted signature
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch additional profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    ...session.user,
                    name: profile?.full_name,
                    avatar: profile?.avatar_url,
                    familyId: profile?.family_id
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    ...session.user,
                    name: profile?.full_name,
                    avatar: profile?.avatar_url,
                    familyId: profile?.family_id
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = async (email: string) => {
        // ... implementation
        throw new Error("Use supabase.auth.signInWithPassword directly or update this method");
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const signup = async (name: string, email: string) => {
        // ... implementation
    };

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <AuthContext.Provider value={{ user, login, logout: logout as any, signup: signup as any, isLoading }}>
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
