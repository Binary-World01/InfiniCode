"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Code, Link as LinkIcon, Sparkles, Loader2, Clock } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function CollaborationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchActiveSessions = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // Fetch projects updated in the last 2 hours
                const twoHoursAgo = new Date();
                twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

                const { data, error } = await supabase
                    .from('projects')
                    .select('id, name, updated_at, language')
                    .gte('updated_at', twoHoursAgo.toISOString())
                    .order('updated_at', { ascending: false })
                    .limit(6);

                if (error) throw error;

                // For a real app, we would also fetch Presence counts here. 
                // For now, we mock participant counts based on the project id.
                const sessionsWithMocks = (data || []).map(p => ({
                    ...p,
                    participants: Math.floor(Math.random() * 3) + 1 // Mock presence count
                }));

                setActiveSessions(sessionsWithMocks);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveSessions();

        // Polling every 30s to keep feed fresh
        const interval = setInterval(fetchActiveSessions, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleCreateSession = async () => {
        if (!user) return;
        setIsCreating(true);
        try {
            // 1. Create a new Project
            const { data: project, error: projError } = await supabase
                .from('projects')
                .insert([{
                    owner_id: user.id,
                    name: `Live Session - ${new Date().toLocaleTimeString()}`,
                    language: 'typescript'
                }])
                .select()
                .single();

            if (projError) throw projError;

            // 2. Add Host to Collaborators as Admin
            const { error: collabError } = await supabase
                .from('project_collaborators')
                .insert([{
                    project_id: project.id,
                    user_id: user.id,
                    role: 'admin'
                }]);

            // Ignore PGRST114/42P01 if table doesn't exist yet (user hasn't ran new SQL)
            if (collabError && !collabError.message.includes("does not exist")) {
                console.error("Collab Error (non-fatal):", collabError);
            }

            // 3. Redirect to the editor room
            router.push(`/editor?id=${project.id}`);

        } catch (err) {
            console.error("Failed to create session:", err);
            alert("Failed to start session. Ensure database is updated.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinClick = (sessionId: string) => {
        router.push(`/editor?id=${sessionId}`);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
            {/* Header Content */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <Users className="h-8 w-8 text-neutral-400" />
                            Collaboration Hub
                        </h1>
                        <p className="text-neutral-400 max-w-2xl">
                            Join live pair-programming sessions or create a new workspace to code together in real-time.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateSession}
                        disabled={isCreating}
                        className="bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        New Session
                    </Button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-12">
                {/* Active Sessions Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            Active Team Sessions
                        </h2>
                        {isLoading && <Loader2 className="h-4 w-4 text-neutral-500 animate-spin" />}
                    </div>

                    {activeSessions.length === 0 && !isLoading ? (
                        <div className="w-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                            <Code className="h-8 w-8 text-neutral-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No active sessions</h3>
                            <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">There are no live programming rooms at the moment. Start a new session to invite others.</p>
                            <Button onClick={handleCreateSession} variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                Start a Workspace
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeSessions.map((session) => (
                                <div key={session.id} className="relative h-full rounded-2.5xl p-[1px] group">
                                    <GlowingEffect blur={0} borderWidth={1} spread={20} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                                    <div className="relative h-full flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:bg-white/[0.02]">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                    <Code className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    LIVE
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{session.name}</h3>
                                            <div className="flex items-center gap-4 text-xs text-neutral-400 mb-6 font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3 w-3" />
                                                    {session.participants} coding
                                                </div>
                                                <div className="flex items-center gap-1.5 uppercase">
                                                    {session.language}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(session.updated_at))} ago
                                            </span>
                                            <Button onClick={() => handleJoinClick(session.id)} variant="ghost" size="sm" className="hover:bg-white/10 hover:text-white transition-colors">
                                                Join Room <LinkIcon className="h-3.5 w-3.5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Empty State for Invites */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">Pending Invites</h2>
                    <div className="w-full rounded-xl border border-dashed border-white/10 bg-black/20 p-12 text-center flex flex-col items-center justify-center">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <LinkIcon className="h-5 w-5 text-neutral-500" />
                        </div>
                        <h3 className="text-white font-medium mb-2">No pending invitations</h3>
                        <p className="text-neutral-500 text-sm max-w-sm">
                            When your teammates send you a direct request to join their workspace, it will appear here.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
