import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

export interface NodePosition {
  x: number;
  y: number;
}

export interface FocusRequest {
  topicId: string;
  requestId: number;
}

interface AppState {
  progress: Record<string, boolean>;
  positions: Record<string, NodePosition>;
  themePreference: ThemePreference;
  selectedTopicId: string | null;
  focusRequest: FocusRequest | null;
  layoutResetKey: number;
  setTopicCompleted: (topicId: string, completed: boolean) => void;
  toggleTopicCompleted: (topicId: string) => void;
  replaceProgress: (progress: Record<string, boolean>) => void;
  resetProgress: () => void;
  setNodePosition: (topicId: string, position: NodePosition) => void;
  resetLayout: () => void;
  selectTopic: (topicId: string | null, focus?: boolean) => void;
  setThemePreference: (preference: ThemePreference) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      progress: {},
      positions: {},
      themePreference: "system",
      selectedTopicId: null,
      focusRequest: null,
      layoutResetKey: 0,

      setTopicCompleted: (topicId, completed) =>
        set((state) => ({
          progress: { ...state.progress, [topicId]: completed },
        })),

      toggleTopicCompleted: (topicId) => {
        const current = get().progress[topicId] === true;
        get().setTopicCompleted(topicId, !current);
      },

      replaceProgress: (progress) => set({ progress: { ...progress } }),

      resetProgress: () => set({ progress: {} }),

      setNodePosition: (topicId, position) =>
        set((state) => ({
          positions: { ...state.positions, [topicId]: position },
        })),

      resetLayout: () =>
        set((state) => ({
          positions: {},
          layoutResetKey: state.layoutResetKey + 1,
        })),

      selectTopic: (topicId, focus = false) =>
        set((state) => ({
          selectedTopicId: topicId,
          focusRequest:
            topicId && focus
              ? { topicId, requestId: (state.focusRequest?.requestId ?? 0) + 1 }
              : state.focusRequest,
        })),

      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: "mapa-programacion-estructurada",
      version: 1,
      partialize: (state) => ({
        progress: state.progress,
        positions: state.positions,
        themePreference: state.themePreference,
      }),
    },
  ),
);
