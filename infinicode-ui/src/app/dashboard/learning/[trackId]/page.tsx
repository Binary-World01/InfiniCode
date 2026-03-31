"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    LayoutTemplate, BrainCircuit, Network, Code2, Sparkles, Cpu, Cloud,
    ChevronRight, Play, CheckCircle2, Lock, ArrowLeft, GraduationCap,
    Clock, Star, Users, Layout, FileCode, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion, AnimatePresence } from "framer-motion";

const trackContent = {
    "trk_1": {
        title: "Frontend Masterclass",
        description: "Zero to Hero guide covering modern web standards, performance, and elite-level React patterns.",
        difficulty: "Beginner to Advanced",
        duration: "45 Hours",
        rating: 4.9,
        students: 12402,
        heroColor: "from-blue-600/20 to-indigo-900/20",
        accentColor: "text-blue-400",
        modules: [
            {
                id: "mod_1",
                title: "Foundations: The Modern Web Core",
                description: "Master the building blocks of the web from first principles.",
                subchapters: [
                    {
                        title: "HTML5 & Semantic Architecture",
                        lessons: [
                            { id: "les_1_1", title: "Semantic HTML & ARIA for A11y", duration: "45m", type: "video" },
                            { id: "les_1_2", title: "Forms, Validation & User Input", duration: "1h 10m", type: "lab" }
                        ]
                    },
                    {
                        title: "Modern CSS Mastery",
                        lessons: [
                            { id: "les_1_3", title: "Flexbox & Grid Deep Dive", duration: "1h 20m", type: "video" },
                            { id: "les_1_4", title: "Container Queries & Logical Props", duration: "50m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_2",
                title: "JavaScript Infinity: Engine & Logic",
                description: "Deep dive into JS internals and scalable design patterns.",
                subchapters: [
                    {
                        title: "Engine Internals",
                        lessons: [
                            { id: "les_2_1", title: "Execution Context & Event Loop", duration: "1h 10m", type: "video" },
                            { id: "les_2_2", title: "Memory Management & Profiling", duration: "45m", type: "lab" }
                        ]
                    },
                    {
                        title: "Modern JS Patterns",
                        lessons: [
                            { id: "les_2_3", title: "Async Mastery & Generators", duration: "1h 30m", type: "video" },
                            { id: "les_2_4", title: "Functional Programming Patterns", duration: "55m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_3",
                title: "React Engineering: Next-Gen Apps",
                description: "Building high-performance applications with React & Next.js.",
                subchapters: [
                    {
                        title: "React Core Deep Dive",
                        lessons: [
                            { id: "les_3_1", title: "Hooks Architecture & Refs", duration: "1h 05m", type: "video" },
                            { id: "les_3_2", title: "State Machines & XState", duration: "1h 20m", type: "lab" }
                        ]
                    },
                    {
                        title: "Server Components & Hydration",
                        lessons: [
                            { id: "les_3_3", title: "RSC Architecture & Actions", duration: "1h 40m", type: "video" },
                            { id: "les_3_4", title: "Streaming & Selective Hydration", duration: "1h 15m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_4",
                title: "Industry Standards & Scale",
                description: "Shipping production-grade code with confidence.",
                subchapters: [
                    {
                        title: "Advanced Testing",
                        lessons: [
                            { id: "les_4_1", title: "TDD with Vitest & Playwright", duration: "2h 10m", type: "lab" },
                            { id: "les_4_2", title: "Visual Regression Testing", duration: "45m", type: "video" }
                        ]
                    },
                    {
                        title: "Performance & Ops",
                        lessons: [
                            { id: "les_4_3", title: "Core Web Vitals & RUM", duration: "55m", type: "video" },
                            { id: "les_4_4", title: "CI/CD & Observability", duration: "1h 15m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_5",
                title: "Advanced Architecture & Systems",
                description: "Mastering complex enterprise frontend systems.",
                subchapters: [
                    {
                        title: "Micro-frontends & Scale",
                        lessons: [
                            { id: "les_5_1", title: "Module Federation & MFEs", duration: "1h 30m", type: "video" },
                            { id: "les_5_2", title: "Monorepos with Turborepo", duration: "1h 10m", type: "lab" }
                        ]
                    },
                    {
                        title: "Advanced Auth & Security",
                        lessons: [
                            { id: "les_5_3", title: "OAuth3 & OIDC Architecture", duration: "1h 40m", type: "video" },
                            { id: "les_5_4", title: "Web Cryptography API Deep Dive", duration: "55m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_6",
                title: "High-Fidelity UI & Motion",
                description: "Creating premium, award-worthy user experiences.",
                subchapters: [
                    {
                        title: "Design Systems & Tokens",
                        lessons: [
                            { id: "les_6_1", title: "Shadcn UI & Component Architecture", duration: "1h 20m", type: "video" },
                            { id: "les_6_2", title: "Tailwind Engineering & JIT", duration: "45m", type: "lab" }
                        ]
                    },
                    {
                        title: "Motion & Animation",
                        lessons: [
                            { id: "les_6_3", title: "Framer Motion: Layout & Orchestration", duration: "1h 45m", type: "video" },
                            { id: "les_6_4", title: "SVG Animations & GSAP", duration: "2h 00m", type: "lab" }
                        ]
                    }
                ]
            }
        ]
    },
    "trk_2": {
        title: "Algorithms & Data Structures",
        description: "Master the foundations of computer science: from Big O to Dynamic Programming.",
        difficulty: "Intermediate",
        duration: "45 Hours",
        rating: 4.8,
        students: 5430,
        heroColor: "from-purple-600/20 to-indigo-900/20",
        accentColor: "text-purple-400",
        modules: []
    },
    "trk_3": {
        title: "System Design for Scale",
        description: "Learn to architect distributed systems that handle millions of requests.",
        difficulty: "Advanced",
        duration: "30 Hours",
        rating: 4.9,
        students: 3210,
        heroColor: "from-green-600/20 to-emerald-900/20",
        accentColor: "text-green-400",
        modules: []
    },
    "trk_4": {
        title: "AI/ML for Developers",
        description: "From Linear Algebra to LLMs. Build, train, and deploy production-ready AI models.",
        difficulty: "Intermediate to Advanced",
        duration: "65 Hours",
        rating: 4.8,
        students: 8340,
        heroColor: "from-purple-600/20 to-blue-900/20",
        accentColor: "text-purple-400",
        modules: [
            {
                id: "mod_1",
                title: "Mathematics & Python Foundations",
                description: "The mathematical backbone of machine learning.",
                subchapters: [
                    {
                        title: "Linear Algebra & Calculus",
                        lessons: [
                            { id: "les_ai_1_1", title: "Vectors, Matrices & Eigenspaces", duration: "1h 30m", type: "video" },
                            { id: "les_ai_1_2", title: "Derivatives & Gradient Descent", duration: "1h 15m", type: "video" }
                        ]
                    },
                    {
                        title: "Python for Data Science",
                        lessons: [
                            { id: "les_ai_1_3", title: "NumPy & Tensor Manipulation", duration: "1h 45m", type: "lab" },
                            { id: "les_ai_1_4", title: "Pandas: Data Wrangling at Scale", duration: "1h 20m", type: "lab" }
                        ]
                    }
                ]
            },
            {
                id: "mod_2",
                title: "Machine Learning Fundamentals",
                description: "Classical algorithms and statistical learning.",
                subchapters: [
                    {
                        title: "Supervised Learning",
                        lessons: [
                            { id: "les_ai_2_1", title: "Regression & Logistic Models", duration: "1h 10m", type: "video" },
                            { id: "les_ai_2_2", title: "Support Vector Machines (SVM)", duration: "55m", type: "lab" }
                        ]
                    },
                    {
                        title: "Ensemble Methods",
                        lessons: [
                            { id: "les_ai_2_3", title: "Random Forests & XGBoost", duration: "1h 30m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_3",
                title: "Deep Learning & Neural Networks",
                description: "Architecting the brain: From Perceptrons to Transformers.",
                subchapters: [
                    {
                        title: "Neural Network Architecture",
                        lessons: [
                            { id: "les_ai_3_1", title: "Backpropagation Deep Dive", duration: "2h 00m", type: "video" },
                            { id: "les_ai_3_2", title: "CNNs for Computer Vision", duration: "1h 45m", type: "lab" }
                        ]
                    },
                    {
                        title: "Sequence Modeling",
                        lessons: [
                            { id: "les_ai_3_3", title: "RNNs, LSTMs & GRUs", duration: "1h 15m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_4",
                title: "Modern AI: LLMs & Generative Tech",
                description: "State-of-the-art NLP and Generative AI patterns.",
                subchapters: [
                    {
                        title: "Attention & Transformers",
                        lessons: [
                            { id: "les_ai_4_1", title: "Attention is All You Need", duration: "2h 30m", type: "video" },
                            { id: "les_ai_4_2", title: "Fine-tuning LLMs (LoRA/QLoRA)", duration: "1h 50m", type: "lab" }
                        ]
                    },
                    {
                        title: "Production AI",
                        lessons: [
                            { id: "les_ai_4_3", title: "RAG: Vector DBs & LangChain", duration: "1h 40m", type: "video" }
                        ]
                    }
                ]
            }
        ]
    },
    "trk_5": {
        title: "Web3 Masterclass",
        description: "Master blockchain engineering, smart contracts, and decentralized protocol design.",
        difficulty: "Intermediate",
        duration: "55 Hours",
        rating: 4.7,
        students: 5120,
        heroColor: "from-green-600/20 to-blue-900/20",
        accentColor: "text-green-400",
        modules: [
            {
                id: "mod_1",
                title: "Blockchain Foundations",
                description: "The cryptography and economics of the decentralized web.",
                subchapters: [
                    {
                        title: "Core Cryptography",
                        lessons: [
                            { id: "les_w3_1_1", title: "Hashing & Digital Signatures", duration: "1h 10m", type: "video" },
                            { id: "les_w3_1_2", title: "Merkle Trees & State Roots", duration: "55m", type: "video" }
                        ]
                    },
                    {
                        title: "Consensus Mechanisms",
                        lessons: [
                            { id: "les_w3_1_3", title: "PoW vs PoS vs PoH", duration: "1h 20m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_2",
                title: "Smart Contract Engineering",
                description: "Authoring bulletproof logic for the EVM.",
                subchapters: [
                    {
                        title: "Solidity Deep Dive",
                        lessons: [
                            { id: "les_w3_2_1", title: "Solidity Syntax & Data Types", duration: "1h 45m", type: "lab" },
                            { id: "les_w3_2_2", title: "Security: Reentrancy & Overflow", duration: "1h 30m", type: "video" }
                        ]
                    },
                    {
                        title: "Toolchain Mastery",
                        lessons: [
                            { id: "les_w3_2_3", title: "Hardhat vs Foundry Workflows", duration: "1h 15m", type: "lab" }
                        ]
                    }
                ]
            },
            {
                id: "mod_3",
                title: "dApp Architecture",
                description: "Connecting the front-end to the decentralized back-end.",
                subchapters: [
                    {
                        title: "Provider Integration",
                        lessons: [
                            { id: "les_w3_3_1", title: "Ethers.js & Viem Patterns", duration: "1h 10m", type: "video" },
                            { id: "les_w3_3_2", title: "WalletConnect Integration", duration: "50m", type: "lab" }
                        ]
                    },
                    {
                        title: "Decentralized Storage",
                        lessons: [
                            { id: "les_w3_3_3", title: "IPFS, Arweave & Filecoin", duration: "1h 10m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_4",
                title: "DeFi & Protocol Design",
                description: "Engineering decentralized finance and governance.",
                subchapters: [
                    {
                        title: "Financial Primitives",
                        lessons: [
                            { id: "les_w3_4_1", title: "DEXs, AMMs & Liquidity Pools", duration: "1h 40m", type: "video" },
                            { id: "les_w3_4_2", title: "Yield Farming & Flash Loans", duration: "1h 30m", type: "lab" }
                        ]
                    },
                    {
                        title: "DAO Governance",
                        lessons: [
                            { id: "les_w3_4_3", title: "Tokenomics & On-chain Voting", duration: "1h 10m", type: "video" }
                        ]
                    }
                ]
            }
        ]
    },
    "trk_6": {
        title: "DevOps Masterclass",
        description: "Scale applications to millions with robust CI/CD, K8s, and Cloud Native architecture.",
        difficulty: "Professional",
        duration: "70 Hours",
        rating: 4.9,
        students: 6750,
        heroColor: "from-orange-600/20 to-red-900/20",
        accentColor: "text-orange-400",
        modules: [
            {
                id: "mod_1",
                title: "Core Infrastructure",
                description: "The systems layer of the cloud.",
                subchapters: [
                    {
                        title: "Linux & Networking",
                        lessons: [
                            { id: "les_do_1_1", title: "Bash Scripting & Automation", duration: "1h 20m", type: "lab" },
                            { id: "les_do_1_2", title: "TCP/IP, DNS & Load Balancing", duration: "1h 10m", type: "video" }
                        ]
                    },
                    {
                        title: "Security & IAM",
                        lessons: [
                            { id: "les_do_1_3", title: "SSH, SSL & Least Privilege", duration: "1h 00m", type: "video" }
                        ]
                    }
                ]
            },
            {
                id: "mod_2",
                title: "Containerization & Orchestration",
                description: "Standardizing the unit of deployment.",
                subchapters: [
                    {
                        title: "Docker Essentials",
                        lessons: [
                            { id: "les_do_2_1", title: "Dockerfiles & Image Optimization", duration: "1h 15m", type: "lab" },
                            { id: "les_do_2_2", title: "Multi-stage Builds", duration: "50m", type: "lab" }
                        ]
                    },
                    {
                        title: "Kubernetes Deep Dive",
                        lessons: [
                            { id: "les_do_2_3", title: "Pods, Services & Ingress", duration: "2h 30m", type: "video" },
                            { id: "les_do_2_4", title: "Helm & Kustomize Patterns", duration: "1h 20m", type: "lab" }
                        ]
                    }
                ]
            },
            {
                id: "mod_3",
                title: "CI/CD & Automation",
                description: "The pipeline is the product.",
                subchapters: [
                    {
                        title: "Pipeline Engineering",
                        lessons: [
                            { id: "les_do_3_1", title: "GitHub Actions & Workflows", duration: "1h 30m", type: "lab" },
                            { id: "les_do_3_2", title: "GitOps with ArgoCD", duration: "1h 15m", type: "video" }
                        ]
                    },
                    {
                        title: "Infrastructure as Code",
                        lessons: [
                            { id: "les_do_3_3", title: "Terraform: State & Modules", duration: "2h 00m", type: "lab" }
                        ]
                    }
                ]
            },
            {
                id: "mod_4",
                title: "Cloud Native & Observability",
                description: "Building resilient, self-healing systems.",
                subchapters: [
                    {
                        title: "Monitoring Stack",
                        lessons: [
                            { id: "les_do_4_1", title: "Prometheus & Grafana", duration: "1h 30m", type: "video" },
                            { id: "les_do_4_2", title: "Logging with ELK / Loki", duration: "1h 20m", type: "lab" }
                        ]
                    },
                    {
                        title: "SRE Principles",
                        lessons: [
                            { id: "les_do_4_3", title: "SLIs, SLOs & Error Budgets", duration: "1h 10m", type: "video" }
                        ]
                    }
                ]
            }
        ]
    }
} as any;

export default function TrackDetailPage() {
    const params = useParams();
    const router = useRouter();
    const trackId = params.trackId as string;
    const track = trackContent[trackId];
    const [expandedModule, setExpandedModule] = useState<string | null>("mod_1");

    if (!track) return <div className="p-20 text-center text-white">Track not found.</div>;

    const handleLessonClick = (lessonId: string) => {
        router.push(`/dashboard/learning/${trackId}/${lessonId}`);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] pb-20">
            {/* Header Content */}
            <div className={`px-8 pt-12 pb-20 border-b border-white/5 bg-gradient-to-br ${track.heroColor} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[160px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[160px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <Button 
                        variant="ghost" 
                        className="mb-8 text-neutral-400 hover:text-white"
                        onClick={() => router.push("/dashboard/learning")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracks
                    </Button>

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex-1">
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 uppercase tracking-widest px-3 py-1">
                                Technical Track
                            </Badge>
                            <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                                {track.title}
                            </h1>
                            <p className="text-xl text-neutral-300 max-w-3xl mb-8 leading-relaxed">
                                {track.description}
                            </p>

                            <div className="flex flex-wrap gap-8 text-sm text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span>{track.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>{track.rating} Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span>{track.students.toLocaleString()} Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-purple-400" />
                                    <span>Professional Certification</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto self-center lg:self-start">
                            <Button className="w-full md:w-64 h-16 bg-white text-black text-lg font-bold hover:bg-neutral-200 transition-all rounded-xl shadow-2xl">
                                Resume Track <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto -mt-10 relative z-20 space-y-8">
                {/* Modules */}
                {track.modules.map((mod: any, idx: number) => (
                    <div key={mod.id} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
                        <div 
                            className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${expandedModule === mod.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-neutral-400 font-mono">
                                    0{idx + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{mod.title}</h3>
                                    <p className="text-sm text-neutral-500">
                                        {mod.subchapters.reduce((acc: number, sub: any) => acc + sub.lessons.length, 0)} Lessons • {mod.description}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-neutral-500">
                                <motion.div animate={{ rotate: expandedModule === mod.id ? 180 : 0 }}>
                                    <ChevronRight className="w-5 h-5" />
                                </motion.div>
                            </Button>
                        </div>

                        <AnimatePresence>
                            {expandedModule === mod.id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-0 border-t border-white/5 bg-black/20 space-y-8">
                                        {mod.subchapters.map((sub: any, subIdx: number) => (
                                            <div key={subIdx} className="space-y-4">
                                                <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    {sub.title}
                                                </h4>
                                                <div className="space-y-2 pl-4 border-l border-white/5">
                                                    {sub.lessons.map((lesson: any) => (
                                                        <div 
                                                            key={lesson.id}
                                                            onClick={() => handleLessonClick(lesson.id)}
                                                            className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 group/lesson cursor-pointer transition-all border border-transparent hover:border-white/10"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-neutral-500 group-hover/lesson:text-blue-400 group-hover/lesson:border-blue-500/30 transition-colors">
                                                                    {lesson.type === 'video' ? <Play className="w-4 h-4 fill-current" /> : <Code2 className="w-4 h-4" />}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-white group-hover/lesson:text-blue-300 transition-colors">{lesson.title}</div>
                                                                    <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                                                                        <Clock className="w-3 h-3" /> {lesson.duration}
                                                                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                                                        <span className="uppercase tracking-wider">{lesson.type}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover/lesson:opacity-100 transition-opacity text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                                                Access Lesson <ChevronRight className="ml-1 w-4 h-4 text-blue-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { Trophy } from "lucide-react";
