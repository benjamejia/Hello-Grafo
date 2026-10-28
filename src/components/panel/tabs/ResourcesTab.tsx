import type { ResourceType, Topic } from "../../../content/types";
import { EmptyTab } from "./EmptyTab";

const TYPE_LABEL: Record<ResourceType, string> = {
  video: "Video",
  lectura: "Lectura",
  libro: "Libro",
  herramienta: "Herramienta",
  practica: "Práctica",
};

interface ResourcesTabProps {
  topic: Topic;
}

export function ResourcesTab({ topic }: ResourcesTabProps) {
  const resources = topic.resources ?? [];

  if (resources.length === 0) {
    return <EmptyTab>Todavía no hay recursos recomendados para este tema.</EmptyTab>;
  }

  return (
    <ul className="space-y-2" aria-label="Recursos recomendados">
      {resources.map((resource, index) => (
        <li
          key={index}
          className="rounded-xl border border-slate-200 p-3 text-sm leading-relaxed dark:border-slate-700"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {TYPE_LABEL[resource.type]}
          </span>
          <p className="font-medium text-slate-900 dark:text-white">
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-600 dark:text-indigo-300 dark:decoration-indigo-700"
              >
                {resource.title}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : (
              resource.title
            )}
          </p>
          {resource.note ? (
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">{resource.note}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
