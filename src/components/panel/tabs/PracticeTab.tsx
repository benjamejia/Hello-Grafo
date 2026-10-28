import type { Topic } from "../../../content/types";
import { DIFFICULTY_LABEL } from "../../../lib/difficulty";
import { checklistKey, useAppStore } from "../../../store/useAppStore";
import { EmptyTab } from "./EmptyTab";

interface PracticeTabProps {
  topic: Topic;
}

export function PracticeTab({ topic }: PracticeTabProps) {
  const checklistState = useAppStore((state) => state.checklist);
  const toggleChecklistItem = useAppStore((state) => state.toggleChecklistItem);

  const exercises = topic.exercises ?? [];
  const checklist = topic.checklist ?? [];

  if (exercises.length === 0 && checklist.length === 0) {
    return <EmptyTab>Todavía no hay ejercicios ni autoevaluación para este tema.</EmptyTab>;
  }

  return (
    <div className="space-y-5">
      {exercises.length > 0 ? (
        <section aria-labelledby="panel-exercises">
          <h3 id="panel-exercises" className="panel-heading">
            Ejercicios
          </h3>
          <ol className="mt-2 space-y-2">
            {exercises.map((exercise, index) => (
              <li
                key={index}
                className="rounded-xl border border-slate-200 p-3 text-sm leading-relaxed dark:border-slate-700"
              >
                <div className="flex items-start gap-2">
                  <span className={`level-badge level-badge--${exercise.level}`}>
                    {DIFFICULTY_LABEL[exercise.level]}
                  </span>
                  <p className="min-w-0 flex-1 text-slate-700 dark:text-slate-200">
                    {exercise.prompt}
                  </p>
                </div>
                {exercise.hint ? (
                  <details className="mt-2 text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      Ver pista
                    </summary>
                    <p className="mt-1.5 font-mono text-xs">{exercise.hint}</p>
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {checklist.length > 0 ? (
        <section aria-labelledby="panel-checklist">
          <h3 id="panel-checklist" className="panel-heading">
            ¿Ya lo dominas?
          </h3>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            Marca lo que ya puedes hacer sin ayuda.
          </p>
          <ul className="mt-2 space-y-1.5">
            {checklist.map((item, index) => {
              const id = `check-${topic.id}-${index}`;
              return (
                <li key={index}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={checklistState[checklistKey(topic.id, index)] === true}
                      onChange={() => toggleChecklistItem(topic.id, index)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                    />
                    <span>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
