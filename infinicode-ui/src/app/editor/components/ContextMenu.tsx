"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Action {
    label: string;
    icon: React.ElementType;
    iconClassName?: string;
    onClick: () => void;
    danger?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    actions: Action[];
}

export function ContextMenu({ x, y, onClose, actions }: ContextMenuProps) {
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    // Ensure menu stays within viewport
    const adjustedX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 200 : x);
    const adjustedY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 300 : y);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-[1000] bg-[#1a1a1a]/95 border border-white/10 rounded-xl shadow-2xl py-2 min-w-[180px] backdrop-blur-2xl"
            style={{ left: adjustedX, top: adjustedY }}
            onClick={(e) => e.stopPropagation()}
        >
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={() => { action.onClick(); onClose(); }}
                    className={cn(
                        "w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold transition-all group",
                        action.danger 
                            ? "text-red-400 hover:bg-red-500/10" 
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                    )}
                >
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                        <action.icon size={14} className={action.iconClassName} />
                    </span>
                    {action.label}
                </button>
            ))}
        </motion.div>
    );
}
