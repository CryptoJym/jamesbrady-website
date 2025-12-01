# James Brady | Human-AI Manifold

A sophisticated 3D visualization of Human-AI interaction dynamics, built with Next.js, React Three Fiber, and custom shaders.

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

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
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

## Key Components

-   `components/ManifoldScene.tsx`: The main 3D scene orchestrator.
-   `components/manifolds/CenterManifold.tsx`: The central stability field with custom shader logic.
-   `components/ChatPanel.tsx`: The interactive chat interface with Markdown support.
-   `lib/attractorMapping.ts`: Mathematical functions mapping state to visual parameters.
