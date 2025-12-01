'use client';

import dynamic from 'next/dynamic';


const ManifoldScene = dynamic(() => import('./ManifoldScene').then(mod => mod.ManifoldScene), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />,
});

export function SceneWrapper() {
    return (
        <main className="relative w-full h-screen bg-black overflow-hidden">
            <div className="absolute inset-0 z-10">
                <ManifoldScene />
            </div>
        </main>
    );
}
