
import { NextResponse } from 'next/server';
import { ManifoldState } from '@/lib/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
Analyze the conversation and respond with maximum intelligence and coherence.

Output JSON format:
{
  "user_analysis": {
    "energy": 0.0-1.0,
    "valence": -1.0-1.0,
    "complexity": 0.0-1.0,
    "novelty": 0.0-1.0,
    "introspection": 0.0-1.0,
    "focus": 0.0-1.0
  },
  "ai_response": {
    "message": "Response text...",
    "analysis": {
      "energy": 0.0-1.0,
      "valence": -1.0-1.0,
      "complexity": 0.0-1.0,
      "novelty": 0.0-1.0,
      "introspection": 0.0-1.0,
      "focus": 0.0-1.0
    }
  }
}
`;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return NextResponse.json({ error: 'OpenAI API Key is missing. Please check .env.local' }, { status: 500 });
    }

    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1];

    // 1. Get User Embedding for spatial dimensions
    const userEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: lastUserMessage.content,
    });
    const userEmbedding = userEmbeddingResponse.data[0].embedding;

    // Project embedding to 2D for shader 'dim' parameters
    // We use arbitrary dimensions from the embedding vector to represent abstract space
    const dim1 = userEmbedding[0] * 15;
    const dim2 = userEmbedding[1] * 15;

    // 2. Generate AI Response + Analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
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
    const aiEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: aiResponse.message || "...",
    });
    const aiEmbedding = aiEmbeddingResponse.data[0].embedding;
    const aiDim1 = aiEmbedding[0] * 15;
    const aiDim2 = aiEmbedding[1] * 15;

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

