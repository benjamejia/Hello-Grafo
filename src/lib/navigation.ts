import { useCallback, useMemo } from "react";
import type { Plan, Topic } from "../content/types";
import { useAppStore } from "../store/useAppStore";
import { getTopicById, getVisibleTopics, suggestNextTopic } from "./graph";

/**
 * Selecciona un tema y, si no se ve en la vista actual, cambia a su materia.
 * Ese cambio es automático: no modifica la meta del alumno.
 */
export function useGoToTopic(plan: Plan): (topicId: string) => void {
  const courseFilter = useAppStore((state) => state.courseFilter);
  const setCourseFilter = useAppStore((state) => state.setCourseFilter);
  const selectTopic = useAppStore((state) => state.selectTopic);

  return useCallback(
    (topicId: string) => {
      const topic = getTopicById(plan, topicId);
      if (!topic) {
        return;
      }
      const { topics, external } = getVisibleTopics(plan, courseFilter);
      const isVisible = [...topics, ...external].some((item) => item.id === topicId);
      if (!isVisible) {
        setCourseFilter(topic.courseId, { auto: true });
      }
      selectTopic(topicId, true);
    },
    [courseFilter, plan, selectTopic, setCourseFilter],
  );
}

/** Siguiente tema hacia la meta, continuando desde `fromTopicId` o desde el último dominado. */
export function useNextTopic(plan: Plan, fromTopicId?: string): Topic | undefined {
  const goalCourse = useAppStore((state) => state.goalCourse);
  const progress = useAppStore((state) => state.progress);
  const lastCompletedId = useAppStore((state) => state.lastCompletedId);
  const from = fromTopicId ?? lastCompletedId;

  return useMemo(
    () => suggestNextTopic(plan, goalCourse, progress, from),
    [plan, goalCourse, progress, from],
  );
}

/** Abre un tema para estudiarlo: lo enfoca y muestra la pestaña Aprender si tiene contenido. */
export function useStudyTopic(plan: Plan): (topic: Topic) => void {
  const goToTopic = useGoToTopic(plan);
  const setPanelTab = useAppStore((state) => state.setPanelTab);

  return useCallback(
    (topic: Topic) => {
      goToTopic(topic.id);
      setPanelTab(topic.draft ? "ruta" : "aprender");
    },
    [goToTopic, setPanelTab],
  );
}
