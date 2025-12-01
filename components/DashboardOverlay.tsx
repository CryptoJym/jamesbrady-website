'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/state';
import { motion } from 'framer-motion';
import { Activity, Cpu, Heart, Sparkles, Zap, GitGraph, Brain } from 'lucide-react';

function MetricIcon({ icon: Icon, value, color, align = 'left' }: { icon: any, value: number, color: string, align?: 'left' | 'right' }) {
    return (
        <div className={`flex items-center gap-4 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
            <Icon className={`w-5 h-5 ${color} opacity-90`} />

            {/* Segmented Bar */}
            <div className={`flex gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-4 rounded-sm transition-all duration-500 ${i < Math.abs(value) * 5
                            ? `${color} opacity-90 shadow-[0_0_8px_currentColor]`
                            : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

export function DashboardOverlay() {
    const { human, ai, center } = useStore((state) => state.conversation);
    const coherence = center.coherence ?? 0.5;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as any }
        }
    };

    const panelHover = {
        scale: 1.02,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
        transition: { duration: 0.3 }
    };

    return (
        <motion.div
            className="absolute inset-0 pointer-events-none z-10 font-mono w-full h-full overflow-hidden p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* Human Column (Left) - Minimalist */}
            <motion.div
                variants={itemVariants}
                whileHover={panelHover}
                className="absolute top-8 left-8 flex flex-col gap-5 bg-black/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg pointer-events-auto cursor-default"
            >
                <div className="flex items-center gap-3 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <div className="h-px w-10 bg-purple-500/40" />
                </div>

                <div className="space-y-4">
                    <MetricIcon icon={Heart} value={human.valence} color="text-pink-500" />
                    <MetricIcon icon={Zap} value={human.energy} color="text-purple-500" />
                    <MetricIcon icon={Activity} value={human.complexity} color="text-indigo-500" />
                </div>
            </motion.div>

            {/* Center Coherence (Top Middle) - The "Eye" */}
            <motion.div
                variants={itemVariants}
                whileHover={{ ...panelHover, scale: 1.05 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg pointer-events-auto cursor-default"
            >
                <div className="flex items-center gap-3">
                    <GitGraph className="w-4 h-4 text-teal-400/80" />
                    <span className="text-2xl font-medium text-white tracking-tight">
                        {(coherence * 100).toFixed(0)}
                    </span>
                    <span className="text-[10px] text-white/50">%</span>
                </div>
                {/* Micro Gauge */}
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-teal-500"
                        animate={{ width: `${coherence * 100}%` }}
                    />
                </div>
            </motion.div>

            {/* AI Column (Right) - Minimalist */}
            <motion.div
                variants={itemVariants}
                whileHover={panelHover}
                className="absolute top-8 right-8 flex flex-col gap-5 items-end bg-black/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg pointer-events-auto cursor-default"
            >
                <div className="flex items-center gap-3 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="h-px w-10 bg-cyan-500/40" />
                    <Cpu className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="space-y-4 flex flex-col items-end">
                    <MetricIcon icon={Heart} value={ai.valence} color="text-cyan-500" align="right" />
                    <MetricIcon icon={Sparkles} value={ai.novelty} color="text-blue-500" align="right" />
                    <MetricIcon icon={Activity} value={ai.complexity} color="text-emerald-500" align="right" />
                </div>
            </motion.div>


            {/* Bottom Corners Decoration */}
            <motion.div variants={itemVariants} className="absolute bottom-8 left-8 text-[9px] text-white/20 font-mono">
                COORD: {human.dim1.toFixed(4)}, {human.dim2.toFixed(4)}
            </motion.div>
            <motion.div variants={itemVariants} className="absolute bottom-8 right-8 text-[9px] text-white/20 font-mono text-right">
                STATUS: ONLINE<br />
                LATENCY: 12ms
            </motion.div>
        </motion.div>
    );
}
