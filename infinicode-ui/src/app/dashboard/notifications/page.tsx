"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, Inbox, MailOpen, FileText, Download, CheckCircle2, Bot, Users, BrainCircuit, GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";

import { InfinityLogo } from "@/components/ui/logo";

const tabItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Branch", icon: GitBranch, href: "/dashboard/branch" },
    { type: "separator" as const },
    { title: "Activity", icon: Activity, href: "/dashboard/activity" },
    { title: "Notifications", icon: Bell, href: "/dashboard/notifications" },
];

export default function NotificationsPage() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const displayName = user?.email?.split('@')[0] || "Developer";

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

    const notifications = [
        { id: 1, title: "Welcome to InfiniCode!", message: "Your workspace is ready. Head over to the editor to start coding.", time: "Just now", read: false },
        { id: 2, title: "Profile Security", message: "We recommend setting up 2FA for your account to enhance security.", time: "2 hours ago", read: false },
        { id: 3, title: "System Update", message: "Version 1.2 is live! We've added new features to the code editor including improved auto-complete.", time: "1 day ago", read: true },
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
                            <h1 className="text-xl font-bold">Notifications</h1>
                            <p className="text-gray-500 text-sm">Stay updated with your account and projects 🔔</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" />
                        </div>
                    </div>

                    <div className="p-6 max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Inbox className="w-5 h-5" /> Inbox
                            </h2>
                            <button className="text-sm text-gray-400 hover:text-white transition flex items-center gap-2">
                                <MailOpen className="w-4 h-4" /> Mark all as read
                            </button>
                        </div>

                        {notifications.map((notif, i) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "p-5 rounded-2xl border transition-all cursor-pointer",
                                    notif.read ? "bg-white/5 border-white/5" : "bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={cn("font-medium", notif.read ? "text-gray-300" : "text-white")}>{notif.title}</h3>
                                    <span className="text-xs text-gray-500">{notif.time}</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{notif.message}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
