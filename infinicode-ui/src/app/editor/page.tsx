"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import {
    Code, Settings, Play, Terminal, Files, GitBranch,
    Search, Bot, LayoutDashboard, LogOut, ChevronRight, X, Users, Lock, UserPlus, CheckCircle2, Shield, Plus, ShieldAlert, Loader2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "@xterm/xterm/css/xterm.css";

class SafeBoundary extends React.Component<any, any> {
    constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, info: any) { console.warn("SafeBoundary Caught:", error, info); }
    render() {
        if (this.state.hasError) return (
            <div style={{ color: 'red', padding: '20px', background: 'black', height: '100vh', width: '100vw', zIndex: 9999, position: 'absolute' }}>
                <pre>{this.state.error?.toString()}</pre><br/>
                <pre>{this.state.error?.stack}</pre>
            </div>
        );
        return this.props.children;
    }
}

// --- Modular Components ---
import { TopNavbar } from "./components/TopNavbar";
import { FileExplorer } from "./components/FileExplorer";
import { EditorCanvas } from "./components/EditorCanvas";
import { TerminalPane } from "./components/TerminalPane";
import { Marketplace } from "./components/Marketplace";
import { ContextMenu } from "./components/ContextMenu";

// --- Types ---
export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
}

const buildFileTree = (files: any[]): FileNode[] => {
    const root: FileNode[] = [];
    const map: { [key: string]: FileNode } = {};

    files.forEach(file => {
        const parts = (file.path || "").split('/').filter(Boolean);
        let currentPath = '';

        parts.forEach((part: string, index: number) => {
            currentPath += `/${part}`;
            const isFolder = index < parts.length - 1;

            if (!map[currentPath]) {
                const node: FileNode = {
                    id: isFolder ? `folder-${currentPath}` : file.id,
                    name: part,
                    type: isFolder ? 'folder' : 'file',
                    path: currentPath,
                    content: isFolder ? undefined : file.content,
                    children: isFolder ? [] : undefined,
                    isOpen: false
                };
                map[currentPath] = node;

                if (index === 0) {
                    root.push(node);
                } else {
                    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                    map[parentPath]?.children?.push(node);
                }
            }
        });
    });

    return root;
};

// --- Branding Component ---
import { InfinityLogo } from "@/components/ui/logo";

export default function EditorPage() {
    return <SafeBoundary><EditorPageContent /></SafeBoundary>;
}

