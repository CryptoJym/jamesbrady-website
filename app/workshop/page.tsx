import type { Metadata } from "next";

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

      <div className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-16">
            <p className="text-[#D4A853] text-sm tracking-[0.3em] uppercase mb-4">
              The Workshop
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Build Something
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Three guides. Real commands. Working results. Start at the top and
              work down, or jump to what you need.
            </p>
            <div className="w-16 h-px bg-[#D4A853] mt-8" />
          </header>

          <div className="space-y-24">
            {/* Guide 1: Set Up Your AI Agent */}
            <section id="agent-setup">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[#D4A853] font-mono text-sm">01</span>
                <h2 className="text-2xl font-semibold">
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

                <div className="space-y-4">
                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 1 — Install Node.js if you don&apos;t have it
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        brew install node
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        On macOS with Homebrew. For other systems, visit
                        nodejs.org.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 2 — Install Claude Code globally
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        npm install -g @anthropic-ai/claude-code
                      </code>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 3 — Set your API key
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        export ANTHROPIC_API_KEY=sk-ant-your-key-here
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        Get your key from console.anthropic.com. Add this to
                        your shell profile (~/.zshrc or ~/.bashrc) to persist it.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 4 — Run it in a project
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        cd your-project && claude
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        That&apos;s it. The agent starts, reads your project,
                        and waits for instructions.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 5 — Give it a task
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        &quot;Read the README and summarize what this project
                        does&quot;
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        Start simple. As you build trust, give it bigger tasks:
                        &quot;Add a dark mode toggle&quot;, &quot;Write tests for
                        the auth module&quot;, &quot;Refactor this component to
                        use hooks&quot;.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-2 border-[#D4A853]/40 pl-6 text-neutral-400 italic">
                  The agent learns your codebase as it works. It reads files,
                  checks types, runs tests. It&apos;s not generating code in a
                  vacuum — it&apos;s working inside your project.
                </div>
              </div>
            </section>

            {/* Guide 2: Install Skills */}
            <section id="install-skills">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[#D4A853] font-mono text-sm">02</span>
                <h2 className="text-2xl font-semibold">
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

                <div className="space-y-4">
                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 1 — Understand where skills live
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-mono space-y-1">
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

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 2 — Create a skill file
                    </div>
                    <div className="p-4 font-mono text-sm">
                      <p className="text-neutral-500 mb-2">
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
                      <p className="text-neutral-400 mt-2">
                        When asked to deploy, run `npx vercel --prod`.
                      </p>
                      <p className="text-neutral-400">
                        Confirm the deployment URL with the user.
                      </p>
                      <p className="text-neutral-400">
                        If it fails, check for build errors first.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 3 — Use the skill
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        /deploy
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        Type the slash command in Claude Code. The agent loads
                        the skill and follows its instructions. You can also just
                        say &quot;deploy this project&quot; and the skill
                        activates by matching the trigger.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 4 — Install community skills
                    </div>
                    <div className="p-4">
                      <p className="text-neutral-400 text-sm">
                        Community skills are markdown files you download and drop
                        into your skills directory. Browse curated collections,
                        copy the file, and the capability is available
                        immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-2 border-[#D4A853]/40 pl-6 text-neutral-400 italic">
                  Good skills are specific and opinionated. &quot;Deploy to
                  Vercel&quot; is better than &quot;deploy anywhere&quot;. The
                  specificity is what makes the agent reliable.
                </div>
              </div>
            </section>

            {/* Guide 3: Connect MCP Servers */}
            <section id="connect-mcp">
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-[#D4A853] font-mono text-sm">03</span>
                <h2 className="text-2xl font-semibold">
                  Connect MCP Servers
                </h2>
              </div>

              <div className="space-y-6 text-neutral-300 leading-relaxed">
                <p>
                  MCP servers give your agent access to external tools — databases,
                  APIs, browsers, file systems. Once connected, the agent can use
                  these tools as naturally as reading a file.
                </p>

                <div className="space-y-4">
                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 1 — Open your Claude Code settings
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        claude config
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        Or edit ~/.claude/settings.json directly.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 2 — Add an MCP server (example: GitHub)
                    </div>
                    <div className="p-4 font-mono text-sm">
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

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 3 — Restart Claude Code
                    </div>
                    <div className="p-4">
                      <p className="text-neutral-400 text-sm">
                        Exit and re-launch Claude Code. It discovers MCP servers
                        on startup. You&apos;ll see the server&apos;s tools
                        listed in the available tools.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 4 — Use the tools
                    </div>
                    <div className="p-4">
                      <code className="text-sm font-mono text-[#D4A853]/80">
                        &quot;List my open pull requests on this repo&quot;
                      </code>
                      <p className="text-neutral-500 text-xs mt-2">
                        The agent calls the GitHub MCP server&apos;s tools
                        automatically. No special syntax needed — just describe
                        what you want.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1E1E1E] rounded-lg bg-[#141414] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#1E1E1E] text-xs text-neutral-500">
                      Step 5 — Add more servers
                    </div>
                    <div className="p-4">
                      <p className="text-neutral-400 text-sm mb-3">
                        Popular MCP servers to add:
                      </p>
                      <div className="space-y-2 text-sm font-mono">
                        <p>
                          <span className="text-[#D4A853]/80">filesystem</span>
                          <span className="text-neutral-500">
                            {" "}
                            — Read/write files outside the project
                          </span>
                        </p>
                        <p>
                          <span className="text-[#D4A853]/80">postgres</span>
                          <span className="text-neutral-500">
                            {" "}
                            — Query and manage databases
                          </span>
                        </p>
                        <p>
                          <span className="text-[#D4A853]/80">supabase</span>
                          <span className="text-neutral-500">
                            {" "}
                            — Full Supabase platform access
                          </span>
                        </p>
                        <p>
                          <span className="text-[#D4A853]/80">browserbase</span>
                          <span className="text-neutral-500">
                            {" "}
                            — Cloud browser automation
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-2 border-[#D4A853]/40 pl-6 text-neutral-400 italic">
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
