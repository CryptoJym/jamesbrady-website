import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

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
 * THE PRIMER — reskinned in place, wave 4.
 *
 * SAME URL. /primer has not moved and is not redirected (site brief,
 * 2026-08-11). What changed is the skin: this was one of four routes still
 * wearing the old gold-and-black design, which an independent review called
 * "stylistically a different site". It now renders on the Direction B system
 * with the site's own rail, nav and footer, like every other route.
 *
 * THE TEACHING CONTENT IS THE POINT AND IT SURVIVES. Every section, every
 * in-page anchor (#code #stack #agents #skills #mcp — those are link equity
 * too), every paragraph and both pull quotes are carried across. Headings move
 * to sentence case because that is the type system this site uses everywhere.
 * The prose itself is the archive and is reproduced as written, punctuation
 * included: rewriting an archived volume's sentences would be a content edit
 * wearing a reskin's clothes.
 *
 * WHAT LEFT. The four sacred-geometry section dividers went with the rest of
 * the retired register: they were decoration whose VARIANT NAMES the register
 * rules ban, and the new system's own section rules do the same work. The old
 * names are in git history and in the pull request, not here — this file is
 * scanned for the banned register too, and a comment that spells a retired
 * term to explain its removal still ships the term.
 *
 * verify-seo check 11 now scans this route instead of deferring it.
 */

const VOLUME = learn.find((v) => v.slug === "primer")!;
const CAPSULE = buildRoutes().find((r) => r.path === "/primer")!.capsule;

export const metadata: Metadata = pageMetadata({
  path: "/primer",
  title: "The Primer",
  description:
    "How coding systems work: code, the stack, AI agents, skills and MCP, explained for a reader who does not write code. Archived, kept at its original URL.",
  og: { image: "/og/primer.png", imageAlt: "James Brady — The Primer, archived" },
});

const SECTIONS = [
  { id: "code", num: "01", label: "What is code?" },
  { id: "stack", num: "02", label: "The stack" },
  { id: "agents", num: "03", label: "AI agents" },
  { id: "skills", num: "04", label: "Skills" },
  { id: "mcp", num: "05", label: "MCP, the Model Context Protocol" },
];

