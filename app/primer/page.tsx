import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Primer",
  description:
    "How coding systems work. Code, the stack, AI agents, skills, and MCP — explained for humans.",
};

const stackLayers = [
  {
    layer: "Hardware",
    desc: "CPUs, GPUs, memory, storage. The physical machines that compute.",
  },
  {
    layer: "Operating System",
    desc: "Linux, macOS, Windows. Manages hardware and provides a stable platform.",
  },
  {
    layer: "Runtime",
    desc: "Node.js, Python, JVM. Executes your code in the OS environment.",
  },
  {
    layer: "Framework",
    desc: "Next.js, Django, Rails. Provides structure, conventions, and pre-built patterns.",
  },
  {
    layer: "Application",
    desc: "Your program. The logic, the interface, the APIs — the thing people actually use.",
  },
  {
    layer: "Infrastructure",
    desc: "AWS, Vercel, Cloudflare. Cloud services that host and scale everything.",
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

      <article className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-16">
            <p className="text-[#D4A853] text-sm tracking-[0.3em] uppercase mb-4">
              The Primer
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How Coding Systems Work
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Everything you need to understand modern software — from raw code
              to AI agents. No jargon gates. No prerequisites.
            </p>
            <div className="w-16 h-px bg-[#D4A853] mt-8" />
          </header>

          {/* Table of Contents */}
          <nav className="mb-16 p-6 border border-[#1E1E1E] rounded-lg bg-[#141414]">
            <p className="text-sm text-neutral-500 uppercase tracking-wide mb-3">
              Contents
            </p>
            <ol className="space-y-2 text-sm">
              <li>
                <a
                  href="#code"
                  className="text-neutral-300 hover:text-[#D4A853] transition-colors"
                >
                  1. What Is Code?
                </a>
              </li>
              <li>
                <a
                  href="#stack"
                  className="text-neutral-300 hover:text-[#D4A853] transition-colors"
                >
                  2. The Stack
                </a>
              </li>
              <li>
                <a
                  href="#agents"
                  className="text-neutral-300 hover:text-[#D4A853] transition-colors"
                >
                  3. AI Agents
                </a>
              </li>
              <li>
                <a
                  href="#skills"
                  className="text-neutral-300 hover:text-[#D4A853] transition-colors"
                >
                  4. Skills
                </a>
              </li>
              <li>
                <a
                  href="#mcp"
                  className="text-neutral-300 hover:text-[#D4A853] transition-colors"
                >
                  5. MCP — Model Context Protocol
                </a>
              </li>
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-16">
            {/* 1. What Is Code? */}
            <section id="code">
              <h2 className="text-2xl font-semibold mb-6">1. What Is Code?</h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
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
                <div className="border-l-2 border-[#D4A853]/40 pl-6 my-6 text-neutral-400 italic">
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
            <section id="stack">
              <h2 className="text-2xl font-semibold mb-6">2. The Stack</h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Modern software is built in layers. Developers call this
                  &ldquo;the stack&rdquo; — each layer handles a different level
                  of abstraction.
                </p>
                <div className="grid gap-3 my-6">
                  {stackLayers.map((item) => (
                    <div
                      key={item.layer}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 border border-[#1E1E1E] rounded bg-[#141414]"
                    >
                      <span className="text-[#D4A853] font-mono text-sm whitespace-nowrap sm:min-w-[140px]">
                        {item.layer}
                      </span>
                      <span className="text-neutral-400 text-sm">
                        {item.desc}
                      </span>
                    </div>
                  ))}
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
            <section id="agents">
              <h2 className="text-2xl font-semibold mb-6">3. AI Agents</h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
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
                <p>What makes agents powerful:</p>
                <ul className="list-none space-y-2 my-4">
                  {agentCapabilities.map((item) => (
                    <li key={item} className="flex gap-3 items-start">
                      <span className="text-[#D4A853] mt-1.5 text-xs">
                        &#9656;
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  The leading AI coding agents today are Claude Code (Anthropic),
                  Codex (OpenAI), Goose (Block), and Aider. They sit in your
                  terminal, understand your project&apos;s context, and write
                  real code that ships.
                </p>
                <div className="border-l-2 border-[#D4A853]/40 pl-6 my-6 text-neutral-400 italic">
                  An agent without tools is just a chatbot with ambition. The
                  tools are what make it useful.
                </div>
              </div>
            </section>

            {/* 4. Skills */}
            <section id="skills">
              <h2 className="text-2xl font-semibold mb-6">4. Skills</h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
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
                <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6 my-6 font-mono text-sm">
                  <p className="text-neutral-500 mb-2">
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
                  <p className="text-neutral-400 mt-2">
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
            <section id="mcp">
              <h2 className="text-2xl font-semibold mb-6">
                5. MCP — Model Context Protocol
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
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
                <p>The architecture is simple:</p>
                <div className="grid gap-3 my-6">
                  {mcpConcepts.map((item) => (
                    <div
                      key={item.term}
                      className="p-4 border border-[#1E1E1E] rounded bg-[#141414]"
                    >
                      <p className="text-[#D4A853] font-mono text-sm mb-1">
                        {item.term}
                      </p>
                      <p className="text-neutral-400 text-sm">{item.desc}</p>
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
