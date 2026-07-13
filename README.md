# James Brady — AI Alchemist

The source for [jamesbrady.org](https://www.jamesbrady.org): an editorial personal site about production AI systems, agent architecture, tools, and practical implementation.

## Overview

This project visualizes the relationship between Human and AI states through three distinct manifolds:
1.  **Human Manifold**: Represents the user's state (Energy, Valence, Coherence).
2.  **AI Manifold**: Represents the AI's state (Energy, Valence, Coherence).
3.  **Center Manifold**: A dynamic "Stability Attractor Field" that emerges from the interaction between Human and AI.

## Features

### 3D Visualization
-   **Custom Shaders**: Each manifold uses unique vertex and fragment shaders to represent data visually.
-   **Real-time Dynamics**: The manifolds react in real-time to changes in state (Coherence, Tension, Energy).
-   **Attractor Fields**: Visualizes complex mathematical attractors (Clifford, De Jong) mapped to interaction data.

### Interactive Chat
-   **Markdown Support**: Rich text rendering for AI responses (lists, code blocks, formatting).
-   **Expandable UI**: The chat panel can be minimized to view the manifolds or expanded to read long conversations.
-   **State Integration**: Chatting with the AI updates the underlying state, which immediately reflects in the 3D visualization.

## Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) / [Three.js](https://threejs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Markdown**: `react-markdown`, `remark-gfm`

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the application**:
    Navigate to [http://localhost:3000](http://localhost:3000) (or the port specified in the console).

## Lead delivery

The `/contact` form sends inquiries through a Server Action to the shared Utlyze lead gateway, which stores the inquiry and forwards it to the published HighLevel workflow. No CRM secret is exposed in this public repository. Set `LEAD_INGEST_URL` only when a local or staging override is needed, and never expose it with a `NEXT_PUBLIC_` prefix.

## Key Components

-   `components/ManifoldScene.tsx`: The main 3D scene orchestrator.
-   `components/manifolds/CenterManifold.tsx`: The central stability field with custom shader logic.
-   `components/ChatPanel.tsx`: The interactive chat interface with Markdown support.
-   `lib/attractorMapping.ts`: Mathematical functions mapping state to visual parameters.
