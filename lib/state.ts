import { create } from 'zustand';
import { ConversationState, ManifoldState } from './types';

type Store = {
    conversation: ConversationState;
    setHuman: (m: ManifoldState) => void;
    setAI: (m: ManifoldState) => void;
    setCenter: (m: ManifoldState) => void;
    setInputActivity: (activity: number) => void;
};

const defaultManifoldState = (): ManifoldState => ({
    energy: 0.6,
    valence: 0.3,
    complexity: 0.5,
    novelty: 0.4,
    introspection: 0.3,
    focus: 0.5,
    dim1: 0.2,
    dim2: 0.1,
});

export const useStore = create<Store>((set) => ({
    conversation: {
        human: defaultManifoldState(),
        ai: defaultManifoldState(),
        center: defaultManifoldState(),
        inputActivity: 0, // 0 to 1, decays over time
    },
    setHuman: (m) => set((s) => ({ conversation: { ...s.conversation, human: m } })),
    setAI: (m) => set((s) => ({ conversation: { ...s.conversation, ai: m } })),
    setCenter: (m) => set((s) => ({ conversation: { ...s.conversation, center: m } })),
    setInputActivity: (activity) => set((s) => ({ conversation: { ...s.conversation, inputActivity: activity } })),
}));
