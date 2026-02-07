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
            console.log("AuthContext: Checking session...");
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log("AuthContext: Session found:", !!session);
                if (session?.user) {
                    console.log("AuthContext: Fetching profile for:", session.user.id);
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) console.error("AuthContext: Profile fetch error:", error);

                    setUser({
                        ...session.user,
                        name: profile?.full_name,
                        avatar: profile?.avatar_url,
                        familyId: profile?.family_id
                    });
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("AuthContext: Session check failed:", e);
            } finally {
                setIsLoading(false);
                console.log("AuthContext: isLoading set to false (init)");
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: onAuthStateChange event:", event);
            try {
                if (session?.user) {
                    console.log("AuthContext: Fetching profile on change for:", session.user.id);
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) console.error("AuthContext: Profile fetch error (change):", error);

                    setUser({
                        ...session.user,
                        name: profile?.full_name,
                        avatar: profile?.avatar_url,
                        familyId: profile?.family_id
                    });
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("AuthContext: Auth change handler failed:", e);
            } finally {
                setIsLoading(false);
                console.log("AuthContext: isLoading set to false (change)");
            }
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
