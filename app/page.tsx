'use client';

import { useState } from 'react';
import { SceneWrapper } from '@/components/SceneWrapper';
import { ChatPanel } from '@/components/ChatPanel';
import { DashboardOverlay } from '@/components/DashboardOverlay';
import { BootSequence } from '@/components/BootSequence';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const [booted, setBooted] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-sans text-white selection:bg-cyan-500/30">
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      {/* Full-bleed 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <SceneWrapper />
      </div>

      {/* UI Elements - Fade in after boot */}
      {booted && (
        <>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <DashboardOverlay />
          </div>
          <ChatPanel />
        </>
      )}
    </main>
  );
}
