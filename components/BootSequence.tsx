'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    const steps = [
        "INITIALIZING NEURAL LINK...",
        "CONNECTING TO MANIFOLD...",
        "SYNCHRONIZING TENSORS...",
        "SYSTEM ONLINE"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(timer);
                    setTimeout(onComplete, 800); // Wait a bit after final step
                    return prev;
                }
                return prev + 1;
            });
        }, 800); // Duration per step

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 relative">
                    <motion.div
                        className="absolute inset-0 border-t-2 border-cyan-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 border-r-2 border-purple-500 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <div className="h-6 overflow-hidden flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-xs font-mono text-cyan-500 tracking-[0.3em]"
                        >
                            {steps[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
