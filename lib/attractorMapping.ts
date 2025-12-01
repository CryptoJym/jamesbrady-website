import type { ManifoldState } from './types';

export type AttractorParams = {
    a: number;
    b: number;
    c: number;
    d: number;
};

/**
 * Utility clamping helpers
 */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * Human base Clifford parameters.
 * These live in a "nice" region of the Clifford attractor space.
 */
const HUMAN_BASE: AttractorParams = {
    a: -1.4,
    b: 1.6,
    c: 1.0,
    d: 0.7,
};

/**
 * AI base De Jong parameters.
 */
const AI_BASE: AttractorParams = {
    a: 1.4,
    b: -2.3,
    c: 2.4,
    d: -2.1,
};

/**
 * Map a manifold state (you) to Clifford attractor parameters.
 *
 * Intuition:
 * - valence and energy bend `a` (emotional tilt + intensity)
 * - complexity drives `b` (structural ruffling)
 * - novelty + embedding direction steer `c` and `d` (topic / pattern drift)
 */
export function cliffordParamsFromHuman(state: ManifoldState): AttractorParams {
    const {
        energy,
        valence,
        complexity,
        novelty,
        dim1,
        dim2,
    } = state;

    const e = clamp01(energy);
    const cx = clamp01(complexity);
    const nv = clamp01(novelty);

    return {
        a: HUMAN_BASE.a
            + 0.6 * valence       // emotional tilt
            + 0.3 * (e - 0.5),    // intensity warp
        b: HUMAN_BASE.b
            + 0.8 * cx,           // more complexity => more intricate attractor
        c: HUMAN_BASE.c
            + 0.4 * dim1          // embedding direction X
            + 0.3 * nv,           // novelty pushes shape off its usual basin
        d: HUMAN_BASE.d
            + 0.4 * dim2,         // embedding direction Y
    };
}

/**
 * Map a manifold state (me) to De Jong attractor parameters.
 *
 * Intuition:
 * - complexity + energy => `a` (how "dense" the response is)
 * - embedding direction => `b`, `c` (semantic direction)
 * - valence + focus => `d` (how sharply the AI "locks in")
 */
export function deJongParamsFromAI(state: ManifoldState): AttractorParams {
    const {
        energy,
        valence,
        complexity,
        focus,
        dim1,
        dim2,
    } = state;

    const e = clamp01(energy);
    const cx = clamp01(complexity);
    const f = clamp01(focus);

    return {
        a: AI_BASE.a
            + 0.4 * cx            // structured density
            + 0.2 * e,            // intensity
        b: AI_BASE.b
            + 0.5 * dim1,         // semantic direction X
        c: AI_BASE.c
            + 0.5 * dim2,         // semantic direction Y
        d: AI_BASE.d
            + 0.3 * valence       // affective tilt
            + 0.4 * (f - 0.5),    // more focus => sharper attractor regime
    };
}

/**
 * Blend human + AI attractor parameters according to coherence.
 * coherence in [0,1], tension = 1 - coherence.
 *
 * λ = coherence:
 * - λ = 0   => pure human
 * - λ = 1   => pure AI
 * - 0 < λ < 1 => somewhere in between
 */
export function blendedCenterParams(
    humanState: ManifoldState,
    aiState: ManifoldState,
    coherence: number,
): AttractorParams {
    const λ = clamp01(coherence); // 0..1

    const h = cliffordParamsFromHuman(humanState);
    const a = deJongParamsFromAI(aiState);

    return {
        a: λ * a.a + (1 - λ) * h.a,
        b: λ * a.b + (1 - λ) * h.b,
        c: λ * a.c + (1 - λ) * h.c,
        d: λ * a.d + (1 - λ) * h.d,
    };
}

/**
 * Convenience: produce all three parameter sets in one call,
 * if you already have coherence.
 */
export function getAllAttractorParams(
    humanState: ManifoldState,
    aiState: ManifoldState,
    coherence: number,
): {
    human: AttractorParams;
    ai: AttractorParams;
    center: AttractorParams;
} {
    return {
        human: cliffordParamsFromHuman(humanState),
        ai: deJongParamsFromAI(aiState),
        center: blendedCenterParams(humanState, aiState, coherence),
    };
}
