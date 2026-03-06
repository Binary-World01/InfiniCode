"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Github, Mail, Lock, User } from "lucide-react";

function InfinityLogo({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="-1 -4 13 13" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <circle cx="1" cy="0" r="0.45" /><circle cx="2" cy="0" r="0.45" /><circle cx="6" cy="0" r="0.45" /><circle cx="7" cy="0" r="0.45" /><circle cx="8" cy="0" r="0.45" /><circle cx="9" cy="0" r="0.45" />
            <circle cx="0" cy="1" r="0.45" /><circle cx="1" cy="1" r="0.45" /><circle cx="2" cy="1" r="0.45" /><circle cx="3" cy="1" r="0.45" /><circle cx="4" cy="1" r="0.45" /><circle cx="5" cy="1" r="0.45" /><circle cx="6" cy="1" r="0.45" /><circle cx="10" cy="1" r="0.45" />
            <circle cx="0" cy="2" r="0.45" /><circle cx="4" cy="2" r="0.45" /><circle cx="5" cy="2" r="0.45" /><circle cx="10" cy="2" r="0.45" /><circle cx="11" cy="2" r="0.45" />
            <circle cx="0" cy="3" r="0.45" /><circle cx="4" cy="3" r="0.45" /><circle cx="5" cy="3" r="0.45" /><circle cx="10" cy="3" r="0.45" /><circle cx="11" cy="3" r="0.45" />
            <circle cx="0" cy="4" r="0.45" /><circle cx="1" cy="4" r="0.45" /><circle cx="3" cy="4" r="0.45" /><circle cx="4" cy="4" r="0.45" /><circle cx="5" cy="4" r="0.45" /><circle cx="6" cy="4" r="0.45" /><circle cx="10" cy="4" r="0.45" />
            <circle cx="1" cy="5" r="0.45" /><circle cx="2" cy="5" r="0.45" /><circle cx="3" cy="5" r="0.45" /><circle cx="6" cy="5" r="0.45" /><circle cx="7" cy="5" r="0.45" /><circle cx="8" cy="5" r="0.45" /><circle cx="9" cy="5" r="0.45" />
        </svg>
    );
}

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({ email, name });
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
                    <h1 className="text-3xl font-bold mt-6 tracking-tight">Get Started</h1>
                    <p className="text-gray-500 text-sm mt-2">Join the infinite coding revolution.</p>
                </div>

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
                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98] mt-4"
                    >
                        Create Account <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-8 text-center text-[10px] text-gray-500 leading-relaxed">
                    By signing up, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                </div>

                <p className="text-center text-gray-500 text-xs mt-10">
                    Already have an account? <Link href="/login" className="text-white font-semibold hover:text-blue-400 transition-colors">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
