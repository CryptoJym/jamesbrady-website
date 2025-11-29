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
        <div className="w-full max-w-4xl mx-auto p-6 pointer-events-auto flex flex-col justify-end h-[50vh]">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-none mask-gradient-to-t mb-6" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse shadow-[0_0_15px_white]" />
                        </div>
                        <p className="text-xs font-light tracking-[0.3em] uppercase opacity-50">Manifold Online</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500",
                            m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "p-5 rounded-2xl text-lg font-light leading-relaxed backdrop-blur-xl shadow-lg border",
                                m.role === 'user'
                                    ? "bg-white/10 text-white border-white/10 rounded-br-sm"
                                    : "bg-black/40 text-blue-50 border-white/5 rounded-bl-sm shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                            )}
                        >
                            {m.content}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-30 px-2">
                            {m.role === 'user' ? 'You' : 'Intelligence'}
                        </span>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-3 p-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 w-fit animate-pulse">
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-150" />
                        </div>
                        <span className="text-xs text-white/40 font-light tracking-widest uppercase">Synthesizing</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-2 shadow-2xl backdrop-blur-md transition-all focus-within:bg-white/10 focus-within:border-white/20">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter sequence..."
                        className="flex-1 bg-transparent border-none py-4 px-6 text-lg text-white placeholder:text-white/20 focus:outline-none font-light tracking-wide"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 text-white/50 hover:text-white disabled:opacity-30 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
