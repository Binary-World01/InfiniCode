"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (userData: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                // SELF-HEALING: If token is "mock_token", force a reset
                if (session?.access_token === "mock_token") {
                    console.warn("Corrupted mock token detected. Forcing reset...");
                    logout();
                    return;
                }

                setUser(session?.user ?? null);
            } catch (err) {
                console.error("Auth initialization error:", err);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = (userData: any) => {
        // This function will now be a dummy as login happens via Supabase components or direct calls
        // But for compatibility with existing code that might call it:
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn("Sign out error (ignoring):", err);
        }
        
        // Aggressively clear all possible auth keys
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes('auth-token') || key === 'user') {
                    localStorage.removeItem(key);
                }
            });
            // Also clear cookies if possible (client-side)
            document.cookie.split(";").forEach((c) => {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        }

        setUser(null);
        router.push("/");
        // Force reload to ensure fresh state
        setTimeout(() => window.location.reload(), 100);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
