import RadioGroupDashedDemo from "@/components/ui/radio-group-dashed-demo";
import RadioGroupWithPlanCards from "@/components/ui/radio-group-with-plan-cards";
import ShineBorderDemo from "@/components/ui/shine-border";
import LoadingBreadcrumbDemo from "@/components/ui/animated-loading-svg-text-shimmer";
import { SocialIcons } from "@/components/ui/social-icons";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";
import Link from "next/link";

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

const componentList = [
    {
        label: "Cursor Particle Typography", color: "text-purple-400", bg: "bg-purple-500/10", tag: "canvas", component: (
            <div className="w-full bg-black rounded-xl overflow-hidden" style={{ height: 200 }}>
                <CursorDrivenParticleTypography text="∞ Code" fontSize={60} particleDensity={5} dispersionStrength={20} color="#ffffff" />
            </div>
        )
    },
    { label: "Radio Group Dashed", color: "text-blue-400", bg: "bg-blue-500/10", tag: "interactive", component: <div className="p-4"><RadioGroupDashedDemo /></div> },
    { label: "Radio Group Plan Cards", color: "text-orange-400", bg: "bg-orange-500/10", tag: "interactive", component: <div className="p-4"><RadioGroupWithPlanCards /></div> },
    { label: "Animated SVG Loader + Shimmer", color: "text-teal-400", bg: "bg-teal-500/10", tag: "animation", component: <div className="p-6"><LoadingBreadcrumbDemo /></div> },
    { label: "ShineBorder Pricing Card", color: "text-red-400", bg: "bg-red-500/10", tag: "effect", component: <div className="p-4 flex justify-center scale-90 origin-top"><ShineBorderDemo /></div> },
    { label: "Social Icons", color: "text-gray-400", bg: "bg-gray-500/10", tag: "ui", component: <div className="p-6 flex justify-center bg-neutral-900 rounded-xl"><SocialIcons /></div> },
    {
        label: "Glowing Effect", color: "text-yellow-400", bg: "bg-yellow-500/10", tag: "effect", component: (
            <div className="p-4 grid grid-cols-2 gap-2">
                {["Feature A", "Feature B", "Feature C", "Feature D"].map((f, i) => (
                    <div key={i} className="relative rounded-xl border border-white/10 p-1.5 h-16">
                        <GlowingEffect spread={30} glow={true} disabled={false} proximity={40} inactiveZone={0.01} borderWidth={2} />
                        <div className="relative rounded-lg bg-white/[0.02] h-full flex items-center justify-center text-xs text-gray-400">{f}</div>
                    </div>
                ))}
            </div>
        )
    },
    { label: "Loading Breadcrumb", color: "text-cyan-400", bg: "bg-cyan-500/10", tag: "animation", component: <div className="p-6 flex items-center justify-center gap-4 flex-wrap"><LoadingBreadcrumbDemo /></div> },
];

export default function ComponentsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Nav */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-black/70 backdrop-blur-xl">
                <Link href="/" className="flex items-center gap-2"><InfinityLogo size={28} /><span className="font-bold">InfiniCode</span><span className="text-xs text-gray-500 border border-white/10 rounded-full px-2 py-0.5 ml-1">Components</span></Link>
                <div className="flex gap-4">
                    <Link href="/editor" className="text-sm text-gray-400 hover:text-white">Editor</Link>
                    <Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link>
                    <Link href="/dashboard" className="text-sm bg-white text-black font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 text-sm">Dashboard</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="text-center py-20 px-6">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">UI Library</p>
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Components</span>
                </h1>
                <p className="text-gray-500 text-lg">All UI components used throughout InfiniCode, in one place.</p>
            </section>

            {/* Components Grid */}
            <section className="px-6 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {componentList.map((item, i) => (
                        <div key={i} className="relative rounded-2xl border border-white/10 p-2">
                            <div className="relative rounded-xl bg-white/[0.02] overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${item.color}`}>{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] ${item.bg} ${item.color} border border-current/20 rounded-full px-2 py-0.5 font-mono uppercase tracking-widest`}>{item.tag}</span>
                                </div>
                                {/* Component Preview */}
                                <div className="bg-black/40">{item.component}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2"><InfinityLogo size={20} /><span className="text-gray-500 text-sm">InfiniCode UI Library</span></Link>
                <SocialIcons />
                <p className="text-gray-600 text-xs">Built with Next.js, Tailwind CSS & TypeScript</p>
            </footer>
        </div>
    );
}
