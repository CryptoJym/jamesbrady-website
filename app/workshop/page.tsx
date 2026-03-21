import type { Metadata } from "next";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "The Workshop",
  description:
    "Three practical guides. Set up an AI agent, install skills, connect MCP servers.",
};

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

      <div className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Header — asymmetric editorial */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 animate-fade-up">
            <div className="md:col-span-7">
              <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853] inline-block mb-8">
                The Workshop
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6">
                Build
                <br />
                Something
              </h1>
              <div className="w-20 h-px bg-[#D4A853] animate-gold-line" />
            </div>
            <div className="md:col-span-4 md:col-start-9 flex items-end">
              <p className="text-neutral-400 text-base leading-relaxed">
                Three guides. Real commands. Working results. Start at the top and
                work down, or jump to what you need.
              </p>
            </div>
          </header>

          {/* Quick nav */}
          <nav className="mb-24 animate-fade-up stagger-2">
            <div className="flex flex-wrap gap-3">
              {[
                { id: "agent-setup", label: "Agent Setup", num: "01" },
                { id: "install-skills", label: "Install Skills", num: "02" },
                { id: "connect-mcp", label: "Connect MCP", num: "03" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#1E1E1E] hover:border-[#D4A853]/30 transition-all duration-500 ease-out-expo"
                >
                  <span className="font-mono text-xs text-neutral-600 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo">
                    {item.num}
                  </span>
                  <span className="text-sm text-neutral-400 group-hover:text-[#E8E4DD] transition-colors duration-500 ease-out-expo">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </nav>

          <div className="max-w-3xl space-y-32">
            {/* Guide 1: Set Up Your AI Agent */}
            <section id="agent-setup" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-10">
                <span className="font-mono text-xs text-[#D4A853]">01</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Set Up Your AI Agent
                </h2>
              </div>

              <div className="space-y-6 text-neutral-300 leading-relaxed">
                <p>
                  We&apos;ll set up Claude Code — Anthropic&apos;s agentic
                  coding tool. It runs in your terminal, reads your entire
                  codebase, and writes real code. You need Node.js 18+ and an
                  Anthropic API key.
                </p>

                <div className="space-y-4 my-10">
                  <StepBlock
                    label="Step 1 — Install Node.js if you don't have it"
                    command="brew install node"
                    note="On macOS with Homebrew. For other systems, visit nodejs.org."
                  />
                  <StepBlock
                    label="Step 2 — Install Claude Code globally"
                    command="npm install -g @anthropic-ai/claude-code"
                  />
                  <StepBlock
                    label="Step 3 — Set your API key"
                    command="export ANTHROPIC_API_KEY=sk-ant-your-key-here"
                    note="Get your key from console.anthropic.com. Add this to your shell profile (~/.zshrc or ~/.bashrc) to persist it."
                  />
                  <StepBlock
                    label="Step 4 — Run it in a project"
                    command="cd your-project && claude"
                    note="That's it. The agent starts, reads your project, and waits for instructions."
                  />
                  <StepBlock
                    label="Step 5 — Give it a task"
                    command={`"Read the README and summarize what this project does"`}
                    note={`Start simple. As you build trust, give it bigger tasks: "Add a dark mode toggle", "Write tests for the auth module", "Refactor this component to use hooks".`}
                  />
                </div>

                <div className="border-l-2 border-[#D4A853] pl-6 my-10 text-neutral-400 italic">
                  The agent learns your codebase as it works. It reads files,
                  checks types, runs tests. It&apos;s not generating code in a
                  vacuum — it&apos;s working inside your project.
                </div>
              </div>
            </section>

            {/* Guide 2: Install Skills */}
            <section id="install-skills" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-10">
                <span className="font-mono text-xs text-[#D4A853]">02</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Install &amp; Use Skills
                </h2>
              </div>

              <div className="space-y-6 text-neutral-300 leading-relaxed">
                <p>
                  Skills give your agent specialized capabilities. A skill for
                  deployment knows the exact steps. A skill for testing knows the
                  framework conventions. Skills are loaded on demand — they
                  don&apos;t bloat your agent when unused.
                </p>

                <div className="space-y-4 my-10">
                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 1 — Understand where skills live
                      </span>
                    </div>
                    <div className="p-5">
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
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 2 — Create a skill file
                      </span>
                    </div>
                    <div className="p-5 font-mono text-sm">
                      <p className="text-neutral-600 mb-3">
                        # ~/.claude/skills/deploy.md
                      </p>
                      <p className="text-[#D4A853]">---</p>
                      <p className="text-neutral-300">
                        name: deploy-to-vercel
                      </p>
                      <p className="text-neutral-300">
                        description: Deploy the current project to Vercel
                      </p>
                      <p className="text-[#D4A853]">---</p>
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

                  <StepBlock
                    label="Step 3 — Use the skill"
                    command="/deploy"
                    note={`Type the slash command in Claude Code. The agent loads the skill and follows its instructions. You can also just say "deploy this project" and the skill activates by matching the trigger.`}
                  />

                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 4 — Install community skills
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        Community skills are markdown files you download and drop
                        into your skills directory. Browse curated collections,
                        copy the file, and the capability is available
                        immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-2 border-[#D4A853] pl-6 my-10 text-neutral-400 italic">
                  Good skills are specific and opinionated. &quot;Deploy to
                  Vercel&quot; is better than &quot;deploy anywhere&quot;. The
                  specificity is what makes the agent reliable.
                </div>
              </div>
            </section>

            {/* Guide 3: Connect MCP Servers */}
            <section id="connect-mcp" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-10">
                <span className="font-mono text-xs text-[#D4A853]">03</span>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Connect MCP Servers
                </h2>
              </div>

              <div className="space-y-6 text-neutral-300 leading-relaxed">
                <p>
                  MCP servers give your agent access to external tools — databases,
                  APIs, browsers, file systems. Once connected, the agent can use
                  these tools as naturally as reading a file.
                </p>

                <div className="space-y-4 my-10">
                  <StepBlock
                    label="Step 1 — Open your Claude Code settings"
                    command="claude config"
                    note="Or edit ~/.claude/settings.json directly."
                  />

                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 2 — Add an MCP server (example: GitHub)
                      </span>
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

                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1E1E1E]">
                      <span className="text-xs text-neutral-500">
                        Step 3 — Restart Claude Code
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        Exit and re-launch Claude Code. It discovers MCP servers
                        on startup. You&apos;ll see the server&apos;s tools
                        listed in the available tools.
                      </p>
                    </div>
                  </div>

                  <StepBlock
                    label="Step 4 — Use the tools"
                    command={`"List my open pull requests on this repo"`}
                    note="The agent calls the GitHub MCP server's tools automatically. No special syntax needed — just describe what you want."
                  />

                  <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden">
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
                          <div key={server.name} className="flex items-baseline gap-3">
                            <CaretRight
                              size={10}
                              weight="bold"
                              className="text-[#D4A853] flex-shrink-0 mt-1"
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
                </div>

                <div className="border-l-2 border-[#D4A853] pl-6 my-10 text-neutral-400 italic">
                  Each MCP server you add expands what your agent can do. Start
                  with one or two and add more as you need them. The
                  configuration is the same pattern every time.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
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
    <div className="border border-[#1E1E1E] rounded-xl bg-[#141414] overflow-hidden hover:border-[#D4A853]/15 transition-all duration-500 ease-out-expo">
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
