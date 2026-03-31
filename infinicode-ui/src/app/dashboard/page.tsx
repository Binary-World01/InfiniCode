"use client";
import { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { SocialIcons } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, Star, TrendingUp, Clock, Zap, Users,
    GraduationCap, BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

export default function DashboardPage() {
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [heatmapData, setHeatmapData] = useState<{ [date: string]: number }>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // 1. Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) setProfile(profileData);

                // 2. Fetch Projects
                const { data: projectData, error: projError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('updated_at', { ascending: false });

                if (projectData) setProjects(projectData);

                // 3. Fetch Data for Heatmap (Activity Logs)
                const { data: activityData } = await supabase
                    .from('activity_logs')
                    .select('created_at')
                    .eq('user_id', user.id);

                const dayCounts: { [date: string]: number } = {};
                const recordEvent = (dateStr: string) => {
                    if (!dateStr) return;
                    const dateKey = new Date(dateStr).toISOString().split('T')[0];
                    dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
                };

                // Combine system events (profile/project creation) with explicit activity logs
                if (profileData?.created_at) recordEvent(profileData.created_at);
                if (projectData) projectData.forEach(p => recordEvent(p.created_at));
                if (activityData) activityData.forEach(a => recordEvent(a.created_at));

                setHeatmapData(dayCounts);
                // 4. Fetch Challenges Stats
                const { data: challengesData } = await supabase
                    .from('user_challenges')
                    .select('score, status')
                    .eq('user_id', user.id);
                
                const solvedCount = challengesData?.filter(c => c.status === 'completed').length || 0;
                const avgScore = challengesData && challengesData.length > 0
                    ? Math.round(challengesData.reduce((acc, curr) => acc + (curr.score || 0), 0) / challengesData.length)
                    : 0;

                setChallengeStats({ solvedCount, avgScore });

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [user]);

    const [challengeStats, setChallengeStats] = useState({ solvedCount: 0, avgScore: 0 });

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

    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Developer";

    // Dynamic stats based on real data
    const dashboardStats = [
        {
            label: "Total XP",
            value: (profile?.total_xp || 0).toLocaleString(),
            icon: <Star className="h-4 w-4" />,
            change: "Level Up"
        },
        {
            label: "Solutions",
            value: challengeStats.solvedCount.toString(),
            icon: <Zap className="h-4 w-4" />,
            change: "Rank +1"
        },
        {
            label: "Interview Avg",
            value: `${challengeStats.avgScore}%`,
            icon: <BrainCircuit className="h-4 w-4 text-purple-400" />,
            change: "Top Performer"
        },
        {
            label: "Streak Days",
            value: (profile?.streak || 0).toString(),
            icon: <TrendingUp className="h-4 w-4" />,
            change: "🔥 Continuous"
        },
    ];

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !user) {
            console.warn("Cannot create project: Missing name or user session.");
            return;
        }
        
        setIsCreating(true);
        try {
            // 1. Re-verify session before DB hit
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            console.log("Session Debug:", {
                hasSession: !!session,
                tokenLength: token?.length || 0,
                tokenParts: token?.split('.').length || 0
            });

            if (!session) {
                alert("Session expired. Please log in again.");
                window.location.href = "/login";
                return;
            }

            // 2. Pre-flight: Ensure Profile exists (fixes RLS/FK issues)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.log("Profile missing for authenticated user, creating on-the-fly...");
                const { error: insertProfileError } = await supabase.from('profiles').insert({
                    id: user.id,
                    username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || 'Infinicode Developer',
                    theme: 'dark'
                });
                
                if (insertProfileError) {
                    // 23505 is PostgreSQL's unique_violation error code
                    if (insertProfileError.code === '23505') {
                        console.log("Profile already exists (insert violation). Proceeding...");
                    } else {
                        console.error("Profile creation failed (detailed):", {
                            message: insertProfileError.message,
                            code: insertProfileError.code,
                            details: insertProfileError.details,
                            hint: insertProfileError.hint
                        });
                        throw new Error(`Profile initialization failed: ${insertProfileError.message}`);
                    }
                }
            }

            // 3. Create Project
            const { data, error } = await supabase.from('projects').insert({
                name: newProjectName.trim(),
                owner_id: user.id,
                language: 'typescript',
                updated_at: new Date().toISOString()
            }).select().single();

            if (error) {
                console.error("Supabase error (Projects Insert):", error);
                throw error;
            }
            
            // Log creation activity
            const { error: logError } = await supabase.from('activity_logs').insert({
                user_id: user.id,
                project_id: data.id,
                type: 'PROJECT_CREATE',
                message: `Created project "${newProjectName.trim()}"`,
                created_at: new Date().toISOString()
            });

            if (logError) {
                console.warn("Non-critical error logging activity:", logError);
            }

            window.location.href = `/editor?id=${data.id}`;
        } catch (err: any) {
            console.error("Full error object in handleCreateProject:", err);
            const isAuthError = err.message?.includes('JWT') || err.code === '401' || err.status === 401;
            
            if (isAuthError) {
                if (confirm(`Authentication error detected: ${err.message}\n\nThis usually means your session is corrupted. Would you like to force log out and reset?`)) {
                    logout();
                }
            } else {
                alert(`Failed to create project: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setIsCreating(false);
        }
    };

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
                            <h1 className="text-xl font-bold">Dashboard</h1>
                            <p className="text-gray-500 text-sm">Welcome back, {displayName.split(' ')[0]} 👋</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" />
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition"
                            >
                                New Project
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-8 max-w-7xl">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {dashboardStats.map((stat, i) => (
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

                            {isFetching ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map((project, i) => (
                                        <motion.div key={project.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                                            onClick={() => window.location.href = `/editor?id=${project.id}`}
                                            className="group relative rounded-2xl border border-white/10 p-2 hover:border-white/20 transition-colors cursor-pointer">
                                            <GlowingEffect spread={25} glow={false} disabled={false} proximity={40} inactiveZone={0.1} borderWidth={2} />
                                            <div className="relative rounded-xl bg-white/[0.02] p-5 flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0 flex items-center justify-center`}>
                                                    <Code className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white truncate">{project.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{project.language}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{project.stars || 0}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(project.updated_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 rounded-2xl border border-dashed border-white/10 flex flex-col items-center text-center">
                                    <FolderOpen className="w-10 h-10 text-gray-600 mb-4" />
                                    <p className="text-gray-400 mb-6">No projects found. Start building something amazing!</p>
                                    <button 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition"
                                    >
                                        Create First Project
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Create Project Modal */}
                        <AnimatePresence>
                            {isCreateModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Create New Project</h3>
                                            <p className="text-neutral-400 text-sm italic font-mono opacity-60">"The journey of a thousand miles begins with a single line of code."</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Project Name</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newProjectName}
                                                    onChange={(e) => setNewProjectName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                                    placeholder="my-awesome-app"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => setIsCreateModalOpen(false)} 
                                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors">Cancel</button>
                                            <button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()}
                                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/10">
                                                {isCreating ? "Initializing..." : "Launch Editor"}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Activity Heatmap */}
                        <div className="relative rounded-2xl border border-white/10 p-2">
                            <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
                            <div className="relative rounded-xl bg-white/[0.02] p-6">
                                <h2 className="text-lg font-semibold mb-4">Coding Activity</h2>
                                <div className="grid grid-cols-[repeat(52,1fr)] gap-0.5">
                                    {Array.from({ length: 364 }).map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() - (363 - i));
                                        const dateKey = d.toISOString().split('T')[0];
                                        const count = heatmapData[dateKey] || 0;

                                        const bg = count > 5 ? "bg-purple-500" : count > 2 ? "bg-blue-500/80" : count > 0 ? "bg-blue-500/40" : "bg-white/5";
                                        return <div key={i} title={`${dateKey}: ${count} actions`} className={`${bg} rounded-[2px] transition-colors`} style={{ paddingBottom: "100%" }} />;
                                    })}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs text-green-400 font-mono">Real-time sync</span>
                                    <span className="text-xs text-gray-600">364 days of coding activity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
