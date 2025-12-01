'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/state';
import { motion } from 'framer-motion';

// Simple Sparkline Component
function Sparkline({ data, color }: { data: number[], color: string }) {
    return (
        <div className="h-6 w-full opacity-40 relative overflow-hidden">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 32">
                <path
                    d={`M 0 ${32 - data[0] * 32} ${data.map((d, i) => `L ${(i / (data.length - 1)) * 100} ${32 - d * 32}`).join(' ')}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}

function MetricBar({ label, value, color = "bg-white" }: { label: string, value: number, color?: string }) {
    // Mock history data for sparkline
    const history = [value * 0.8, value * 0.9, value * 1.1, value * 0.95, value];

    return (
        <div className="flex flex-col gap-1 w-48 group">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/40 group-hover:text-white/80 transition-colors font-medium">
                <span>{label}</span>
                <span className="font-mono text-white/60">{Math.round(value * 100)}%</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color} shadow-[0_0_10px_currentColor]`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                />
            </div>
            <Sparkline data={history} color={color.replace('bg-', 'stroke-').replace('400', '500')} />
        </div>
    );
}

export function DashboardOverlay() {
    const { human, ai, center } = useStore((s) => s.conversation);
    const coherence = center.coherence ?? 0.5;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 pointer-events-none select-none w-full h-full overflow-hidden">

            {/* Human Column (Left) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-8 left-8 flex flex-col gap-6 items-start pointer-events-auto"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-purple-100/70">Human State</h3>
                </div>

                <div className="space-y-5 pl-4 border-l border-white/10 backdrop-blur-sm bg-black/20 p-4 rounded-r-xl">
                    <MetricBar label="Energy" value={human.energy} color="bg-purple-400" />
                    <MetricBar label="Valence" value={(human.valence + 1) / 2} color="bg-pink-400" />
                    <MetricBar label="Complexity" value={human.complexity} color="bg-indigo-400" />
                    <MetricBar label="Novelty" value={human.novelty} color="bg-blue-400" />
                    <MetricBar label="Introspection" value={human.introspection} color="bg-violet-400" />
                </div>
            </motion.div>

            {/* Center Coherence Gauge - Positioned Top Center */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
                <div className="relative flex items-center justify-center group cursor-default pointer-events-auto">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full opacity-40" />

                    {/* Conic Gradient Ring */}
                    <div
                        className="h-24 w-24 rounded-full mask-ring border border-teal-500/10 shadow-2xl"
                        style={{
                            background: `conic-gradient(
                                rgba(45, 212, 191, 1) 0deg,
                                rgba(45, 212, 191, 1) ${coherence * 360}deg,
                                rgba(255, 255, 255, 0.05) ${coherence * 360}deg,
                                rgba(255, 255, 255, 0.05) 360deg
                            )`,
                            mask: 'radial-gradient(transparent 68%, black 69%)',
                            WebkitMask: 'radial-gradient(transparent 68%, black 69%)'
                        }}
                    />

                    {/* Inner Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-light tracking-tighter text-teal-50 font-mono drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                            {(coherence * 100).toFixed(0)}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-teal-500/50">Coh</span>
                    </div>
                </div>
            </motion.div>

            {/* AI Column (Right) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-8 right-8 flex flex-col gap-6 items-end text-right pointer-events-auto"
            >
                <div className="flex items-center gap-3 mb-2 flex-row-reverse">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_#06b6d4] animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-100/70">AI State</h3>
                </div>

                <div className="space-y-5 pr-4 border-r border-white/10 backdrop-blur-sm bg-black/20 p-4 rounded-l-xl">
                    <MetricBar label="Energy" value={ai.energy} color="bg-cyan-400" />
                    <MetricBar label="Valence" value={(ai.valence + 1) / 2} color="bg-teal-400" />
                    <MetricBar label="Complexity" value={ai.complexity} color="bg-sky-400" />
                    <MetricBar label="Focus" value={ai.focus} color="bg-emerald-400" />
                    <MetricBar label="Structure" value={ai.dim1} color="bg-slate-300" />
                </div>
            </motion.div>
        </div>
    );
}
