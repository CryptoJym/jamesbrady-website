import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveNotice, JsonLd, Provenance } from "@/components/fg/Reading";
import { Cmd, Contents, Defs, Step, Steps, VolumeSection } from "@/components/fg/Volume";
import { learn } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";

/**
 * THE WORKSHOP — archived, and re-skinned in place in the Fulgurite system.
 *
 * SAME URL, three guides, every step and every command carried across verbatim. A command is the thing itself, so
 * nothing in a command block was touched: a reader copies it and it has to work. Step numbers come from a CSS counter,
 * so the list numbers itself.
 *
 */

const VOLUME = learn.find((v) => v.slug === "workshop")!;
const CAPSULE = buildRoutes().find((r) => r.path === "/workshop")!.capsule;

export const metadata: Metadata = pageMetadata({
  path: "/workshop",
  title: "The Workshop",
  description:
    "Three practical guides: set up an AI agent, install and use skills, connect MCP servers. Real commands, working results. Archived, kept at its original URL.",
  og: {
    image: "/og/workshop.png",
    imageAlt: "James Brady — The Workshop, archived",
  },
});

const GUIDES = [
  { id: "agent-setup", num: "01", label: "Set up your AI agent" },
  { id: "install-skills", num: "02", label: "Install and use skills" },
  { id: "connect-mcp", num: "03", label: "Connect MCP servers" },
];

export default function WorkshopPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page fga-volume">
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/workshop",
            name: "The Workshop",
            description: CAPSULE,
            items: GUIDES.map((g) => ({
              path: `/workshop#${g.id}`,
              name: g.label,
            })),
          }),
        )}
      />

      <header className="fg-page__head">
        <p className="fg-eyebrow">The Workshop · Archived</p>
        <h1 className="fg-h1">Build something.</h1>
        <p className="fg-p">{CAPSULE}</p>
      </header>

      <ArchiveNotice date={VOLUME.archivedDate}>
        This volume is kept for reference and is no longer maintained. Commands and package names were correct when it
        was written and have not been rechecked since, so run each one against the current documentation before you
        trust it. It stays at its original URL. The three volumes are introduced together on{" "}
        <Link href="/learn">the learn hub</Link>.
      </ArchiveNotice>

      <Contents
        title="Three guides. Real commands. Working results."
        aside="Start at the top and work down, or jump to what you need. Each guide is written to be followed once, start to finish, rather than skimmed."
        items={GUIDES}
      />

      <VolumeSection id="agent-setup" num="01" eyebrow="Guide" heading="Set up your AI agent.">
        <div className="fga-prose">
          <p>
            We&rsquo;ll set up Claude Code &mdash; Anthropic&rsquo;s agentic coding tool. It runs in your terminal, reads
            your entire codebase, and writes real code. You need Node.js 18+ and an Anthropic API key.
          </p>
        </div>
        <Steps>
          <Step
            label="Install Node.js if you do not have it"
            command="brew install node"
            note="On macOS with Homebrew. For other systems, visit nodejs.org."
          />
          <Step label="Install Claude Code globally" command="npm install -g @anthropic-ai/claude-code" />
          <Step
            label="Set your API key"
            command="export ANTHROPIC_API_KEY=sk-ant-your-key-here"
            note="Get your key from console.anthropic.com. Add this to your shell profile (~/.zshrc or ~/.bashrc) to persist it."
          />
          <Step
            label="Run it in a project"
            command="cd your-project && claude"
            note="That’s it. The agent starts, reads your project, and waits for instructions."
          />
          <Step
            label="Give it a task"
            command={`"Read the README and summarize what this project does"`}
            note="Start simple. As you build trust, give it bigger tasks: “Add a dark mode toggle”, “Write tests for the auth module”, “Refactor this component to use hooks”."
          />
        </Steps>
        <div className="fga-prose fga-after">
          <blockquote>
            <p>
              The agent learns your codebase as it works. It reads files, checks types, runs tests. It&rsquo;s not
              generating code in a vacuum &mdash; it&rsquo;s working inside your project.
            </p>
          </blockquote>
        </div>
      </VolumeSection>

      <VolumeSection id="install-skills" num="02" eyebrow="Guide" heading="Install and use skills.">
        <div className="fga-prose">
          <p>
            Skills give your agent specialized capabilities. A skill for deployment knows the exact steps. A skill for
            testing knows the framework conventions. Skills are loaded on demand &mdash; they don&rsquo;t bloat your
            agent when unused.
          </p>
        </div>

        <Steps>
          <Step label="Understand where skills live">
            <Cmd>{`~/.claude/skills/    global skills, available in every project
.claude/skills/      project-local skills, scoped to this repo`}</Cmd>
          </Step>
          <Step label="Create a skill file">
            <Cmd>{`# ~/.claude/skills/deploy.md
---
name: deploy-to-vercel
description: Deploy the current project to Vercel
---
When asked to deploy, run \`npx vercel --prod\`.
Confirm the deployment URL with the user.
If it fails, check for build errors first.`}</Cmd>
          </Step>
          <Step
            label="Use the skill"
            command="/deploy"
            note="Type the slash command in Claude Code. The agent loads the skill and follows its instructions. You can also just say “deploy this project” and the skill activates by matching the trigger."
          />
          <Step
            label="Install community skills"
            note="Community skills are markdown files you download and drop into your skills directory. Browse curated collections, copy the file, and the capability is available immediately."
          />
        </Steps>
        <div className="fga-prose fga-after">
          <blockquote>
            <p>
              Good skills are specific and opinionated. &ldquo;Deploy to Vercel&rdquo; is better than &ldquo;deploy
              anywhere&rdquo;. The specificity is what makes the agent reliable.
            </p>
          </blockquote>
        </div>
      </VolumeSection>

      <VolumeSection id="connect-mcp" num="03" eyebrow="Guide" heading="Connect MCP servers.">
        <div className="fga-prose">
          <p>
            MCP servers give your agent access to external tools &mdash; databases, APIs, browsers, file systems. Once
            connected, the agent can use these tools as naturally as reading a file.
          </p>
        </div>
        <Steps>
          <Step
            label="Open your Claude Code settings"
            command="claude config"
            note="Or edit ~/.claude/settings.json directly."
          />
          <Step label="Add an MCP server (example: GitHub)">
            <Cmd>{`{
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
}`}</Cmd>
          </Step>
          <Step
            label="Restart Claude Code"
            note="Exit and re-launch Claude Code. It discovers MCP servers on startup. You’ll see the server’s tools listed in the available tools."
          />
          <Step
            label="Use the tools"
            command={`"List my open pull requests on this repo"`}
            note="The agent calls the GitHub MCP server’s tools automatically. No special syntax needed — just describe what you want."
          />
          <Step label="Add more servers">
            <Defs
              items={[
                { term: "filesystem", desc: "Read and write files outside the project" },
                { term: "postgres", desc: "Query and manage databases" },
                { term: "supabase", desc: "Full Supabase platform access" },
                { term: "browserbase", desc: "Cloud browser automation" },
              ]}
            />
          </Step>
        </Steps>
        <div className="fga-prose fga-after">
          <blockquote>
            <p>
              Each MCP server you add expands what your agent can do. Start with one or two and add more as you need
              them. The configuration is the same pattern every time.
            </p>
          </blockquote>
        </div>
      </VolumeSection>

      <Provenance
        source="content/learn/index.ts — the same entry the learn hub reads"
        method="Archive date read from the volume entry; step numbers come from a CSS counter, never typed"
      />
    </main>
  );
}
