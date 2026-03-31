"use client";
import { useState, useEffect } from "react";
import { Calendar, Play, FileCheck, Brain, Plus, Code, Loader2, ChevronRight, Target } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    initial_code: string;
}

const upcomingInterviews = [
    { id: "int_1", role: "Senior Frontend Engineer", company: "TechCorp", date: "Today, 2:00 PM", type: "System Design" },
    { id: "int_2", role: "Fullstack Developer", company: "DataSync", date: "Tomorrow, 10:00 AM", type: "Algorithms" },
];

const pastAssessments = [
    { id: "past_1", role: "React Developer", score: "Pass", date: "Oct 12, 2026", color: "text-green-400" },
    { id: "past_2", role: "Backend Engineer", score: "Retry", date: "Oct 04, 2026", color: "text-yellow-400" },
];

export default function InterviewPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [loadingChallenges, setLoadingChallenges] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoadingChallenges(true);
        try {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .order('difficulty', { ascending: true });
            
            if (error) throw error;
            setChallenges(data || []);
            if (data && data.length > 0) setSelectedChallenge(data[0]);
        } catch (err) {
            console.error("Failed to fetch challenges:", err);
        } finally {
            setLoadingChallenges(false);
        }
    };

    const handleStartPractice = async () => {
        if (!user || !selectedChallenge) return;
        setIsCreating(true);
        try {
            // 0. Pre-flight: Ensure Profile exists (Fixes FK projects_owner_id_fkey)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.log("Profile missing, initializing...");
                const { error: insertError } = await supabase.from('profiles').insert({
                    id: user.id,
                    username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                    email: user.email || '',
                    full_name: 'InfiniCode Developer'
                });
                if (insertError && insertError.code !== '23505') {
                    throw new Error(`Profile initialization failed: ${insertError.message}`);
                }
            }

            // 1. Create Interview Project
            const { data: project, error: projError } = await supabase
                .from('projects')
                .insert([{
                    owner_id: user.id,
                    name: `Interview: ${selectedChallenge.title}`,
                    language: 'javascript'
                }])
                .select()
                .single();

            if (projError) throw new Error(`Project creation failed: ${projError.message}`);

            // 2. Add Host to Collaborators as Admin
            const { error: collabError } = await supabase
                .from('project_collaborators')
                .insert([{
                    project_id: project.id,
                    user_id: user.id,
                    role: 'admin'
                }]);

            if (collabError) console.warn("Collaborator registration failed (non-fatal):", collabError);

            // 3. Setup Initial Challenge File
            const { error: fileError } = await supabase
                .from('project_files')
                .insert([{
                    id: crypto.randomUUID(),
                    project_id: project.id,
                    name: 'solution.js',
                    path: 'solution.js',
                    content: selectedChallenge.initial_code
                }]);

            if (fileError) throw new Error(`File initialization failed: ${fileError.message}`);

            // 4. Redirect with Interview Mode & Challenge ID
            router.push(`/editor?id=${project.id}&mode=interview&challengeId=${selectedChallenge.id}`);

        } catch (err: any) {
            console.error("Critical: Failed to start mock interview:", err);
            alert(`Failed to initialize interview session: ${err.message || "Unknown error"}\n\nPlease check your Supabase connection and ensure the setup SQL has been executed.`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
            {/* Header Content */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <Brain className="h-8 w-8 text-neutral-400" />
                            Interview Portal
                        </h1>
                        <p className="text-neutral-400 max-w-2xl">
                            Prepare for technical interviews with AI-driven mock sessions or join scheduled real assessments.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">

                {/* Challenge Catalog Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Target className="h-6 w-6 text-purple-400" />
                                Challenge Catalog
                            </h2>
                            <p className="text-neutral-400 text-sm mt-1">Select a challenge to begin your AI proctored session.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loadingChallenges ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-48 rounded-xl border border-white/5 bg-white/5 animate-pulse" />
                            ))
                        ) : challenges.map((challenge) => (
                            <div 
                                key={challenge.id}
                                onClick={() => setSelectedChallenge(challenge)}
                                className={`group relative rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
                                    selectedChallenge?.id === challenge.id 
                                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02] transition-transform' 
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                                        challenge.difficulty === 'Easy' ? 'text-green-400 border-green-400/20' :
                                        challenge.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-400/20' :
                                        'text-red-400 border-red-400/20'
                                    }`}>
                                        {challenge.difficulty}
                                    </Badge>
                                    <Code className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                                </div>
                                <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{challenge.title}</h3>
                                <p className="text-xs text-neutral-400 line-clamp-3 mb-4">{challenge.description}</p>
                                <div className="text-[10px] text-neutral-500 font-mono">{challenge.category}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* AI Mock Interview CTA */}
                <section>
                    <div className="relative rounded-2.5xl p-[1px]">
                        <GlowingEffect blur={0} borderWidth={1} spread={20} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                        <div className="relative flex flex-col md:flex-row items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md p-8 shadow-2xl">
                            <div className="z-10">
                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Brain className="h-6 w-6 text-purple-400" />
                                    Launch Assessment
                                </h2>
                                <p className="text-neutral-300 max-w-lg mb-6">
                                    {selectedChallenge 
                                        ? `Initialize a proctored environment for "${selectedChallenge.title}". Your solution will be graded by the AI Mentor.`
                                        : "Select a challenge from the catalog above to start your AI proctored practice session."
                                    }
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleStartPractice}
                                        disabled={isCreating || !selectedChallenge}
                                        className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all min-w-[160px]"
                                    >
                                        {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                                        {isCreating ? "Initializing..." : "Start Practice"}
                                    </Button>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                        View Syllabus
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                                <Brain className="h-48 w-48 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Interviews */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Upcoming Scheduled
                        </h2>
                        <div className="space-y-4">
                            {upcomingInterviews.map((interview) => (
                                <div key={interview.id} className="rounded-xl border border-white/10 bg-black/40 p-5 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-white">{interview.role}</h3>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                                            {interview.company}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-neutral-400 mb-4">{interview.type} • {interview.date}</div>
                                    <Button className="w-full bg-white text-black hover:bg-neutral-200">
                                        Enter Waiting Room
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Past Assessments */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-neutral-400" />
                            Past Assessments
                        </h2>
                        <div className="space-y-4">
                            {pastAssessments.map((past) => (
                                <div key={past.id} className="rounded-xl border border-white/10 bg-black/40 p-5 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">{past.role}</h3>
                                        <div className="text-sm text-neutral-500">{past.date}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold ${past.color}`}>{past.score}</span>
                                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed border-white/10 text-neutral-400 hover:text-white hover:border-white/20">
                                <Plus className="h-4 w-4 mr-2" /> Record External Result
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
