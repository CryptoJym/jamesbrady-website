'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatPanel() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Systems online. Neural link established. I am ready to visualize your thoughts." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State setters
    const setHuman = useStore((s) => s.setHuman);
    const setAI = useStore((s) => s.setAI);
    const setCenter = useStore((s) => s.setCenter);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
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
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: 'assistant', content: `**System Error:** ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-8 px-4 md:px-0 z-20">

            {/* Messages Container - Centered, floating above input */}
            <div className="w-full max-w-2xl mx-auto mb-6 h-[50vh] overflow-y-auto mask-gradient-to-t pointer-events-none pr-2 scrollbar-hide">
                <div className="flex flex-col gap-6 justify-end min-h-full pb-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} pointer-events-auto`}
                            >
                                {msg.role === 'user' ? (
                                    // User Message: Glass Bubble
                                    <div className="max-w-[80%] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tr-sm px-5 py-3 text-sm md:text-base text-white/90 shadow-lg">
                                        {msg.content}
                                    </div>
                                ) : (
                                    // AI Message: Clean Text with Accent
                                    <div className="max-w-[85%] flex gap-4 items-start">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0">
                                            <Sparkles className="w-3 h-3 text-cyan-400" />
                                        </div>
                                        <div className="text-sm md:text-base text-cyan-50/90 leading-relaxed font-light bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                                            <ReactMarkdown
                                                components={{
                                                    strong: ({ node, ...props }) => <span className="font-semibold text-cyan-300" {...props} />,
                                                    code: ({ node, ...props }) => <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono text-cyan-200" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-cyan-500/50 font-mono ml-10 pointer-events-auto"
                        >
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                            PROCESSING_NEURAL_INPUT...
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Capsule - Floating at bottom */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full max-w-2xl mx-auto pointer-events-auto"
            >
                <form onSubmit={handleSubmit} className="relative group">
                    {/* Neural Glow - Reacts to Focus and Input */}
                    <motion.div
                        animate={{
                            opacity: isFocused ? 0.8 : 0.3,
                            scale: isFocused ? 1.02 : 1,
                        }}
                        className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-full blur transition-all duration-500"
                    />

                    <div className={`relative flex items-center bg-black/60 backdrop-blur-xl border rounded-full px-2 py-2 shadow-2xl transition-colors duration-300 ${isFocused ? 'border-cyan-500/30' : 'border-white/10'}`}>
                        <div className={`pl-4 pr-2 transition-colors duration-300 ${isFocused ? 'text-cyan-400' : 'text-white/30'}`}>
                            <Terminal className="w-4 h-4" />
                        </div>

                        <input
                            type="text"
                            value={input}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                setInput(e.target.value);
                                // Boost activity on typing
                                useStore.getState().setInputActivity(1.0);
                            }}
                            placeholder="Enter semantic input..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20 text-sm md:text-base font-light h-10"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`p-2 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent ${input.trim()
                                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <div className="text-center mt-3">
                    <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                        System v2.0 • Neural Link Active
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
