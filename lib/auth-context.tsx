'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
    name?: string;
    avatar?: string;
    familyId?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (name: string, email: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TIMEOUT_MS = 10000; // 10 seconds timeout for DB calls

/**
 * Utility to wrap promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, description: string): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            console.error(`[Timeout] ${description} timed out after ${TIMEOUT_MS}ms`);
            reject(new Error(`${description} timed out`));
        }, TIMEOUT_MS);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result as T;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: useEffect [init] starting...");

        const checkSession = async () => {
            console.log("AuthContext: checkSession() starting...");
            try {
                const { data: { session }, error } = await withTimeout(
                    supabase.auth.getSession(),
                    "supabase.auth.getSession"
                );

                if (error) {
                    console.error("AuthContext: getSession error:", error);
                    return;
                }

                console.log("AuthContext: Session exists:", !!session);
                if (session?.user) {
                    // Update user state immediately with auth data
                    console.log("AuthContext: Setting user state from session:", session.user.id);
                    setUser(session.user);

                    // Fetch profile in background without blocking isLoading
                    fetchProfile(session.user);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("AuthContext: Unexpected error during checkSession:", e);
            } finally {
                console.log("AuthContext: setting isLoading = false (init)");
                setIsLoading(false);
            }
        };

        const fetchProfile = async (currentUser: SupabaseUser) => {
            console.log("AuthContext: fetchProfile() starting for:", currentUser.id);
            try {
                const { data: profile, error } = await withTimeout(
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .maybeSingle(),
                    "Fetch Profile"
                );

                if (error) {
                    console.error("AuthContext: Profile fetch error:", error);
                } else if (profile) {
                    console.log("AuthContext: Profile found, updating user state enriched");
                    setUser({
                        ...currentUser,
                        name: profile.full_name,
                        avatar: profile.avatar_url,
                        familyId: profile.family_id
                    });
                } else {
                    console.log("AuthContext: No profile found for user in DB.");
                }
            } catch (e) {
                console.error("AuthContext: Unexpected error fetching profile:", e);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: onAuthStateChange fired:", event);

            if (session?.user) {
                console.log("AuthContext: Auth change - user exists:", session.user.id);
                setUser(session.user);
                setIsLoading(false); // Ensure unblocked
                fetchProfile(session.user);
            } else {
                console.log("AuthContext: Auth change - no user");
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            console.log("AuthContext: cleanup - unsubscribing");
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        console.log("AuthContext: logout() called");
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (e) {
            console.error("AuthContext: Logout error:", e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login: async () => { },
            logout,
            signup: async () => { },
            isLoading
        }}>
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
