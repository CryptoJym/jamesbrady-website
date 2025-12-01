'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/state';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Minus, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';

export function ChatPanel() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Drag State (Motion Values for Instant Response)
    const height = useMotionValue(35); // Initial height %
    const heightTemplate = useTransform(height, (h) => `${h}%`);

    // We track the raw value for logic (snapping)
    const heightRef = useRef(35);
    useEffect(() => {
        const unsubscribe = height.on("change", (v) => { heightRef.current = v; });
        return unsubscribe;
    }, [height]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const setHuman = useStore((s) => s.setHuman);
    const setAI = useStore((s) => s.setAI);
    const setCenter = useStore((s) => s.setCenter);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]); // Removed height dependency as it's now a motion value

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Auto-expand if minimized (less than 15%)
        if (heightRef.current < 15) {
            animate(height, 35, { type: "spring", stiffness: 300, damping: 30 });
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to fetch');
            }

            const data = await res.json();

            const assistantMsg: Message = { role: 'assistant', content: data.assistantMessage };
            setMessages((prev) => [...prev, assistantMsg]);

            // Update manifolds
            if (data.humanState) setHuman(data.humanState);
            if (data.aiState) setAI(data.aiState);
            if (data.centerState) setCenter(data.centerState);

        } catch (error: any) {
            console.error(error);
            const errorMsg: Message = {
                role: 'assistant',
                content: `Error: ${error.message || 'Something went wrong. Please try again.'}`
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Drag Logic
    const handlePan = (event: any, info: PanInfo) => {
        const screenHeight = window.innerHeight;
        const draggedPixels = info.delta.y; // Delta gives us frame-by-frame change
        const draggedPercent = (draggedPixels / screenHeight) * 100;

        // Invert: dragging UP (negative delta) should INCREASE height
        const newHeight = height.get() - draggedPercent;

        // Clamp during drag
        height.set(Math.max(5, Math.min(95, newHeight)));
    };

    const handlePanEnd = () => {
        const currentH = height.get();
        let targetH = currentH;

        // Snap logic
        if (currentH < 15) targetH = 5;       // Minimized
        else if (currentH < 45) targetH = 35; // Normal
        else targetH = 85;                    // Expanded

        animate(height, targetH, { type: "spring", stiffness: 400, damping: 30 });
    };

    // Manual Controls
    const setHeightManual = (target: number) => {
        animate(height, target, { type: "spring", stiffness: 400, damping: 30 });
    };

    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 flex flex-col z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ height: heightTemplate }} // Direct mapping, no React state re-renders
        >
            {/* Background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />

            {/* Draggable Header / Controls */}
            <motion.div
                className="relative z-40 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5 cursor-ns-resize group"
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
                {/* Status Indicator */}
                <div className="flex items-center gap-3 pointer-events-none">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-amber-500" : "bg-cyan-500")} />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                        {isLoading ? 'PROCESSING...' : 'SYSTEM READY'}
                    </span>
                </div>

                {/* Drag Handle Indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/50 transition-colors">
                    <GripHorizontal size={20} />
                </div>

                {/* Manual Controls */}
                <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setHeightManual(5)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        title="Minimize"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={() => setHeightManual(heightRef.current > 50 ? 35 : 85)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        title={heightRef.current > 50 ? "Restore" : "Expand"}
                    >
                        {heightRef.current > 50 ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </motion.div>

            {/* Messages Area - Hidden when minimized */}
            <motion.div
                className="relative flex-1 w-full mx-auto overflow-y-auto px-6 pt-6 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                style={{
                    opacity: useTransform(height, [5, 15], [0, 1]),
                    pointerEvents: useTransform(height, (h) => h < 10 ? 'none' : 'auto')
                }}
                ref={scrollRef}
            >
                <div className="flex flex-col justify-end min-h-full gap-8 max-w-3xl mx-auto">
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={cn(
                                    "flex w-full",
                                    m.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[90%] px-8 py-6 text-base leading-relaxed shadow-sm",
                                    m.role === 'user'
                                        ? "bg-white text-black rounded-2xl rounded-br-sm font-medium"
                                        : "bg-white/5 text-gray-100 border border-white/10 rounded-2xl rounded-bl-sm backdrop-blur-md"
                                )}>
                                    {m.role === 'assistant' ? (
                                        <div className="prose prose-invert prose-base max-w-none 
                                            prose-p:leading-loose prose-p:mb-4 
                                            prose-headings:font-light prose-headings:tracking-wide prose-headings:text-white/90
                                            prose-strong:font-bold prose-strong:text-white
                                            prose-ul:my-4 prose-li:my-1
                                            prose-code:text-cyan-300 prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                            prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4
                                            prose-blockquote:border-l-4 prose-blockquote:border-cyan-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start w-full"
                            >
                                <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
                className="relative w-full max-w-3xl mx-auto px-6 pb-8 pt-4"
                style={{
                    opacity: useTransform(height, [5, 15], [0, 1]),
                    pointerEvents: useTransform(height, (h) => h < 10 ? 'none' : 'auto')
                }}
            >
                <form onSubmit={handleSubmit} className="relative flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="relative w-full bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl py-4 pl-6 pr-12 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all font-light tracking-wide text-lg"
                            suppressHydrationWarning
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-4 rounded-xl bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-lg font-medium"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
