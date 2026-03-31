"use client";
import React from "react";
import { Play, Bot, LayoutDashboard, LogOut, Settings, Users, CheckCircle2, Bot as BotIcon } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import { cn } from "@/lib/utils";

interface TopNavbarProps {
    projectId: string | null;
    project: any;
    user: any;
    logout: () => void;
    activeUsers: any[];
    userRole: string | null;
    isAiOpen: boolean;
    setAiOpen: (open: boolean) => void;
    isRunning: boolean;
    onRun: () => void;
    onHome: () => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    onRename?: (newName: string) => void;
    isSaving?: boolean;
    timeLeft?: number;
    isInterviewMode?: boolean;
}

import { InfinityLogo } from "@/components/ui/logo";

export function TopNavbar({
    projectId,
    project,
    user,
    logout,
    activeUsers,
    userRole,
    isAiOpen,
    setAiOpen,
    isRunning,
    onRun,
    onHome,
    showPreview,
    setShowPreview,
    onRename,
    isSaving,
    timeLeft,
    isInterviewMode
}: TopNavbarProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempName, setTempName] = React.useState(project?.name || "");

    React.useEffect(() => {
        setTempName(project?.name || "");
    }, [project?.name]);

    const handleRenameSubmit = () => {
        if (tempName && tempName !== project?.name && onRename) {
            onRename(tempName);
        }
        setIsEditing(false);
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-black/40 px-6 backdrop-blur-3xl z-40">
            <div className="flex items-center gap-6">
                <div onClick={onHome} className="cursor-pointer group flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                        <InfinityLogo size={20} />
                    </div>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input
                                autoFocus
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                                className="bg-white/5 border border-blue-500/30 rounded px-2 py-0.5 text-sm font-bold text-white outline-none"
                            />
                        ) : (
                            <LoadingBreadcrumb 
                                className="text-sm font-bold tracking-tight text-white/90 cursor-pointer hover:text-blue-400 transition-colors"
                                text={project?.name || "Untitled Project"}
                                onClick={() => userRole === 'admin' && setIsEditing(true)}
                            />
                        )}
                        {userRole === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-blue-400 border border-blue-500/20 tracking-tighter uppercase">Admin</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                            {isSaving ? (
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Saving...</span>
                            ) : (
                                <><CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> Saved</>
                            )}
                        </span>
                        <span className="opacity-30">•</span>
                        <span>{projectId === 'local' ? 'LocalStorage' : projectId?.substring(0, 8)}</span>
                    </div>
                </div>

                {isInterviewMode && timeLeft !== undefined && (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-mono font-black text-red-500 tracking-wider">
                            {Math.floor(timeLeft / 60)}:{ (timeLeft % 60).toString().padStart(2, '0') }
                        </span>
                        <span className="text-[9px] font-bold text-red-500/60 uppercase ml-1">Remaining</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all",
                        showPreview 
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                            : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                    )}
                >
                    <LayoutDashboard size={14} />
                    {showPreview ? "Preview Active" : "Show Preview"}
                </button>

                {/* Active Users Avatars */}
                <div className="flex -space-x-2">
                    {activeUsers.slice(0, 3).map((u, i) => (
                        <div 
                            key={u.id} 
                            title={u.email}
                            className="w-7 h-7 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/20"
                        >
                            <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="avatar" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={onRun}
                        disabled={isRunning}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95",
                            isRunning ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20"
                        )}
                    >
                        {isRunning ? <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <Play size={14} fill="currentColor" />}
                        <span>{isRunning ? "Running..." : "Run"}</span>
                    </button>

                    <button 
                        onClick={() => setAiOpen(!isAiOpen)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            isAiOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Bot size={14} /> AI
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={logout}>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
