"use client";
import { BoltStyleChat } from "@/components/ui/bolt-style-chat";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { TextScramble } from "@/components/ui/text-scramble";
import { SocialIcons } from "@/components/ui/social-icons";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";
import { Box, Zap, Shield, Globe, Code, Cpu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const features = [
  { area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]", icon: <Code className="h-4 w-4" />, title: "AI-Powered Code Completion", description: "Gemini & GPT-4o complete your thoughts in real time, suggest refactors, and catch bugs before they happen." },
  { area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]", icon: <Zap className="h-4 w-4" />, title: "Run Code Instantly", description: "Execute any language directly in the browser with zero setup. Node, Python, Java, Rust — all instantly available." },
  { area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]", icon: <Globe className="h-4 w-4" />, title: "Real-Time Collaboration", description: "Share your editor session with teammates. See cursors, edits, and comments live — like Google Docs for code." },
  { area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]", icon: <Shield className="h-4 w-4" />, title: "Enterprise-Grade Security", description: "JWT auth, BCrypt passwords, CORS policies, and end-to-end encryption protect every session." },
  { area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]", icon: <Cpu className="h-4 w-4" />, title: "Infinite ∞ Canvas", description: "InfiniCode adapts to you. Drag, resize, and organize your workspace exactly how you think." },
];

import { InfinityLogo } from "@/components/ui/logo";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handlePrompt = (prompt: string) => {
    // Store prompt in sessionStorage to be picked up by the editor
    sessionStorage.setItem("last_prompt", prompt);
    // Redirect to editor
    router.push("/editor");
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <InfinityLogo size={32} />
            <span className="font-bold text-lg tracking-tight">InfiniCode</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/editor" className="hover:text-white transition-colors">Editor</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/components" className="hover:text-white transition-colors">Components</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 hidden sm:block">Dashboard</Link>
                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
                >
                  Sign out
                </button>
                <Link href="/editor" className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">Open IDE</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Sign in</Link>
                <Link href="/login" className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">Start coding →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — BoltStyleChat */}
      <section className="pt-16">
        <BoltStyleChat
          title="What will you"
          announcementText="∞ InfiniCode AI v2 — Now with Gemini 2.5"
          subtitle="The AI IDE that codes with you, not for you."
          onSend={handlePrompt}
        />
      </section>

      {/* Particle Typography Showcase */}
      <section className="border-t border-white/10 bg-black/90">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-400 mb-1 font-semibold uppercase tracking-widest">Interactive Canvas</p>
            <h2 className="text-2xl font-bold">Hover to scatter</h2>
          </div>
          <LoadingBreadcrumb text="InfiniCode AI thinking" />
        </div>
        <div className="w-full bg-black" style={{ height: 280 }}>
          <CursorDrivenParticleTypography text="InfiniCode" showBrandLogo={true} fontSize={90} particleDensity={5} dispersionStrength={22} color="#ffffff" />
        </div>
      </section>

      {/* Features Grid with GlowingEffect */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Why InfiniCode?</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">infinite developer</span></h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Everything you need to code, collaborate, and ship — in one powerful IDE.</p>
          </div>
          <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            {features.map((feature, i) => (
              <li key={i} className={`min-h-[14rem] list-none ${feature.area}`}>
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/5 bg-white/[0.02] p-6 shadow-sm">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-white/10 bg-white/5 p-2">{feature.icon}</div>
                      <div className="space-y-3">
                        <h3 className="pt-0.5 text-xl leading-snug font-semibold tracking-tight text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TextScramble CTA Section */}
      <section className="py-24 px-6 border-t border-white/10 flex flex-col items-center text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-8 font-mono">Hover to decode</p>
        <div className="flex flex-col md:flex-row gap-16 items-center justify-center mb-16">
          <TextScramble text="WRITE CODE" className="text-2xl" />
          <TextScramble text="SHIP FASTER" className="text-2xl" />
          <TextScramble text="BUILD MORE" className="text-2xl" />
        </div>
        <Link href="/editor" className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(99,102,241,0.4)]">
          Open the Editor →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <InfinityLogo size={24} />
            <span className="font-semibold text-gray-400">InfiniCode</span>
            <span className="text-gray-600 text-sm">© 2026</span>
          </div>
          <SocialIcons />
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/components" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
