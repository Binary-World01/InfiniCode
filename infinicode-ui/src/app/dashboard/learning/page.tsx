"use client";
import { BookOpen, Trophy, Target, Play, GraduationCap, Clock } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const learningTracks = [
    { id: "trk_1", title: "Frontend Masterclass", progress: 65, total: 24, icon: <LayoutTemplate className="h-5 w-5" />, color: "text-blue-400" },
    { id: "trk_2", title: "Algorithms & Data Structures", progress: 12, total: 45, icon: <BrainCircuit className="h-5 w-5" />, color: "text-purple-400" },
    { id: "trk_3", title: "System Design for Scale", progress: 0, total: 30, icon: <Network className="h-5 w-5" />, color: "text-green-400" },
    { id: "trk_4", title: "Advanced AI & Machine Learning", progress: 0, total: 60, icon: <Sparkles className="h-5 w-5" />, color: "text-cyan-400" },
    { id: "trk_5", title: "Web3 & Blockchain Development", progress: 0, total: 40, icon: <Cpu className="h-5 w-5" />, color: "text-orange-400" },
    { id: "trk_6", title: "Cloud Infrastructure & DevOps", progress: 0, total: 50, icon: <Cloud className="h-5 w-5" />, color: "text-pink-400" },
];

export default function LearningPage() {
    const router = useRouter();
    return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
            {/* Header Content */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-neutral-400" />
                            Learning Center
                        </h1>
                        <p className="text-neutral-400 max-w-2xl">
                            Level up your engineering skills with interactive courses and daily coding challenges.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-12">

                {/* Daily Challenge Hero */}
                <section>
                    <div className="relative rounded-2.5xl p-[1px]">
                        <GlowingEffect
                            blur={0}
                            borderWidth={1}
                            spread={20}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                        />
                        <div className="relative flex flex-col md:flex-row items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-md p-8 shadow-2xl">
                            <div className="flex-1 pr-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border border-green-500/20">
                                        <Trophy className="h-3.5 w-3.5 mr-1.5" /> Daily Challenge
                                    </Badge>
                                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Resets in 14h 22m
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Implement an LRU Cache
                                </h2>
                                <p className="text-neutral-300 max-w-2xl mb-6 line-clamp-2">
                                    Design and implement a data structure for Least Recently Used (LRU) cache. It should support get and put operations in O(1) time complexity.
                                </p>
                                <div className="flex gap-4">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                                        <Code2 className="h-4 w-4 mr-2" /> Solve Challenge
                                    </Button>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-9 w-9 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-neutral-400">
                                                U{i}
                                            </div>
                                        ))}
                                        <div className="h-9 px-3 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-xs font-medium text-neutral-400 z-10">
                                            +1,204 solving
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-center justify-center min-w-[160px] pl-8 border-l border-white/10">
                                <div className="text-4xl font-black text-green-400 mb-1">Hard</div>
                                <div className="text-sm font-medium text-neutral-500">Difficulty</div>
                                <div className="mt-4 flex gap-1">
                                    <span className="h-1.5 w-6 rounded-full bg-green-500"></span>
                                    <span className="h-1.5 w-6 rounded-full bg-green-500"></span>
                                    <span className="h-1.5 w-6 rounded-full bg-green-500/30"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tracks Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            Your Learning Tracks
                        </h2>
                        <Button variant="link" className="text-neutral-400 hover:text-white">Browse All →</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {learningTracks.map((track) => {
                            const percent = Math.round((track.progress / track.total) * 100);
                            return (
                                <div key={track.id} className="group relative rounded-xl border border-white/10 bg-black/40 p-6 hover:bg-white/[0.02] transition-colors overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${track.color}`}>
                                            {track.icon}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white mb-0.5">{percent}%</div>
                                            <div className="text-xs text-neutral-500">Completed</div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2">{track.title}</h3>
                                    <p className="text-sm text-neutral-400 mb-6">
                                        {track.progress} of {track.total} lessons completed
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${track.progress === 0 ? 'w-0' : track.color.replace('text-', 'bg-')
                                                }`}
                                            style={{ width: `${Math.max(2, percent)}%` }}
                                        />
                                    </div>

                                    <Button 
                                        onClick={() => router.push(`/dashboard/learning/${track.id}`)}
                                        className="w-full bg-white text-black hover:bg-neutral-200"
                                    >
                                        {track.progress === 0 ? "Start Track" : "Continue Learning"} <Play className="h-3.5 w-3.5 ml-2" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
import { LayoutTemplate, BrainCircuit, Network, Code2, Sparkles, Cpu, Cloud } from "lucide-react";
