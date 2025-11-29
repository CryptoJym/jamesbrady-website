'use client';

import { useStore } from '@/lib/state';

import { } from 'lucide-react';

export function DashboardOverlay() {
    const center = useStore((s) => s.conversation.center);

    return (
        <div className="absolute top-0 inset-x-0 p-8 flex justify-center pointer-events-none z-20">
            <div className="flex flex-col items-center gap-1 opacity-50">
                <span className="text-[10px] uppercase tracking-[0.4em] font-light">System Coherence</span>
                <span className="text-sm font-light tracking-widest">
                    {((center.coherence ?? 0) * 100).toFixed(0)}%
                </span>
            </div>
        </div>
    );
}
