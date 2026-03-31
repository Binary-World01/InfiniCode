"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Code, Settings, LogOut, Bell, FolderOpen,
    GitBranch, Activity, User, Key, Save, AlertCircle, CheckCircle2, Shield, CreditCard, Palette, MonitorSmartphone, BrainCircuit, GraduationCap, Users, UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

import { InfinityLogo } from "@/components/ui/logo";

export default function SettingsPage() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // UI State
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        bio: "",
        github_url: "",
        portfolio_url: "",
        theme_preference: "dark",
        font_size: 14,
        tab_size: 4,
        keymap_preference: "standard",
        auto_save: true,
        gemini_api_key: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile:", error);
                } else if (data) {
                    setProfile(data);
                    setFormData({
                        full_name: data.full_name || "",
                        username: data.username || "",
                        bio: data.bio || "",
                        github_url: data.github_url || "",
                        portfolio_url: data.portfolio_url || "",
                        theme_preference: data.theme_preference || "dark",
                        font_size: data.font_size || 14,
                        tab_size: data.tab_size || 4,
                        keymap_preference: data.keymap_preference || "standard",
                        auto_save: data.auto_save ?? true,
                        gemini_api_key: data.gemini_api_key || "",
                    });
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
        setSaveStatus("idle");
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveStatus("idle");

        try {
            let apiError = null;
            const updatePayload = {
                full_name: formData.full_name,
                username: formData.username,
                bio: formData.bio,
                github_url: formData.github_url,
                portfolio_url: formData.portfolio_url,
                theme_preference: formData.theme_preference,
                font_size: Number(formData.font_size),
                tab_size: Number(formData.tab_size),
                keymap_preference: formData.keymap_preference,
                auto_save: formData.auto_save,
                gemini_api_key: formData.gemini_api_key,
            };

            if (profile) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', user.id);
                apiError = error;
            } else {
                const { error } = await supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        email: user.email,
                        ...updatePayload
                    }]);
                apiError = error;
                if (!apiError) setProfile({ id: user.id });
            }

            if (apiError) throw apiError;

            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setSaveStatus("error");
            setErrorMessage(err.message || "Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Developer";

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

    const settingTabs = [
        { id: 'profile', label: 'Public Profile', icon: <User className="w-4 h-4" /> },
        { id: 'account', label: 'Account Security', icon: <Shield className="w-4 h-4" /> },
        { id: 'editor', label: 'Editor Preferences', icon: <MonitorSmartphone className="w-4 h-4" /> },
        { id: 'integrations', label: 'Integrations', icon: <Key className="w-4 h-4" /> },
    ];

    return (
        <AuthGuard>
            <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
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
                                label: displayName, href: "/dashboard/settings",
                                icon: <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">{displayName[0]?.toUpperCase()}</div>
                            }} />
                        </div>
                    </SidebarBody>
                </Sidebar>

                <div className="flex-1 overflow-y-auto w-full relative">
                    <div className="border-b border-white/5 px-8 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                            <p className="text-gray-400 text-sm">Manage your profile, preferences, and API integrations.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn(
                                    "px-6 py-2.5 flex items-center gap-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]",
                                    saveStatus === "success" ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-white text-black hover:bg-neutral-200",
                                    isSaving && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : saveStatus === "success" ? (
                                    <>Saved <CheckCircle2 className="w-4 h-4" /></>
                                ) : (
                                    <>Save Changes <Save className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

                        {/* Settings Sidebar Nav */}
                        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
                            {settingTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                                        activeTab === tab.id
                                            ? "bg-white text-black shadow-lg"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Settings Content Area */}
                        <div className="flex-1 space-y-8 pb-12">
                            {saveStatus === "error" && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">{errorMessage}</p>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-xl font-semibold mb-6">Avatar</h3>
                                            <div className="flex items-center gap-6">
                                                <div className="h-24 w-24 rounded-full border border-white/10 bg-neutral-900 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                                                    {displayName[0]?.toUpperCase()}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex gap-3">
                                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                                            <UploadCloud className="w-4 h-4" /> Upload New
                                                        </button>
                                                        <button className="px-4 py-2 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 rounded-lg text-sm font-medium transition-colors">
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-neutral-500">Recommended size: 256x256px. Max 2MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-5">
                                            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 font-medium">Display Name</label>
                                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 font-medium">Username</label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-gray-500 text-sm">@</span>
                                                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" className="flex-1 w-full bg-black border border-white/10 rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400 font-medium">Bio</label>
                                                <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Full-stack developer passionate about building..." rows={4} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition resize-none" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 font-medium">GitHub URL</label>
                                                    <input type="text" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 font-medium">Portfolio URL</label>
                                                    <input type="text" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* EDITOR TAB */}
                                {activeTab === 'editor' && (
                                    <motion.div
                                        key="editor"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-6">
                                            <h3 className="text-xl font-semibold">Workspace Configuration</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-sm text-gray-400 font-medium">IDE Theme</label>
                                                    <select name="theme_preference" value={formData.theme_preference} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                                                        <option value="dark">Dark Mode (Default)</option>
                                                        <option value="light">Light Mode</option>
                                                        <option value="high_contrast">High Contrast</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm text-gray-400 font-medium">Keymap Mode</label>
                                                    <select name="keymap_preference" value={formData.keymap_preference} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                                                        <option value="standard">Standard (VS Code)</option>
                                                        <option value="vim">Vim</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm text-gray-400 font-medium">Font Size (px)</label>
                                                    <input type="number" name="font_size" value={formData.font_size} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" min="10" max="32" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm text-gray-400 font-medium">Tab Size (spaces)</label>
                                                    <select name="tab_size" value={formData.tab_size} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                                                        <option value="2">2 Spaces</option>
                                                        <option value="4">4 Spaces</option>
                                                        <option value="8">8 Spaces</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-white mb-1">Auto-save Files</div>
                                                    <div className="text-sm text-neutral-500">Automatically save files to the cloud when typing stops.</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" name="auto_save" checked={formData.auto_save} onChange={handleChange} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#0a0a0a] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* INTEGRATIONS TAB */}
                                {activeTab === 'integrations' && (
                                    <motion.div
                                        key="integrations"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">Platform Integrations</h3>
                                                <p className="text-sm text-gray-400">
                                                    Link your accounts and provide API keys to unlock advanced features. Keys are encrypted at rest.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-5 border border-white/10 rounded-xl bg-white/[0.02]">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <label className="text-sm font-medium text-white flex items-center gap-2">Gemini API Key</label>
                                                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Get a key</a>
                                                        </div>
                                                        <input type="password" name="gemini_api_key" value={formData.gemini_api_key} onChange={handleChange} placeholder="AIzaSy..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition font-mono text-sm" />
                                                        <p className="text-xs text-neutral-500">Bypasses InfiniCode platform rate limits for the primary AI coding assistant.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ACCOUNT TAB */}
                                {activeTab === 'account' && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-6">
                                            <h3 className="text-xl font-semibold">Security Settings</h3>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 font-medium">Email Address</label>
                                                    <div className="flex gap-4">
                                                        <input type="email" disabled value={user?.email || ""} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-neutral-400 cursor-not-allowed" />
                                                        <button className="px-6 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium whitespace-nowrap">Change Email</button>
                                                    </div>
                                                </div>
                                                <div className="pt-4">
                                                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                                                        Send Password Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
                                            <h3 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h3>
                                            <p className="text-sm text-red-400/70 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                                            <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-sm font-medium transition-colors">
                                                Delete Account
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
