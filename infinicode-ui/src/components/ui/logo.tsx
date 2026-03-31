"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InfinityLogoProps {
    size?: number;
    className?: string;
}

export const InfinityLogo = ({ size = 32, className }: InfinityLogoProps) => {
    const dots = [
        { cx: 1, cy: 0 }, { cx: 2, cy: 0 }, { cx: 6, cy: 0 }, { cx: 7, cy: 0 }, { cx: 8, cy: 0 }, { cx: 9, cy: 0 },
        { cx: 0, cy: 1 }, { cx: 1, cy: 1 }, { cx: 2, cy: 1 }, { cx: 3, cy: 1 }, { cx: 4, cy: 1 }, { cx: 5, cy: 1 }, { cx: 6, cy: 1 }, { cx: 10, cy: 1 },
        { cx: 0, cy: 2 }, { cx: 4, cy: 2 }, { cx: 5, cy: 2 }, { cx: 10, cy: 2 }, { cx: 11, cy: 2 },
        { cx: 0, cy: 3 }, { cx: 4, cy: 3 }, { cx: 5, cy: 3 }, { cx: 10, cy: 3 }, { cx: 11, cy: 3 },
        { cx: 0, cy: 4 }, { cx: 1, cy: 4 }, { cx: 3, cy: 4 }, { cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }, { cx: 10, cy: 4 },
        { cx: 1, cy: 5 }, { cx: 2, cy: 5 }, { cx: 3, cy: 5 }, { cx: 6, cy: 5 }, { cx: 7, cy: 5 }, { cx: 8, cy: 5 }, { cx: 9, cy: 5 }
    ];

    return (
        <motion.svg 
            width={size} height={size} viewBox="-1 -4 13 13" fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] cursor-pointer", className)}
            initial="initial"
            whileHover="hover"
        >
            {dots.map((dot, i) => (
                <motion.circle
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    r="0.45"
                    variants={{
                        initial: { x: 0, y: 0 },
                        hover: { 
                            x: (Math.random() - 0.5) * 5, 
                            y: (Math.random() - 0.5) * 5,
                            transition: { type: "spring", stiffness: 300, damping: 10 }
                        }
                    }}
                />
            ))}
        </motion.svg>
    );
};
