import { ManifoldScene } from '@/components/ManifoldScene';
import { ChatPanel } from '@/components/ChatPanel';
import { DashboardOverlay } from '@/components/DashboardOverlay';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#02030b] text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0">
        <ManifoldScene />
      </div>

      {/* UI Layer - Components handle their own positioning */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <DashboardOverlay />
        <ChatPanel />
      </div>
    </main>
  );
}
