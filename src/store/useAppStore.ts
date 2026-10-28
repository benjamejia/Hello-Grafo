import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CourseFilter } from "../content/types";

export type ThemePreference = "system" | "light" | "dark";

export interface NodePosition {
  x: number;
  y: number;
}

export function checklistKey(topicId: string, index: number): string {
  return `${topicId}#${index}`;
}

export type PanelTab ="ruta" | "aprender" | "practicar" | "recursos";

export interface FocusRequest {
  topicId: string;
  requestId: number;
}

interface AppState {
  progress: Record<string, boolean>;
  /** Posiciones arrastradas por el usuario, separadas por vista (filtro de materia). */
  positions: Record<CourseFilter, Record<string, NodePosition>>;
  themePreference: ThemePreference;
  courseFilter: CourseFilter;
  /**
   * Materia que el alumno eligió estudiar. "Siguiente paso" calcula la ruta hacia ella,
   * aunque la vista cambie sola a otra materia para mostrar un requisito.
   */
  goalCourse: CourseFilter;
  /** Último tema marcado como dominado; el siguiente paso intenta continuar desde ahí. */
  lastCompletedId: string | null;
  selectedTopicId: string | null;
  focusRequest: FocusRequest | null;
  layoutResetKey: number;
  panelTab: PanelTab;
  /** Casillas de autoevaluación marcadas; la clave sale de checklistKey(). */
  checklist: Record<string, boolean>;
  onboardingDone: boolean;
  guideOpen: boolean;
  setTopicCompleted: (topicId: string, completed: boolean) => void;
  toggleTopicCompleted: (topicId: string) => void;
  replaceProgress: (progress: Record<string, boolean>) => void;
  resetProgress: () => void;
  setNodePosition: (topicId: string, position: NodePosition) => void;
  resetLayout: () => void;
  /** `auto`: cambio hecho por la app para mostrar un tema; no cambia la meta. */
  setCourseFilter: (filter: CourseFilter, options?: { auto?: boolean }) => void;
  selectTopic: (topicId: string | null, focus?: boolean) => void;
  clearFocusRequest: () => void;
  setThemePreference: (preference: ThemePreference) => void;
  setPanelTab: (tab: PanelTab) => void;
  toggleChecklistItem: (topicId: string, index: number) => void;
  openGuide: () => void;
  closeGuide: () => void;
}

type PersistedState = Pick<
  AppState,
  | "progress"
  | "positions"
  | "themePreference"
  | "courseFilter"
  | "goalCourse"
  | "lastCompletedId"
  | "checklist"
  | "onboardingDone"
>;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      progress: {},
      positions: {},
      themePreference: "system",
      courseFilter: "pe",
      goalCourse: "pe",
      lastCompletedId: null,
      selectedTopicId: null,
      focusRequest: null,
      layoutResetKey: 0,
      panelTab: "aprender",
      checklist: {},
      onboardingDone: false,
      guideOpen: false,

      setTopicCompleted: (topicId, completed) =>
        set((state) => ({
          progress: { ...state.progress, [topicId]: completed },
          lastCompletedId: completed
            ? topicId
            : state.lastCompletedId === topicId
              ? null
              : state.lastCompletedId,
        })),

      toggleTopicCompleted: (topicId) => {
        const current = get().progress[topicId] === true;
        get().setTopicCompleted(topicId, !current);
      },

      replaceProgress: (progress) => set({ progress: { ...progress } }),

      resetProgress: () => set({ progress: {}, lastCompletedId: null }),

      setNodePosition: (topicId, position) =>
        set((state) => ({
          positions: {
            ...state.positions,
            [state.courseFilter]: { ...state.positions[state.courseFilter], [topicId]: position },
          },
        })),

      resetLayout: () =>
        set((state) => ({
          positions: { ...state.positions, [state.courseFilter]: {} },
          layoutResetKey: state.layoutResetKey + 1,
        })),

      setCourseFilter: (courseFilter, options) =>
        set((state) => {
          const goal = options?.auto ? {} : { goalCourse: courseFilter };
          return state.courseFilter === courseFilter
            ? goal
            : { ...goal, courseFilter, selectedTopicId: null, focusRequest: null };
        }),

      selectTopic: (topicId, focus = false) =>
        set((state) => ({
          selectedTopicId: topicId,
          focusRequest:
            topicId && focus
              ? { topicId, requestId: (state.focusRequest?.requestId ?? 0) + 1 }
              : state.focusRequest,
        })),

      clearFocusRequest: () => set({ focusRequest: null }),

      setThemePreference: (themePreference) => set({ themePreference }),

      setPanelTab: (panelTab) => set({ panelTab }),

      toggleChecklistItem: (topicId, index) =>
        set((state) => {
          const key = checklistKey(topicId, index);
          return { checklist: { ...state.checklist, [key]: state.checklist[key] !== true } };
        }),

      openGuide: () => set({ guideOpen: true, selectedTopicId: null }),

      closeGuide: () => set({ guideOpen: false, onboardingDone: true }),
    }),
    {
      name: "mapa-programacion-estructurada",
      version: 3,
      partialize: (state): PersistedState => ({
        progress: state.progress,
        positions: state.positions,
        themePreference: state.themePreference,
        courseFilter: state.courseFilter,
        goalCourse: state.goalCourse,
        lastCompletedId: state.lastCompletedId,
        checklist: state.checklist,
        onboardingDone: state.onboardingDone,
      }),
      migrate: (persisted, version) => {
        if (version < 2) {
          // v1 solo tenía Programación Estructurada con ids sin prefijo.
          const old = persisted as { progress?: Record<string, boolean>; themePreference?: ThemePreference };
          const progress: Record<string, boolean> = {};
          for (const [id, value] of Object.entries(old.progress ?? {})) {
            progress[/^p\d+$/.test(id) ? `fund.${id}` : `pe.${id}`] = value;
          }
          return {
            progress,
            positions: {},
            themePreference: old.themePreference ?? "system",
            courseFilter: "pe",
            goalCourse: "pe",
            lastCompletedId: null,
            checklist: {},
            onboardingDone: false,
          } satisfies PersistedState;
        }
        if (version < 3) {
          // v2 no tenía meta: se toma la materia que estaba viendo.
          const old = persisted as Omit<PersistedState, "goalCourse" | "lastCompletedId">;
          return {
            ...old,
            goalCourse: old.courseFilter ?? "pe",
            lastCompletedId: null,
          } satisfies PersistedState;
        }
        return persisted as PersistedState;
      },
    },
  ),
);
