import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArchiveBand,
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { learn } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";

/**
 * THE WORKSHOP — reskinned in place, wave 4.
 *
 * SAME URL, three guides, every step and every command carried across
 * verbatim. A command is the thing itself, so nothing in a .cmd block was
 * touched: a reader copies it and it has to work.
 *
 * STEP NUMBERS ARE COUNTERS NOW. The old page typed "Step 1 —", "Step 2 —"
 * into each label, which is a numeral with nothing behind it and goes wrong
 * the first time a step is inserted. The numbers now come from the CSS counter
 * on .steps, so the list numbers itself.
 *
 * The embedded walkthrough in guide 2 is the same recording /watch serves.
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

function Cmd({ children }: { children: string }) {
  return (
    <figure className="cmd">
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

function Step({
  label,
  command,
  note,
  children,
}: {
  label: string;
  command?: string;
  note?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="step">
      <p className="step__label">{label}</p>
      {command ? <Cmd>{command}</Cmd> : null}
      {children}
      {note ? <p className="step__detail">{note}</p> : null}
    </li>
  );
}

export default function WorkshopPage() {
  return (
    <main id="main" tabIndex={-1}>
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

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>The Workshop</span>
            <i aria-hidden="true">/</i>
            <span>Archived</span>
          </p>
          <h1>Build something.</h1>
          <p className="page-lead">{CAPSULE}</p>
        </div>
      </div>

      <ArchiveBand date={VOLUME.archivedDate}>
        This volume is kept for reference and is no longer maintained. Commands
        and package names were correct when it was written and have not been
        rechecked since, so run each one against the current documentation before
        you trust it. It stays at its original URL. The three volumes are
        introduced together on <Link href="/learn">the learn hub</Link>.
      </ArchiveBand>

      <section className="work work--bare">
        <div className="wrap">
          <SectionHead
            eyebrow="Contents"
            heading="Three guides. Real commands. Working results."
            aside="Start at the top and work down, or jump to what you need. Each guide is written to be followed once, start to finish, rather than skimmed."
          />
          <ul className="linklist">
            {GUIDES.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>
                  <span className="linklist__label">
                    {g.num}
                    <span className="arw" aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className="linklist__note">{g.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ──────────────────────────────────────── guide 01: agent setup */}
      <section className="work" id="agent-setup">
        <div className="wrap">
          <SectionHead
            num="01"
            eyebrow="Guide"
            heading="Set up your AI agent."
          />
          <div className="prose">
            <p>
              We&rsquo;ll set up Claude Code &mdash; Anthropic&rsquo;s agentic
              coding tool. It runs in your terminal, reads your entire codebase,
              and writes real code. You need Node.js 18+ and an Anthropic API
              key.
            </p>
          </div>
          <ol className="steps prose--after">
            <Step
              label="Install Node.js if you do not have it"
              command="brew install node"
              note="On macOS with Homebrew. For other systems, visit nodejs.org."
            />
            <Step
              label="Install Claude Code globally"
              command="npm install -g @anthropic-ai/claude-code"
            />
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
          </ol>
          <div className="prose prose--after">
            <blockquote>
              <p>
                The agent learns your codebase as it works. It reads files,
                checks types, runs tests. It&rsquo;s not generating code in a
                vacuum &mdash; it&rsquo;s working inside your project.
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────── guide 02: install skills */}
      <section className="work" id="install-skills">
        <div className="wrap">
          <SectionHead
            num="02"
            eyebrow="Guide"
            heading="Install and use skills."
          />
          <div className="prose">
            <p>
              Skills give your agent specialized capabilities. A skill for
              deployment knows the exact steps. A skill for testing knows the
              framework conventions. Skills are loaded on demand &mdash; they
              don&rsquo;t bloat your agent when unused.
            </p>
          </div>

          <figure className="vid">
            {/* No <track>: no caption file exists for this recording. /watch
                states that plainly for all of them. */}
            <video
              controls
              preload="metadata"
              playsInline
              poster="/video-posters/install-first-skill.png"
            >
              <source src="/videos/james-install-first-skill.mp4" type="video/mp4" />
            </video>
            <figcaption className="vid__row">
              <span>Walkthrough · install your first skill</span>
              <Link href="/watch">
                All recordings
                <span className="arw" aria-hidden="true">
                  →
                </span>
              </Link>
            </figcaption>
          </figure>

          <ol className="steps prose--after">
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
          </ol>
          <div className="prose prose--after">
            <blockquote>
              <p>
                Good skills are specific and opinionated. &ldquo;Deploy to
                Vercel&rdquo; is better than &ldquo;deploy anywhere&rdquo;. The
                specificity is what makes the agent reliable.
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────── guide 03: connect mcp */}
      <section className="work" id="connect-mcp">
        <div className="wrap">
          <SectionHead num="03" eyebrow="Guide" heading="Connect MCP servers." />
          <div className="prose">
            <p>
              MCP servers give your agent access to external tools &mdash;
              databases, APIs, browsers, file systems. Once connected, the agent
              can use these tools as naturally as reading a file.
            </p>
          </div>
          <ol className="steps prose--after">
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
              <ul className="defs defs--after">
                {[
                  {
                    name: "filesystem",
                    desc: "Read and write files outside the project",
                  },
                  { name: "postgres", desc: "Query and manage databases" },
                  { name: "supabase", desc: "Full Supabase platform access" },
                  { name: "browserbase", desc: "Cloud browser automation" },
                ].map((s) => (
                  <li key={s.name}>
                    <p className="defs__label">{s.name}</p>
                    <p className="defs__detail">{s.desc}</p>
                  </li>
                ))}
              </ul>
            </Step>
          </ol>
          <div className="prose prose--after">
            <blockquote>
              <p>
                Each MCP server you add expands what your agent can do. Start
                with one or two and add more as you need them. The configuration
                is the same pattern every time.
              </p>
            </blockquote>
          </div>
          <PageNameplate
            source="content/learn/index.ts — the same entry the learn hub reads"
            method="Archive date read from the volume entry; step numbers come from a CSS counter, never typed"
          />
        </div>
      </section>
    </main>
  );
}
