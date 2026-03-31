"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowRight, Github, Mail, Lock } from "lucide-react";

import { InfinityLogo } from "@/components/ui/logo";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Pre-clear any corrupted session
        await supabase.auth.signOut();
        localStorage.removeItem('user');
        Object.keys(localStorage).forEach(key => {
            if (key.includes('auth-token')) localStorage.removeItem(key);
        });

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An error occurred during login");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGithubLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-2xl relative z-10 shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <Link href="/"><InfinityLogo size={48} /></Link>
                    <h1 className="text-3xl font-bold mt-6 tracking-tight">Sign In</h1>
                    <p className="text-gray-500 text-sm mt-2">Welcome back to the infinite canvas.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] px-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">Password</label>
                            <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Authenticating..." : "Login to InfiniCode"} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-600 tracking-[0.3em]"><span className="bg-[#0a0a0a] px-3">Sync Session</span></div>
                    </div>

                    <button onClick={handleGithubLogin} className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-[0.98]">
                        <Github className="w-5 h-5" /> Continue with GitHub
                    </button>
                </div>

                <p className="text-center text-gray-500 text-xs mt-10">
                    New to the platform? <Link href="/register" className="text-white font-semibold hover:text-blue-400 transition-colors">Create account</Link>
                </p>
            </motion.div>
        </div>
    );
}
