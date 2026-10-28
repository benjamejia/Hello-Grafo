import type { Topic } from "../../../content/types";
import { ExampleBlock } from "../ExampleBlock";
import { EmptyTab } from "./EmptyTab";

interface LearnTabProps {
  topic: Topic;
}

export function LearnTab({ topic }: LearnTabProps) {
  const mistakes = topic.commonMistakes ?? [];
  const hasContent =
    Boolean(topic.prior) || Boolean(topic.why) || topic.examples.length > 0 || mistakes.length > 0;

  if (!hasContent) {
    return <EmptyTab>Este tema todavía no tiene explicación ni ejemplos.</EmptyTab>;
  }

  return (
    <div className="space-y-5">
      {topic.prior ? (
        <section aria-labelledby="panel-prior">
          <h3 id="panel-prior" className="panel-heading">
            Conocimientos previos
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {topic.prior}
          </p>
        </section>
      ) : null}

      {topic.why ? (
        <section aria-labelledby="panel-why">
          <h3 id="panel-why" className="panel-heading">
            Por qué está aquí
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {topic.why}
          </p>
        </section>
      ) : null}

      {topic.examples.length > 0 ? (
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
      ) : null}

      {mistakes.length > 0 ? (
        <section aria-labelledby="panel-mistakes">
          <h3 id="panel-mistakes" className="panel-heading">
            Errores comunes
          </h3>
          <ul className="mt-2 space-y-2">
            {mistakes.map((item, index) => (
              <li
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-800/50"
              >
                <p className="flex gap-2 font-medium text-rose-800 dark:text-rose-300">
                  <span aria-hidden="true">✗</span>
                  <span>
                    <span className="sr-only">Error: </span>
                    {item.mistake}
                  </span>
                </p>
                <p className="mt-1.5 flex gap-2 text-slate-700 dark:text-slate-200">
                  <span aria-hidden="true" className="text-emerald-700 dark:text-emerald-400">
                    ✓
                  </span>
                  <span>
                    <span className="sr-only">Cómo evitarlo: </span>
                    {item.fix}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
