'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { withTimeout } from './timeout';

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
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to enrich user with metadata fallback
    const enrichUser = useCallback((currentUser: SupabaseUser, profileData?: any): User => {
        return {
            ...currentUser,
            name: profileData?.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
            avatar: profileData?.avatar_url || currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
            familyId: profileData?.family_id || null
        };
    }, []);

    const fetchProfile = useCallback(async (currentUser: SupabaseUser, retryCount = 0) => {
        console.log(`AuthContext: fetchProfile() starting for: ${currentUser.id} (attempt ${retryCount + 1})`);
        try {
            const response = await withTimeout(
                (async () => {
                    return await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .maybeSingle();
                })(),
                "Fetch Profile"
            );

            if (response.error) {
                console.error("AuthContext: Profile fetch error:", response.error);
                // Even on error, we should have set the basic user from session already, 
                // but let's ensure it has at least metadata fallbacks
                setUser(enrichUser(currentUser));
            } else if (response.data) {
                const profile = response.data;
                console.log("AuthContext: Profile found, updating user state enriched");
                setUser(enrichUser(currentUser, profile));
                return true;
            } else {
                console.log("AuthContext: No profile found for user in DB.");
                // Set fallback from metadata while we wait/retry
                setUser(enrichUser(currentUser));

                // If it's a fresh signup, the trigger might still be running. Retry once after delay.
                if (retryCount < 2) {
                    console.log("AuthContext: Retrying profile fetch in 2s...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return await fetchProfile(currentUser, retryCount + 1);
                }
            }
        } catch (e) {
            console.error("AuthContext: Unexpected error fetching profile:", e);
            setUser(enrichUser(currentUser));
        }
        return false;
    }, [enrichUser]);

    const refreshProfile = useCallback(async () => {
        console.log("AuthContext: refreshProfile() called");
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user);
        }
    }, [fetchProfile]);

    useEffect(() => {
        console.log("AuthContext: useEffect [init] starting...");

        const checkSession = async () => {
            console.log("AuthContext: checkSession() starting...");
            try {
                const response = await withTimeout(
                    (async () => {
                        return await supabase.auth.getSession();
                    })(),
                    "supabase.auth.getSession"
                );

                if (response.error) {
                    console.error("AuthContext: getSession error:", response.error);
                    return;
                }

                const session = response.data.session;
                console.log("AuthContext: Session exists:", !!session);
                if (session?.user) {
                    console.log("AuthContext: Setting user state from session:", session.user.id);
                    // Set initial state from metadata immediately
                    setUser(enrichUser(session.user));
                    // Fetch full profile (family_id etc) in background
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

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: onAuthStateChange fired:", event);

            if (session?.user) {
                console.log("AuthContext: Auth change - user exists:", session.user.id);
                setUser(enrichUser(session.user));
                setIsLoading(false);
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
    }, [fetchProfile, enrichUser]);

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
            refreshProfile,
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
