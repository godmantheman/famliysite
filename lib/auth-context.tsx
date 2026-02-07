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

    const enrichUser = useCallback((currentUser: SupabaseUser, profileData?: any): User => {
        const metadata = currentUser.user_metadata || {};
        const name = profileData?.full_name || metadata.full_name || metadata.name || metadata.display_name || '';
        const avatar = profileData?.avatar_url || metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`;
        const familyId = profileData?.family_id || null;

        console.log(`AuthContext: Enriching user ${currentUser.id}`, { name, familyId, hasProfile: !!profileData });

        return {
            ...currentUser,
            name,
            avatar,
            familyId
        };
    }, []);

    const fetchProfile = useCallback(async (currentUser: SupabaseUser, retryCount = 0) => {
        console.log(`AuthContext: fetchProfile [${currentUser.id}] attempt ${retryCount + 1}`);
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
                setUser(enrichUser(currentUser));
                return false;
            }

            if (response.data) {
                console.log("AuthContext: Profile found in DB:", response.data);
                setUser(enrichUser(currentUser, response.data));
                return true;
            } else {
                console.warn("AuthContext: No profile record found in 'profiles' table.");

                // Fallback: Enrichment from metadata while waiting
                setUser(enrichUser(currentUser));

                // If no profile exists and it's not a fresh signup retry, we might need to create it (Recovery)
                if (retryCount >= 2) {
                    console.log("AuthContext: Profile missing after retries. Attempting recovery creation...");
                    const metadata = currentUser.user_metadata || {};
                    const { error: upsertError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: currentUser.id,
                            full_name: metadata.full_name || metadata.name || '',
                            avatar_url: metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`
                        });

                    if (upsertError) {
                        console.error("AuthContext: Profile recovery upsert failed:", upsertError);
                    } else {
                        console.log("AuthContext: Profile recovery successful.");
                        // Try fetching one last time to get any trigger-added family_id
                        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
                        if (data) setUser(enrichUser(currentUser, data));
                    }
                    return false;
                }

                // Fresh signup/login retry logic
                console.log("AuthContext: Retrying profile fetch in 2s...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                return await fetchProfile(currentUser, retryCount + 1);
            }
        } catch (e) {
            console.error("AuthContext: Unexpected error in fetchProfile:", e);
            setUser(enrichUser(currentUser));
        }
        return false;
    }, [enrichUser]);

    const refreshProfile = useCallback(async () => {
        console.log("AuthContext: refreshProfile() triggered");
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user);
        }
    }, [fetchProfile]);

    useEffect(() => {
        console.log("AuthContext: useEffect mounting...");

        const checkSession = async () => {
            console.log("AuthContext: Initial session check starting...");
            try {
                const response = await withTimeout(
                    supabase.auth.getSession(),
                    "initial getSession"
                );

                if (response.error) throw response.error;

                const session = response.data.session;
                if (session?.user) {
                    console.log("AuthContext: Found existing session for:", session.user.id);
                    setUser(enrichUser(session.user));
                    await fetchProfile(session.user);
                } else {
                    console.log("AuthContext: No active session found.");
                    setUser(null);
                }
            } catch (e) {
                console.error("AuthContext: checkSession failed:", e);
            } finally {
                console.log("AuthContext: Loading set to false");
                setIsLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AuthContext: Auth event fired [${event}]`);

            if (session?.user) {
                console.log("AuthContext: Setting user from auth event:", session.user.id);
                setUser(enrichUser(session.user));
                setIsLoading(false);
                fetchProfile(session.user);
            } else {
                console.log("AuthContext: No user in auth event.");
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile, enrichUser]);

    const logout = async () => {
        console.log("AuthContext: logout initiating...");
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (e) {
            console.error("AuthContext: Logout failed:", e);
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
