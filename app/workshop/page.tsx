import type { Metadata } from "next";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import Image from "next/image";
import {
  Terminal,
  Plug,
  Lightning,
  CaretRight,
  Copy,
} from "@phosphor-icons/react/dist/ssr";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

export const metadata: Metadata = {
  title: "The Workshop",
  description:
    "Three practical guides. Set up an AI agent, install skills, connect MCP servers.",
};

/* ---------- guide data ---------- */

const guides = [
  {
    id: "agent-setup",
    icon: Terminal,
    eyebrow: "Guide 01",
    title: "Set Up Your AI Agent",
    intro:
      "We'll set up Claude Code — Anthropic's agentic coding tool. It runs in your terminal, reads your entire codebase, and writes real code. You need Node.js 18+ and an Anthropic API key.",
    callout:
      "The agent learns your codebase as it works. It reads files, checks types, runs tests. It's not generating code in a vacuum — it's working inside your project.",
  },
  {
    id: "install-skills",
    icon: Plug,
    eyebrow: "Guide 02",
    title: "Install & Use Skills",
    intro:
      "Skills give your agent specialized capabilities. A skill for deployment knows the exact steps. A skill for testing knows the framework conventions. Skills are loaded on demand — they don't bloat your agent when unused.",
    callout:
      'Good skills are specific and opinionated. "Deploy to Vercel" is better than "deploy anywhere". The specificity is what makes the agent reliable.',
  },
  {
    id: "connect-mcp",
    icon: Lightning,
    eyebrow: "Guide 03",
    title: "Connect MCP Servers",
    intro:
      "MCP servers give your agent access to external tools — databases, APIs, browsers, file systems. Once connected, the agent can use these tools as naturally as reading a file.",
    callout:
      "Each MCP server you add expands what your agent can do. Start with one or two and add more as you need them. The configuration is the same pattern every time.",
  },
] as const;

const dividerVariants: Array<"metatron" | "wave" | "hexline"> = [
  "metatron",
  "wave",
  "hexline",
];

/* ---------- page ---------- */

