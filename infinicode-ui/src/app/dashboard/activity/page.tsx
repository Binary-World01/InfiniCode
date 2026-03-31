"use client";
import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, CheckCircle2, GitCommit, UserPlus, Upload, FileCode2,
    Code2, Users, FilePlus, BrainCircuit, GraduationCap, Play
} from "lucide-react";
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

// Helper to format timestamps to relative time
function getRelativeTime(dateStr: string) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const elapsed = new Date(dateStr).getTime() - Date.now();

    const days = Math.round(elapsed / (1000 * 60 * 60 * 24));
    if (Math.abs(days) > 0) return rtf.format(days, 'day');

    const hours = Math.round(elapsed / (1000 * 60 * 60));
    if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');

    const minutes = Math.round(elapsed / (1000 * 60));
    return rtf.format(minutes, 'minute');
}

export default function ActivityPage() {
    const [open, setOpen] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [heatmapData, setHeatmapData] = useState<{ [date: string]: number }>({});
    const [isFetching, setIsFetching] = useState(true);

    const { user, logout } = useAuth();
    const displayName = user?.email?.split('@')[0] || "Developer";

    useEffect(() => {
        const fetchActivityData = async () => {
            if (!user) {
                setIsFetching(false);
                return;
            }
            try {
                // 1. Fetch Profile info (creation date)
                const { data: profile, error: profileError } = await supabase.from('profiles').select('created_at').eq('id', user.id).single();
                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Profile fetch error:", profileError);
                }

                // 2. Fetch Projects
                const { data: projects, error: projectsError } = await supabase.from('projects').select('id, name, created_at').eq('owner_id', user.id);
                if (projectsError) {
                    console.error("Projects fetch error:", projectsError);
                }

                // 3. Fetch Files
                let files: any[] = [];
                if (projects && projects.length > 0) {
                    const projectIds = projects.map(p => p.id);
                    const { data, error: filesError } = await supabase.from('project_files').select('id, project_id, name, created_at, updated_at').in('project_id', projectIds);
                    if (filesError) {
                        console.error("Files fetch error:", filesError);
                    }
                    if (data) files = data;
                }

                // 4. Fetch Data for Heatmap & Timeline (Activity Logs)
                const { data: activityData, error: activityError } = await supabase
                    .from('activity_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (activityError) console.error("Activity fetch error:", activityError);

                // Compile timeline events
                const allEvents: any[] = [];
                const dayCounts: { [date: string]: number } = {};

                const recordEvent = (dateStr: string, event: any) => {
                    allEvents.push({ ...event, date: dateStr });
                    const dateKey = new Date(dateStr).toISOString().split('T')[0];
                    dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
                };

                // Add Profile creation
                if (profile?.created_at) {
                    recordEvent(profile.created_at, { type: "auth", message: "Joined InfiniCode", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" });
                }

                // Add Projects creation (legacy fallbacks if activity_logs missing)
                projects?.forEach(p => {
                    const exists = activityData?.some(a => a.type === 'PROJECT_CREATE' && a.project_id === p.id);
                    if (!exists) {
                        recordEvent(p.created_at, { type: "create", message: `Created project '${p.name}'`, icon: FolderOpen, color: "text-green-400", bg: "bg-green-500/10" });
                    }
                });

                // Add Activity Logs (PROJECT_RUN, PROJECT_CREATE, PROJECT_RENAME, etc.)
                activityData?.forEach(a => {
                    let icon = Code2;
                    let color = "text-blue-400";
                    let bg = "bg-blue-500/10";
                    
                    if (a.type === 'PROJECT_RUN') { icon = Play; color = "text-yellow-400"; bg = "bg-yellow-500/10"; }
                    if (a.type === 'PROJECT_CREATE') { icon = FolderOpen; color = "text-green-400"; bg = "bg-green-500/10"; }
                    if (a.type === 'PROJECT_RENAME') { icon = GitBranch; color = "text-purple-400"; bg = "bg-purple-500/10"; }

                    recordEvent(a.created_at, { type: a.type, message: a.message, icon, color, bg });
                });

                // Add Files creation and updates (legacy support)
                files?.forEach(f => {
                    const projectName = projects?.find((p: any) => p.id === f.project_id)?.name || "Unknown Project";
                    const exists = activityData?.some(a => a.message.includes(f.name));
                    if (!exists) {
                        recordEvent(f.created_at, { type: "upload", message: `Added '${f.name}' to '${projectName}'`, icon: FileCode2, color: "text-orange-400", bg: "bg-orange-500/10" });
                    }
                });

                // Sort events descending
                allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setActivities(allEvents);
                setHeatmapData(dayCounts);

            } catch (err) {
                console.error("Error fetching activity:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchActivityData();
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
                    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
                        <div>
                            <h1 className="text-xl font-bold">Activity Log</h1>
                            <p className="text-gray-500 text-sm">Track your progress and contributions 📈</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" />
                        </div>
                    </div>

                    <div className="p-6 space-y-8 max-w-4xl mx-auto">
                        <div className="relative rounded-2xl border border-white/10 p-2">
                            <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
                            <div className="relative rounded-xl bg-white/[0.02] p-6">
                                <h2 className="text-lg font-semibold mb-4">Coding Activity Heatmap</h2>
                                <div className="grid grid-cols-[repeat(52,1fr)] gap-1 md:gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                                    {Array.from({ length: 364 }).map((_, i) => {
                                        // Generate dates going backwards from today
                                        const d = new Date();
                                        d.setDate(d.getDate() - (363 - i));
                                        const dateKey = d.toISOString().split('T')[0];
                                        const count = heatmapData[dateKey] || 0;

                                        const bg = count > 5 ? "bg-purple-500" : count > 2 ? "bg-blue-500/80" : count > 0 ? "bg-blue-500/40" : "bg-white/5";
                                        return <div key={i} title={`${dateKey}: ${count} actions`} className={`${bg} rounded-sm md:rounded w-full aspect-square`} />;
                                    })}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs text-green-400 font-mono">Real-time sync</span>
                                    <span className="text-xs text-gray-600">364 days of coding activity</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-6">Recent Timeline</h2>

                            {isFetching ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : activities.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                    {activities.slice(0, 50).map((activity, index) => {
                                        const Icon = activity.icon;
                                        return (
                                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 1) }}
                                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                    <div className={`w-8 h-8 rounded-full ${activity.bg} ${activity.color} flex items-center justify-center`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl shadow">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-bold text-white text-sm">{activity.type.toUpperCase()}</div>
                                                        <time className="font-mono text-gray-500 text-xs">{getRelativeTime(activity.date)}</time>
                                                    </div>
                                                    <div className="text-gray-300 text-sm">{activity.message}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                                    No activity found. Create a project to get started!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
