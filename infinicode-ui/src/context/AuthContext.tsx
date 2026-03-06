"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (userData: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedAuth = localStorage.getItem("infinicode_auth");
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setIsAuthenticated(true);
                setUser(authData);
            } catch (e) {
                console.error("Failed to parse auth data", e);
                localStorage.removeItem("infinicode_auth");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: any) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem("infinicode_auth", JSON.stringify(userData));
        router.push("/dashboard");
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("infinicode_auth");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
