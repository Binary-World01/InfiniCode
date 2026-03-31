"use client";
import React from "react";
import { Terminal, X } from "lucide-react";

interface TerminalPaneProps {
    terminalOpen: boolean;
    isRunning: boolean;
    terminalLines: string[];
    onClear: () => void;
    onClose: () => void;
    terminalRef: React.RefObject<HTMLDivElement | null>;
}

export function TerminalPane({
    terminalOpen,
    isRunning,
    terminalLines,
    onClear,
    onClose,
    terminalRef
}: TerminalPaneProps) {
    if (!terminalOpen) return null;

    React.useEffect(() => {
        if (terminalOpen && terminalRef.current) {
            terminalRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLines, terminalOpen, terminalRef]);

    const parseAnsi = (line: string) => {
        // More robust handling for multiple color tags and reset
        let html = line.replace(/\r\n/g, '').replace(/\r/g, '');
        
        // Map colors
        const colors: Record<string, string> = {
            '31': '#f87171', // Red
            '32': '#4ade80', // Green
            '33': '#facc15', // Yellow
            '34': '#60a5fa', // Blue
            '35': '#c084fc', // Purple
            '36': '#22d3ee', // Cyan
            '37': '#ffffff', // White
            '0':  '#ffffff'  // Reset
        };

        // Simple ANSI to HTML span conversion
        // This regex handles \x1b[31m and \x1b[0m style sequences
        return html.replace(/\x1b\[(\d+)m/g, (match, code) => {
            if (code === '0') return '</span>';
            return `<span style="color:${colors[code] || '#fff'}">`;
        });
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 h-64 border-t border-white/10 bg-[#0c0c0c] backdrop-blur-xl flex flex-col shadow-2xl z-20">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compiler Terminal</span>
                    {isRunning && (
                        <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                            <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            running
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClear} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Clear</button>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed no-scrollbar scroll-smooth">
                {terminalLines.length === 0 ? (
                    <div className="text-gray-600 text-[11px]">▶ Click Run to execute the active file. Output will appear here.</div>
                ) : (
                    <>
                        {terminalLines.map((line, i) => (
                            <div key={i} className="text-gray-200 whitespace-pre-wrap break-all" dangerouslySetInnerHTML={{ __html: parseAnsi(line) || '&nbsp;' }} />
                        ))}
                        <div ref={terminalRef} className="h-4 w-1" />
                    </>
                )}
            </div>
        </div>
    );
}
