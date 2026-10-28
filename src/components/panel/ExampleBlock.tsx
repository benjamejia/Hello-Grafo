import type { Example } from "../../content/types";

interface ExampleBlockProps {
  example: Example;
}

const LANGUAGE_LABEL: Record<Example["language"], string> = {
  c: "Lenguaje C",
  java: "Java",
  csharp: "C#",
  javascript: "JavaScript",
  php: "PHP",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  pseudocode: "Seudocódigo",
  text: "Texto",
};

export function ExampleBlock({ example }: ExampleBlockProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {example.title}
        </h4>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
          {LANGUAGE_LABEL[example.language]}
        </span>
      </div>

      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {example.explanation}
      </p>

      <pre
        tabIndex={0}
        aria-label={`Código de ejemplo: ${example.title}`}
        className="mt-3 max-h-80 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <code>{example.code}</code>
      </pre>

      {example.output ? (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Salida esperada
          </p>
          <pre
            tabIndex={0}
            aria-label={`Salida esperada: ${example.title}`}
            className="max-h-52 overflow-x-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:focus-visible:ring-indigo-400"
          >
            <code>{example.output}</code>
          </pre>
        </div>
      ) : null}
    </article>
  );
}
