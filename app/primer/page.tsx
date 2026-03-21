import type { Metadata } from "next";
import {
  CaretRight,
  Cpu,
  DesktopTower,
  Terminal,
  Stack,
  Cube,
  Cloud,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "The Primer",
  description:
    "How coding systems work. Code, the stack, AI agents, skills, and MCP — explained for humans.",
};

const stackLayers = [
  {
    layer: "Hardware",
    desc: "CPUs, GPUs, memory, storage. The physical machines that compute.",
    icon: Cpu,
  },
  {
    layer: "Operating System",
    desc: "Linux, macOS, Windows. Manages hardware and provides a stable platform.",
    icon: DesktopTower,
  },
  {
    layer: "Runtime",
    desc: "Node.js, Python, JVM. Executes your code in the OS environment.",
    icon: Terminal,
  },
  {
    layer: "Framework",
    desc: "Next.js, Django, Rails. Provides structure, conventions, and pre-built patterns.",
    icon: Stack,
  },
  {
    layer: "Application",
    desc: "Your program. The logic, the interface, the APIs — the thing people actually use.",
    icon: Cube,
  },
  {
    layer: "Infrastructure",
    desc: "AWS, Vercel, Cloudflare. Cloud services that host and scale everything.",
    icon: Cloud,
  },
];

const agentCapabilities = [
  "Read and write files on your machine",
  "Execute shell commands and scripts",
  "Search and navigate codebases",
  "Make API calls to external services",
  "Plan multi-step tasks and track progress",
  "Self-correct when something goes wrong",
];

const mcpConcepts = [
  {
    term: "MCP Server",
    desc: "Exposes capabilities — database queries, API calls, file operations, browser automation. Runs as a process your agent communicates with.",
  },
  {
    term: "MCP Client",
    desc: "The agent (like Claude Code) that discovers and uses server capabilities through the protocol.",
  },
  {
    term: "Transport",
    desc: "The communication layer — typically stdio (local processes) or HTTP with server-sent events.",
  },
];

const tocItems = [
  { id: "code", label: "What Is Code?", num: "01" },
  { id: "stack", label: "The Stack", num: "02" },
  { id: "agents", label: "AI Agents", num: "03" },
  { id: "skills", label: "Skills", num: "04" },
  { id: "mcp", label: "MCP — Model Context Protocol", num: "05" },
];

