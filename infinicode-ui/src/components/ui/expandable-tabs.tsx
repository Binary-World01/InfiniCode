"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Tab { title: string; icon: LucideIcon; href?: string; type?: never; }
interface Separator { type: "separator"; title?: never; icon?: never; href?: never; }
type TabItem = Tab | Separator;

interface ExpandableTabsProps {
    tabs: TabItem[];
    className?: string;
    activeColor?: string;
    onChange?: (index: number | null) => void;
}

const buttonVariants = {
    initial: { gap: 0, paddingLeft: ".5rem", paddingRight: ".5rem" },
    animate: (isSelected: boolean) => ({ gap: isSelected ? ".5rem" : 0, paddingLeft: isSelected ? "1rem" : ".5rem", paddingRight: isSelected ? "1rem" : ".5rem" }),
};

const spanVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
};

const transition: any = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({ tabs, className, activeColor = "text-primary", onChange }: ExpandableTabsProps) {
    const [selected, setSelected] = React.useState<number | null>(null);
    const outsideClickRef = React.useRef<any>(null);

    useOnClickOutside(outsideClickRef, () => { setSelected(null); onChange?.(null); });

    const handleSelect = (index: number) => {
        setSelected(index);
        onChange?.(index);
    };

    const SeparatorEl = () => <div className="mx-2 h-[24px] w-[1.5px] bg-white/10" aria-hidden="true" />;

    return (
        <div ref={outsideClickRef} className={cn("flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-1.5 shadow-lg", className)}>
            {tabs.map((tab, index) => {
                if (tab.type === "separator") return <SeparatorEl key={`separator-${index}`} />;
                const Icon = tab.icon;
                const isSelected = selected === index;

                const content = (
                    <>
                        <Icon size={24} strokeWidth={2} />
                        <AnimatePresence initial={false}>
                            {isSelected && (
                                <motion.span variants={spanVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="overflow-hidden">
                                    {tab.title}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </>
                );

                const commonProps = {
                    variants: buttonVariants,
                    initial: false,
                    animate: "animate",
                    custom: isSelected,
                    onClick: () => handleSelect(index),
                    transition: transition,
                    className: cn("relative flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-300 cursor-pointer",
                        isSelected ? cn("bg-white/10", activeColor) : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )
                };

                if (tab.href) {
                    return (
                        <motion.div {...commonProps} key={tab.title}>
                            <Link href={tab.href} className="flex items-center gap-inherit w-full h-full">
                                {content}
                            </Link>
                        </motion.div>
                    );
                }
                return (
                    <motion.button key={tab.title} {...commonProps} type="button">
                        {content}
                    </motion.button>
                );
            })}
        </div>
    );
}