function EditorPageContent() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("id");

    // --- Access & Role State ---
    const [accessStatus, setAccessStatus] = useState<"checking" | "denied" | "lobby" | "granted">("checking");
    const [userRole, setUserRole] = useState<"viewer" | "writer" | "admin" | null>(null);
    const [pendingRequests, setPendingRequests] = useState<{ id: string, email: string }[]>([]);

    // --- Real-time Presence State ---
    const [activeUsers, setActiveUsers] = useState<any[]>([]);

    // --- Editor State ---
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(true);
    const [aiOpen, setAiOpen] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [extensionsOpen, setExtensionsOpen] = useState(false);
    const [editorTheme, setEditorTheme] = useState("vs-dark");
    const [project, setProject] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [aiInput, setAiInput] = useState("");
    const [aiResponse, setAiResponse] = useState<any[]>([]);
    const [isLocal, setIsLocal] = useState(false);
    const [terminalLines, setTerminalLines] = useState<any[]>([]);
    const [newItemModal, setNewItemModal] = useState<{ open: boolean, type: 'file' | 'folder' }>({ open: false, type: 'file' });
    const [modalValue, setModalValue] = useState("");
    const [isPyodideLoading, setIsPyodideLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, open: boolean, node: FileNode | null }>({ x: 0, y: 0, open: false, node: null });
    const [isProjectSaving, setIsProjectSaving] = useState(false);
    
    // --- Interview Mode State ---
    const [timeLeft, setTimeLeft] = useState<number>(2700); // 45 minutes
    const [isInterviewFinished, setIsInterviewFinished] = useState(false);
    const [isAssessing, setIsAssessing] = useState(false);

    // --- Global Error Silencing (Next.js Overlay Protection) ---
    useEffect(() => {
        const originalError = console.error;
        (window.console as any).error = (...args: any[]) => {
            const rawMsg = args.map(a => String(a)).join(' ');
            // Prevent the Turbopack feedback loop
            if (rawMsg.includes('stackframe') || rawMsg.includes('error-stack-parser')) return;
            
            // Redirect to terminal so the user still sees it
            writeToTerminal(`\x1b[31m[RUNTIME ERROR]\x1b[0m ${rawMsg}`);
            
            // Downgrade to warn to prevent Next.js from throwing the fatal Error Overlay
            console.warn("[Intercepted Error]", ...args);
        };
        return () => { (window.console as any).error = originalError; };
    }, []);

    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const aiEndRef = useRef<HTMLDivElement>(null);
    const editorChannelRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pyodideRef = useRef<any>(null);

    // 1. Initial Access Check
    useEffect(() => {
        if (!user) return;
        if (!projectId) {
            router.replace('/editor?id=local');
            return;
        }

        const verifyAccess = async () => {
            if (projectId === 'local') {
                setAccessStatus('granted');
                setUserRole('admin');
                setIsLocal(true);
                return;
            }

            try {
                // Check if user is owner
                const { data: proj, error: projErr } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (projErr) throw projErr;
                setProject(proj);

                if (proj.owner_id === user.id) {
                    setUserRole('admin');
                    setAccessStatus('granted');
                    return;
                }

                // Check project_collaborators
                const { data: collab } = await supabase
                    .from('project_collaborators')
                    .select('role')
                    .eq('project_id', projectId)
                    .eq('user_id', user.id)
                    .single();

                if (collab) {
                    setUserRole(collab.role as any);
                    setAccessStatus('granted');
                } else {
                    setAccessStatus('denied');
                }
            } catch (err: any) {
                console.warn("Access Auth Error:", err);
                if (err.code === 'PGRST116') setAccessStatus('denied'); // Not found
                else router.push('/dashboard');
            }
        };

        verifyAccess();
    }, [projectId, user, router]);

    // 2. Setup Lobby Channel (For requesting access)
    useEffect(() => {
        if (!projectId || !user) return;

        const lobbyChannel = supabase.channel(`lobby:${projectId}`)
            .on('broadcast', { event: 'access_request' }, (payload) => {
                // If I am admin, I receive requests
                if (userRole === 'admin') {
                    setPendingRequests(prev => [...prev, payload.payload]);
                }
            })
            .on('broadcast', { event: 'access_response' }, (payload) => {
                // If I am waiting in lobby, I receive host replies
                if (payload.payload.userId === user.id) {
                    if (payload.payload.status === 'accepted') {
                        setUserRole(payload.payload.role);
                        setAccessStatus('granted');
                    } else {
                        setAccessStatus('denied');
                        alert("The host denied your request to join.");
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(lobbyChannel);
        };
    }, [projectId, user, userRole]);

    // Update file tree when files list changes
    useEffect(() => {
        setFileTree(buildFileTree(files));
    }, [files]);

    const handleFolderToggle = (path: string) => {
        const toggleNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    return { ...node, isOpen: !node.isOpen };
                }
                if (node.children) {
                    return { ...node, children: toggleNode(node.children) };
                }
                return node;
            });
        };
        setFileTree(prev => toggleNode(prev));
    };

    // Initialize Terminal
    useEffect(() => {
        if (terminalOpen && terminalRef.current && !xtermRef.current) {
            const initTerminal = async () => {
                const { Terminal: XTerm } = await import("@xterm/xterm");
                const { FitAddon } = await import("@xterm/addon-fit");

                const xterm = new XTerm({
                    theme: {
                        background: '#0a0a0a',
                        foreground: '#a1a1aa',
                        cursor: '#3b82f6',
                        selectionBackground: 'rgba(59, 130, 246, 0.3)'
                    },
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono, monospace',
                    cursorBlink: true
                });

                const fitAddon = new FitAddon();
                xterm.loadAddon(fitAddon);
                xterm.open(terminalRef.current!);
                fitAddon.fit();

                xtermRef.current = xterm;
                fitAddonRef.current = fitAddon;

                // Write queued lines
                if (terminalLines.length > 0) {
                    terminalLines.forEach(line => xterm.writeln(line));
                    setTerminalLines([]);
                }
            };

            initTerminal();
        }

        const handleResize = () => fitAddonRef.current?.fit();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [terminalOpen]);

    // 3. Main Editor Data Load & Presence (Only when Granted)
    useEffect(() => {
        if (accessStatus !== 'granted' || !projectId || !user) return;

        console.log("Initializing Editor data and Presence...");

        const loadData = async () => {
            if (projectId === 'local') {
                // Load from localStorage if saved files exist
                const saved = localStorage.getItem('infinicode_local_files');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed.length > 0) {
                            setFiles(parsed);
                            setActiveFileId(parsed[0].id);
                            return;
                        }
                    } catch (_) { }
                }
                // Default scratchpad
                const defaultFiles = [{
                    id: 'local-scratch',
                    name: 'scratch.ts',
                    path: '/scratch.ts',
                    content: '// Welcome to your local scratchpad!\n// Files here are saved to localStorage.\n\nconsole.log("Hello, InfiniCode!");'
                }];
                setFiles(defaultFiles);
                setActiveFileId('local-scratch');
                localStorage.setItem('infinicode_local_files', JSON.stringify(defaultFiles));
                return;
            }

            // Fetch files
            const { data: fileData, error } = await supabase
                .from('project_files')
                .select('*')
                .eq('project_id', projectId)
                .order('name');

            if (error) {
                console.warn("Error fetching files:", error);
            }

            if (fileData) {
                setFiles(fileData);
                if (fileData.length > 0) setActiveFileId(fileData[0].id);
            }
        };

        loadData();

        // Setup Main Editor Real-time Sync & Presence
        const channel = supabase.channel(`editor:${projectId}`, {
            config: {
                presence: { key: user.id },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const presenceState = channel.presenceState();
                const users = Object.keys(presenceState).map(key => {
                    const presenceArray = presenceState[key] as any[];
                    return presenceArray[0]; // Take first presence for user
                });
                setActiveUsers(users);
            })
            .on('broadcast', { event: 'file_update' }, (payload) => {
                const { fileId, content } = payload.payload;
                // If someone else types, update state locally
                setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content } : f));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        id: user.id,
                        email: user.email,
                        role: userRole,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        editorChannelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [accessStatus, projectId, user, userRole]);

    // 3.8 Interview Timer logic
    useEffect(() => {
        if (searchParams.get('mode') === 'interview' && timeLeft > 0 && !isInterviewFinished) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isInterviewFinished) {
            handleFinishInterview();
        }
    }, [timeLeft, isInterviewFinished, searchParams]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleFinishInterview = async () => {
        if (isAssessing) return;
        setIsAssessing(true);
        writeToTerminal(`\x1b[34m[PROCTOR]\x1b[0m Commencing final technical assessment...`);

        try {
            const code = files.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n');
            const challengeId = searchParams.get('challengeId');
            
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `FINAL ASSESSMENT MODE. Analyze the following code for a technical interview.
                    Challenge ID: ${challengeId}
                    
                    ${code}
                    
                    Return raw JSON ONLY in this format:
                    {
                      "score": number (0-100),
                      "status": "PASS" | "FAIL",
                      "feedback": "string (concise summary of performance)",
                      "nextSteps": "string (what to study next)"
                    }`,
                    systemPrompt: "You are the Lead Technical Interviewer. You evaluate code based on correctness, complexity, and style. Be fair but strict. Return ONLY the JSON."
                })
            });

            const data = await res.json();
            const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("AI returned invalid evaluation format");
            const evaluation = JSON.parse(jsonMatch[0]);

            // Save to user_challenges
            if (challengeId && user) {
                await supabase.from('user_challenges').insert({
                    user_id: user.id,
                    challenge_id: challengeId,
                    status: evaluation.status === 'PASS' ? 'completed' : 'failed',
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    completed_at: new Date().toISOString()
                });
                
                logActivity('INTERVIEW_SCORE', `Completed interview for challenge ${challengeId} with score ${evaluation.score}%`);
            }

            setAiResponse(prev => [...prev, {
                role: "ai",
                text: `### Final Assessment: ${evaluation.status}\n\n**Score:** ${evaluation.score}%\n\n**Feedback:** ${evaluation.feedback}\n\n**Next Steps:** ${evaluation.nextSteps}`,
            }]);

            setIsInterviewFinished(true);
            writeToTerminal(`\x1b[32m[DONE]\x1b[0m Assessment complete. Score: ${evaluation.score}%`);

        } catch (err) {
            console.error("Assessment Error:", err);
            writeToTerminal(`\x1b[31m[ERROR]\x1b[0m Assessment failed. ${err instanceof Error ? err.message : ""}`);
        } finally {
            setIsAssessing(false);
        }
    };

    useEffect(() => {
        if (searchParams.get('mode') === 'interview' && aiResponse.length === 0) {
            setAiResponse([{
                role: "ai",
                text: "Welcome to your technical assessment. I will be your proctor today. Please review the problem description in the `solution.js` file and begin your implementation. You have 45 minutes. Feel free to ask me for clarifications, but be aware that I am evaluating your approach and communication. Good luck.",
                provider: "AI PROCTOR"
            }]);
        }
    }, [searchParams, aiResponse]);

    // --- Actions ---

    const requestAccess = async () => {
        setAccessStatus('lobby');
        await supabase.channel(`lobby:${projectId}`).send({
            type: 'broadcast',
            event: 'access_request',
            payload: { id: user?.id, email: user?.email }
        });
    };

    const logActivity = async (type: string, message: string) => {
        if (!user || projectId === 'local') return;
        try {
            await supabase.from('activity_logs').insert({
                user_id: user.id,
                project_id: projectId,
                type,
                message,
                created_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn("Error logging activity:", err);
        }
    };

    const handleRenameProject = async (newName: string) => {
        if (!projectId || projectId === 'local' || userRole !== 'admin') return;
        
        setIsProjectSaving(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ name: newName, updated_at: new Date().toISOString() })
                .eq('id', projectId);
            
            if (error) throw error;
            setProject((prev: any) => ({ ...prev, name: newName }));
            logActivity('PROJECT_RENAME', `Renamed project to "${newName}"`);
        } catch (err) {
            console.warn("Error renaming project:", err);
            alert("Failed to rename project.");
        } finally {
            setIsProjectSaving(false);
        }
    };

    const handleAcceptRequest = async (reqId: string, reqEmail: string) => {
        // Drop from UI pending map
        setPendingRequests(prev => prev.filter(r => r.id !== reqId));

        // 1. Write to DB
        await supabase.from('project_collaborators').insert({
            project_id: projectId,
            user_id: reqId,
            role: 'writer' // default to writer
        });

        // 2. Broadcast acceptance to them
        await supabase.channel(`lobby:${projectId}`).send({
            type: 'broadcast',
            event: 'access_response',
            payload: { userId: reqId, status: 'accepted', role: 'writer' }
        });
    };

    const handleRejectRequest = async (reqId: string) => {
        setPendingRequests(prev => prev.filter(r => r.id !== reqId));
        await supabase.channel(`lobby:${projectId}`).send({
            type: 'broadcast',
            event: 'access_response',
            payload: { userId: reqId, status: 'rejected' }
        });
    };


    // --- AI Chat Actions ---
    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInput.trim() || !projectId || !user) return;

        const userInput = aiInput;
        setAiInput("");
        setAiResponse(prev => [...prev, { role: "user", text: userInput }]);

        const isInterview = searchParams.get('mode') === 'interview';

        try {
            // Build conversation history
            const historyText = aiResponse.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n\n');

            // Append full workspace context so the AI can see the whole project!
            const tree = files.map(f => f.path).join('\n');
            const allFilesStr = files.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n');
            const context = `\n\n=== PROJECT CONTEXT ===\n\nFile Tree:\n${tree}\n\nFile Contents:\n${allFilesStr}\n\n=======================\n`;

            // Combine history, full context, and the new prompt
            const fullPrompt = `${historyText ? `--- Chat History ---\n${historyText}\n\n` : ''}${context}--- New User Message ---\n${userInput}`;


            const systemPrompt = isInterview
                ? "You are a professional Technical Interviewer from InfiniCode. Do NOT give solutions. Ask concise, probing questions about Big O complexity, edge cases, and architectural choices. Evaluate the candidate's communication as much as their code. One question at a time."
                : `You are an expert, elite senior software engineer acting as an autonomous agent (Antigravity Mode). 
Your task is to write complete, fully functional, production-ready code. 

ORGANIZATION REQUIREMENT: 
You MUST organize code into a professional directory structure (e.g., /src/components, /src/api, /src/styles). 

CRITICAL INSTRUCTION:
If you need to propose a direct file change, file creation, or code insertion, you MUST output a JSON block wrapped in \`\`\`json (action block). 
Do NOT output regular code blocks for file modifications. The JSON must exactly match this format:
\`\`\`json
{
  "action": "CREATE_FILE",
  "file": "src/components/FileName.tsx",
  "explanation": "Detailed explanation of exactly what this complex codebase does",
  "content": "THE ENTIRE, COMPLETE 100% PRODUCTION-READY SOURCE CODE GOES HERE."
}
\`\`\`
Actions supported: CREATE_FILE, UPDATE_FILE. Always provide the full file content in the 'content' field. If CREATE_FILE is used with a nested path, the IDE will automatically handle folder creation.`;

            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    model: 'auto', // Using the new autonomous fallback engine for 100% uptime
                    systemPrompt
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to connect to AI');

            setAiResponse(prev => [...prev, {
                role: "ai",
                text: data.reply,
                provider: data.provider
            }]);
        } catch (err: any) {
            setAiResponse(prev => [...prev, { role: "ai", text: "⚠️ Connection Error: " + err.message }]);
        }
    };

    const activeFile = files.find(f => f.id === activeFileId);
    const codeContent = activeFile?.content || "// Select a file to view code";

    const handleFileChange = async (newContent: string) => {
        if (!activeFileId || userRole === 'viewer') return;

        // Optimistic local update
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));

        // High-frequency Broadcast sub-100ms via WebSockets
        if (editorChannelRef.current) {
            editorChannelRef.current.send({
                type: 'broadcast',
                event: 'file_update',
                payload: { fileId: activeFileId, content: newContent }
            });
        }

        // --- Heavy Database Save (Debounced) ---
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        // Show "Saving..." indicator immediately
        setIsProjectSaving(true);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                if (projectId !== 'local') {
                    const { error: fileErr } = await supabase
                        .from('project_files')
                        .update({ content: newContent, updated_at: new Date().toISOString() })
                        .eq('id', activeFileId);

                    if (fileErr) throw fileErr;

                    const { error: projErr } = await supabase
                        .from('projects')
                        .update({ updated_at: new Date().toISOString() })
                        .eq('id', projectId);

                    if (projErr) throw projErr;

                    // Log activity occasionally (once per save burst)
                    if (activeFile) {
                        logActivity('CODE_EDIT', `Edited ${activeFile.name}`);
                    }
                }
            } catch (err: any) {
                console.warn("Autosave Error:", err);
                writeToTerminal(`\x1b[31m[Cloud Save Error]\x1b[0m ${err.message || "Unknown error"}`);
            } finally {
                // Done saving
                setIsProjectSaving(false);
            }
        }, 800); // Faster 800ms debounce
    };

    // Auto-save local files to localStorage whenever files state changes
    useEffect(() => {
        if (projectId === 'local' && files.length > 0) {
            localStorage.setItem('infinicode_local_files', JSON.stringify(files));
        }
    }, [files, projectId]);


    const parseAiMessage = (text: string) => {
        // Extract ALL ```json blocks from the AI response
        const actions: any[] = [];
        const globalRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
        let match;
        let cleanText = text;

        const allMatches: string[] = [];
        while ((match = globalRegex.exec(text)) !== null) {
            allMatches.push(match[0]);
            try {
                const parsed = JSON.parse(match[1]);
                if (parsed.action && parsed.file) {
                    actions.push(parsed);
                }
            } catch (_) { }
        }

        // Remove all matched blocks from the display text
        allMatches.forEach(m => { cleanText = cleanText.replace(m, '').trim(); });

        // Fallback for raw JSON objects (no backticks)
        if (actions.length === 0) {
            const rawRegex = /\{\s*"action"[\s\S]*?\}/g;
            let rawMatch;
            while ((rawMatch = rawRegex.exec(text)) !== null) {
                try {
                    const parsed = JSON.parse(rawMatch[0]);
                    if (parsed.action && parsed.file) {
                        actions.push(parsed);
                        cleanText = cleanText.replace(rawMatch[0], '').trim();
                    }
                } catch (_) { }
            }
        }

        if (actions.length === 0) return { text, actions: [] };
        return { text: cleanText || text, actions };
    };


    const applyFileAction = async (action: any, existingFilesList: any[]): Promise<any[]> => {
        // Normalize paths to always start with exactly one slash for reliable matching
        let filePath = action.file.startsWith('/') ? action.file : `/${action.file}`;
        let fileName = filePath.split('/').pop() || action.file;

        const existingFile = existingFilesList.find(f => {
            const fPath = f.path.startsWith('/') ? f.path : `/${f.path}`;
            return fPath === filePath;
        });

        if (existingFile) {
            // Update existing file in Supabase
            if (projectId !== 'local') {
                await supabase.from('project_files')
                    .update({ content: action.content, updated_at: new Date().toISOString() })
                    .eq('id', existingFile.id);
            }
            return existingFilesList.map(f => f.id === existingFile.id ? { ...f, content: action.content } : f);
        } else {
            // Create new file
            const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const newFileRecord = {
                id: fileId,
                project_id: projectId,
                name: fileName,
                path: filePath,
                content: action.content
            };
            if (projectId !== 'local') {
                await supabase.from('project_files').insert(newFileRecord);
            }
            return [...existingFilesList, newFileRecord];
        }
    };

    const handleApproveAction = async (action: any, msgIndex: number) => {
        setAiResponse(prev => prev.map((m, i) => i === msgIndex ? { ...m, accepted: true } : m));

        if (action.action === 'CREATE_FILE' || action.action === 'UPDATE_FILE') {
            const updatedFiles = await applyFileAction(action, files);
            setFiles(updatedFiles);
            const filePath = action.file.startsWith('/') ? action.file : `/${action.file}`;
            const applied = updatedFiles.find(f => f.path === filePath);
            if (applied) setActiveFileId(applied.id);
            writeToTerminal(`\x1b[32m✓\x1b[0m AI created ${action.file}`);
        }
    };

    const handleApproveAllActions = async (actions: any[], msgIndex: number) => {
        setAiResponse(prev => prev.map((m, i) => i === msgIndex ? { ...m, accepted: true } : m));
        writeToTerminal(`\x1b[34m[AI]\x1b[0m Creating ${actions.length} files...`);

        let currentFiles = [...files];
        let lastId: string | null = null;

        for (const action of actions) {
            if (action.action === 'CREATE_FILE' || action.action === 'UPDATE_FILE') {
                currentFiles = await applyFileAction(action, currentFiles);
                const fp = action.file.startsWith('/') ? action.file : `/${action.file}`;
                const created = currentFiles.find(f => f.path === fp);
                if (created) lastId = created.id;
                writeToTerminal(`\x1b[32m✓\x1b[0m Created ${action.file}`);
                logActivity('FILE_CREATE', `AI-generated file: ${action.file}`);
            }
        }
        setFiles(currentFiles);
        if (lastId) setActiveFileId(lastId);
        writeToTerminal(`\x1b[32m[DONE]\x1b[0m All ${actions.length} files created successfully.`);
        logActivity('AI_AGENT_APPLY', `Applied ${actions.length} file changes from AI`);
    };

    const handleRejectAction = (msgIndex: number) => {
        setAiResponse(prev => prev.map((m, i) => i === msgIndex ? { ...m, rejected: true } : m));
    };

    const handleCreateConfirm = async () => {
        if (!modalValue || userRole === 'viewer') {
            setNewItemModal({ ...newItemModal, open: false });
            setModalValue("");
            return;
        }

        const inputPath = modalValue;
        const isFolder = newItemModal.type === 'folder';

        // Ensure leading slash
        const filePath = inputPath.startsWith('/') ? inputPath : `/${inputPath}`;

        // Pick default comment style per file extension
        const getDefaultContent = (fname: string) => {
            const e = fname.split('.').pop()?.toLowerCase();
            if (['py', 'sh', 'rb', 'r'].includes(e || '')) return `# ${fname}\n`;
            if (['html', 'htm', 'xml', 'svg'].includes(e || '')) return `<!-- ${fname} -->\n`;
            if (['css', 'scss', 'less'].includes(e || '')) return `/* ${fname} */\n`;
            if (['json'].includes(e || '')) return `{}\n`;
            if (['md', 'markdown'].includes(e || '')) return `# ${fname}\n`;
            return `// ${fname}\n`;
        };

        if (isFolder) {
            const normalizedPath = filePath.endsWith('/') ? filePath : `${filePath}/`;
            const gitKeepPath = `${normalizedPath}.gitkeep`;
            const fileId = `folder-init-${Date.now()}`;
            const newFile = {
                id: fileId,
                project_id: projectId,
                name: '.gitkeep',
                path: gitKeepPath,
                content: `# Folder initialized: ${inputPath}`
            };
            setFiles(prev => [...prev, newFile]);
            if (projectId !== 'local') {
                const { error } = await supabase.from('project_files').insert(newFile);
                if (error) {
                    writeToTerminal(`\x1b[31m[ERROR]\x1b[0m Failed to create folder: ${error.message}`);
                    return;
                }
                logActivity('FILE_CREATE', `Created folder ${inputPath}`);
            }
        } else {
            const fileName = filePath.split('/').pop() || inputPath;
            const fileId = `file-${Date.now()}`;
            const newFile = {
                id: fileId,
                project_id: projectId,
                name: fileName,
                path: filePath,
                content: getDefaultContent(fileName)
            };
            setFiles(prev => [...prev, newFile]);
            setActiveFileId(fileId);
            if (projectId !== 'local') {
                const { error } = await supabase.from('project_files').insert(newFile);
                if (error) {
                    writeToTerminal(`\x1b[31m[ERROR]\x1b[0m Failed to create file: ${error.message}`);
                    return;
                }
                logActivity('FILE_CREATE', `Created file ${fileName}`);
            }
        }

        setNewItemModal({ ...newItemModal, open: false });
        setModalValue("");
    };

    const handleDeleteFile = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        
        const fileToDelete = files.find(f => f.id === id);
        setFiles(prev => prev.filter(f => f.id !== id));
        if (activeFileId === id) setActiveFileId(null);

        if (projectId !== 'local' && fileToDelete) {
            const { error } = await supabase.from('project_files').delete().eq('id', id);
            if (error) {
                writeToTerminal(`\x1b[31m[ERROR]\x1b[0m Failed to delete file: ${error.message}`);
                return;
            }
            logActivity('FILE_DELETE', `Deleted ${fileToDelete.name}`);
        }
    };

    const handleRenameFile = async (node: FileNode) => {
        const newName = window.prompt("Enter new name:", node.name);
        if (!newName || newName === node.name) return;

        const updatedFiles = files.map(f => {
            if (f.id === node.id || f.path === node.path) {
                const newPath = f.path.replace(new RegExp(`${node.name}$`), newName);
                return { ...f, name: f.id === node.id ? newName : f.name, path: newPath };
            }
            return f;
        });

        setFiles(updatedFiles);
        if (projectId !== 'local') {
            const { error } = await supabase.from('project_files').update({ name: newName }).eq('id', node.id);
            if (error) {
                writeToTerminal(`\x1b[31m[ERROR]\x1b[0m Failed to rename file: ${error.message}`);
                return;
            }
            logActivity('FILE_RENAME', `Renamed ${node.name} to ${newName}`);
        }
    };

    const handleCreateFile = () => setNewItemModal({ open: true, type: 'file' });
    const handleCreateFolder = () => setNewItemModal({ open: true, type: 'folder' });

    const writeToTerminal = (message: string) => {
        // Always use React state — reliable, no xterm init needed
        setTerminalLines(prev => [...prev, message]);
        // Also write to xterm if available
        if (xtermRef.current) {
            try { xtermRef.current.writeln(message); } catch (_) { }
        }
    };

    const handleRun = async () => {
        if (isRunning || !activeFile) return;
        setIsRunning(true);
        setTerminalOpen(true);
        
        // Log activity
        logActivity('PROJECT_RUN', `Executed ${activeFile.name}`);

        // Safety: auto-reset after 15s so button never stays stuck
        const safetyTimer = setTimeout(() => setIsRunning(false), 15000);

        const filename = activeFile.name;
        const content = activeFile.content || "";
        const ext = filename.split('.').pop()?.toLowerCase();

        // Small delay to let terminal open and render before writing
        await new Promise(r => setTimeout(r, 50));
        writeToTerminal(`\r\n\x1b[33m$\x1b[0m run ${filename}`);

        // --- HTML & React Frontend: Live Preview ---
        if (['html', 'htm', 'jsx', 'tsx'].includes(ext || "") || (content.includes('import React') && ['js', 'ts'].includes(ext || ""))) {
            setShowPreview(true);
            writeToTerminal('\x1b[34m[INFO]\x1b[0m Booting up Live Browser View...');
            setTimeout(() => {
                writeToTerminal('\x1b[32m[SUCCESS]\x1b[0m React App Builder started. Check the right panel for UI.');
                setIsRunning(false);
                writeToTerminal('\r\n\x1b[33m$\x1b[0m ');
            }, 500);
            return;
        }

        // --- JavaScript / TypeScript Script: In-Browser Execution via Babel ---
        if (['js', 'ts', 'mjs'].includes(ext || "")) {
            writeToTerminal(`\x1b[34m[EXEC]\x1b[0m Transpiling ${filename}...`);
            try {
                // Load Babel standalone if not already loaded
                if (!(window as any).Babel) {
                    writeToTerminal('\x1b[33m[LOAD]\x1b[0m Loading Babel transpiler...');
                    await new Promise<void>((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = 'https://unpkg.com/@babel/standalone/babel.min.js';

                        // Fix for Monaco Editor: temporary hide AMD define so Babel registers globally
                        const originalDefine = (window as any).define;
                        (window as any).define = undefined;

                        s.onload = () => {
                            (window as any).define = originalDefine;
                            let checks = 0;
                            const checkBabel = setInterval(() => {
                                if ((window as any).Babel) {
                                    clearInterval(checkBabel);
                                    resolve();
                                } else if (checks++ > 50) { // 5s max
                                    clearInterval(checkBabel);
                                    reject(new Error("Babel loaded but window.Babel is undefined."));
                                }
                            }, 100);
                        };
                        s.onerror = () => {
                            (window as any).define = originalDefine;
                            reject(new Error('Failed to load Babel.'));
                        };
                        document.head.appendChild(s);
                    });
                    writeToTerminal('\x1b[32m[READY]\x1b[0m Babel loaded.');
                }

                // Transpile with Babel into CommonJS format so imports become require() calls
                const transformed = (window as any).Babel.transform(content, {
                    presets: [
                        ['env', { modules: 'commonjs' }], // Converts ES imports to require()
                        ['typescript', { allExtensions: true }]
                    ],
                    filename: filename,
                }).code;

                // We no longer strip imports! Babel converted them to require()
                const execCode = transformed;

                // Custom require function to resolve other files in the editor
                const customRequire = (moduleName: string) => {
                    // Strip ./ or ../ and extensions for simple matching
                    let cleanName = moduleName.replace(/^\.\//, '').replace(/^\.\.\//, '').split('.')[0];

                    if (cleanName === 'react') return (window as any).React;
                    if (cleanName === 'react-dom') return (window as any).ReactDOM;

                    // Find the file in our state
                    const targetFile = files.find(f => f.name.startsWith(cleanName + '.') && ['js', 'jsx', 'ts', 'tsx'].includes(f.name.split('.').pop() || ''));
                    if (!targetFile) throw new Error(`Cannot find module '${moduleName}'`);

                    const targetExt = targetFile.name.split('.').pop();
                    const targetIsJSX = ['jsx', 'tsx'].includes(targetExt || '');

                    // Transpile the dependency
                    const depTransformed = (window as any).Babel.transform(targetFile.content || "", {
                        presets: [
                            ['env', { modules: 'commonjs' }],
                            ['typescript', { isTSX: targetIsJSX, allExtensions: true }],
                            ...(targetIsJSX ? [['react', { runtime: 'classic' }]] : []),
                        ],
                        filename: targetFile.name,
                    }).code;

                    // Evaluate the dependency
                    const module = { exports: {} };
                    const depFn = new Function('require', 'module', 'exports', 'React', 'ReactDOM', depTransformed);
                    depFn(customRequire, module, module.exports, (window as any).React, (window as any).ReactDOM);

                    return module.exports;
                };

                // Intercept console output
                const logs: string[] = [];
                const orig = { log: console.log, error: console.error, warn: console.warn };
                (window.console as any).log = (...a: any[]) => {
                    const msg = a.map((x: any) => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ');
                    logs.push(msg);
                    writeToTerminal(msg);
                    orig.log(...a);
                };
                (window.console as any).error = (...a: any[]) => {
                    const msg = a.map((x: any) => String(x)).join(' ');
                    logs.push(msg);
                    writeToTerminal(`\x1b[31m${msg}\x1b[0m`);
                    orig.error(...a);
                };
                (window.console as any).warn = (...a: any[]) => {
                    const msg = a.map((x: any) => String(x)).join(' ');
                    logs.push(msg);
                    writeToTerminal(`\x1b[33m${msg}\x1b[0m`);
                    orig.warn(...a);
                };

                try {
                    // Create headless mocks so components don't crash when evaluated
                    const mockReact = (window as any).React || {
                        createElement: () => ({ type: 'ReactElement' }),
                        Fragment: 'Fragment',
                        useState: (v: any) => [v, () => { }],
                        useEffect: () => { },
                    };
                    const mockReactDOM = (window as any).ReactDOM || {
                        render: () => writeToTerminal('\x1b[36m[React]\x1b[0m Component simulated (no DOM)'),
                        createRoot: () => ({
                            render: () => writeToTerminal('\x1b[36m[React]\x1b[0m Component root rendered (no DOM)')
                        })
                    };

                    const mainModule = { exports: {} };
                    const fn = new Function('require', 'module', 'exports', 'React', 'ReactDOM', execCode);
                    const result = fn(customRequire, mainModule, mainModule.exports, mockReact, mockReactDOM);
                    if (result instanceof Promise) await result;
                    if (logs.length === 0) {
                        writeToTerminal('\x1b[33m[Process exited — no console output. Use console.log() to print values.]\x1b[0m');
                    }
                } finally {
                    Object.assign(window.console, orig);
                }

                writeToTerminal('\x1b[32m[Done]\x1b[0m exit code 0');
            } catch (err: any) {
                writeToTerminal(`\x1b[31m[Error]\x1b[0m ${err.message}`);
                if (err.name === 'ReferenceError') {
                    writeToTerminal('\x1b[34m[TIP]\x1b[0m This environment uses Strict Mode. Ensure all variables are declared (e.g., `let i = 0` instead of `i = 0`).');
                }
            } finally {
                clearTimeout(safetyTimer);
                setIsRunning(false);
                writeToTerminal('\x1b[33m$ \x1b[0m');
            }
            return;
        }


        // --- Python: Pyodide (Local WASM) ---
        if (ext === 'py') {
            writeToTerminal('\x1b[34m[EXEC]\x1b[0m Starting Python runtime (Pyodide)...');
            try {
                if (!pyodideRef.current) {
                    writeToTerminal('\x1b[33m[LOAD]\x1b[0m Loading Pyodide (first run may take ~5s)...');
                    if (!(window as any).loadPyodide) {
                        await new Promise<void>((resolve, reject) => {
                            const script = document.createElement("script");
                            script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
                            script.onload = () => resolve();
                            script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }
                    pyodideRef.current = await (window as any).loadPyodide({
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                        stdout: (text: string) => writeToTerminal(text),
                        stderr: (text: string) => writeToTerminal(`\x1b[31m${text}\x1b[0m`),
                    });
                    writeToTerminal('\x1b[32m[READY]\x1b[0m Python runtime loaded.');
                }

                writeToTerminal('\x1b[32m[RUN]\x1b[0m Syncing files & Executing script...');
                files.forEach(f => {
                    if (f.content !== undefined && f.path) {
                        try {
                            const p = f.path.startsWith('/') ? f.path.substring(1) : f.path;
                            const parts = p.split('/');
                            parts.pop();
                            let curr = '';
                            for (const d of parts) {
                                curr += (curr ? '/' : '') + d;
                                try { pyodideRef.current.FS.mkdir(curr); } catch (e) {}
                            }
                            pyodideRef.current.FS.writeFile(p, f.content);
                        } catch (e) {
                            console.warn("Pyodide FS sync error:", e);
                        }
                    }
                });
                await pyodideRef.current.runPythonAsync(content);
                writeToTerminal('\x1b[32m[DONE]\x1b[0m Script finished.');
            } catch (err: any) {
                writeToTerminal(`\x1b[31m[Python Error]\x1b[0m ${err.message}`);
            } finally {
                clearTimeout(safetyTimer);
                setIsRunning(false);
                writeToTerminal('\r\n\x1b[33m$\x1b[0m ');
            }
            return;
        }

        // --- Other Languages: Run via Java Backend ---
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        writeToTerminal(`\x1b[34m[EXEC]\x1b[0m Sending ${filename} to InfiniCode Cloud Runtime...`);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        try {
            const res = await fetch(`${backendUrl}/api/execute`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Session-Id': projectId || 'default',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    language: ext,
                    code: content,
                    mainFile: activeFile.path,
                    files: files.filter(f => f.content !== undefined).map(f => ({ path: f.path, content: f.content }))
                })
            });

            const data = await res.json();
            if (data.stdout) writeToTerminal(data.stdout);
            if (data.stderr) writeToTerminal(`\x1b[31m${data.stderr}\x1b[0m`);
            if (data.executionTimeMs) writeToTerminal(`\x1b[32m[Done]\x1b[0m exit code ${data.success ? 0 : 1} (${data.executionTimeMs}ms)`);
        } catch (err: any) {
            writeToTerminal(`\x1b[31m[Runtime Error]\x1b[0m ${err.message}`);
            writeToTerminal(`\x1b[34m[TIP]\x1b[0m Local in-browser support: .js, .jsx, .ts, .tsx, .py, .html`);
        } finally {
            clearTimeout(safetyTimer);
            setIsRunning(false);
            writeToTerminal('\r\n\x1b[33m$\x1b[0m ');
        }
    };


    const handleOpenInBrowser = () => {
        if (!activeFile || !['html', 'htm'].includes(activeFile.name.split('.').pop()?.toLowerCase() || "")) {
            alert("Please select an HTML file to open in the browser.");
            return;
        }
        const blob = new Blob([activeFile.content || ""], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };


    // --- Sidebars & Menus ---
    const mainSidebarLinks = [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        { label: "Files", href: "#", icon: <Files className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: any) => { e.preventDefault(); setExtensionsOpen(false); } },
        { label: "Extensions", href: "#", icon: <Plus className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: any) => { e.preventDefault(); setExtensionsOpen(true); } },
        { label: "Search", href: "#", icon: <Search className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: any) => e.preventDefault() },
        { label: "Terminal", href: "#", icon: <Terminal className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: any) => { e.preventDefault(); setTerminalOpen(true); } },
        { label: "AI Assistant", href: "#", icon: <Bot className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: any) => { e.preventDefault(); setAiOpen(true); } },
        { label: "Settings", href: "/dashboard/settings", icon: <Settings className="text-neutral-400 h-5 w-5 flex-shrink-0" /> },
        {
            label: "Sign Out", href: "#", icon: <LogOut className="text-neutral-400 h-5 w-5 flex-shrink-0" />, onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                logout();
            }
        },
    ];

    // --- Lobby Render States ---
    if (accessStatus === "checking") {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin border-4 border-white/10 border-t-blue-500 rounded-full w-12 h-12"></div>
            </div>
        );
    }

    if (accessStatus === "denied") {
        return (
            <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
                <div className="max-w-md w-full p-8 border border-white/10 rounded-2xl bg-black/40 text-center shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Private Workspace</h2>
                        <p className="text-neutral-400 text-sm">You do not have permission to view this project. If you were invited, request access below to notify the host.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={requestAccess} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                            Request Access
                        </button>
                        <Link href="/dashboard" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors inline-block">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (accessStatus === "lobby") {
        return (
            <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
                <div className="max-w-md w-full p-8 border border-white/10 rounded-2xl bg-black/40 text-center shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <UserPlus className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
                        <p className="text-neutral-400 text-sm">Your access request has been sent via private channel. The workspace will load instantly when the host accepts.</p>
                    </div>
                    <div className="flex justify-center pt-4">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                    <Link href="/dashboard" className="block text-sm text-neutral-500 hover:text-white transition-colors mt-6">
                        Cancel and return
                    </Link>
                </div>
            </div>
        );
    }

    // --- In-Browser React Sandbox ---
    const getPreviewHtml = () => {
        const hasReact = files.some(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx') || (f.content?.includes('import React') && (f.name.endsWith('.ts') || f.name.endsWith('.js'))));

        const bundleHtml = (html: string) => {
            let bundled = html;
            // 1. Replace CSS links with inline styles
            bundled = bundled.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
                const fileName = href.split('/').pop();
                // Match by exact name or relative path ending
                const cssFile = files.find(f => f.name === fileName || f.path.endsWith(href.startsWith('/') ? href : '/' + href));
                if (cssFile) return `<style data-file="${href}">${cssFile.content}</style>`;
                return match;
            });
            // 2. Replace JS scripts with inline scripts
            bundled = bundled.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (match, src) => {
                const fileName = src.split('/').pop();
                const jsFile = files.find(f => f.name === fileName || f.path.endsWith(src.startsWith('/') ? src : '/' + src));
                if (jsFile) return `<script data-file="${src}">${jsFile.content}</script>`;
                return match;
            });
            return bundled;
        };

        if (!hasReact) {
            let htmlContent = "";
            if (activeFile?.name.endsWith('.html')) htmlContent = activeFile.content || "";
            else {
                const indexHtml = files.find(f => f.name === 'index.html');
                if (indexHtml) htmlContent = indexHtml.content || "";
            }

            if (htmlContent) return bundleHtml(htmlContent);

            return `<html><body style="font-family:sans-serif;padding:20px;text-align:center;color:#666;">
                <h3>No HTML File Found</h3>
                <p style="font-size:12px;">Create an index.html or select an HTML file to preview.</p>
            </body></html>`;
        }

        // Safely stringify the file system to inject into the iframe without breaking script tags
        const safeFiles = JSON.stringify(files).replace(/</g, '\\u003c');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
                <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.10/babel.min.js"></script>
                <style>body { margin: 0; padding: 0; font-family: sans-serif; }</style>
                <script>
                    const renderError = (title, message) => {
                        const root = document.getElementById('root') || document.body;
                        if (!root.innerHTML.includes('Runtime Error')) {
                            root.innerHTML = '<div style="color:#ef4444;background:#fee2e2;padding:20px;font-family:monospace;border:1px solid #fca5a5;border-radius:8px;margin:20px;white-space:pre-wrap;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"><b>' + title + '</b><br/><br/>' + message + '</div>';
                        }
                    };

                    window.onerror = function(msg, url, line, col, err) {
                        renderError('Runtime Error', msg + '\\n\\n' + (err && err.stack ? err.stack : ''));
                    };
                    window.onunhandledrejection = function(event) {
                        renderError('Unhandled Promise Rejection', event.reason);
                    };
                    const originalConsoleError = console.error;
                    console.error = function(...args) {
                        originalConsoleError.apply(console, args);
                        const msg = args.map(a => typeof a === 'object' && a instanceof Error ? a.stack || a.message : String(a)).join(' ');
                        // Many React 18 createRoot crashes just log to console.error and unmount
                        if (msg.includes('The above error occurred') || msg.includes('Minified React error') || /error/i.test(msg)) {
                            renderError('React Error', msg);
                        }
                    };
                </script>
            </head>
            <body>
                <div id="root">
                    <div style="padding: 20px; color: #888; text-align: center; font-family: sans-serif;">
                        <svg class="animate-spin" style="width:24px;height:24px;margin:0 auto 10px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
                            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path opacity="0.75" fill="#3b82f6" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
                        Compiling React App...
                    </div>
                </div>
                <script>
                    window.PROJECT_FILES = ${safeFiles};
                    
                    const customRequire = (moduleName) => {
                        if (moduleName === 'react') return window.React;
                        if (moduleName === 'react-dom' || moduleName === 'react-dom/client') return window.ReactDOM;

                        if (moduleName.endsWith('.css')) {
                            const cssName = moduleName.split('/').pop();
                            const cssFile = window.PROJECT_FILES.find(f => f.name === cssName || f.path.endsWith(cssName));
                            if (cssFile) {
                                const style = document.createElement('style');
                                style.textContent = cssFile.content;
                                document.head.appendChild(style);
                            }
                            return {};
                        }
                        
                        // Fake SVGs/Images
                        if (moduleName.match(/\\.(svg|png|jpg|jpeg|gif)$/i)) {
                            return 'data:image/svg+xml;utf8,<svg></svg>';
                        }

                        let cleanName = moduleName.replace(/^\\.\\/?/, '').replace(/^\\.\\.\\/?/g, '').split('/').pop().split('.')[0];
                        const targetFile = window.PROJECT_FILES.find(f => f.name.startsWith(cleanName + '.') && ['js', 'jsx', 'ts', 'tsx'].includes(f.name.split('.').pop() || ''));
                        
                        if (!targetFile) throw new Error("Cannot resolve module '" + moduleName + "' (Make sure the file exists)");
                        
                        const targetIsJSX = ['jsx', 'tsx'].includes(targetFile.name.split('.').pop() || '');
                        
                        const compiled = window.Babel.transform(targetFile.content || "", {
                            presets: [
                                ['env', { modules: 'commonjs' }],
                                ['typescript', { isTSX: targetIsJSX, allExtensions: true }],
                                ...(targetIsJSX ? [['react', { runtime: 'classic' }]] : []),
                            ],
                            filename: targetFile.name,
                        }).code;

                        const module = { exports: {} };
                        const depFn = new Function('require', 'module', 'exports', 'React', 'ReactDOM', compiled);
                        depFn(customRequire, module, module.exports, window.React, window.ReactDOM);
                        return module.exports;
                    };

                    const initApp = () => {
                        window.onerror = null; // Clear early load error handler if we want, but let's keep it
                        if (!window.Babel) {
                            setTimeout(initApp, 100);
                            return;
                        }
                        const entryFiles = window.PROJECT_FILES.filter(f => /^index\\.(tsx|jsx|ts|js)$/.test(f.name));
                        const entryFile = entryFiles.find(f => f.path.includes('src/')) || entryFiles[0];
                        
                        if (entryFile) {
                            try {
                                document.getElementById('root').innerHTML = '';
                                customRequire(entryFile.name);
                            } catch(e) {
                                renderError('Compile Error', e.message + '\\n' + (e.stack || ''));
                            }
                        } else {
                            document.getElementById('root').innerHTML = '<div style="color:#666;padding:20px;">No React entry point (e.g. index.tsx) found.</div>';
                        }
                    };

                    window.onload = initApp;
                </script>
            </body>
            </html>
        `;
    };

    // --- Main Editor Render (Granted) ---
    const handleGlobalContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const nodeEl = target.closest('[data-node-id]');
        
        if (nodeEl) {
            const id = nodeEl.getAttribute('data-node-id');
            const path = nodeEl.getAttribute('data-node-path');
            const type = nodeEl.getAttribute('data-node-type');
            const name = nodeEl.textContent?.trim() || "";

            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                open: true,
                node: { id: id!, path: path!, type: type as any, name, isOpen: false }
            });
        } else {
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                open: true,
                node: null
            });
        }
    };

    return (
        <AuthGuard>
            <main 
                className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden relative"
                onContextMenu={handleGlobalContextMenu}
            >

                {/* --- Toast Overlays for Admins --- */}
                <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-3">
                    <AnimatePresence>
                        {pendingRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-black/80 backdrop-blur-xl border border-blue-500/30 p-4 rounded-xl shadow-2xl w-80 flex flex-col gap-3"
                            >
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Access Request</h4>
                                        <p className="text-xs text-neutral-400 truncate">{req.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAcceptRequest(req.id, req.email)} className="flex-1 bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-400 transition-colors">
                                        Accept
                                    </button>
                                    <button onClick={() => handleRejectRequest(req.id)} className="flex-1 bg-white/10 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-white/20 transition-colors">
                                        Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>


                {/* Left Sidebar */}
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                    <SidebarBody className="justify-between gap-10">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <div className={cn("flex items-center mb-8 px-2 transition-all duration-300 w-full", sidebarOpen ? "gap-2 justify-start" : "justify-center")}>
                                <div className="flex-shrink-0 flex items-center justify-center"><InfinityLogo size={42} /></div>
                                <motion.span animate={{ display: sidebarOpen ? "inline-block" : "none", opacity: sidebarOpen ? 1 : 0 }} className="font-bold text-white whitespace-pre text-xl">InfiniCode</motion.span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {mainSidebarLinks.map((link, idx) => <SidebarLink key={idx} link={link} />)}
                            </div>
                        </div>
                    </SidebarBody>
                </Sidebar>

                {/* --- Main Editor Area --- */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* --- Top Navbar --- */}
                    <TopNavbar 
                        projectId={projectId}
                        project={project}
                        user={user}
                        logout={logout}
                        activeUsers={activeUsers}
                        userRole={userRole}
                        isAiOpen={aiOpen}
                        setAiOpen={setAiOpen}
                        isRunning={isRunning}
                        onRun={handleRun}
                        onHome={() => router.push("/dashboard")}
                        showPreview={showPreview}
                        setShowPreview={setShowPreview}
                        onRename={handleRenameProject}
                        isSaving={isProjectSaving}
                        timeLeft={timeLeft}
                        isInterviewMode={searchParams.get('mode') === 'interview'}
                    />

                    <div className="flex-1 flex overflow-hidden">

                        <div className="flex-1 flex overflow-hidden">
                            {/* --- Conditional Side Pane (Explorer or Marketplace) --- */}
                            {extensionsOpen ? (
                                <Marketplace onClose={() => setExtensionsOpen(false)} />
                            ) : (
                                <FileExplorer 
                                    fileTree={fileTree}
                                    activeFileId={activeFileId}
                                    onFileClick={(id: string) => setActiveFileId(id)}
                                    onFolderToggle={handleFolderToggle}
                                    onCreateFile={handleCreateFile}
                                    onCreateFolder={handleCreateFolder}
                                />
                            )}

                            {contextMenu.open && (
                                <ContextMenu
                                    x={contextMenu.x}
                                    y={contextMenu.y}
                                    onClose={() => setContextMenu({ ...contextMenu, open: false })}
                                    actions={contextMenu.node ? [
                                        { label: "Run File", icon: Play, onClick: () => { if (contextMenu.node?.type === 'file') { setActiveFileId(contextMenu.node.id); handleRun(); } } },
                                        { label: "Rename", icon: Files, iconClassName: "scale-75", onClick: () => contextMenu.node && handleRenameFile(contextMenu.node) },
                                        { label: "Delete", icon: X, onClick: () => contextMenu.node && handleDeleteFile(contextMenu.node.id), danger: true },
                                        { label: "Copy Path", icon: Code, onClick: () => contextMenu.node && navigator.clipboard.writeText(contextMenu.node.path) },
                                    ] : [
                                        { label: "New File", icon: Plus, onClick: handleCreateFile },
                                        { label: "New Folder", icon: Files, iconClassName: "scale-75", onClick: handleCreateFolder },
                                        { label: "Run Project", icon: Play, iconClassName: "text-green-500", onClick: handleRun },
                                        { label: "Global Search", icon: Search, onClick: () => console.log("Search") },
                                    ]}
                                />
                            )}

                            {/* --- Editor Canvas --- */}
                            <EditorCanvas 
                                userRole={userRole}
                                editorTheme={editorTheme}
                                activeFile={activeFile}
                                codeContent={codeContent}
                                onCodeChange={(val: string) => handleFileChange(val)}
                            />

                            {/* --- Terminal Pane --- */}
                            <TerminalPane 
                                terminalOpen={terminalOpen}
                                isRunning={isRunning}
                                terminalLines={terminalLines}
                                onClear={() => setTerminalLines([])}
                                onClose={() => setTerminalOpen(false)}
                                terminalRef={terminalRef}
                            />

                            {/* New Item Modal */}
                            <AnimatePresence>
                                {newItemModal.open && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                            className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    {newItemModal.type === 'file' ? <Plus className="text-blue-400 w-5 h-5" /> : <Files className="text-blue-400 w-5 h-5" />}
                                                    Create New {newItemModal.type === 'file' ? 'File' : 'Folder'}
                                                </h3>
                                                <button onClick={() => setNewItemModal({ ...newItemModal, open: false })} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4" /></button>
                                            </div>
                                            <p className="text-xs text-gray-500">Enter the path for your new {newItemModal.type}. Supports subdirectories (e.g. src/utils/helper.ts)</p>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={modalValue}
                                                onChange={(e) => setModalValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateConfirm()}
                                                placeholder={newItemModal.type === 'file' ? "src/components/Button.tsx" : "src/assets"}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                            />
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => setNewItemModal({ ...newItemModal, open: false })}
                                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCreateConfirm}
                                                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-xs font-semibold text-white transition-colors"
                                                >
                                                    Create {newItemModal.type === 'file' ? 'File' : 'Folder'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>

                        {/* Live Preview Panel */}
                        {showPreview && (
                            <div className="w-[400px] border-l border-white/10 bg-white flex flex-col animate-in slide-in-from-right duration-300">
                                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Browser View</span>
                                    <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-200 rounded"><X className="w-3 h-3 text-gray-500" /></button>
                                </div>
                                <div className="flex-1 bg-white relative">
                                    <iframe
                                        title="Preview"
                                        className="w-full h-full border-none absolute inset-0 bg-white"
                                        srcDoc={getPreviewHtml()}
                                    />
                                </div>
                            </div>
                        )}

                        {/* AI Assistant Panel */}
                        {aiOpen && (
                            <div className="w-80 border-l border-white/10 flex flex-col bg-[#0a0a0a]">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Bot className="h-4 w-4 text-purple-400" />
                                        {searchParams.get('mode') === 'interview' ? 'Technical Interviewer' : 'AI Assistant'}
                                    </div>
                                    <button onClick={() => setAiOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                                    {aiResponse.map((msg, i) => {
                                        if (msg.role === 'user') {
                                            return (
                                                <div key={i} className="flex gap-3 flex-row-reverse">
                                                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-white/10">
                                                        {user?.email?.[0].toUpperCase() || 'P'}
                                                    </div>
                                                    <div className="text-xs leading-relaxed rounded-2xl px-3 py-2.5 max-w-[220px] shadow-sm bg-blue-500/20 text-blue-100 border border-blue-500/10 whitespace-pre-wrap break-words">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const { text, actions } = parseAiMessage(msg.text);
                                        return (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-blue-500 to-purple-600">
                                                    ∞
                                                </div>
                                                <div className="flex flex-col gap-2 max-w-[220px] w-full">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                                            {msg.provider || "AI ASSISTANT"}
                                                        </span>
                                                        <div className="h-[1px] flex-1 bg-white/5" />
                                                    </div>
                                                    {text && (
                                                        <div className="text-xs leading-relaxed rounded-2xl px-3 py-2.5 shadow-sm bg-white/5 text-gray-300 border border-white/5 whitespace-pre-wrap break-words prose-invert max-w-none">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 className="text-sm font-bold mt-3 mb-1 text-white" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-xs font-bold mt-3 mb-1 text-white" {...props} />,
                                                                    h3: ({ node, ...props }) => <h3 className="text-[11px] font-bold mt-3 mb-1 text-white" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                    code: ({ node, className, children, ...props }: any) => {
                                                                        const isInline = !className;
                                                                        return isInline
                                                                            ? <code className="bg-white/10 text-indigo-300 rounded px-1 py-0.5 text-[10px] font-mono break-all" {...props}>{children}</code>
                                                                            : <code className="block bg-black/40 text-blue-200 rounded p-2 text-[10px] font-mono overflow-x-auto my-2 border border-white/5" {...props}>{children}</code>;
                                                                    },
                                                                    a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />
                                                                }}
                                                            >
                                                                {text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                    {actions && actions.length > 0 && (
                                                        <div className="flex flex-col gap-2">
                                                            {/* Approve All button for multi-file responses */}
                                                            {actions.length > 1 && !msg.accepted && !msg.rejected && (
                                                                <button
                                                                    onClick={() => handleApproveAllActions(actions, i)}
                                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[10px] font-bold py-2 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Approve All ({actions.length} files)
                                                                </button>
                                                            )}
                                                            {msg.accepted && (
                                                                <div className="text-xs text-green-400 flex items-center gap-1 font-medium px-1"><CheckCircle2 className="w-3 h-3" /> All {actions.length} files created</div>
                                                            )}
                                                            {/* Individual file cards */}
                                                            {actions.map((action: any, ai: number) => (
                                                                <div key={ai} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-3 shadow-lg flex flex-col gap-2 relative overflow-hidden">
                                                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 left-0" />
                                                                    <div className="flex items-center gap-2">
                                                                        <Code className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                                                        <span className="text-[9px] font-semibold text-white truncate">{action.action}</span>
                                                                    </div>
                                                                    <div className="bg-black/40 rounded border border-white/5 p-1.5 font-mono text-[9px] text-blue-300 truncate">
                                                                        {action.file}
                                                                    </div>
                                                                    {actions.length === 1 && !msg.accepted && !msg.rejected && (
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleApproveAction(action, i)} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded transition-colors">Approve</button>
                                                                            <button onClick={() => handleRejectAction(i)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-bold py-1.5 rounded transition-colors">Reject</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {!msg.accepted && !msg.rejected && actions.length > 1 && (
                                                                <button onClick={() => handleRejectAction(i)} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 text-[10px] font-bold py-1.5 rounded transition-colors">
                                                                    Reject All
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={aiEndRef} />
                                </div>
                                <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
                                    {searchParams.get('mode') === 'interview' && !isInterviewFinished && (
                                        <button 
                                            onClick={handleFinishInterview}
                                            disabled={isAssessing}
                                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 group"
                                        >
                                            {isAssessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                                            {isAssessing ? "Evaluating..." : "Finish & Grade Assessment"}
                                        </button>
                                    )}
                                    <form onSubmit={handleAiSubmit} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 focus-within:border-white/20 transition-colors">
                                        <input
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            placeholder={searchParams.get('mode') === 'interview' ? "Explain your code..." : "Ask AI anything..."}
                                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                                        />
                                        <button type="submit" className="text-blue-400 hover:text-blue-300 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </main>
            </AuthGuard>
    );
}
