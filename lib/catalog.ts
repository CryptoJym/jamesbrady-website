export interface Tool {
  name: string;
  description: string;
  install: string;
  github: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
}

export const catalog: Category[] = [
  {
    id: 'documents',
    name: 'Document Processing',
    description: 'Parse, convert, and manipulate documents at scale.',
    tools: [
      {
        name: 'Markitdown',
        description: 'Convert any document to clean Markdown. Handles PDF, DOCX, PPTX, HTML, images, and more.',
        install: 'pip install markitdown',
        github: 'https://github.com/microsoft/markitdown',
      },
      {
        name: 'Docling',
        description: 'Advanced document parsing with layout understanding. Extracts text, tables, and figures from PDFs and office formats.',
        install: 'pip install docling',
        github: 'https://github.com/DS4SD/docling',
      },
      {
        name: 'Marker',
        description: 'High-accuracy PDF to Markdown conversion. Handles academic papers, books, and complex layouts.',
        install: 'pip install marker-pdf',
        github: 'https://github.com/VikParuchuri/marker',
      },
      {
        name: 'Unstructured',
        description: 'Universal document parser. Extracts structured data from any file format for LLM pipelines.',
        install: 'pip install unstructured',
        github: 'https://github.com/Unstructured-IO/unstructured',
      },
    ],
  },
  {
    id: 'design',
    name: 'Design & UI',
    description: 'Build beautiful interfaces with proven component systems.',
    tools: [
      {
        name: 'shadcn/ui',
        description: 'Beautifully designed, accessible components you copy into your project. Not a dependency — you own the code.',
        install: 'npx shadcn@latest init',
        github: 'https://github.com/shadcn-ui/ui',
      },
      {
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework. Write styles directly in your markup. The standard for modern web development.',
        install: 'npm install tailwindcss',
        github: 'https://github.com/tailwindlabs/tailwindcss',
      },
      {
        name: 'Radix UI',
        description: 'Unstyled, accessible component primitives. The foundation that shadcn/ui and many design systems build on.',
        install: 'npm install @radix-ui/react-dialog',
        github: 'https://github.com/radix-ui/primitives',
      },
      {
        name: 'Lucide',
        description: 'Beautiful, consistent open-source icon library. 1500+ icons with React, Vue, and Svelte support.',
        install: 'npm install lucide-react',
        github: 'https://github.com/lucide-icons/lucide',
      },
    ],
  },
  {
    id: 'dev',
    name: 'Development Tools',
    description: 'Ship faster with better tooling.',
    tools: [
      {
        name: 'Biome',
        description: 'Fast formatter, linter, and more. Written in Rust. One tool replaces ESLint and Prettier.',
        install: 'npm install --save-dev @biomejs/biome',
        github: 'https://github.com/biomejs/biome',
      },
      {
        name: 'Playwright',
        description: 'Browser automation and end-to-end testing. Cross-browser, auto-wait, and built-in test runner.',
        install: 'npm install -D playwright',
        github: 'https://github.com/microsoft/playwright',
      },
      {
        name: 'Zod',
        description: 'TypeScript-first schema validation. Define your types once, validate at runtime. The standard for type-safe APIs.',
        install: 'npm install zod',
        github: 'https://github.com/colinhacks/zod',
      },
      {
        name: 'Turborepo',
        description: 'High-performance monorepo build system. Caches builds, runs tasks in parallel, scales to any size.',
        install: 'npx create-turbo@latest',
        github: 'https://github.com/vercel/turborepo',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Analytics',
    description: 'Measure what matters. Reach who matters.',
    tools: [
      {
        name: 'Plausible',
        description: 'Privacy-friendly web analytics. No cookies, no consent banners. Simple, accurate, open source.',
        install: 'docker compose up',
        github: 'https://github.com/plausible/analytics',
      },
      {
        name: 'PostHog',
        description: 'Product analytics, feature flags, session replay, A/B testing. All-in-one, open source.',
        install: 'npm install posthog-js',
        github: 'https://github.com/PostHog/posthog',
      },
      {
        name: 'Resend',
        description: 'Email API built for developers. Clean API, React email templates, great deliverability.',
        install: 'npm install resend',
        github: 'https://github.com/resend/resend-node',
      },
      {
        name: 'Cal.com',
        description: 'Open source scheduling infrastructure. Calendly alternative you can self-host and customize.',
        install: 'npx create-cal-app',
        github: 'https://github.com/calcom/cal.com',
      },
    ],
  },
  {
    id: 'agents',
    name: 'Agent Frameworks',
    description: 'AI agents that write code, run commands, and ship software.',
    tools: [
      {
        name: 'Claude Code',
        description: "Anthropic's agentic coding tool. Understands your entire codebase. Reads, writes, executes, and ships.",
        install: 'npm install -g @anthropic-ai/claude-code',
        github: 'https://github.com/anthropics/claude-code',
      },
      {
        name: 'Codex',
        description: "OpenAI's coding agent. Sandboxed execution, multi-file editing, and autonomous task completion.",
        install: 'npm install -g @openai/codex',
        github: 'https://github.com/openai/codex',
      },
      {
        name: 'Goose',
        description: "Block's open source AI agent. Extensible, multi-provider, with a rich toolkit ecosystem.",
        install: 'brew install goose',
        github: 'https://github.com/block/goose',
      },
      {
        name: 'Aider',
        description: 'AI pair programming in your terminal. Git-aware, multi-file editing, works with any LLM.',
        install: 'pip install aider-chat',
        github: 'https://github.com/Aider-AI/aider',
      },
    ],
  },
  {
    id: 'local-ai',
    name: 'Local AI',
    description: 'Run models on your own hardware. No API keys. No data leaving your machine.',
    tools: [
      {
        name: 'Ollama',
        description: 'Run LLMs locally with a single command. Pull models like Docker images. CPU and GPU support.',
        install: 'brew install ollama',
        github: 'https://github.com/ollama/ollama',
      },
      {
        name: 'LM Studio',
        description: 'Desktop application for running local LLMs. Clean UI, model management, and OpenAI-compatible API.',
        install: 'Download from lmstudio.ai',
        github: 'https://github.com/lmstudio-ai/lms',
      },
      {
        name: 'Open WebUI',
        description: 'Feature-rich web interface for LLMs. Chat, RAG, model management, and multi-user support.',
        install: 'pip install open-webui',
        github: 'https://github.com/open-webui/open-webui',
      },
      {
        name: 'Jan',
        description: 'Local AI desktop app. Offline-first, cross-platform, with built-in model store and API server.',
        install: 'Download from jan.ai',
        github: 'https://github.com/janhq/jan',
      },
    ],
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Automate workflows, schedule jobs, and orchestrate systems.',
    tools: [
      {
        name: 'n8n',
        description: 'Workflow automation platform with visual editor. 400+ integrations. Self-hostable, source-available.',
        install: 'npx n8n',
        github: 'https://github.com/n8n-io/n8n',
      },
      {
        name: 'Temporal',
        description: 'Durable execution platform. Build reliable distributed systems. Automatic retries and state management.',
        install: 'brew install temporal',
        github: 'https://github.com/temporalio/temporal',
      },
      {
        name: 'Windmill',
        description: 'Developer platform for scripts, workflows, and UIs. Turn any script into a production workflow.',
        install: 'docker compose up',
        github: 'https://github.com/windmill-labs/windmill',
      },
      {
        name: 'Trigger.dev',
        description: 'Background jobs for developers. Long-running tasks with built-in retry, scheduling, and observability.',
        install: 'npx trigger.dev@latest init',
        github: 'https://github.com/triggerdotdev/trigger.dev',
      },
    ],
  },
  {
    id: 'memory',
    name: 'Memory & Knowledge',
    description: 'Give your AI persistent memory and searchable knowledge.',
    tools: [
      {
        name: 'Mem0',
        description: 'Memory layer for AI applications. Persistent, contextual memory across conversations and sessions.',
        install: 'pip install mem0ai',
        github: 'https://github.com/mem0ai/mem0',
      },
      {
        name: 'ChromaDB',
        description: 'AI-native embedding database. Store, search, and retrieve by semantic similarity. Dead simple API.',
        install: 'pip install chromadb',
        github: 'https://github.com/chroma-core/chroma',
      },
      {
        name: 'Qdrant',
        description: 'High-performance vector search engine. Filtering, payload storage, and distributed deployment.',
        install: 'docker pull qdrant/qdrant',
        github: 'https://github.com/qdrant/qdrant',
      },
      {
        name: 'LanceDB',
        description: 'Embedded vector database. Serverless, zero-config. Built on Lance columnar format for speed.',
        install: 'pip install lancedb',
        github: 'https://github.com/lancedb/lancedb',
      },
    ],
  },
  {
    id: 'mcp',
    name: 'MCP Servers',
    description: 'Connect your AI agent to any external tool or data source.',
    tools: [
      {
        name: 'Official MCP Servers',
        description: 'Reference implementations by Anthropic. Filesystem, GitHub, Google Drive, Postgres, Puppeteer, and more.',
        install: 'npx @modelcontextprotocol/server-filesystem',
        github: 'https://github.com/modelcontextprotocol/servers',
      },
      {
        name: 'Supabase MCP',
        description: 'Connect your agent to Supabase. Query databases, manage auth, and interact with storage.',
        install: 'npx supabase-mcp-server',
        github: 'https://github.com/supabase-community/supabase-mcp',
      },
      {
        name: 'Browserbase MCP',
        description: 'Cloud browser for AI agents. Navigate, click, extract data from any website at scale.',
        install: 'npx @browserbasehq/mcp-server',
        github: 'https://github.com/browserbase/mcp-server-browserbase',
      },
      {
        name: 'Neon MCP',
        description: 'Serverless Postgres for AI agents. Branch databases, run migrations, and query data.',
        install: 'npx @neondatabase/mcp-server-neon',
        github: 'https://github.com/neondatabase/mcp-server-neon',
      },
    ],
  },
];
