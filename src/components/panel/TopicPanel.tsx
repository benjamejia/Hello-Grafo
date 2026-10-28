import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Plan, Topic } from "../../content/types";
import { DIFFICULTY_LABEL, formatHours } from "../../lib/difficulty";
import { getCourseById, getModule, getTopicById } from "../../lib/graph";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useAppStore, type PanelTab } from "../../store/useAppStore";
import { LearnTab } from "./tabs/LearnTab";
import { PracticeTab } from "./tabs/PracticeTab";
import { StudyActions } from "./StudyActions";
import { ResourcesTab } from "./tabs/ResourcesTab";
import { RouteTab } from "./tabs/RouteTab";

interface TopicPanelProps {
  plan: Plan;
}

interface TabDefinition {
  id: PanelTab;
  label: string;
  count: (topic: Topic) => number;
}

const TABS: TabDefinition[] = [
  {
    id: "aprender",
    label: "Aprender",
    count: (topic) => topic.examples.length + (topic.commonMistakes?.length ?? 0),
  },
  {
    id: "practicar",
    label: "Practicar",
    count: (topic) => (topic.exercises?.length ?? 0) + (topic.checklist?.length ?? 0),
  },
  { id: "recursos", label: "Recursos", count: (topic) => topic.resources?.length ?? 0 },
  { id: "ruta", label: "Ruta", count: (topic) => topic.requires.length },
];

export function TopicPanel({ plan }: TopicPanelProps) {
  const selectedTopicId = useAppStore((state) => state.selectedTopicId);
  const panelTab = useAppStore((state) => state.panelTab);
  const setPanelTab = useAppStore((state) => state.setPanelTab);
  const selectTopic = useAppStore((state) => state.selectTopic);
  const tabRefs = useRef<Partial<Record<PanelTab, HTMLButtonElement | null>>>({});

  const topic = selectedTopicId ? getTopicById(plan, selectedTopicId) : undefined;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        selectTopic(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectTopic]);

  // Un tema en construcción solo tiene la ruta; abrirlo ahí evita una pestaña vacía.
  useEffect(() => {
    if (topic?.draft) {
      setPanelTab("ruta");
    }
  }, [topic, setPanelTab]);

  if (!topic) {
    return null;
  }

  const course = getCourseById(plan, topic.courseId);
  if (!course) {
    return null;
  }

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const index = TABS.findIndex((tab) => tab.id === panelTab);
    const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) {
      return;
    }
    event.preventDefault();
    const next = TABS[(index + offset + TABS.length) % TABS.length].id;
    setPanelTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <aside
      aria-labelledby="topic-panel-title"
      className="absolute inset-x-0 bottom-0 z-30 flex max-h-[58dvh] flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-10px_40px_-18px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 lg:inset-y-3 lg:bottom-3 lg:left-auto lg:right-3 lg:max-h-none lg:w-[460px] lg:rounded-2xl lg:border"
    >
      <div className="border-b border-slate-200 px-4 pt-2.5 dark:border-slate-700 sm:px-5 lg:pt-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600 lg:hidden" />
            <span className="group-badge" style={getGroupCssVariables(course)}>
              <span className="group-dot" style={getGroupCssVariables(course)} aria-hidden="true" />
              {course.title} · {getModule(course, topic.module)?.name ?? topic.module}
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

            {topic.difficulty || topic.estimatedHours || topic.draft ? (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Datos del tema">
                {topic.difficulty ? (
                  <li className={`level-badge level-badge--${topic.difficulty}`}>
                    {DIFFICULTY_LABEL[topic.difficulty]}
                  </li>
                ) : null}
                {topic.estimatedHours ? (
                  <li className="meta-badge" title="Tiempo aproximado de estudio y práctica">
                    {formatHours(topic.estimatedHours)}
                  </li>
                ) : null}
                {topic.draft ? <li className="meta-badge meta-badge--draft">En construcción</li> : null}
              </ul>
            ) : null}
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

        <div
          role="tablist"
          aria-label="Secciones del tema"
          onKeyDown={handleTabKeyDown}
          className="-mb-px mt-3 flex gap-1 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = panelTab === tab.id;
            const count = tab.count(topic);
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                id={`panel-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="panel-tabpanel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setPanelTab(tab.id)}
                className={`panel-tab ${isActive ? "panel-tab--active" : ""}`}
              >
                {tab.label}
                {count > 0 ? <span className="panel-tab__count">{count}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="panel-tabpanel"
        role="tabpanel"
        aria-labelledby={`panel-tab-${panelTab}`}
        tabIndex={0}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-4 focus-visible:outline-none sm:px-5"
      >
        {topic.draft ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            Este tema está en construcción. Ya puedes ver qué necesitas antes y a dónde te lleva;
            la explicación y los ejemplos llegarán pronto.
          </p>
        ) : null}

        {panelTab === "ruta" && course.note ? (
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {course.note}
          </p>
        ) : null}

        {panelTab === "aprender" ? <LearnTab topic={topic} /> : null}
        {panelTab === "practicar" ? <PracticeTab topic={topic} /> : null}
        {panelTab === "recursos" ? <ResourcesTab topic={topic} /> : null}
        {panelTab === "ruta" ? <RouteTab plan={plan} topic={topic} /> : null}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-5">
        <StudyActions plan={plan} topic={topic} />
      </div>
    </aside>
  );
}
