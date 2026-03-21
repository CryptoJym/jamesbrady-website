import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Butterfly,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  TiktokLogo,
  YoutubeLogo,
  XLogo,
  PlayCircle,
  BookOpen,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

export const metadata: Metadata = {
  title: "Links",
  description:
    "James Brady link hub — core socials, essays, walkthroughs, and primary ways to connect.",
};

type LinkItem = {
  label: string;
  href: string;
  note: string;
  icon: any;
  external?: boolean;
};

const socialLinks: LinkItem[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jamesbrady1/",
    note: "Professional profile and public thinking",
    icon: LinkedinLogo,
    external: true,
  },
  {
    label: "X / h3roai",
    href: "https://x.com/h3roai",
    note: "Fast takes, AI-native signal, and live thoughts",
    icon: XLogo,
    external: true,
  },
  {
    label: "TikTok / h3ro.ai",
    href: "https://www.tiktok.com/@h3ro.ai",
    note: "Short-form clips and experiments",
    icon: TiktokLogo,
    external: true,
  },
  {
    label: "Bluesky / utlyzeit",
    href: "https://bsky.app/profile/utlyzeit.bsky.social",
    note: "Additional social stream and public notes",
    icon: Butterfly,
    external: true,
  },
  {
    label: "GitHub / CryptoJym",
    href: "https://github.com/CryptoJym",
    note: "Code, repos, systems, and ongoing implementation",
    icon: GithubLogo,
    external: true,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA",
    note: "Channel for video, workshop, and narrated systems content",
    icon: YoutubeLogo,
    external: true,
  },
  {
    label: "Email / james@utlyze.com",
    href: "mailto:james@utlyze.com",
    note: "Direct contact",
    icon: Envelope,
    external: false,
  },
];

const siteLinks: LinkItem[] = [
  {
    label: "Home",
    href: "/",
    note: "AI Alchemist entry point",
    icon: Sparkle,
  },
  {
    label: "Primer",
    href: "/primer",
    note: "How the stack actually works",
    icon: BookOpen,
  },
  {
    label: "Workshop",
    href: "/workshop",
    note: "Practical guides and walkthroughs",
    icon: PlayCircle,
  },
  {
    label: "About",
    href: "/about",
    note: "Philosophy, focus areas, and identity",
    icon: Sparkle,
  },
];

const featuredVideoLinks: LinkItem[] = [
  {
    label: "What is AI Alchemy?",
    href: "/",
    note: "Homepage featured video overview",
    icon: PlayCircle,
  },
  {
    label: "Install your first skill",
    href: "/workshop",
    note: "Workshop walkthrough with James narration",
    icon: PlayCircle,
  },
  {
    label: "From prompts to operating systems",
    href: "/about",
    note: "Video essay on moving beyond one-off prompting",
    icon: PlayCircle,
  },
];

function LinkCard({ item }: { item: LinkItem }) {
  const content = (
    <div className="group rounded-[24px] border border-[#1E1E1E] bg-[#0D0D0D] px-5 py-5 md:px-6 md:py-6 transition-premium hover:border-[#D4A853]/30 hover:bg-[#111111] hover:shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4A853]/15 bg-[#D4A853]/[0.05] text-[#D4A853] transition-premium group-hover:border-[#D4A853]/35 group-hover:bg-[#D4A853]/[0.09]">
          <item.icon size={20} weight="regular" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-medium tracking-tight text-[#E8E4DD]">
              {item.label}
            </h3>
            <ArrowUpRight
              size={14}
              weight="bold"
              className="text-[#D4A853]/60 transition-premium group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-[#D4A853]"
            />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 group-hover:text-neutral-400 transition-premium">
            {item.note}
          </p>
        </div>
      </div>
    </div>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  if (item.href.startsWith("mailto:")) {
    return <a href={item.href}>{content}</a>;
  }

  return <Link href={item.href}>{content}</Link>;
}

function LinkSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: LinkItem[];
}) {
  return (
    <section className="px-6 md:px-12 py-16 md:py-20">
      <div className="max-w-[1080px] mx-auto">
        <ScrollReveal>
          <div className="mb-10 md:mb-12">
            <span className="eyebrow text-[#D4A853] mb-3 inline-block">
              {eyebrow}
            </span>
            <h2 className="section-header max-w-[14ch]">{title}</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {items.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 70}>
              <LinkCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LinksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "James Brady Links",
            url: "https://www.jamesbrady.org/links",
            description:
              "Primary links for James Brady — socials, essays, videos, and direct contact.",
          }),
        }}
      />

      <section className="px-6 md:px-12 pt-28 md:pt-36 pb-18 md:pb-24">
        <div className="max-w-[1080px] mx-auto">
          <ScrollReveal>
            <div className="max-w-[720px]">
              <span className="eyebrow text-[#D4A853] mb-6 inline-block">
                Link hub
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.92] text-[#E8E4DD]">
                The cleanest path
                <br />
                into my world.
              </h1>
              <div className="w-24 h-px bg-[#D4A853] my-8" />
              <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-[36ch]">
                Socials, essays, videos, and the direct lines that actually
                matter — gathered in one place.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="metatron" className="my-4" />

      <LinkSection
        eyebrow="Socials"
        title="Public profiles and channels"
        items={socialLinks}
      />

      <SectionDivider variant="wave" className="my-4" />

      <LinkSection
        eyebrow="Site"
        title="Best starting points on jamesbrady.org"
        items={siteLinks}
      />

      <SectionDivider variant="vesica" className="my-4" />

      <LinkSection
        eyebrow="Watch"
        title="Narrated pieces worth starting with"
        items={featuredVideoLinks}
      />
    </>
  );
}