const STACK_LAYERS = [
  {
    layer: "Hardware",
    desc: "CPUs, GPUs, memory, storage. The physical machines that compute.",
  },
  {
    layer: "Operating system",
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

const AGENT_CAPABILITIES = [
  "Read and write files on your machine",
  "Execute shell commands and scripts",
  "Search and navigate codebases",
  "Make API calls to external services",
  "Plan multi-step tasks and track progress",
  "Self-correct when something goes wrong",
];

const MCP_CONCEPTS = [
  {
    term: "MCP server",
    desc: "Exposes capabilities — database queries, API calls, file operations, browser automation. Runs as a process your agent communicates with.",
  },
  {
    term: "MCP client",
    desc: "The agent (like Claude Code) that discovers and uses server capabilities through the protocol.",
  },
  {
    term: "Transport",
    desc: "The communication layer — typically stdio (local processes) or HTTP with server-sent events.",
  },
];

/**
 * A chain diagram, built from decorative chips.
 *
 * aria-hidden, because the sentence immediately before each one states the
 * same sequence in words. A screen reader gets the sentence; a sighted reader
 * gets the sentence and the picture. Neither gets four floating nouns.
 */
function Chain({ steps }: { steps: string[] }) {
  return (
    <p className="chip-row" aria-hidden="true">
      {steps.map((s, i) => (
        <Fragment key={s}>
          <span className="chip">{s}</span>
          {i < steps.length - 1 ? <span className="arw">→</span> : null}
        </Fragment>
      ))}
    </p>
  );
}

export default function PrimerPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/primer",
            name: "The Primer",
            description: CAPSULE,
            items: SECTIONS.map((s) => ({ path: `/primer#${s.id}`, name: s.label })),
          }),
        )}
      />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>The Primer</span>
            <i aria-hidden="true">/</i>
            <span>Archived</span>
          </p>
          <h1>How coding systems work.</h1>
          <p className="page-lead">{CAPSULE}</p>
        </div>
      </div>

      <ArchiveBand date={VOLUME.archivedDate}>
        This volume is kept for reference and is no longer maintained. It stays at
        its original URL, with nothing moved and nothing redirected. The three
        volumes are introduced together on <Link href="/learn">the learn hub</Link>,
        and what is current is on <Link href="/now">now</Link>.
      </ArchiveBand>

      <section className="work work--bare">
        <div className="wrap">
          <SectionHead
            eyebrow="Contents"
            heading="Five sections, in order."
            aside="Read from the top if the vocabulary is the obstacle. Each section stands on its own if it is not."
          />
          <ul className="linklist">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="linklist__label">
                    {s.num}
                    <span className="arw" aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className="linklist__note">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ────────────────────────────────────────────── 01 what is code */}
      <section className="work" id="code">
        <div className="wrap">
          <SectionHead num="01" eyebrow="Foundations" heading="What is code?" />
          <div className="prose">
            <p>
              Code is a set of precise instructions that tells a computer what to
              do. Every app you use, every website you visit, every AI you talk to
              &mdash; it&rsquo;s all code running on hardware somewhere.
            </p>
            <p>
              At its core, code is just text. Files full of structured text that
              follow rules strict enough for a machine to interpret. Programming
              languages like Python, JavaScript, TypeScript, Rust, and Go give
              humans a way to write those instructions in something readable.
            </p>
            <p>
              The computer itself only understands binary &mdash; electrical
              signals that are on or off, 1 or 0. Your human-readable code gets
              translated (compiled or interpreted) down to machine instructions.
              The programming language is the bridge between your intent and the
              machine&rsquo;s execution.
            </p>
            <blockquote>
              <p>
                Think of code like a recipe. The programming language is the
                language the recipe is written in. The computer is the kitchen.
                The runtime is the cook.
              </p>
            </blockquote>
            <p>
              You don&rsquo;t need to understand binary to write code, just like
              you don&rsquo;t need to understand combustion to drive a car. Each
              layer of abstraction lets you work at a higher level without
              worrying about what&rsquo;s underneath.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────── 02 the stack */}
      <section className="work" id="stack">
        <div className="wrap">
          <SectionHead num="02" eyebrow="Architecture" heading="The stack." />
          <div className="prose">
            <p>
              Modern software is built in layers. Developers call this &ldquo;the
              stack&rdquo; &mdash; each layer handles a different level of
              abstraction.
            </p>
          </div>
          {/*
            The layer numbers come from the CSS counter on .steps, not from an
            array index printed into the markup. The stack is genuinely ordered,
            so an ordered list is the honest element, and a number nobody typed
            cannot drift from the list it labels.
          */}
          <ol className="steps stack-list">
            {STACK_LAYERS.map((l) => (
              <li className="step" key={l.layer}>
                <p className="step__label">{l.layer}</p>
                <p className="step__detail">{l.desc}</p>
              </li>
            ))}
          </ol>
          <div className="prose prose--after">
            <p>
              Each layer abstracts away the complexity below it. A web developer
              using Next.js doesn&rsquo;t think about CPU registers. A DevOps
              engineer managing cloud infrastructure doesn&rsquo;t think about
              React components. Specialization happens at each layer.
            </p>
            <p>
              When someone says &ldquo;full-stack developer,&rdquo; they mean
              someone who works across multiple layers &mdash; typically the
              framework, application, and some infrastructure. Nobody works all
              layers. The stack is too deep.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────── 03 ai agents */}
      <section className="work" id="agents">
        <div className="wrap">
          <SectionHead num="03" eyebrow="Intelligence" heading="AI agents." />
          <div className="prose">
            <p>
              An AI agent is a program that uses a large language model (LLM) to
              reason, plan, and take actions. It&rsquo;s the difference between
              asking someone a question and hiring someone to do a job.
            </p>
            <p>
              A chatbot responds to prompts. An agent interprets your intent,
              breaks it into steps, uses tools, handles errors, and delivers
              results. It operates in a loop: observe the situation, decide what
              to do, take an action, evaluate the result, repeat.
            </p>
            <Chain steps={["Observe", "Decide", "Act", "Evaluate"]} />
            <h3>What makes agents useful</h3>
            <ul>
              {AGENT_CAPABILITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p>
              The leading AI coding agents today are Claude Code (Anthropic),
              Codex (OpenAI), Goose (Block), and Aider. They sit in your terminal,
              understand your project&rsquo;s context, and write real code that
              ships.
            </p>
            <blockquote>
              <p>
                An agent without tools is just a chatbot with ambition. The tools
                are what make it useful.
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── 04 skills */}
      <section className="work" id="skills">
        <div className="wrap">
          <SectionHead num="04" eyebrow="Capabilities" heading="Skills." />
          <div className="prose">
            <p>
              Skills are packaged capabilities that extend what an agent can do.
              Instead of one agent knowing everything about everything, skills
              give it specialized knowledge and workflows on demand.
            </p>
            <p>
              A skill might teach an agent how to deploy to Vercel, write
              Playwright tests, optimize images for SEO, generate PDF reports, or
              set up a CI pipeline. When you need that capability, the skill
              loads. When you don&rsquo;t, it stays out of the way.
            </p>
            <p>
              Most skills are structured text files &mdash; markdown with
              frontmatter that defines when the skill should activate, what it
              does, and how it should behave. They&rsquo;re lightweight,
              composable, and shareable.
            </p>
          </div>
          <figure className="cmd">
            <pre>
              <code>{`---
name: deploy-vercel
description: Deploy to Vercel
trigger: "deploy", "ship it"
---
Instructions for the agent...`}</code>
            </pre>
          </figure>
          <div className="prose">
            <p>
              The skill ecosystem is growing fast. There are skills for SEO
              auditing, database migrations, code review, documentation
              generation, and hundreds more. You can install community skills or
              write your own.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── 05 mcp */}
      <section className="work" id="mcp">
        <div className="wrap">
          <SectionHead
            num="05"
            eyebrow="Protocol"
            heading="MCP, the Model Context Protocol."
          />
          <div className="prose">
            <p>
              MCP is a standard protocol that connects AI agents to external tools
              and data sources. Think of it as USB for AI &mdash; a universal
              interface that lets any compatible agent talk to any compatible
              tool.
            </p>
            <p>
              Before MCP, every integration was custom. Want your agent to access
              your database? Write a custom integration. GitHub? Another one.
              Notion? Another. MCP standardizes all of this into one protocol.
            </p>
            <h3>The architecture is simple</h3>
          </div>
          <ul className="defs defs--after">
            {MCP_CONCEPTS.map((c) => (
              <li key={c.term}>
                <p className="defs__label">{c.term}</p>
                <p className="defs__detail">{c.desc}</p>
              </li>
            ))}
          </ul>
          <div className="prose prose--after">
            <p>
              The agent reaches the tools and the data through the protocol, so
              neither side has to know anything about the other.
            </p>
            <Chain steps={["Agent", "MCP protocol", "Tools and data"]} />
            <p>
              With MCP, an agent can connect to your Supabase database, your
              GitHub repositories, your Notion workspace, your email, your Figma
              files &mdash; all through standardized, interchangeable connectors.
              Add a server, restart the agent, and the new tools are available
              immediately.
            </p>
            <p>
              MCP is open source and maintained by Anthropic. The ecosystem
              includes official reference servers and hundreds of community-built
              servers covering everything from Postgres to Slack to Kubernetes.
            </p>
          </div>
          <PageNameplate
            source="content/learn/index.ts — the same entry the learn hub reads"
            method="Archive date read from the volume entry; the volume text is reproduced as written"
          />
        </div>
      </section>
    </main>
  );
}
