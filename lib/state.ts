import { create } from 'zustand';
import { ConversationState, ManifoldState } from './types';

type Store = {
    conversation: ConversationState;
    setHuman: (m: ManifoldState) => void;
    setAI: (m: ManifoldState) => void;
    setCenter: (m: ManifoldState) => void;
};

const defaultManifoldState = (): ManifoldState => ({
    energy: 0.1,
    valence: 0,
    complexity: 0.1,
    novelty: 0,
    introspection: 0,
    focus: 0.5,
    dim1: 0,
    dim2: 0,
});

export const useStore = create<Store>((set) => ({
    conversation: {
        human: defaultManifoldState(),
        ai: defaultManifoldState(),
        center: defaultManifoldState(),
    },
    setHuman: (m) => set((s) => ({ conversation: { ...s.conversation, human: m } })),
    setAI: (m) => set((s) => ({ conversation: { ...s.conversation, ai: m } })),
    setCenter: (m) => set((s) => ({ conversation: { ...s.conversation, center: m } })),
}));
