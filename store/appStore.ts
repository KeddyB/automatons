import { create } from 'zustand';

interface AppState {
  lastEvent: string | null;
  screenContent: string | null;
  setLastEvent: (event: string | null) => void;
  setScreenContent: (content: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastEvent: null,
  screenContent: null,
  setLastEvent: (event) => set({ lastEvent: event }),
  setScreenContent: (content) => set({ screenContent: content }),
}));
