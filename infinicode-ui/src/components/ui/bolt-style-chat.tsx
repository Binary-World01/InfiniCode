'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Lightbulb, Paperclip, Image, FileCode, ChevronDown, Check, Sparkles, Zap, Brain, Bolt, Github, SendHorizontal } from 'lucide-react'

interface Model { id: string; name: string; description: string; icon: React.ReactNode; badge?: string; }

function FigmaIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z" fill="currentColor" />
            <path d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z" fill="currentColor" />
            <path d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z" fill="currentColor" />
            <path d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z" fill="currentColor" />
            <path d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z" fill="currentColor" />
        </svg>
    )
}

const models: Model[] = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Google Flagship', icon: <Brain className="size-4 text-cyan-400" />, badge: 'Default' },
    { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'DeepSeek Flagship', icon: <Sparkles className="size-4 text-orange-400" /> },
    { id: 'groq-llama-3', name: 'Groq Llama 3', description: 'Ultra-fast inference', icon: <Zap className="size-4 text-green-400" /> },
]

function ModelSelector({ selectedModel = 'gemini-2.5-pro', onModelChange }: { selectedModel?: string; onModelChange?: (model: Model) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(models.find(m => m.id === selectedModel) || models[0])
    const handleSelect = (model: Model) => { setSelected(model); setIsOpen(false); onModelChange?.(model); }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95 border border-white/5 bg-white/5">
                {selected.icon}
                <span className="truncate max-w-[100px]">{selected.name}</span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-3 z-[101] min-w-[240px] bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2">
                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Intelligent Models</div>
                            {models.map((model) => (
                                <button key={model.id} onClick={() => handleSelect(model)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${selected.id === model.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex-shrink-0 p-2 bg-white/5 rounded-lg">{model.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{model.name}</span>
                                            {model.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">{model.badge}</span>}
                                        </div>
                                        <div className="text-[11px] text-gray-500 truncate">{model.description}</div>
                                    </div>
                                    {selected.id === model.id && <Check className="size-4 text-blue-400 flex-shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function ChatInput({ onSend, placeholder = "What do you want to build?" }: { onSend?: (message: string) => void; placeholder?: string }) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px` }
    }, [message])

    const handleSubmit = () => { if (message.trim()) { onSend?.(message); setMessage('') } }
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }

    return (
        <div className="relative w-full max-w-[700px] mx-auto">
            <div className="relative rounded-2xl bg-[#1e1e24] shadow-2xl border border-white/[0.08]">
                <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder}
                    className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-6 pt-6 pb-2 focus:outline-none min-h-[120px]"
                />
                <div className="flex items-center justify-between px-4 pb-4 pt-1">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center size-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#8a8a8f] hover:text-white transition-all">
                            <Plus className="size-4" />
                        </button>
                        <ModelSelector />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#6a6a6f] hover:text-white transition-all">
                            <Lightbulb className="size-3.5" /><span className="hidden sm:inline">Plan</span>
                        </button>
                        <button onClick={handleSubmit} disabled={!message.trim()} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#31577a] hover:bg-[#3d6c96] text-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="hidden sm:inline">Build now</span><SendHorizontal className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

import NeuralBackground from '@/components/ui/flow-field-background'

function AnnouncementBadge({ text, href = "#" }: { text: string; href?: string }) {
    const className = "relative inline-flex items-center gap-2 px-5 py-2 min-h-[40px] rounded-full text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
    const style = { background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', backdropFilter: 'blur(20px) saturate(140%)', boxShadow: 'inset 0 1px rgba(255,255,255,0.2), inset 0 -1px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.08)' }
    const content = <><Bolt className="size-4 relative z-10 text-white" /><span className="relative z-10 text-white font-medium">{text}</span></>
    return href !== '#' ? <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{content}</a> : <button className={className} style={style}>{content}</button>
}

interface BoltChatProps {
    title?: string; subtitle?: string; announcementText?: string; announcementHref?: string;
    placeholder?: string; onSend?: (message: string) => void; onImport?: (source: string) => void;
}

export function BoltStyleChat({
    title = "What will you", subtitle = "Create stunning apps & websites by chatting with AI.",
    announcementText = "Introducing InfiniCode AI v2", announcementHref = "#",
    placeholder = "What do you want to build?", onSend, onImport
}: BoltChatProps) {
    return (
        <div className="relative flex flex-col items-center justify-center min-vh-screen min-h-[800px] w-full overflow-hidden bg-[#0f0f0f]">
            <div className="absolute inset-0 z-0">
                <NeuralBackground />
            </div>
            <div className="absolute top-[70px] z-10"><AnnouncementBadge text={announcementText} href={announcementHref} /></div>
            <div className="absolute top-[66%] left-1/2 sm:top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col flex-1 items-center justify-center w-full h-full overflow-hidden px-4 z-10 pointer-events-none">
                <div className="text-center mb-6 pointer-events-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-1">
                        {title}{' '}<span className="bg-gradient-to-b from-[#4da5fc] via-[#4da5fc] to-white bg-clip-text text-transparent italic">build</span>{' '}today?
                    </h1>
                    <p className="text-base font-semibold sm:text-lg text-[#8a8a8f]">{subtitle}</p>
                </div>
                <div className="w-full max-w-[700px] mb-6 sm:mb-8 mt-2 pointer-events-auto"><ChatInput placeholder={placeholder} onSend={onSend} /></div>
                <div className="flex items-center gap-4 justify-center pointer-events-auto">
                    <span className="text-sm text-[#6a6a6f]">or import from</span>
                    <div className="flex gap-2">
                        {[{ id: 'figma', name: 'Figma', icon: <FigmaIcon className="size-4" /> }, { id: 'github', name: 'GitHub', icon: <Github className="size-4" /> }].map((option) => (
                            <button key={option.id} onClick={() => onImport?.(option.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-[#0f0f0f] hover:bg-[#1a1a1e] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95">
                                {option.icon}<span>{option.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoltStyleChat;
