import type { Plan } from "../../content/types";
import { getCourseById } from "../../lib/graph";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useNextTopic, useStudyTopic } from "../../lib/navigation";
import { useAppStore } from "../../store/useAppStore";

interface NextStepDockProps {
  plan: Plan;
}

/** Acceso al siguiente paso desde el mapa, sin subir a la cabecera. Se oculta con el panel o la guía abiertos. */
export function NextStepDock({ plan }: NextStepDockProps) {
  const selectedTopicId = useAppStore((state) => state.selectedTopicId);
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const guideOpen = useAppStore((state) => state.guideOpen);
  const nextTopic = useNextTopic(plan);
  const studyTopic = useStudyTopic(plan);

  if (selectedTopicId || !onboardingDone || guideOpen || !nextTopic) {
    return null;
  }

  const course = getCourseById(plan, nextTopic.courseId);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[104px] z-20 flex justify-center px-4 lg:bottom-4">
      <button
        type="button"
        onClick={() => studyTopic(nextTopic)}
        className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full border border-indigo-200 bg-white/95 py-2 pl-4 pr-2 text-left shadow-lg backdrop-blur transition-colors hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-slate-900/95 dark:hover:border-indigo-500"
        aria-label={`Continuar con ${nextTopic.title}`}
      >
        {course ? <span className="group-dot" style={getGroupCssVariables(course)} aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Continuar{course ? ` · ${course.shortTitle}` : ""}
          </span>
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {nextTopic.title}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-600"
        >
          →
        </span>
      </button>
    </div>
  );
}
