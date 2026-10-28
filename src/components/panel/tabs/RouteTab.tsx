import type { Plan, Topic } from "../../../content/types";
import {
  getCourseById,
  getEquivalentTopics,
  getNextTopics,
  getTopicById,
} from "../../../lib/graph";
import { useGoToTopic } from "../../../lib/navigation";
import { useAppStore } from "../../../store/useAppStore";
import { TopicChip } from "../TopicChip";

interface RouteTabProps {
  plan: Plan;
  topic: Topic;
}

export function RouteTab({ plan, topic }: RouteTabProps) {
  const progress = useAppStore((state) => state.progress);
  const goToTopic = useGoToTopic(plan);

  const prerequisites = topic.requires
    .map((id) => getTopicById(plan, id))
    .filter((item): item is Topic => item !== undefined);
  const nextTopics = getNextTopics(plan, topic.id);
  const equivalents = getEquivalentTopics(plan, topic.id);

  /** Nombre corto de la materia cuando el tema enlazado es de otra. */
  const otherCourseLabel = (other: Topic): string | null =>
    other.courseId === topic.courseId
      ? null
      : (getCourseById(plan, other.courseId)?.shortTitle ?? other.courseId);

  const describe = (other: Topic, prefix: string): string => {
    const courseLabel = otherCourseLabel(other);
    return `${prefix}${other.title}${courseLabel ? `, de ${courseLabel}` : ""}${
      progress[other.id] === true ? ", ya dominado" : ""
    }`;
  };

  return (
    <div className="space-y-5">
      <section aria-labelledby="panel-prerequisites">
        <h3 id="panel-prerequisites" className="panel-heading">
          Necesitas saber antes
        </h3>
        {prerequisites.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prerequisites.map((prerequisite) => {
              const completed = progress[prerequisite.id] === true;
              return (
                <TopicChip
                  key={prerequisite.id}
                  title={prerequisite.title}
                  courseLabel={otherCourseLabel(prerequisite)}
                  completed={completed}
                  tone={completed ? "done" : "neutral"}
                  ariaLabel={describe(prerequisite, "Ir a ")}
                  onClick={() => goToTopic(prerequisite.id)}
                />
              );
            })}
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            No necesita requisitos. Puedes empezar por aquí.
          </p>
        )}
      </section>

      {equivalents.length > 0 ? (
        <section aria-labelledby="panel-equivalents">
          <h3 id="panel-equivalents" className="panel-heading">
            Lo mismo en otro lenguaje
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Esta idea ya aparece en otras materias. Si dominas alguno de estos temas, aquí sobre
            todo cambia la sintaxis.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {equivalents.map((equivalent) => (
              <TopicChip
                key={equivalent.id}
                title={equivalent.title}
                courseLabel={getCourseById(plan, equivalent.courseId)?.shortTitle}
                completed={progress[equivalent.id] === true}
                tone="equivalent"
                ariaLabel={describe(equivalent, "Ir al tema equivalente: ")}
                onClick={() => goToTopic(equivalent.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="panel-next">
        <h3 id="panel-next" className="panel-heading">
          Te abre la puerta a
        </h3>
        {nextTopics.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {nextTopics.map((nextTopic) => (
              <TopicChip
                key={nextTopic.id}
                title={nextTopic.title}
                courseLabel={otherCourseLabel(nextTopic)}
                tone="next"
                arrow
                ariaLabel={describe(nextTopic, "Ir al tema siguiente: ")}
                onClick={() => goToTopic(nextTopic.id)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Aquí termina esta rama del mapa.
          </p>
        )}
      </section>
    </div>
  );
}