export default function PrimerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "The Primer — How Coding Systems Work",
            description:
              "Code, the stack, AI agents, skills, and MCP — explained for humans.",
            author: { "@type": "Person", name: "James Brady" },
            publisher: { "@type": "Person", name: "James Brady" },
            url: "https://jamesbrady.org/primer",
          }),
        }}
      />

      <article className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Header — asymmetric editorial */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 animate-fade-up">
            <div className="md:col-span-7">
              <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853] inline-block mb-8">
                The Primer
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6">
                How Coding
                <br />
                Systems Work
              </h1>
              <div className="w-20 h-px bg-[#D4A853] animate-gold-line" />
            </div>
            <div className="md:col-span-4 md:col-start-9 flex items-end">
              <p className="text-neutral-400 text-base leading-relaxed">
                Everything you need to understand modern software — from raw code
                to AI agents. No jargon gates. No prerequisites.
              </p>
            </div>
          </header>

          {/* Table of Contents */}
          <nav className="mb-24 animate-fade-up stagger-2">
            <div className="border border-[#1E1E1E] rounded-2xl bg-[#141414] p-8 md:p-10 max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium mb-6">
                Contents
              </p>
              <div className="space-y-0 divide-y divide-[#1E1E1E]">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0 transition-all duration-500 ease-out-expo"
                  >
                    <span className="font-mono text-xs text-neutral-600 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo w-6">
                      {item.num}
                    </span>
                    <span className="text-sm text-neutral-300 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo">
                      {item.label}
                    </span>
                    <CaretRight
                      size={12}
                      weight="bold"
                      className="ml-auto text-neutral-700 group-hover:text-[#D4A853] group-hover:translate-x-0.5 transition-all duration-500 ease-out-expo"
                    />
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Sections — editorial article layout */}
          <div className="max-w-3xl space-y-32">
            {/* 1. What Is Code? */}
            <section id="code" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-xs text-[#D4A853]">01</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  What Is Code?
                </h2>
              </div>
              <div className="space-y-5 text-neutral-300 leading-relaxed">
                <p>
                  Code is a set of precise instructions that tells a computer
                  what to do. Every app you use, every website you visit, every
                  AI you talk to — it&apos;s all code running on hardware
                  somewhere.
                </p>
                <p>
                  At its core, code is just text. Files full of structured text
                  that follow rules strict enough for a machine to interpret.
                  Programming languages like Python, JavaScript, TypeScript,
                  Rust, and Go give humans a way to write those instructions in
                  something readable.
                </p>
                <p>
                  The computer itself only understands binary — electrical
                  signals that are on or off, 1 or 0. Your human-readable code
                  gets translated (compiled or interpreted) down to machine
                  instructions. The programming language is the bridge between
                  your intent and the machine&apos;s execution.
                </p>
                <div className="border-l-2 border-[#D4A853] pl-6 my-10 text-neutral-400 italic">
                  Think of code like a recipe. The programming language is the
                  language the recipe is written in. The computer is the kitchen.
                  The runtime is the cook.
                </div>
                <p>
                  You don&apos;t need to understand binary to write code, just
                  like you don&apos;t need to understand combustion to drive a
                  car. Each layer of abstraction lets you work at a higher level
                  without worrying about what&apos;s underneath.
                </p>
              </div>
            </section>

            {/* 2. The Stack */}
            <section id="stack" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-xs text-[#D4A853]">02</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  The Stack
                </h2>
              </div>
              <div className="space-y-5 text-neutral-300 leading-relaxed">
                <p>
                  Modern software is built in layers. Developers call this
                  &ldquo;the stack&rdquo; — each layer handles a different level
                  of abstraction.
                </p>
                <div className="grid gap-3 my-10">
                  {stackLayers.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.layer}
                        className="group flex items-start gap-4 p-4 border border-[#1E1E1E] rounded-xl bg-[#141414] hover:border-[#D4A853]/20 transition-all duration-500 ease-out-expo"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D4A853]/8 flex items-center justify-center mt-0.5">
                          <Icon
                            size={16}
                            weight="light"
                            className="text-[#D4A853]/60 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[#E8E4DD] font-medium text-sm block mb-1">
                            {item.layer}
                          </span>
                          <span className="text-neutral-500 text-sm leading-relaxed">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p>
                  Each layer abstracts away the complexity below it. A web
                  developer using Next.js doesn&apos;t think about CPU
                  registers. A DevOps engineer managing cloud infrastructure
                  doesn&apos;t think about React components. Specialization
                  happens at each layer.
                </p>
                <p>
                  When someone says &ldquo;full-stack developer,&rdquo; they
                  mean someone who works across multiple layers — typically the
                  framework, application, and some infrastructure. Nobody works
                  all layers. The stack is too deep.
                </p>
              </div>
            </section>

            {/* 3. AI Agents */}
            <section id="agents" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-xs text-[#D4A853]">03</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  AI Agents
                </h2>
              </div>
              <div className="space-y-5 text-neutral-300 leading-relaxed">
                <p>
                  An AI agent is a program that uses a large language model (LLM)
                  to reason, plan, and take actions. It&apos;s the difference
                  between asking someone a question and hiring someone to do a
                  job.
                </p>
                <p>
                  A chatbot responds to prompts. An agent interprets your intent,
                  breaks it into steps, uses tools, handles errors, and delivers
                  results. It operates in a loop: observe the situation, decide
                  what to do, take an action, evaluate the result, repeat.
                </p>
                <p className="text-[#E8E4DD] font-medium">
                  What makes agents powerful:
                </p>
                <ul className="list-none space-y-3 my-6">
                  {agentCapabilities.map((item) => (
                    <li key={item} className="flex gap-3 items-start">
                      <CaretRight
                        size={14}
                        weight="bold"
                        className="text-[#D4A853] mt-1 flex-shrink-0"
                      />
                      <span className="text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  The leading AI coding agents today are Claude Code (Anthropic),
                  Codex (OpenAI), Goose (Block), and Aider. They sit in your
                  terminal, understand your project&apos;s context, and write
                  real code that ships.
                </p>
                <div className="border-l-2 border-[#D4A853] pl-6 my-10 text-neutral-400 italic">
                  An agent without tools is just a chatbot with ambition. The
                  tools are what make it useful.
                </div>
              </div>
            </section>

            {/* 4. Skills */}
            <section id="skills" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-xs text-[#D4A853]">04</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Skills
                </h2>
              </div>
              <div className="space-y-5 text-neutral-300 leading-relaxed">
                <p>
                  Skills are packaged capabilities that extend what an agent can
                  do. Instead of one agent knowing everything about everything,
                  skills give it specialized knowledge and workflows on demand.
                </p>
                <p>
                  A skill might teach an agent how to deploy to Vercel, write
                  Playwright tests, optimize images for SEO, generate PDF
                  reports, or set up a CI pipeline. When you need that
                  capability, the skill loads. When you don&apos;t, it stays out
                  of the way.
                </p>
                <p>
                  Most skills are structured text files — markdown with
                  frontmatter that defines when the skill should activate, what
                  it does, and how it should behave. They&apos;re lightweight,
                  composable, and shareable.
                </p>
                <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] p-6 md:p-8 my-10 font-mono text-sm overflow-x-auto">
                  <p className="text-neutral-600 mb-3">
                    # Example skill structure
                  </p>
                  <p className="text-[#D4A853]">---</p>
                  <p>
                    <span className="text-neutral-500">name:</span>{" "}
                    <span className="text-neutral-300">deploy-vercel</span>
                  </p>
                  <p>
                    <span className="text-neutral-500">description:</span>{" "}
                    <span className="text-neutral-300">Deploy to Vercel</span>
                  </p>
                  <p>
                    <span className="text-neutral-500">trigger:</span>{" "}
                    <span className="text-neutral-300">
                      &quot;deploy&quot;, &quot;ship it&quot;
                    </span>
                  </p>
                  <p className="text-[#D4A853]">---</p>
                  <p className="text-neutral-500 mt-3">
                    Instructions for the agent...
                  </p>
                </div>
                <p>
                  The skill ecosystem is growing fast. There are skills for SEO
                  auditing, database migrations, code review, documentation
                  generation, and hundreds more. You can install community skills
                  or write your own.
                </p>
              </div>
            </section>

            {/* 5. MCP */}
            <section id="mcp" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-xs text-[#D4A853]">05</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  MCP — Model Context Protocol
                </h2>
              </div>
              <div className="space-y-5 text-neutral-300 leading-relaxed">
                <p>
                  MCP is a standard protocol that connects AI agents to external
                  tools and data sources. Think of it as USB for AI — a
                  universal interface that lets any compatible agent talk to any
                  compatible tool.
                </p>
                <p>
                  Before MCP, every integration was custom. Want your agent to
                  access your database? Write a custom integration. GitHub?
                  Another one. Notion? Another. MCP standardizes all of this
                  into one protocol.
                </p>
                <p className="text-[#E8E4DD] font-medium">
                  The architecture is simple:
                </p>
                <div className="grid gap-4 my-10">
                  {mcpConcepts.map((item) => (
                    <div
                      key={item.term}
                      className="p-5 border border-[#1E1E1E] rounded-xl bg-[#141414] hover:border-[#D4A853]/20 transition-all duration-500 ease-out-expo"
                    >
                      <p className="text-[#D4A853] font-mono text-sm mb-2 font-medium">
                        {item.term}
                      </p>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  With MCP, an agent can connect to your Supabase database, your
                  GitHub repositories, your Notion workspace, your email, your
                  Figma files — all through standardized, interchangeable
                  connectors. Add a server, restart the agent, and the new tools
                  are available immediately.
                </p>
                <p>
                  MCP is open source and maintained by Anthropic. The ecosystem
                  includes official reference servers and hundreds of
                  community-built servers covering everything from Postgres to
                  Slack to Kubernetes.
                </p>
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
