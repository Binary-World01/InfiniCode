"use client";
import React, { useState } from "react";
import { X, Search, Terminal, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Component: ExtensionItem ---
const ExtensionItem = ({ ext }: { ext: any }) => {
    const [isInstalling, setIsInstalling] = useState(false);
    const [isInstalled, setIsInstalled] = useState(ext.id === 'prettier');

    const handleInstall = () => {
        if (isInstalled) return;
        setIsInstalling(true);
        setTimeout(() => {
            setIsInstalling(false);
            setIsInstalled(true);
        }, 2000);
    };

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 group hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                    {ext.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{ext.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="font-semibold text-blue-400/80">{ext.author}</span>
                        <span className="opacity-30">•</span>
                        <span>{ext.downloads}</span>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{ext.desc}</p>
            <button
                onClick={(e) => { e.stopPropagation(); handleInstall(); }}
                disabled={isInstalling}
                className={cn(
                    "w-full py-1.5 text-[10px] font-bold rounded-lg transition-all shadow-lg",
                    isInstalled
                        ? "bg-green-500/10 border border-green-500/20 text-green-400 cursor-default"
                        : "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20 active:scale-95"
                )}
            >
                {isInstalling ? "Installing..." : isInstalled ? "Installed" : "Install"}
            </button>
        </div>
    );
};

interface MarketplaceProps {
    onClose: () => void;
}

const extensions = [
    { id: 'prettier', name: 'Prettier - Code Formatter', author: 'Prettier', downloads: '38M', desc: 'Enforces a consistent style by parsing your code and re-printing it.', icon: '✨' },
    { id: 'eslint', name: 'ESLint', author: 'Microsoft', downloads: '32M', desc: 'Finds and fixes problems in your JavaScript code.', icon: '🛡️' },
    { id: 'gitlens', name: 'GitLens — Git supercharged', author: 'GitKraken', downloads: '25M', desc: 'Supercharge Git within VS Code — Visualize code authorship.', icon: '🪵' },
    { id: 'tailwind', name: 'Tailwind CSS IntelliSense', author: 'Tailwind Labs', downloads: '15M', desc: 'Intelligent Tailwind CSS tooling for VS Code.', icon: '🎨' },
    { id: 'python', name: 'Python', author: 'Microsoft', downloads: '110M', desc: 'IntelliSense (Pylance), Linting, Debugging (multi-threaded, remote).', icon: '🐍' },
    { id: 'copilot', name: 'GitHub Copilot', author: 'GitHub', downloads: '12M', desc: 'Your AI pair programmer.', icon: '🤖' },
];

export function Marketplace({ onClose }: MarketplaceProps) {
    return (
        <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 w-[350px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Marketplace</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-black">BETA</span>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={16} className="text-gray-500" />
                </button>
            </div>
            
            <div className="px-4 py-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search extensions..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Featured Extensions</span>
                    <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">See all</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {extensions.map(ext => (
                        <ExtensionItem key={ext.id} ext={ext} />
                    ))}
                </div>
            </div>
        </div>
    );
}
