"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowRight, Github, Mail, Lock, User } from "lucide-react";

import { InfinityLogo } from "@/components/ui/logo";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Check if profile already exists (e.g., if a DB trigger exists)
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', authData.user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                username: email.split('@')[0],
                                email: email,
                                full_name: name,
                            }
                        ]);

                    if (profileError) {
                        console.error("Profile creation error details:", JSON.stringify(profileError, null, 2));

                        // Handle username collision specifically
                        if (profileError.code === '23505' && profileError.message?.includes('username')) {
                            const fallbackUsername = `${email.split('@')[0]}_${authData.user.id.slice(0, 4)}`;
                            await supabase
                                .from('profiles')
                                .insert([{
                                    id: authData.user.id,
                                    username: fallbackUsername,
                                    email: email,
                                    full_name: name,
                                }]);
                        } else {
                            // Non-collision error, but maybe account is still usable?
                            console.warn("Non-critical profile error, proceeding to dashboard.");
                        }
                    }
                }
            }

            // 3. Handle Navigation or Confirmation Message
            if (authData.session) {
                // Email confirmation is disabled, redirect immediately
                router.push("/dashboard");
            } else {
                // Email confirmation is enabled, show success message
                setIsSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during registration");
        } finally {
            setIsSubmitting(false);
        }
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
                    <h1 className="text-3xl font-bold mt-6 tracking-tight">
                        {isSuccess ? "Verify Email" : "Get Started"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        {isSuccess
                            ? "We've sent a link to your email to activate your account."
                            : "Join the infinite coding revolution."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {isSuccess ? (
                    <div className="space-y-6 text-center">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Mail className="w-12 h-12 text-blue-400 animate-pulse" />
                        </div>
                        <p className="text-sm text-gray-400">
                            Check your inbox (and spam folder) for the verification link. Once confirmed, you can log in below.
                        </p>
                        <Link
                            href="/login"
                            className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            Return to Login <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] px-1">Password</label>
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
                            {isSubmitting ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {!isSuccess && (
                    <>
                        <div className="mt-8 text-center text-[10px] text-gray-500 leading-relaxed">
                            By signing up, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                        </div>

                        <p className="text-center text-gray-500 text-xs mt-10">
                            Already have an account? <Link href="/login" className="text-white font-semibold hover:text-blue-400 transition-colors">Sign in</Link>
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    );
}
