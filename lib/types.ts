export type ManifoldState = {
  energy: number;      // 0..1 - activity level
  valence: number;     // -1..1 - sentiment / emotional tone
  complexity: number;  // 0..1 - linguistic / conceptual complexity
  novelty: number;     // 0..1 - conceptual novelty vs past messages
  introspection: number; // 0..1 - how "self-referential/meta" it is
  focus: number;       // 0..1 - how on-topic / coherent it is
  dim1: number;        // low-dim embedding component 1
  dim2: number;        // low-dim embedding component 2
  coherence?: number;  // 0..1 - for center manifold
  tension?: number;    // 0..1 - for center manifold
};

export type ConversationState = {
  human: ManifoldState;
  ai: ManifoldState;
  center: ManifoldState;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
