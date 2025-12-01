'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/state';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronUp, ChevronDown, Minus, Maximize2, Minimize2 } from 'lucide-react';

type ViewMode = 'minimized' | 'normal' | 'expanded';

export function ChatPanel() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('normal');
    const scrollRef = useRef<HTMLDivElement>(null);

    const setHuman = useStore((s) => s.setHuman);
    const setAI = useStore((s) => s.setAI);
    const setCenter = useStore((s) => s.setCenter);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, viewMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Auto-expand if minimized when sending
        if (viewMode === 'minimized') setViewMode('normal');

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
            // Add error message to chat
            const errorMsg: Message = {
                role: 'assistant',
                content: `Error: ${error.message || 'Something went wrong. Please try again.'}`
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Container height based on viewMode
    const containerHeight = {
        minimized: 'h-[60px]',
        normal: 'h-[35%]',
        expanded: 'h-[80%]',
    }[viewMode];

    return (
        <motion.div
            className={`absolute bottom-0 left-0 right-0 flex flex-col z-30 transition-all duration-500 ease-in-out ${containerHeight}`}
            initial={false}
            animate={{ height: containerHeight === 'h-[60px]' ? 60 : containerHeight === 'h-[35%]' ? '35%' : '80%' }}
        >
            {/* Control Deck Background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" />

            {/* Header / Controls */}
            <div className="relative z-40 flex items-center justify-between px-6 py-2 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                        {isLoading ? 'AI PROCESSING...' : 'SYSTEM READY'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {viewMode !== 'minimized' && (
                        <button
                            onClick={() => setViewMode('minimized')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            title="Minimize"
                        >
                            <Minus size={14} />
                        </button>
                    )}
                    {viewMode === 'minimized' && (
                        <button
                            onClick={() => setViewMode('normal')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            title="Restore"
                        >
                            <ChevronUp size={14} />
                        </button>
                    )}
                    {viewMode === 'normal' && (
                        <button
                            onClick={() => setViewMode('expanded')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            title="Expand"
                        >
                            <Maximize2 size={14} />
                        </button>
                    )}
                    {viewMode === 'expanded' && (
                        <button
                            onClick={() => setViewMode('normal')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            title="Restore"
                        >
                            <Minimize2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area - Hidden when minimized */}
            {viewMode !== 'minimized' && (
                <div
                    className="relative flex-1 w-full max-w-5xl mx-auto overflow-y-auto px-6 pt-6 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    ref={scrollRef}
                >
                    <div className="flex flex-col justify-end min-h-full gap-6">
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
                                        "max-w-[85%] px-6 py-4 text-[15px] leading-relaxed shadow-sm",
                                        m.role === 'user'
                                            ? "bg-white text-black rounded-2xl rounded-br-sm font-medium"
                                            : "bg-white/5 text-white border border-white/10 rounded-2xl rounded-bl-sm backdrop-blur-md"
                                    )}>
                                        {m.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
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
                                    <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="relative w-full max-w-3xl mx-auto px-6 pb-8 pt-2">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="relative w-full bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all font-light tracking-wide"
                            suppressHydrationWarning
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-4 rounded-xl bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-lg font-medium"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
