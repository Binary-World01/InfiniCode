"use client";

import React, { useEffect, useRef } from "react";

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export interface CursorDrivenParticleTypographyProps {
    className?: string;
    text: string;
    fontSize?: number;
    fontFamily?: string;
    particleSize?: number;
    particleDensity?: number;
    dispersionStrength?: number;
    returnSpeed?: number;
    color?: string;
    showBrandLogo?: boolean;
}

class Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    dispersion: number;
    returnSpd: number;

    constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        dispersion: number,
        returnSpd: number
    ) {
        this.x = x + (Math.random() - 0.5) * 10;
        this.y = y + (Math.random() - 0.5) * 10;
        this.originX = x;
        this.originY = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.size = size;
        this.color = color;
        this.dispersion = dispersion;
        this.returnSpd = returnSpd;
    }

    update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 120;

        if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (interactionRadius - distance) / interactionRadius;
            this.vx -= forceDirectionX * force * this.dispersion;
            this.vy -= forceDirectionY * force * this.dispersion;
        }

        this.vx += (this.originX - this.x) * this.returnSpd;
        this.vy += (this.originY - this.y) * this.returnSpd;
        this.vx *= 0.85;
        this.vy *= 0.85;

        const distToOrigin = Math.sqrt(
            Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
        );

        if (distToOrigin < 1 && Math.random() > 0.95) {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function CursorDrivenParticleTypography({
    className,
    text,
    fontSize = 120,
    fontFamily = "Inter, sans-serif",
    particleSize = 1.5,
    particleDensity = 6,
    dispersionStrength = 15,
    returnSpeed = 0.08,
    color,
    showBrandLogo = false,
}: CursorDrivenParticleTypographyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let containerWidth = 0;
        let containerHeight = 0;

        const init = () => {
            const container = containerRef.current;
            if (!container) return;

            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerWidth * dpr;
            canvas.height = containerHeight * dpr;
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            const computedStyle = window.getComputedStyle(container);
            const textColor = color || computedStyle.color || "#ffffff";

            ctx.clearRect(0, 0, containerWidth, containerHeight);

            const effectiveFontSize = Math.min(fontSize, containerWidth * 0.15);
            ctx.fillStyle = textColor;
            ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (showBrandLogo) {
                // Adjust logoSize to better match text height (cap-height)
                const logoSize = effectiveFontSize * 0.95; 
                const logoDots = [
                    { cx: 1, cy: 0 }, { cx: 2, cy: 0 }, { cx: 6, cy: 0 }, { cx: 7, cy: 0 }, { cx: 8, cy: 0 }, { cx: 9, cy: 0 },
                    { cx: 0, cy: 1 }, { cx: 1, cy: 1 }, { cx: 2, cy: 1 }, { cx: 3, cy: 1 }, { cx: 4, cy: 1 }, { cx: 5, cy: 1 }, { cx: 6, cy: 1 }, { cx: 10, cy: 1 },
                    { cx: 0, cy: 2 }, { cx: 4, cy: 2 }, { cx: 5, cy: 2 }, { cx: 10, cy: 2 }, { cx: 11, cy: 2 },
                    { cx: 0, cy: 3 }, { cx: 4, cy: 3 }, { cx: 5, cy: 3 }, { cx: 10, cy: 3 }, { cx: 11, cy: 3 },
                    { cx: 0, cy: 4 }, { cx: 1, cy: 4 }, { cx: 3, cy: 4 }, { cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }, { cx: 10, cy: 4 },
                    { cx: 1, cy: 5 }, { cx: 2, cy: 5 }, { cx: 3, cy: 5 }, { cx: 6, cy: 5 }, { cx: 7, cy: 5 }, { cx: 8, cy: 5 }, { cx: 9, cy: 5 }
                ];
                
                const dotScale = logoSize / 12;
                const textWidth = text ? ctx.measureText(text).width : 0;
                const totalWidth = text ? (logoSize * 1.1) + textWidth : logoSize;
                
                // Offset of the entire logo+text block from canvas edge to center it
                const blockOffsetX = (containerWidth - totalWidth) / 2;
                const blockOffsetY = containerHeight / 2 - (5 * dotScale) / 2;

                particles = []; // Clear particles before scanning

                // 1. Draw the brand logo pattern on the canvas for the scanner to pick up
                ctx.fillStyle = textColor;
                logoDots.forEach(dot => {
                    ctx.beginPath();
                    // Draw a solid circle on the canvas - this will result in a "bold" cluster of particles
                    ctx.arc(blockOffsetX + dot.cx * dotScale, blockOffsetY + dot.cy * dotScale, dotScale * 0.45, 0, Math.PI * 2);
                    ctx.fill();
                });

                // 2. Draw the text on the same canvas
                if (text) {
                    ctx.textAlign = "left";
                    // Tighter spacing between logo and text
                    ctx.fillText(text, blockOffsetX + logoSize * 1.1, containerHeight / 2);
                }
            } else {
                particles = []; // Clear particles if not showing logo
                ctx.fillText(text, containerWidth / 2, containerHeight / 2);
            }

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Scan the canvas for text particles
            const step = Math.max(1, Math.floor(particleDensity * dpr));
            for (let y = 0; y < textCoordinates.height; y += step) {
                for (let x = 0; x < textCoordinates.width; x += step) {
                    const index = (y * textCoordinates.width + x) * 4;
                    const alpha = textCoordinates.data[index + 3] || 0;

                    if (alpha > 128) {
                        particles.push(
                            new Particle(x / dpr, y / dpr, particleSize, textColor, dispersionStrength, returnSpeed)
                        );
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, containerWidth, containerHeight);
            particles.forEach((particle) => {
                particle.update(mouseX, mouseY);
                particle.draw(ctx);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        const timeoutId = setTimeout(() => {
            init();
            animate();
        }, 100);

        const resizeObserver = new ResizeObserver(() => init());
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color, showBrandLogo]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full min-h-[400px] flex items-center justify-center relative touch-none",
                className
            )}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}

export default CursorDrivenParticleTypography;
