import { useMemo } from "react";
import type { Course } from "../../content/types";
import {
  getCompletedCount,
  getNextAvailableTopic,
} from "../../lib/graph";
import { useAppStore } from "../../store/useAppStore";
import { Legend } from "./Legend";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  course: Course;
}

export function Header({ course }: HeaderProps) {
  const progress = useAppStore((state) => state.progress);
  const resetProgress = useAppStore((state) => state.resetProgress);
  const selectTopic = useAppStore((state) => state.selectTopic);

  const completed = useMemo(
    () => getCompletedCount(course, progress),
    [course, progress],
  );
  const total = course.topics.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const nextTopic = useMemo(
    () => getNextAvailableTopic(course, progress),
    [course, progress],
  );

  const handleResetProgress = (): void => {
    const confirmed = window.confirm(
      "¿Reiniciar el progreso? Se quitarán todas las marcas de temas dominados. La disposición del mapa se conservará.",
    );
    if (confirmed) {
      resetProgress();
    }
  };

  return (
    <header className="z-40 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-4">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-5 gap-y-2">
        <div className="min-w-0 flex-1 basis-64">
          <div className="flex items-center gap-2.5">
            <span
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-500 sm:flex"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="5" cy="7" r="2.2" />
                <circle cx="19" cy="7" r="2.2" />
                <circle cx="12" cy="17" r="2.2" />
                <path d="M7 8.5 10.4 15M17 8.5 13.6 15M7.2 7h9.6" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {course.title}
                </h1>
                <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:inline">
                  {course.subtitle}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <div
                  role="progressbar"
                  aria-label={`Progreso: ${completed} de ${total} temas dominados`}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={completed}
                  className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 sm:w-40"
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 dark:bg-indigo-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{completed}</span>{" "}
                  de {total} temas dominados
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (nextTopic) {
                selectTopic(nextTopic.id, true);
              }
            }}
            disabled={!nextTopic}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            aria-label="Ver mi siguiente paso, el primer tema disponible"
            title={nextTopic ? `Siguiente paso: ${nextTopic.title}` : "No hay temas disponibles"}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 10h11m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Ver mi siguiente paso</span>
            <span className="sm:hidden">Siguiente paso</span>
          </button>

          <button
            type="button"
            onClick={handleResetProgress}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
            aria-label="Reiniciar todo el progreso"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 7V3m0 4h4M4 7a7 7 0 1 1-1 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Reiniciar progreso</span>
            <span className="sm:hidden">Reiniciar</span>
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-[1800px]">
        <Legend groups={course.groups} />
      </div>
    </header>
  );
}
