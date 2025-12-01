import { SceneWrapper } from '@/components/SceneWrapper';
import { ChatPanel } from '@/components/ChatPanel';
import { DashboardOverlay } from '@/components/DashboardOverlay';

export default function Home() {
  return (
    <main className="relative h-screen w-full bg-black overflow-hidden font-sans text-white selection:bg-cyan-500/30">
      {/* Full-bleed 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <SceneWrapper />
      </div>

      {/* Dashboard HUD overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DashboardOverlay />
      </div>

      {/* Chat Interface - floats at bottom */}
      <ChatPanel />
    </main>
  );
}
