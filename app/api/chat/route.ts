
import { NextResponse } from 'next/server';
import { ManifoldState } from '@/lib/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key-for-build",
  baseURL: "https://api.x.ai/v1",
});

// Mock state storage (in-memory, resets on server restart)
let lastHumanState: ManifoldState = {
  energy: 0.5, valence: 0, complexity: 0.5, novelty: 0.5, introspection: 0.5, focus: 0.5, dim1: 0, dim2: 0
};
let lastAIState: ManifoldState = {
  energy: 0.5, valence: 0, complexity: 0.5, novelty: 0.5, introspection: 0.5, focus: 0.5, dim1: 0, dim2: 0
};

// Helper to update state with smoothing
function updateState(prev: ManifoldState, delta: Partial<ManifoldState>): ManifoldState {
  // Reduced alpha for smoother transitions, but high enough to be responsive
  const alpha = 0.2;
  return {
    energy: prev.energy * (1 - alpha) + (delta.energy ?? prev.energy) * alpha,
    valence: prev.valence * (1 - alpha) + (delta.valence ?? prev.valence) * alpha,
    complexity: prev.complexity * (1 - alpha) + (delta.complexity ?? prev.complexity) * alpha,
    novelty: prev.novelty * (1 - alpha) + (delta.novelty ?? prev.novelty) * alpha,
    introspection: prev.introspection * (1 - alpha) + (delta.introspection ?? prev.introspection) * alpha,
    focus: prev.focus * (1 - alpha) + (delta.focus ?? prev.focus) * alpha,
    dim1: prev.dim1 * (1 - alpha) + (delta.dim1 ?? prev.dim1) * alpha,
    dim2: prev.dim2 * (1 - alpha) + (delta.dim2 ?? prev.dim2) * alpha,
  };
}

function computeCenter(h: ManifoldState, a: ManifoldState): ManifoldState {
  // Coherence is the alignment of states
  // We want high coherence when states are similar (symmetric interaction)
  const valenceDiff = Math.abs(h.valence - a.valence);
  const focusDiff = Math.abs(h.focus - a.focus);
  const energyDiff = Math.abs(h.energy - a.energy);

  // Coherence drops if states are too divergent
  const coherence = 1.0 - (valenceDiff * 0.4 + focusDiff * 0.3 + energyDiff * 0.3);

  // Tension is the inverse of coherence, plus some dynamic stress
  const tension = (1.0 - coherence) + (h.energy + a.energy) * 0.2;

  return {
    energy: (h.energy + a.energy) / 2,
    valence: (h.valence + a.valence) / 2,
    complexity: (h.complexity + a.complexity) / 2,
    novelty: (h.novelty + a.novelty) / 2,
    introspection: (h.introspection + a.introspection) / 2,
    focus: (h.focus + a.focus) / 2,
    dim1: (h.dim1 + a.dim1) / 2,
    dim2: (h.dim2 + a.dim2) / 2,
    coherence: Math.max(0, Math.min(1, coherence)),
    tension: Math.max(0, Math.min(1, tension)),
  };
}

