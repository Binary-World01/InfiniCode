"use client";
import { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, Star, Clock, Search, Users, GraduationCap, BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

import { InfinityLogo } from "@/components/ui/logo";

const tabItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Branch", icon: GitBranch, href: "/dashboard/branch" },
    { type: "separator" as const },
    { title: "Activity", icon: Activity, href: "/dashboard/activity" },
    { title: "Notifications", icon: Bell, href: "/dashboard/notifications" },
];

export default function BranchPage() {
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFetching, setIsFetching] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('updated_at', { ascending: false });

                if (data) setProjects(data);
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchProjects();
    }, [user]);

    const sidebarLinks = [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Editor", href: "/editor", icon: <Code className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Collaboration", href: "/dashboard/collaboration", icon: <Users className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Interview Prep", href: "/dashboard/interview", icon: <BrainCircuit className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Learning Center", href: "/dashboard/learning", icon: <GraduationCap className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Projects", href: "/dashboard/branch", icon: <FolderOpen className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Activity", href: "/dashboard/activity", icon: <Activity className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Settings", href: "/dashboard/settings", icon: <Settings className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
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

    const displayName = user?.email?.split('@')[0] || "Developer";

    const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.language?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <AuthGuard>
            <div className="flex h-screen bg-black text-white overflow-hidden">
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <div className={cn("flex items-center mb-8 px-2 transition-all duration-300 w-full", open ? "gap-2 justify-start" : "justify-center")}>
                                <div className="flex-shrink-0 flex items-center justify-center">
                                    <InfinityLogo size={42} />
                                </div>
                                <motion.span animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }} className="font-bold text-white whitespace-pre text-xl">InfiniCode</motion.span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {sidebarLinks.map((link, idx) => <SidebarLink key={idx} link={link} />)}
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <SidebarLink link={{
                                label: displayName, href: "/dashboard",
                                icon: <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">{displayName[0].toUpperCase()}</div>
                            }} />
                        </div>
                    </SidebarBody>
                </Sidebar>

                <div className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
                        <div>
                            <h1 className="text-xl font-bold">Branch (Projects)</h1>
                            <p className="text-gray-500 text-sm">Manage and organize your codebase 🚀</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" />
                            <Link href="/editor" className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition">New Project</Link>
                        </div>
                    </div>

                    <div className="p-6 space-y-8 max-w-7xl mx-auto">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or language..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
                            />
                        </div>

                        {/* Projects Grid */}
                        {isFetching ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project, i) => (
                                    <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                                        onClick={() => window.location.href = `/editor?id=${project.id}`}
                                        className="group relative rounded-2xl border border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden p-[1px]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative bg-black/50 backdrop-blur-sm rounded-[15px] p-6 h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                                        <Code className="h-6 w-6" />
                                                    </div>
                                                    <div className="px-2 py-1 bg-white/5 rounded-full text-xs font-mono text-gray-400">{project.language}</div>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-1 truncate">{project.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">{project.description || "No description provided."}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
                                                <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{project.stars || 0}</div>
                                                <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(project.updated_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 mt-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                <FolderOpen className="w-16 h-16 text-gray-700 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                                <p className="text-gray-400 mb-8 max-w-md">You haven't created any projects matching your search, or your branch is empty. Start a new project to see it here.</p>
                                <Link href="/editor" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Create New Project</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
