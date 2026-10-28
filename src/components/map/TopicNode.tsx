import type { KeyboardEvent } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { Course, Topic, TopicStatus } from "../../content/types";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useAppStore } from "../../store/useAppStore";

export type TopicNodeData = {
  topic: Topic;
  course: Course;
  moduleName: string;
  status: TopicStatus;
  isSelected: boolean;
  isDimmed: boolean;
  /** Requisito de otra materia mostrado como referencia en la vista de una materia. */
  isExternal: boolean;
  /** Equivalente en otro lenguaje del tema seleccionado. */
  isEquivalent: boolean;
};

export type TopicFlowNode = Node<TopicNodeData, "topic">;

const STATUS_LABEL: Record<TopicStatus, string> = {
  completed: "Dominado",
  available: "Disponible",
  pending: "Pendiente",
};

export function TopicNode({ data }: NodeProps<TopicFlowNode>) {
  const { topic, course, moduleName, status, isSelected, isDimmed, isExternal, isEquivalent } =
    data;
  const selectTopic = useAppStore((state) => state.selectTopic);

  const className = [
    "topic-node",
    `topic-node--${status}`,
    isSelected ? "topic-node--selected" : "",
    isDimmed ? "topic-node--dimmed" : "",
    isExternal ? "topic-node--external" : "",
    isEquivalent ? "topic-node--equivalent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      selectTopic(topic.id);
    }
  };

  const label = isExternal ? `${course.shortTitle} · requisito externo` : moduleName;

  return (
    <div
      className={className}
      style={getGroupCssVariables(course)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${topic.title}. ${course.title}, ${moduleName}. Estado: ${STATUS_LABEL[status]}.${
        topic.draft ? " Contenido en construcción." : ""
      }`}
      onClick={(event) => {
        event.stopPropagation();
        selectTopic(topic.id);
      }}
      onKeyDown={handleKeyDown}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="topic-handle"
        isConnectable={false}
      />

      <div className="flex items-start gap-2.5">
        <span className="topic-node__dot" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="topic-node__group">{label}</p>
          <p className="topic-node__title">{topic.title}</p>
        </div>
        {status === "completed" ? (
          <span className="topic-node__check" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`topic-node__status topic-node__status--${status}`}>
          {STATUS_LABEL[status]}
        </span>
        {topic.draft ? (
          <span className="topic-node__count" title="Este tema todavía no tiene contenido completo">
            En construcción
          </span>
        ) : (
          <span className="topic-node__count">
            {topic.requires.length === 0
              ? "Sin requisitos"
              : `${topic.requires.length} requisito${topic.requires.length === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="topic-handle"
        isConnectable={false}
      />
    </div>
  );
}
