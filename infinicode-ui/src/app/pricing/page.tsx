import ShineBorderDemo from "@/components/ui/shine-border";
import RadioGroupWithPlanCards from "@/components/ui/radio-group-with-plan-cards";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Check } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/context/AuthContext";

import { InfinityLogo } from "@/components/ui/logo";

const plans = [
    { name: "Starter", price: "Free", desc: "For solo developers", color: "from-blue-500 to-cyan-500", features: ["Monaco code editor", "3 AI completions/day", "Community support", "2 projects"] },
    { name: "Pro", price: "$19", desc: "For professional developers", color: "from-purple-500 to-pink-500", features: ["Everything in Starter", "Unlimited AI completions", "Real-time collaboration", "Priority support", "20 projects", "All languages"] },
    { name: "Team", price: "$49", desc: "For growing teams", color: "from-orange-500 to-red-500", features: ["Everything in Pro", "Unlimited projects", "Team management", "Admin dashboard", "Custom integrations", "SLA support"] },
];

export default function PricingPage() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-black text-white">
                {/* Nav */}
                <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2"><InfinityLogo size={28} /><span className="font-bold">InfiniCode</span></Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-4 text-sm text-gray-400">
                            <Link href="/editor" className="hover:text-white">Editor</Link>
                            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
                        </div>
                        {isAuthenticated && (
                            <button
                                onClick={() => logout()}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <section className="text-center py-24 px-6">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Pricing</p>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">transparent</span> pricing
                    </h1>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">Start free. Scale as you grow. No hidden fees, no surprises.</p>
                </section>

                {/* Plan Selector (RadioGroupWithPlanCards) */}
                <section className="px-6 pb-12 flex justify-center">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-6">Quick Selector</h2>
                        <RadioGroupWithPlanCards />
                    </div>
                </section>

                {/* Full Plan Cards */}
                <section className="px-6 pb-24">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div key={i} className={`relative rounded-2xl border border-white/10 p-2 ${i === 1 ? "md:-mt-4" : ""}`}>
                                {i === 1 && <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={3} />}
                                <div className="relative rounded-xl bg-white/[0.02] p-8">
                                    {i === 1 && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                                            Most Popular
                                        </div>
                                    )}
                                    <div className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 text-transparent bg-clip-text bg-gradient-to-r ${plan.color}`}>
                                        {plan.name}
                                    </div>
                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                                        {plan.price !== "Free" && <span className="text-gray-500 mb-2">/mo</span>}
                                    </div>
                                    <p className="text-gray-500 text-sm mb-8">{plan.desc}</p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f, fi) => (
                                            <li key={fi} className="flex items-center gap-2 text-sm text-gray-300">
                                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={i === 1 ? "/editor" : "/dashboard"}
                                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center ${i === 1 ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.4)]" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ShineBorder highlighted plan */}
                <section className="py-16 px-6 border-t border-white/10 flex flex-col items-center">
                    <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-6">Enterprise</p>
                    <h2 className="text-3xl font-bold mb-10 text-center">Need something bigger?</h2>
                    <ShineBorderDemo />
                </section>

                {/* FAQ */}
                <section className="py-16 px-6 border-t border-white/10 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center">Frequently asked</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Is the free plan actually free?", a: "Yes. No credit card required. Free forever with generous limits." },
                            { q: "Can I switch plans anytime?", a: "Upgrade or downgrade anytime. Changes take effect immediately." },
                            { q: "What AI models are included?", a: "Pro and Team plans get access to Gemini 2.5, GPT-4o, and Claude 4." },
                        ].map((faq, i) => (
                            <div key={i} className="relative rounded-2xl border border-white/10 p-2">
                                <GlowingEffect spread={20} glow={false} disabled={false} proximity={40} inactiveZone={0.2} borderWidth={1} />
                                <div className="relative rounded-xl bg-white/[0.02] p-5">
                                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                                    <p className="text-sm text-gray-500">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AuthGuard>
    );
}
