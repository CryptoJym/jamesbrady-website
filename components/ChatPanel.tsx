'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/state';
import { Message } from '@/lib/types';
import { Send, Loader2 } from 'lucide-react';

// Actually I haven't created lib/utils.ts yet. I'll use inline clsx for now or create it.
// I'll create a simple helper here to avoid extra files if not needed, or just import clsx directly.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ChatPanel() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const setHuman = useStore((s) => s.setHuman);
    const setAI = useStore((s) => s.setAI);
    const setCenter = useStore((s) => s.setCenter);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();

            const assistantMsg: Message = { role: 'assistant', content: data.assistantMessage };
            setMessages((prev) => [...prev, assistantMsg]);

            // Update manifolds
            if (data.humanState) setHuman(data.humanState);
            if (data.aiState) setAI(data.aiState);
            if (data.centerState) setCenter(data.centerState);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none"
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        >
            <div className="w-full max-w-3xl bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[40vh]">

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center text-white/20 py-4">
                            <p className="text-xs font-mono tracking-[0.2em] uppercase">System Ready</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 opacity-50">
                                <span className={cn(
                                    "text-[10px] uppercase tracking-widest font-mono",
                                    m.role === 'user' ? "text-blue-400" : "text-purple-400"
                                )}>
                                    {m.role === 'user' ? 'USER' : 'GPT-5.1'}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    "text-sm leading-relaxed",
                                    m.role === 'user' ? "text-white/90" : "text-white/80"
                                )}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 opacity-50">
                            <span className="text-[10px] uppercase tracking-widest font-mono text-purple-400">PROCESSING</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-75" />
                                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter sequence..."
                            className="flex-1 bg-transparent border-none py-2 px-2 text-white placeholder:text-white/20 focus:outline-none font-mono text-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-2 text-white/50 hover:text-white disabled:opacity-30 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
