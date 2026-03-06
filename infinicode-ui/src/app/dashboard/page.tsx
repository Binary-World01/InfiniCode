"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { SocialIcons } from "@/components/ui/social-icons";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, Star, TrendingUp, Clock, Zap, Users
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";

function InfinityLogo({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="-1 -3.5 13 13" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <circle cx="1" cy="0" r="0.45" /><circle cx="2" cy="0" r="0.45" /><circle cx="6" cy="0" r="0.45" /><circle cx="7" cy="0" r="0.45" /><circle cx="8" cy="0" r="0.45" /><circle cx="9" cy="0" r="0.45" />
            <circle cx="0" cy="1" r="0.45" /><circle cx="1" cy="1" r="0.45" /><circle cx="2" cy="1" r="0.45" /><circle cx="3" cy="1" r="0.45" /><circle cx="4" cy="1" r="0.45" /><circle cx="5" cy="1" r="0.45" /><circle cx="6" cy="1" r="0.45" /><circle cx="10" cy="1" r="0.45" />
            <circle cx="0" cy="2" r="0.45" /><circle cx="4" cy="2" r="0.45" /><circle cx="5" cy="2" r="0.45" /><circle cx="10" cy="2" r="0.45" /><circle cx="11" cy="2" r="0.45" />
            <circle cx="0" cy="3" r="0.45" /><circle cx="4" cy="3" r="0.45" /><circle cx="5" cy="3" r="0.45" /><circle cx="10" cy="3" r="0.45" /><circle cx="11" cy="3" r="0.45" />
            <circle cx="0" cy="4" r="0.45" /><circle cx="1" cy="4" r="0.45" /><circle cx="3" cy="4" r="0.45" /><circle cx="4" cy="4" r="0.45" /><circle cx="5" cy="4" r="0.45" /><circle cx="6" cy="4" r="0.45" /><circle cx="10" cy="4" r="0.45" />
            <circle cx="1" cy="5" r="0.45" /><circle cx="2" cy="5" r="0.45" /><circle cx="3" cy="5" r="0.45" /><circle cx="6" cy="5" r="0.45" /><circle cx="7" cy="5" r="0.45" /><circle cx="8" cy="5" r="0.45" /><circle cx="9" cy="5" r="0.45" />
        </svg>
    );
}

const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Editor", href: "/editor", icon: <Code className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Projects", href: "/dashboard", icon: <FolderOpen className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Activity", href: "/dashboard", icon: <Activity className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Settings", href: "/dashboard", icon: <Settings className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Sign Out", href: "/", icon: <LogOut className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
];

const tabItems = [
    { title: "Overview", icon: LayoutDashboard },
    { title: "Repos", icon: GitBranch },
    { type: "separator" as const },
    { title: "Activity", icon: Activity },
    { title: "Notifications", icon: Bell },
];

const stats = [
    { label: "Lines Written", value: "142,893", icon: <Code className="h-4 w-4" />, change: "+12.4%" },
    { label: "AI Completions", value: "8,341", icon: <Zap className="h-4 w-4" />, change: "+28.1%" },
    { label: "Active Sessions", value: "3", icon: <Users className="h-4 w-4" />, change: "Live" },
    { label: "Streak Days", value: "47", icon: <TrendingUp className="h-4 w-4" />, change: "🔥 Record" },
];

const recentProjects = [
    { name: "codecollab-backend", lang: "Java", stars: 24, updated: "2h ago", color: "bg-orange-500" },
    { name: "infinicode-ui", lang: "TypeScript", stars: 89, updated: "30m ago", color: "bg-blue-500" },
    { name: "ai-code-gen", lang: "Python", stars: 156, updated: "1d ago", color: "bg-green-500" },
    { name: "realtime-collab", lang: "Go", stars: 42, updated: "3h ago", color: "bg-cyan-500" },
];

export default function DashboardPage() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();

    const sidebarLinks = [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Editor", href: "/editor", icon: <Code className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Projects", href: "/dashboard", icon: <FolderOpen className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Activity", href: "/dashboard", icon: <Activity className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Settings", href: "/dashboard", icon: <Settings className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        {
            label: "Sign Out",
            href: "#",
            icon: <LogOut className="text-neutral-400 h-5 w-5 flex-shrink-0" />,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                logout();
            }
        },
    ];

    return (
        <AuthGuard>
            <div className="flex h-screen bg-black text-white overflow-hidden">
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="flex items-center gap-2 mb-8 px-2">
                                <InfinityLogo size={28} />
                                <motion.span animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }} className="font-bold text-white whitespace-pre">InfiniCode</motion.span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {sidebarLinks.map((link, idx) => <SidebarLink key={idx} link={link} />)}
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <SidebarLink link={{
                                label: user?.name || "User", href: "/dashboard",
                                icon: <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">{user?.name?.[0].toUpperCase() || "U"}</div>
                            }} />
                        </div>
                    </SidebarBody>
                </Sidebar>

                <div className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
                        <div>
                            <h1 className="text-xl font-bold">Dashboard</h1>
                            <p className="text-gray-500 text-sm">Welcome back, {user?.name?.split(' ')[0] || "Developer"} 👋</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" />
                            <Link href="/editor" className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition">Open Editor</Link>
                        </div>
                    </div>

                    <div className="p-6 space-y-8 max-w-7xl">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="relative rounded-2xl border border-white/10 p-2">
                                    <GlowingEffect spread={30} glow={true} disabled={false} proximity={48} inactiveZone={0.01} borderWidth={2} />
                                    <div className="relative rounded-xl bg-white/[0.02] p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">{stat.icon}</div>
                                            <span className="text-xs text-green-400 font-mono">{stat.change}</span>
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Projects */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Recent Projects</h2>
                                <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300">View all →</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentProjects.map((project, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                                        onClick={() => window.location.href = '/editor'}
                                        className="group relative rounded-2xl border border-white/10 p-2 hover:border-white/20 transition-colors cursor-pointer">
                                        <GlowingEffect spread={25} glow={false} disabled={false} proximity={40} inactiveZone={0.1} borderWidth={2} />
                                        <div className="relative rounded-xl bg-white/[0.02] p-5 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg ${project.color} flex-shrink-0 flex items-center justify-center`}>
                                                <Code className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white truncate">{project.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{project.lang}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Star className="h-3 w-3" />{project.stars}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{project.updated}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Heatmap Placeholder */}
                        <div className="relative rounded-2xl border border-white/10 p-2">
                            <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
                            <div className="relative rounded-xl bg-white/[0.02] p-6">
                                <h2 className="text-lg font-semibold mb-4">Coding Activity</h2>
                                <div className="grid grid-cols-[repeat(52,1fr)] gap-0.5">
                                    {Array.from({ length: 365 }).map((_, i) => {
                                        const intensity = Math.abs(Math.sin(i * 43.19)); // Deterministic pseudo-random for SSR hydration
                                        const bg = intensity > 0.8 ? "bg-purple-500" : intensity > 0.6 ? "bg-blue-500/70" : intensity > 0.3 ? "bg-blue-500/40" : "bg-white/5";
                                        return <div key={i} className={`${bg} rounded-[2px]`} style={{ paddingBottom: "100%" }} />;
                                    })}
                                </div>
                                <p className="text-xs text-gray-600 mt-3 text-right">365 days of coding activity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
