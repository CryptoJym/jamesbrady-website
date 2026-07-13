import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Narrated video essays and walkthroughs from James Brady on AI systems, operator loops, and applied leverage.",
  alternates: { canonical: "/watch" },
};

const videos = [
  {
    id: "operating-system",
    state: "System story",
    title: "From models to operating leverage",
    description:
      "How models, tools, memory, skills, and workflows compound into a system that can carry work.",
    src: "/videos/james-what-is-ai-alchemy.mp4",
    captions: "/captions/james-what-is-ai-alchemy.vtt",
    summary:
      "A model alone is not a business system. The system appears when tools, memory, skills, and workflows connect, preserve context, and start carrying load together.",
  },
  {
    id: "first-skill",
    state: "Workshop",
    title: "Install your first skill",
    description:
      "A practical path from one useful behavior to one repeatable operator loop.",
    src: "/videos/james-install-first-skill.mp4",
    captions: "/captions/james-install-first-skill.vtt",
    summary:
      "Start with one useful behavior. Define the outcome, install one skill, connect one trigger-input-output loop, and test it against real work before expanding the stack.",
  },
  {
    id: "prompts-to-systems",
    state: "Operating thesis",
    title: "From prompts to operating systems",
    description:
      "The shift from one-off output to continuity, routing, skills, and a durable next action.",
    src: "/videos/james-prompts-to-operating-systems.mp4",
    captions: "/captions/james-prompts-to-operating-systems.vtt",
    summary:
      "A prompt gives you output. An operating system gives you continuity: context, tools, skills, routing, and the next action built into the work.",
  },
];

export default function WatchPage() {
  return (
    <>
      <section className="border-b border-[#CDD3CF] py-16 md:py-24">
        <div className="site-shell grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="evidence-label text-[#B93620]">Watch</p>
            <h1 className="thesis-display mt-8 max-w-[10ch] text-balance">Ideas are clearer when you can hear the reasoning.</h1>
          </div>
          <p className="max-w-[46ch] text-lg leading-relaxed text-[#5E6864] md:col-span-4">
            Narrated system stories and practical walkthroughs. Each piece has a
            direct file and a written summary.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-shell border-b border-[#CDD3CF]">
          {videos.map((video, index) => (
            <article key={video.id} id={video.id} className="scroll-mt-24 border-t border-[#CDD3CF] py-9 md:py-12">
              <div className="grid gap-8 md:grid-cols-12 md:gap-12">
                <div className="md:col-span-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="evidence-label text-[#B93620]">{video.state}</p>
                    <p className="evidence-label text-[#5E6864]">0{index + 1}</p>
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold leading-[1] tracking-[-0.045em] md:text-4xl">{video.title}</h2>
                  <p className="mt-5 leading-relaxed text-[#5E6864]">{video.description}</p>
                  <a href={video.src} target="_blank" rel="noopener noreferrer" className="text-link mt-6 inline-flex items-center gap-2 text-sm">
                    Open direct MP4
                    <ArrowUpRight size={13} weight="bold" />
                  </a>
                  <div className="mt-8 border-t border-[#CDD3CF] pt-5">
                    <p className="evidence-label text-[#5E6864]">Narrative summary</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#5E6864]">{video.summary}</p>
                  </div>
                </div>

                <div className="md:col-span-8">
                  <div className="border border-[#171A1B] bg-[#171A1B] p-2">
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      className="aspect-video w-full bg-black"
                      aria-label={`${video.title}. ${video.description}`}
                    >
                      <source src={video.src} type="video/mp4" />
                      <track
                        kind="captions"
                        src={video.captions}
                        srcLang="en"
                        label="English"
                        default
                      />
                      <p>
                        Your browser cannot play this video. <a href={video.src}>Open the MP4 directly.</a>
                      </p>
                    </video>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