export default function WorkshopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "The Workshop — Practical AI Agent Guides",
            description:
              "Three practical guides for setting up AI agents, skills, and MCP servers.",
            author: { "@type": "Person", name: "James Brady" },
            url: "https://jamesbrady.org/workshop",
          }),
        }}
      />

      <div className="min-h-screen bg-[#0A0A0A]">
        {/* ========== HERO ========== */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 h-[50vh] md:h-[60vh]">
            <Image
              src="/images/workshop-build.jpg"
              alt=""
              fill
              priority
              className="object-cover opacity-25"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 via-[#0A0A0A]/70 to-[#0A0A0A]" />
          </div>

          <div className="relative px-6 md:px-12 pt-28 pb-20 md:pt-36 md:pb-28">
            <div className="max-w-[1400px] mx-auto">
              <header className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-up">
                <div className="md:col-span-7">
                  <span className="eyebrow text-[#D4A853] mb-8 block">
                    The Workshop
                  </span>
                  <h1 className="section-header text-[#E8E4DD] leading-[1.05] mb-6">
                    Build
                    <br />
                    Something
                  </h1>
                  <div className="w-24 h-px bg-gradient-to-r from-[#D4A853] to-transparent" />
                </div>

                <div className="md:col-span-4 md:col-start-9 flex items-end">
                  <p className="text-neutral-400 text-base leading-relaxed">
                    Three guides. Real commands. Working results. Start at the top
                    and work down, or jump to what you need.
                  </p>
                </div>
              </header>

              {/* ---- Quick Nav ---- */}
              <nav className="mt-16 animate-fade-up" style={{ animationDelay: "150ms" }}>
                <div className="flex flex-wrap gap-3">
                  {guides.map((g) => {
                    const Icon = g.icon;
                    return (
                      <a
                        key={g.id}
                        href={`#${g.id}`}
                        className="group flex items-center gap-3 px-5 py-3 rounded-full border border-[#1E1E1E] hover:border-[#D4A853]/40 bg-[#0F0F0F] transition-premium"
                      >
                        <Icon
                          size={16}
                          weight="duotone"
                          className="text-neutral-600 group-hover:text-[#D4A853] transition-premium"
                        />
                        <span className="text-sm text-neutral-400 group-hover:text-[#E8E4DD] transition-premium">
                          {g.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* ========== GUIDE SECTIONS ========== */}
        <div className="px-6 md:px-12 pb-32">
          <div className="max-w-3xl mx-auto">
            {/* ---------- Guide 1: Agent Setup ---------- */}
            <section id="agent-setup" className="scroll-mt-24">
              <ScrollReveal>
                <GuideHeader
                  icon={Terminal}
                  eyebrow="Guide 01"
                  title="Set Up Your AI Agent"
                />
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <p className="text-neutral-300 leading-relaxed mb-10">
                  We&apos;ll set up Claude Code — Anthropic&apos;s agentic
                  coding tool. It runs in your terminal, reads your entire
                  codebase, and writes real code. You need Node.js 18+ and an
                  Anthropic API key.
                </p>
              </ScrollReveal>

              <div className="space-y-4 mb-10">
                <ScrollReveal delay={120}>
                  <StepBlock
                    label="Step 1 — Install Node.js if you don't have it"
                    command="brew install node"
                    note="On macOS with Homebrew. For other systems, visit nodejs.org."
                  />
                </ScrollReveal>
                <ScrollReveal delay={160}>
                  <StepBlock
                    label="Step 2 — Install Claude Code globally"
                    command="npm install -g @anthropic-ai/claude-code"
                  />
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <StepBlock
                    label="Step 3 — Set your API key"
                    command="export ANTHROPIC_API_KEY=sk-ant-your-key-here"
                    note="Get your key from console.anthropic.com. Add this to your shell profile (~/.zshrc or ~/.bashrc) to persist it."
                  />
                </ScrollReveal>
                <ScrollReveal delay={240}>
                  <StepBlock
                    label="Step 4 — Run it in a project"
                    command="cd your-project && claude"
                    note="That's it. The agent starts, reads your project, and waits for instructions."
                  />
                </ScrollReveal>
                <ScrollReveal delay={280}>
                  <StepBlock
                    label="Step 5 — Give it a task"
                    command={`"Read the README and summarize what this project does"`}
                    note='Start simple. As you build trust, give it bigger tasks: "Add a dark mode toggle", "Write tests for the auth module", "Refactor this component to use hooks".'
                  />
                </ScrollReveal>
              </div>

              <ScrollReveal delay={320}>
                <Callout>
                  The agent learns your codebase as it works. It reads files,
                  checks types, runs tests. It&apos;s not generating code in a
                  vacuum — it&apos;s working inside your project.
                </Callout>
              </ScrollReveal>
            </section>

            {/* ---- divider 1 ---- */}
            <ScrollReveal className="my-24">
              <SectionDivider variant="metatron" />
            </ScrollReveal>

            {/* ---------- Guide 2: Install Skills ---------- */}
            <section id="install-skills" className="scroll-mt-24">
              <ScrollReveal>
                <GuideHeader
                  icon={Plug}
                  eyebrow="Guide 02"
                  title="Install & Use Skills"
                />
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <p className="text-neutral-300 leading-relaxed mb-10">
                  Skills give your agent specialized capabilities. A skill for
                  deployment knows the exact steps. A skill for testing knows the
                  framework conventions. Skills are loaded on demand — they
                  don&apos;t bloat your agent when unused.
                </p>
              </ScrollReveal>

              <div className="space-y-4 mb-10">
                <ScrollReveal delay={120}>
                  <InfoBlock title="Step 1 — Understand where skills live">
                    <div className="text-sm font-mono space-y-2">
                      <p className="text-neutral-400">
                        <span className="text-[#D4A853]/80">
                          ~/.claude/skills/
                        </span>{" "}
                        — Global skills, available in every project
                      </p>
                      <p className="text-neutral-400">
                        <span className="text-[#D4A853]/80">
                          .claude/skills/
                        </span>{" "}
                        — Project-local skills, scoped to this repo
                      </p>
                    </div>
                  </InfoBlock>
                </ScrollReveal>

                <ScrollReveal delay={160}>
                  <div className="border border-[#1E1E1E] rounded-xl bg-[#111111] overflow-hidden hover:border-[#D4A853]/15 transition-premium group">
                    <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        Step 2 — Create a skill file
                      </span>
                      <Copy
                        size={14}
                        className="text-neutral-700 group-hover:text-neutral-500 transition-premium"
                      />
                    </div>
                    <div className="p-5 font-mono text-sm">
                      <p className="text-neutral-600 mb-3">
                        # ~/.claude/skills/deploy.md
                      </p>
                      <p className="text-[#D4A853]/70">---</p>
                      <p className="text-neutral-300">
                        name: deploy-to-vercel
                      </p>
                      <p className="text-neutral-300">
                        description: Deploy the current project to Vercel
                      </p>
                      <p className="text-[#D4A853]/70">---</p>
                      <p className="text-neutral-500 mt-3">
                        When asked to deploy, run `npx vercel --prod`.
                      </p>
                      <p className="text-neutral-500">
                        Confirm the deployment URL with the user.
                      </p>
                      <p className="text-neutral-500">
                        If it fails, check for build errors first.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <StepBlock
                    label="Step 3 — Use the skill"
                    command="/deploy"
                    note='Type the slash command in Claude Code. The agent loads the skill and follows its instructions. You can also just say "deploy this project" and the skill activates by matching the trigger.'
                  />
                </ScrollReveal>

                <ScrollReveal delay={240}>
                  <InfoBlock title="Step 4 — Install community skills">
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Community skills are markdown files you download and drop
                      into your skills directory. Browse curated collections,
                      copy the file, and the capability is available immediately.
                    </p>
                  </InfoBlock>
                </ScrollReveal>
              </div>

              <ScrollReveal delay={280}>
                <Callout>
                  Good skills are specific and opinionated. &quot;Deploy to
                  Vercel&quot; is better than &quot;deploy anywhere&quot;. The
                  specificity is what makes the agent reliable.
                </Callout>
              </ScrollReveal>
            </section>

            {/* ---- divider 2 ---- */}
            <ScrollReveal className="my-24">
              <SectionDivider variant="wave" />
            </ScrollReveal>

            {/* ---------- Guide 3: Connect MCP ---------- */}
            <section id="connect-mcp" className="scroll-mt-24">
              <ScrollReveal>
                <GuideHeader
                  icon={Lightning}
                  eyebrow="Guide 03"
                  title="Connect MCP Servers"
                />
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <p className="text-neutral-300 leading-relaxed mb-10">
                  MCP servers give your agent access to external tools —
                  databases, APIs, browsers, file systems. Once connected, the
                  agent can use these tools as naturally as reading a file.
                </p>
              </ScrollReveal>

              <div className="space-y-4 mb-10">
                <ScrollReveal delay={120}>
                  <StepBlock
                    label="Step 1 — Open your Claude Code settings"
                    command="claude config"
                    note="Or edit ~/.claude/settings.json directly."
                  />
                </ScrollReveal>

                <ScrollReveal delay={160}>
                  <div className="border border-[#1E1E1E] rounded-xl bg-[#111111] overflow-hidden hover:border-[#D4A853]/15 transition-premium group">
                    <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        Step 2 — Add an MCP server (example: GitHub)
                      </span>
                      <Copy
                        size={14}
                        className="text-neutral-700 group-hover:text-neutral-500 transition-premium"
                      />
                    </div>
                    <div className="p-5 font-mono text-sm overflow-x-auto">
                      <pre className="text-neutral-300 whitespace-pre-wrap">{`{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}`}</pre>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <InfoBlock title="Step 3 — Restart Claude Code">
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Exit and re-launch Claude Code. It discovers MCP servers on
                      startup. You&apos;ll see the server&apos;s tools listed in
                      the available tools.
                    </p>
                  </InfoBlock>
                </ScrollReveal>

                <ScrollReveal delay={240}>
                  <StepBlock
                    label="Step 4 — Use the tools"
                    command={`"List my open pull requests on this repo"`}
                    note="The agent calls the GitHub MCP server's tools automatically. No special syntax needed — just describe what you want."
                  />
                </ScrollReveal>

                <ScrollReveal delay={280}>
                  <div className="border border-[#1E1E1E] rounded-xl bg-[#111111] overflow-hidden hover:border-[#D4A853]/15 transition-premium">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 5 — Add more servers
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-neutral-500 text-sm mb-4">
                        Popular MCP servers to add:
                      </p>
                      <div className="space-y-3 text-sm">
                        {[
                          {
                            name: "filesystem",
                            desc: "Read/write files outside the project",
                          },
                          {
                            name: "postgres",
                            desc: "Query and manage databases",
                          },
                          {
                            name: "supabase",
                            desc: "Full Supabase platform access",
                          },
                          {
                            name: "browserbase",
                            desc: "Cloud browser automation",
                          },
                        ].map((server) => (
                          <div
                            key={server.name}
                            className="flex items-center gap-3"
                          >
                            <CaretRight
                              size={10}
                              weight="bold"
                              className="text-[#D4A853] flex-shrink-0"
                            />
                            <p>
                              <span className="text-[#D4A853]/80 font-mono">
                                {server.name}
                              </span>
                              <span className="text-neutral-500">
                                {" "}
                                — {server.desc}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <ScrollReveal delay={320}>
                <Callout>
                  Each MCP server you add expands what your agent can do. Start
                  with one or two and add more as you need them. The
                  configuration is the same pattern every time.
                </Callout>
              </ScrollReveal>
            </section>

            {/* ---- bottom divider ---- */}
            <ScrollReveal className="mt-24">
              <SectionDivider variant="hexline" />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </>
  );
}

/* ========== SUB-COMPONENTS ========== */

function GuideHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: PhosphorIcon;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg border border-[#D4A853]/20 bg-[#D4A853]/5 flex items-center justify-center">
          <Icon size={20} weight="duotone" className="text-[#D4A853]" />
        </div>
        <span className="eyebrow text-[#D4A853]">{eyebrow}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#E8E4DD]">
        {title}
      </h2>
    </div>
  );
}

function StepBlock({
  label,
  command,
  note,
}: {
  label: string;
  command: string;
  note?: string;
}) {
  return (
    <div className="border border-[#1E1E1E] rounded-xl bg-[#111111] overflow-hidden hover:border-[#D4A853]/15 transition-premium group">
      <div className="px-5 py-3 border-b border-[#1E1E1E]">
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className="p-5">
        <code className="text-sm font-mono text-[#D4A853]/80 block">
          {command}
        </code>
        {note && (
          <p className="text-neutral-500 text-xs mt-3 leading-relaxed">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1E1E1E] rounded-xl bg-[#111111] overflow-hidden hover:border-[#D4A853]/15 transition-premium">
      <div className="px-5 py-3 border-b border-[#1E1E1E]">
        <span className="text-xs text-neutral-500">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative border-l-2 border-[#D4A853]/50 pl-6 py-1 my-10">
      <p className="text-neutral-400 italic leading-relaxed">{children}</p>
    </div>
  );
}
