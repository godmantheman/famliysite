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
            console.log("AuthContext: Starting checkSession...");
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error("AuthContext: getSession error:", sessionError);
                    setIsLoading(false);
                    return;
                }

                console.log("AuthContext: Session retrieved:", !!session);
                if (session?.user) {
                    // Set basic user info first to unblock UI
                    console.log("AuthContext: Setting basic user info for:", session.user.id);
                    setUser(session.user);
                    setIsLoading(false); // Unblock!

                    // Then fetch profile in background
                    console.log("AuthContext: Fetching profile in background...");
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profileError) {
                        console.error("AuthContext: Profile fetch error (bg):", profileError);
                    } else if (profile) {
                        console.log("AuthContext: Profile found, updating user state");
                        setUser({
                            ...session.user,
                            name: profile.full_name,
                            avatar: profile.avatar_url,
                            familyId: profile.family_id
                        });
                    } else {
                        console.log("AuthContext: No profile found for user");
                    }
                } else {
                    setUser(null);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("AuthContext: Unexpected error in checkSession:", e);
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: onAuthStateChange event:", event);
            try {
                if (session?.user) {
                    // Update user immediately
                    setUser(session.user);
                    // We don't necessarily need to set isLoading here if it's already false,
                    // but if it's a fresh sign-in, we might want to ensure UI is ready.
                    setIsLoading(false);

                    console.log("AuthContext: Fetching profile on change...");
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (error) {
                        console.error("AuthContext: Profile fetch error (change):", error);
                    } else if (profile) {
                        console.log("AuthContext: Profile update on change success");
                        setUser({
                            ...session.user,
                            name: profile.full_name,
                            avatar: profile.avatar_url,
                            familyId: profile.family_id
                        });
                    }
                } else {
                    console.log("AuthContext: No session on change, clearing user");
                    setUser(null);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("AuthContext: Auth change handler failed:", e);
                setIsLoading(false);
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
