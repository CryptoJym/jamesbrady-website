'use client';

import dynamic from 'next/dynamic';

const ManifoldScene = dynamic(() => import('./ManifoldScene').then(mod => mod.ManifoldScene), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />,
});

export function SceneWrapper() {
    return <ManifoldScene />;
}
