import { useEffect } from "react";
import type { Course, Topic } from "../../content/types";
import { getGroupCssVariables } from "../../lib/groupStyle";
import {
  getGroupById,
  getNextTopics,
  getTopicById,
} from "../../lib/graph";
import { useAppStore } from "../../store/useAppStore";
import { ExampleBlock } from "./ExampleBlock";

interface TopicPanelProps {
  course: Course;
}

export function TopicPanel({ course }: TopicPanelProps) {
  const selectedTopicId = useAppStore((state) => state.selectedTopicId);
  const progress = useAppStore((state) => state.progress);
  const selectTopic = useAppStore((state) => state.selectTopic);
  const toggleTopicCompleted = useAppStore((state) => state.toggleTopicCompleted);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        selectTopic(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectTopic]);

  if (!selectedTopicId) {
    return null;
  }

  const topic = getTopicById(course, selectedTopicId);
  if (!topic) {
    return null;
  }

  const group = getGroupById(course, topic.group);
  if (!group) {
    return null;
  }

  const prerequisites = topic.requires
    .map((id) => getTopicById(course, id))
    .filter((item): item is Topic => item !== undefined);
  const nextTopics = getNextTopics(course, topic.id);
  const isCompleted = progress[topic.id] === true;

  return (
    <aside
      aria-labelledby="topic-panel-title"
      className="absolute inset-x-0 bottom-0 z-30 flex max-h-[64dvh] flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-10px_40px_-18px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 lg:inset-y-3 lg:bottom-3 lg:left-auto lg:right-3 lg:max-h-none lg:w-[430px] lg:rounded-2xl lg:border"
    >
      <div className="flex items-start gap-3 border-b border-slate-200 px-4 pb-3 pt-2.5 dark:border-slate-700 sm:px-5 lg:pt-4">
        <div className="min-w-0 flex-1">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600 lg:hidden" />
          <span className="group-badge" style={getGroupCssVariables(group)}>
            <span className="group-dot" style={getGroupCssVariables(group)} aria-hidden="true" />
            {group.name}
          </span>
          <h2
            id="topic-panel-title"
            className="mt-1.5 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white"
          >
            {topic.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {topic.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={() => selectTopic(null)}
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:ring-indigo-400"
          aria-label="Cerrar tarjeta del tema"
          title="Cerrar"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
        <section aria-labelledby="panel-prerequisites">
          <h3 id="panel-prerequisites" className="panel-heading">
            Necesitas saber antes
          </h3>
          {prerequisites.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prerequisites.map((prerequisite) => {
                const prerequisiteCompleted = progress[prerequisite.id] === true;
                return (
                  <button
                    key={prerequisite.id}
                    type="button"
                    onClick={() => selectTopic(prerequisite.id, true)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 ${
                      prerequisiteCompleted
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                    aria-label={`Ir a ${prerequisite.title}${
                      prerequisiteCompleted ? ", ya dominado" : ""
                    }`}
                  >
                    {prerequisite.title}
                    {prerequisiteCompleted ? (
                      <span aria-hidden="true" className="font-bold">
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              No necesita requisitos. Puedes empezar por aquí.
            </p>
          )}
        </section>

        <section aria-labelledby="panel-prior">
          <h3 id="panel-prior" className="panel-heading">
            Conocimientos previos
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {topic.prior}
          </p>
        </section>

        <section aria-labelledby="panel-why">
          <h3 id="panel-why" className="panel-heading">
            Por qué está aquí
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {topic.why}
          </p>
        </section>

        <section aria-labelledby="panel-examples">
          <h3 id="panel-examples" className="panel-heading">
            Ejemplos
          </h3>
          <div className="mt-2 space-y-3">
            {topic.examples.map((example, index) => (
              <ExampleBlock key={`${topic.id}-${index}`} example={example} />
            ))}
          </div>
        </section>

        <section aria-labelledby="panel-next">
          <h3 id="panel-next" className="panel-heading">
            Te abre la puerta a
          </h3>
          {nextTopics.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nextTopics.map((nextTopic) => (
                <button
                  key={nextTopic.id}
                  type="button"
                  onClick={() => selectTopic(nextTopic.id, true)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/70 dark:focus-visible:ring-indigo-400"
                  aria-label={`Ir al tema siguiente: ${nextTopic.title}`}
                >
                  {nextTopic.title}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Aquí termina esta rama del mapa.
            </p>
          )}
        </section>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-5">
        <button
          type="button"
          onClick={() => toggleTopicCompleted(topic.id)}
          aria-pressed={isCompleted}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900 ${
            isCompleted
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          }`}
        >
          {isCompleted ? (
            <>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quitar marca
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Marcar como dominado
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
