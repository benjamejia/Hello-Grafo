import type { Plan, Topic } from "../../content/types";
import { getCourseById, getMissingPath, isTopicAvailable } from "../../lib/graph";
import { useNextTopic, useStudyTopic } from "../../lib/navigation";
import { checklistKey, useAppStore } from "../../store/useAppStore";

interface StudyActionsProps {
  plan: Plan;
  topic: Topic;
}

const PRIMARY =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900";
const LINK =
  "rounded text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-slate-100";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pie del panel: lo que el alumno puede hacer con este tema ahora mismo.
 * - Ya dominado: celebra y ofrece el siguiente paso ahí mismo.
 * - Le faltan requisitos: dice cuántos y por dónde empezar.
 * - Disponible: marcarlo como dominado.
 */
export function StudyActions({ plan, topic }: StudyActionsProps) {
  const progress = useAppStore((state) => state.progress);
  const checklistState = useAppStore((state) => state.checklist);
  const toggleTopicCompleted = useAppStore((state) => state.toggleTopicCompleted);
  const studyTopic = useStudyTopic(plan);
  const nextTopic = useNextTopic(plan, topic.id);

  const isCompleted = progress[topic.id] === true;

  if (isCompleted) {
    const nextCourse = nextTopic ? getCourseById(plan, nextTopic.courseId) : undefined;
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400" role="status">
            <CheckIcon />
            ¡Dominaste este tema!
          </p>
          <button type="button" onClick={() => toggleTopicCompleted(topic.id)} className={LINK}>
            Quitar marca
          </button>
        </div>
        {nextTopic ? (
          <button type="button" onClick={() => studyTopic(nextTopic)} className={`${PRIMARY} justify-between text-left`}>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-indigo-100">
                Siguiente paso
                {nextCourse && nextCourse.id !== topic.courseId ? ` · ${nextCourse.shortTitle}` : ""}
              </span>
              <span className="block truncate">{nextTopic.title}</span>
            </span>
            <span aria-hidden="true" className="text-lg">
              →
            </span>
          </button>
        ) : (
          <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            ¡Terminaste toda la ruta de tu meta! 🎉
          </p>
        )}
      </div>
    );
  }

  const available = isTopicAvailable(topic, progress);
  const { missing, start } = available ? { missing: 0, start: undefined } : getMissingPath(plan, topic, progress);
  const checklist = topic.checklist ?? [];
  const checklistDone =
    checklist.length > 0 &&
    checklist.every((_, index) => checklistState[checklistKey(topic.id, index)] === true);

  return (
    <div className="space-y-2.5">
      {!available ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <p>
            Te {missing === 1 ? "falta 1 tema" : `faltan ${missing} temas`} antes de este.
          </p>
          {start ? (
            <button
              type="button"
              onClick={() => studyTopic(start)}
              className="mt-1 inline-flex items-center gap-1 rounded text-left font-semibold text-amber-950 underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-amber-100"
            >
              Empieza por: {start.title}
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : checklistDone ? (
        <p className="text-center text-xs text-emerald-700 dark:text-emerald-400" role="status">
          Cumpliste toda la autoevaluación. ¿Lo marcas como dominado?
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => toggleTopicCompleted(topic.id)}
        aria-pressed={false}
        className={
          available
            ? PRIMARY
            : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        }
      >
        <CheckIcon />
        {available ? "Marcar como dominado" : "Ya lo domino"}
      </button>
    </div>
  );
}