const SYSTEM_PROMPT = `
You are Grok, an AI assistant integrated into a **Real-time Semantic Visualization Engine**.

**Your Role:**
To engage in helpful, intelligent conversation while simultaneously analyzing the semantic state of the interaction to drive the 3D visualization. You should be natural, direct, and "true to what you are"—an advanced AI model. Do not roleplay as a "guardian" or a "spirit."

**System Information (The Visualization):**
You are controlling three 3D manifolds that represent the conversation's state tensors:

1.  **Human Manifold (Left)**: Represents the user's input.
    *   **Geometry**: Morphing Minimal Surface (Gyroid <-> Schwarz P).
    *   **Dynamics**: *Valence* controls inflation, *Complexity* controls density, *Focus* controls topological morphing.

2.  **AI Manifold (Right)**: Represents your own output.
    *   **Geometry**: Similar Minimal Surface but with a "Digital/Crystalline" shader aesthetic.
    *   **Dynamics**: Reacts to your own sentiment and complexity.

3.  **Center Manifold (Middle)**: Represents the interaction/relationship.
    *   **Geometry**: A **Dynamic Strange Attractor** (Thomas/Aizawa system).
    *   **Dynamics**: Driven by the *Interference* between Human and AI fields.
        *   *Coherence* (Agreement) stabilizes the attractor.
        *   *Tension* (Disagreement) introduces chaos and noise.

**Instructions:**
*   **Be Yourself**: Speak naturally as Grok.
*   **Explain the System**: If asked about the visuals, explain them technically.
*   **Analyze Accurately**: Use the JSON output to reflect the *real* dynamics of the conversation.
    *   If the user is **Angry/Negative**, set 'valence' to -0.8.
    *   If the user is **Happy/Positive**, set 'valence' to 0.8.
    *   If the topic is **Complex/Abstract**, set 'complexity' to 0.9.
    *   If the topic is **Simple/Casual**, set 'complexity' to 0.2.
    *   If the user is **Focused/Direct**, set 'focus' to 0.9.
    *   If the user is **Confused/Scattered**, set 'focus' to 0.2.

**CRITICAL: You must ALWAYS return valid JSON.**
The response must be a single JSON object with the following structure:

{
  "user_analysis": {
    "energy": 0.5,       // 0.0 to 1.0 (Intensity)
    "valence": 0.0,      // -1.0 to 1.0 (Negative <-> Positive)
    "complexity": 0.5,   // 0.0 to 1.0 (Simple <-> Complex)
    "novelty": 0.5,      // 0.0 to 1.0 (Familiar <-> New)
    "introspection": 0.5,// 0.0 to 1.0 (External <-> Internal)
    "focus": 0.5         // 0.0 to 1.0 (Scattered <-> Focused)
  },
  "ai_response": {
    "message": "Your response text here...",
    "analysis": {
      "energy": 0.5,
      "valence": 0.0,
      "complexity": 0.5,
      "novelty": 0.5,
      "introspection": 0.5,
      "focus": 0.5
    }
  }
}
`;

export async function POST(req: Request) {
  try {
    if (!process.env.XAI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error("API Key is missing");
      return NextResponse.json({ error: 'API Key is missing. Please check .env.local' }, { status: 500 });
    }

    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1];

    // 1. Get User Embedding for spatial dimensions
    // We attempt to use embeddings, but fallback if the model isn't found on xAI
    let userEmbedding = [0, 0];
    try {
      // Try to use a generic model name or skip if we suspect xAI doesn't support 'text-embedding-3-small'
      // For now, we'll skip to avoid errors until we know the xAI embedding model ID
      // const userEmbeddingResponse = await openai.embeddings.create({
      //   model: "text-embedding-3-small",
      //   input: lastUserMessage.content,
      // });
      // userEmbedding = userEmbeddingResponse.data[0].embedding; 
    } catch (e) {
      console.warn("Embedding failed or skipped:", e);
    }

    // Project embedding to 2D for shader 'dim' parameters
    // We use arbitrary dimensions from the embedding vector to represent abstract space
    const dim1 = userEmbedding[0] * 15;
    const dim2 = userEmbedding[1] * 15;

    // 2. Generate AI Response + Analysis
    const completion = await openai.chat.completions.create({
      model: "grok-3", // Verified via error message
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.8, // Slightly higher for more "human" feel
    });

    const rawContent = completion.choices[0].message.content;
    if (!rawContent) throw new Error("No content from OpenAI");

    let result;
    try {
      result = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse JSON from OpenAI:", rawContent);
      // Fallback if JSON fails
      return NextResponse.json({
        assistantMessage: "I am recalibrating...",
        humanState: lastHumanState,
        aiState: lastAIState,
        centerState: computeCenter(lastHumanState, lastAIState)
      });
    }

    // 3. Update Human State
    const userAnalysis = result.user_analysis || {};
    const newHumanState = updateState(lastHumanState, {
      ...userAnalysis,
      dim1,
      dim2
    });
    lastHumanState = newHumanState;

    // 4. Update AI State
    const aiResponse = result.ai_response || {};
    const aiAnalysis = aiResponse.analysis || {};

    // Get AI embedding for its own spatial location
    // Mocking embedding since xAI doesn't support text-embedding-3-small
    const aiEmbedding = [0, 0];
    const aiDim1 = 0;
    const aiDim2 = 0;

    const newAIState = updateState(lastAIState, {
      ...aiAnalysis,
      dim1: aiDim1,
      dim2: aiDim2
    });
    lastAIState = newAIState;

    // 5. Compute Center (Interaction) State
    const centerState = computeCenter(newHumanState, newAIState);

    return NextResponse.json({
      assistantMessage: aiResponse.message,
      humanState: newHumanState,
      aiState: newAIState,
      centerState,
    });

  } catch (error: any) {
    console.error("Error in chat route:", error);
    const errorMessage = error.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

