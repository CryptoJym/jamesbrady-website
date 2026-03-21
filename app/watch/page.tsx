import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  PlayCircle,
  DownloadSimple,
  Subtitles,
} from "@phosphor-icons/react/dist/ssr";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Narrated video essays and walkthroughs from James Brady on AI systems, operator loops, and applied leverage.",
};

type VideoItem = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster?: string;
  transcript: string;
};

const videos: VideoItem[] = [
  {
    id: "ai-alchemy",
    title: "What is AI Alchemy?",
    description:
      "The main system-story overview: models, tools, memory, skills, and workflows compounding into leverage.",
    src: "/videos/james-what-is-ai-alchemy.mp4",
    poster: "/images/hero-alchemy.jpg",
    transcript:
      "AI alchemy is the practice of turning raw models into working leverage. A model alone is not a business system. The system appears when tools, memory, skills, and workflows connect and start carrying load together.",
  },
  {
    id: "install-first-skill",
    title: "Install your first skill",
    description:
      "A Workshop walkthrough for going from one useful behavior to one live operator loop.",
    src: "/videos/james-install-first-skill.mp4",
    poster: "/images/workshop-build.jpg",
    transcript:
      "Do not start with a giant stack. Start with one useful behavior. Pick the outcome, install one skill, connect one trigger-input-output loop, and then test it in the real world until it becomes leverage.",
  },
  {
    id: "prompts-to-os",
    title: "From prompts to operating systems",
    description:
      "The shift from one-off prompt output to continuity, routing, skills, and momentum.",
    src: "/videos/james-prompts-to-operating-systems.mp4",
    poster: "/images/primer-stack.jpg",
    transcript:
      "A prompt gives you output. An operating system gives you continuity. It remembers context, uses tools, follows skills, routes work, and creates the next action instead of just dropping more text in your lap.",
  },
];

function VideoBlock({ video }: { video: VideoItem }) {
  return (
    <section id={video.id} className="scroll-mt-28">
      <div className="rounded-[28px] overflow-hidden border border-[#1E1E1E] bg-[#0D0D0D] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="px-5 md:px-6 py-5 border-b border-[#1E1E1E] flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#E8E4DD]">
              {video.title}
            </h2>
            <p className="mt-3 text-neutral-400 leading-relaxed">
              {video.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <a
              href={video.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#D4A853] hover:text-[#E8E4DD] transition-premium"
            >
              <PlayCircle size={16} weight="regular" />
              Open direct MP4
            </a>
            <a
              href={video.src}
              download
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#D4A853] transition-premium"
            >
              <DownloadSimple size={16} weight="regular" />
              Download
            </a>
          </div>
        </div>

        <div className="p-3 md:p-4">
          <video
            controls
            preload="metadata"
            playsInline
            className="w-full rounded-[20px] bg-black"
            poster={video.poster}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        </div>

        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1">
          <div className="rounded-[20px] border border-[#1E1E1E] bg-[#111111] px-4 py-4 md:px-5 md:py-5">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#D4A853] mb-3">
              <Subtitles size={14} weight="regular" />
              Transcript preview
            </div>
            <p className="text-sm md:text-[15px] leading-relaxed text-neutral-400 max-w-[85ch]">
              {video.transcript}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function WatchPage() {
  return (
    <>
      <section className="px-6 md:px-12 pt-28 md:pt-36 pb-18 md:pb-20">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="eyebrow text-[#D4A853] mb-5 inline-block">
              Watch
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.94] max-w-[10ch] text-[#E8E4DD]">
              Video essays and walkthroughs.
            </h1>
            <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-[44ch]">
              A cleaner place to watch the narrated pieces without relying on a
              homepage embed. Each one also has a direct MP4 fallback.
            </p>
            <div className="mt-8">
              <Link
                href="/links"
                className="inline-flex items-center gap-3 text-sm text-[#D4A853] hover:text-[#E8E4DD] transition-premium"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#D4A853]/25">
                  <ArrowUpRight size={14} weight="bold" />
                </span>
                Back to links hub
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="metatron" className="my-4" />

      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto space-y-10 md:space-y-12">
          {videos.map((video, index) => (
            <ScrollReveal key={video.id} delay={index * 80}>
              <VideoBlock video={video} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
