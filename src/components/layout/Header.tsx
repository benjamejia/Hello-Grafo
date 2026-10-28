import { useMemo } from "react";
import type { Plan } from "../../content/types";
import { getCompletedCount, getCourseById, getVisibleTopics } from "../../lib/graph";
import { useNextTopic, useStudyTopic } from "../../lib/navigation";
import { useAppStore } from "../../store/useAppStore";
import { CourseFilter } from "./CourseFilter";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  plan: Plan;
}

export function Header({ plan }: HeaderProps) {
  const progress = useAppStore((state) => state.progress);
  const courseFilter = useAppStore((state) => state.courseFilter);
  const resetProgress = useAppStore((state) => state.resetProgress);
  const goalCourse = useAppStore((state) => state.goalCourse);
  const studyTopic = useStudyTopic(plan);
  const nextTopic = useNextTopic(plan);
  const openGuide = useAppStore((state) => state.openGuide);

  const topics = useMemo(
    () => getVisibleTopics(plan, courseFilter).topics,
    [plan, courseFilter],
  );
  const course = courseFilter === "all" ? undefined : getCourseById(plan, courseFilter);
  const scopeLabel = course ? course.title : "toda la ruta";

  const completed = useMemo(() => getCompletedCount(topics, progress), [topics, progress]);
  const total = topics.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const goal = goalCourse === "all" ? undefined : getCourseById(plan, goalCourse);
  const goalLabel = goal ? goal.title : "toda la ruta";

  const handleResetProgress = (): void => {
    const confirmed = window.confirm(
      "¿Reiniciar el progreso? Se quitarán las marcas de temas dominados de todas las materias. La disposición del mapa se conservará.",
    );
    if (confirmed) {
      resetProgress();
    }
  };

  return (
    <header className="z-40 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:py-2.5 dark:border-slate-800 dark:bg-slate-950/95 sm:px-4">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-5 gap-y-2">
        <div className="min-w-0 flex-1 basis-64">
          <div className="flex items-center gap-2.5">
            <span
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-600 sm:flex"
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
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {plan.title}
                </h1>
                <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:inline">
                  {plan.subtitle}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <div
                  role="progressbar"
                  aria-label={`Progreso en ${scopeLabel}: ${completed} de ${total} temas dominados`}
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
                  <span className="hidden sm:inline"> en {scopeLabel}</span>
                </p>
              </div>
            </div>

            {/* En celular, ayuda y tema van junto al título para ahorrar una fila. */}
            <div className="flex shrink-0 gap-2 sm:hidden">
              <HelpButton onClick={openGuide} />
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-wrap">
          <SearchBox plan={plan} />

          <button
            type="button"
            data-guide="next-step"
            onClick={() => {
              if (nextTopic) {
                studyTopic(nextTopic);
              }
            }}
            disabled={!nextTopic}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            aria-label={nextTopic ? `Ver mi siguiente paso: ${nextTopic.title}` : "No hay un siguiente paso"}
            title={
              nextTopic
                ? `Siguiente paso hacia ${goalLabel}: ${nextTopic.title}`
                : `Ya dominas toda la ruta de ${goalLabel}`
            }
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
          </button>

          <button
            type="button"
            onClick={handleResetProgress}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
            aria-label="Reiniciar todo el progreso"
            title="Reiniciar progreso"
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
            <span className="hidden xl:inline">Reiniciar progreso</span>
          </button>

          <div className="hidden sm:contents">
            <HelpButton onClick={openGuide} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-[1800px]" data-guide="filter">
        <CourseFilter courses={plan.courses} />
      </div>
    </header>
  );
}

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
      aria-label="Ver la guía de bienvenida"
      title="Ver la guía"
    >
      ?
    </button>
  );
}
