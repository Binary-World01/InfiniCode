"use client";
import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import {
    Code, Settings, Play, Terminal, Files, GitBranch,
    Search, Bot, LayoutDashboard, LogOut, ChevronRight, X
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
    { label: "Files", href: "/dashboard", icon: <Files className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Search", href: "/dashboard", icon: <Search className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Git", href: "/dashboard", icon: <GitBranch className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Terminal", href: "#", icon: <Terminal className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "AI Assistant", href: "#", icon: <Bot className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
    { label: "Settings", href: "/dashboard", icon: <Settings className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
];

const tabItems = [
    { title: "Main.tsx", icon: Code },
    { title: "utils.ts", icon: Code },
    { type: "separator" as const },
    { title: "Terminal", icon: Terminal },
    { title: "Run", icon: Play },
];

const sampleCode = `// InfiniCode IDE — AI-Powered Editor
// ∞ The infinite canvas for your code

import { useState, useEffect } from 'react';
import { GeminiClient } from '@infinicode/ai';

interface CodeSession {
  id: string;
  language: string;
  content: string;
  collaborators: string[];
}

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash'
});

export async function generateCode(prompt: string): Promise<string> {
  const response = await gemini.generate({
    prompt: \`Write clean, production-ready code for: \${prompt}\`,
    temperature: 0.7,
    maxTokens: 2048
  });
  
  return response.text;
}

export function useCollabSession(sessionId: string) {
  const [session, setSession] = useState<CodeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket(\`wss://api.infinicode.dev/collab/\${sessionId}\`);
    
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSession(data.session);
    };
    
    return () => ws.close();
  }, [sessionId]);
  
  return { session, isConnected };
}`;

export default function EditorPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(true);
    const [aiOpen, setAiOpen] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const { user, logout } = useAuth();

    // Terminal Log State
    const [terminalLines, setTerminalLines] = useState([
        { type: "sys", text: "InfiniCode Terminal v2.0.0" },
        { type: "sys", text: "─────────────────────────" },
        { type: "cmd", text: "~/infinicode-ui $ npm run dev" },
        { type: "sys", text: "▲ Next.js 16.1.6 (Turbopack)" },
        { type: "sys", text: "  Local: http://localhost:3000" },
        { type: "success", text: "✓ Ready in 1588ms" },
        { type: "empty", text: "" }
    ]);

    // AI Chat State
    const [aiInput, setAiInput] = useState("");
    const [aiResponse, setAiResponse] = useState([
        { role: "ai", text: "I see you're building a real-time collaboration feature! Here's what I suggest..." },
        { role: "user", text: "Can you add WebRTC peer-to-peer for lower latency?" },
        { role: "ai", text: "Great idea! WebRTC would reduce latency significantly. Let me refactor the useCollabSession hook..." },
    ]);

    const terminalEndRef = useRef<HTMLDivElement>(null);
    const aiEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll hooks
    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLines]);
    useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiResponse]);

    // Pick up prompt from landing page
    useEffect(() => {
        const lastPrompt = sessionStorage.getItem("last_prompt");
        if (lastPrompt) {
            // Add user message
            setAiResponse(prev => [...prev, { role: "user", text: lastPrompt }]);

            // Trigger AI response
            setTimeout(() => {
                setAiResponse(prev => [...prev, { role: "ai", text: "I've analyzed your prompt and I'm ready to help you build that! I've initialized the workspace with some boilerplate relevant to your project. What should we focus on first? 🚀" }]);
            }, 1000);

            // Clear the prompt
            sessionStorage.removeItem("last_prompt");
        }
    }, [setAiResponse]);

    const handleRun = () => {
        if (isRunning) return;
        setIsRunning(true);
        setTerminalOpen(true);

        // Simulating compilation pipelining
        setTerminalLines(prev => [...prev, { type: "cmd", text: "~/infinicode-ui $ infinicode run main.tsx" }, { type: "sys", text: "Compiling code..." }]);

        setTimeout(() => {
            setTerminalLines(prev => [...prev, { type: "success", text: "✓ Done in 1432ms" }]);

            setTimeout(() => {
                setTerminalLines(prev => [...prev,
                { type: "info", text: "✨ Build Successful" },
                { type: "info", text: "OUTPUT: " },
                { type: "cmd", text: "> Hello World from InfiniCode! 🚀" },
                { type: "empty", text: "" }
                ]);
                setIsRunning(false);
            }, 1000);
        }, 1500);
    };

    const handleAiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const userInput = aiInput;
        setAiInput("");
        setAiResponse(prev => [...prev, { role: "user", text: userInput }]);

        setTimeout(() => {
            setAiResponse(prev => [...prev, { role: "ai", text: "I am a simulated AI in this demo layout. I would typically stream a thoughtful response to your query right here! 🧠⚡" }]);
        }, 1200);
    };

    const sidebarLinks = [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Files", href: "/dashboard", icon: <Files className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Search", href: "/dashboard", icon: <Search className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Git", href: "/dashboard", icon: <GitBranch className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        {
            label: "Terminal",
            href: "#",
            icon: <Terminal className="text-neutral-400 h-5 w-5 flex-shrink-0" />,
            onClick: () => setTerminalOpen(true)
        },
        {
            label: "AI Assistant",
            href: "#",
            icon: <Bot className="text-neutral-400 h-5 w-5 flex-shrink-0" />,
            onClick: () => setAiOpen(true)
        },
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
            <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
                {/* Left Sidebar */}
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="flex items-center gap-2 mb-8 px-2">
                                <InfinityLogo size={28} />
                                <motion.span animate={{ display: sidebarOpen ? "inline-block" : "none", opacity: sidebarOpen ? 1 : 0 }} className="font-bold text-white whitespace-pre">InfiniCode</motion.span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {sidebarLinks.map((link, idx) => (
                                    <SidebarLink
                                        key={idx}
                                        link={link}
                                    />
                                ))}
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

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs Bar */}
                    <div className="border-b border-white/10 px-4 py-3 flex items-center gap-4 bg-black/40">
                        <ExpandableTabs tabs={tabItems} activeColor="text-blue-400" className="flex-shrink-0" />
                        <div className="flex-1" />
                        {isRunning && <LoadingBreadcrumb text="Compiling /" />}
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className={`flex items-center gap-2 px-4 py-1.5 ${isRunning ? "bg-gray-500/20 border-gray-500/30 text-gray-400" : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"} border rounded-lg text-sm font-medium transition-colors`}
                        >
                            <Play className="h-3.5 w-3.5" />Run
                        </button>
                        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Dashboard</Link>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Code Editor */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Line Numbers + Code */}
                            <div className="flex-1 overflow-auto bg-[#0d0d0d] p-4 font-mono text-sm shadow-inner">
                                <pre className="relative">
                                    <div className="flex gap-6">
                                        <div className="select-none text-right text-gray-700 leading-6 border-r border-white/5 pr-4 min-w-[30px]">
                                            {sampleCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                                        </div>
                                        <code className="text-gray-300 leading-6 whitespace-pre overflow-x-auto flex-1">
                                            {sampleCode.split('\n').map((line, i) => {
                                                let colored = line
                                                    .replace(/(\/\/.+)/g, '<span class="text-gray-500">$1</span>')
                                                    .replace(/\b(import|export|from|const|async|function|return|interface|await|new|useEffect|useState)\b/g, '<span class="text-blue-400">$1</span>')
                                                    .replace(/('[^']*'|`[^`]*`)/g, '<span class="text-green-400">$1</span>')
                                                    .replace(/\b(string|number|boolean)\b/g, '<span class="text-cyan-400">$1</span>');
                                                return <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />;
                                            })}
                                        </code>
                                    </div>
                                </pre>
                            </div>

                            {/* Terminal Panel */}
                            {terminalOpen && (
                                <div className="h-64 border-t border-white/10 bg-black flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
                                        <div className="flex items-center gap-2 text-sm text-gray-400"><Terminal className="h-4 w-4" />Terminal</div>
                                        <button onClick={() => setTerminalOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
                                        {terminalLines.map((line, i) => (
                                            <div key={i} className={
                                                line.type === 'sys' ? 'text-gray-500' :
                                                    line.type === 'cmd' ? 'text-white' :
                                                        line.type === 'info' ? 'text-blue-400 font-semibold' :
                                                            line.type === 'success' ? 'text-green-400' : ''
                                            }>
                                                {line.type === 'cmd' ? (
                                                    <><span className="text-blue-400">~/infinicode</span><span className="text-gray-500"> $ </span>{line.text.replace('~/infinicode-ui $ ', '').replace('~/infinicode $ ', '')}</>
                                                ) : line.text}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-1 mt-1 text-gray-500"><span className="text-blue-400">~/infinicode</span> $<span className="animate-pulse text-white ml-1">█</span></div>
                                        <div ref={terminalEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Panel */}
                        {aiOpen && (
                            <div className="w-80 border-l border-white/10 flex flex-col bg-black/40 backdrop-blur-md">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                    <div className="flex items-center gap-2 text-sm font-medium"><Bot className="h-4 w-4 text-purple-400" />AI Assistant</div>
                                    <button onClick={() => setAiOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {aiResponse.map((msg, i) => (
                                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-white/10'}`}>
                                                {msg.role === 'ai' ? '∞' : (user?.name?.[0].toUpperCase() || 'P')}
                                            </div>
                                            <div className={`text-xs leading-relaxed rounded-2xl px-3 py-2.5 max-w-[220px] shadow-sm ${msg.role === 'ai' ? 'bg-white/5 text-gray-300 border border-white/5' : 'bg-blue-500/20 text-blue-100 border border-blue-500/10'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={aiEndRef} />
                                </div>
                                <div className="p-4 border-t border-white/10 bg-black/20">
                                    <form onSubmit={handleAiSubmit} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus-within:border-white/20 transition-colors">
                                        <input
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            placeholder="Ask AI anything..."
                                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                                        />
                                        <button type="submit" className="text-blue-400 hover:text-blue-300 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
