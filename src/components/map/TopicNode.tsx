import type { KeyboardEvent } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { GroupDefinition, Topic, TopicStatus } from "../../content/types";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useAppStore } from "../../store/useAppStore";

export type TopicNodeData = {
  topic: Topic;
  group: GroupDefinition;
  status: TopicStatus;
  isSelected: boolean;
  isDimmed: boolean;
};

export type TopicFlowNode = Node<TopicNodeData, "topic">;

const STATUS_LABEL: Record<TopicStatus, string> = {
  completed: "Dominado",
  available: "Disponible",
  pending: "Pendiente",
};

export function TopicNode({ data }: NodeProps<TopicFlowNode>) {
  const { topic, group, status, isSelected, isDimmed } = data;
  const selectTopic = useAppStore((state) => state.selectTopic);

  const className = [
    "topic-node",
    `topic-node--${status}`,
    isSelected ? "topic-node--selected" : "",
    isDimmed ? "topic-node--dimmed" : "",
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

  return (
    <div
      className={className}
      style={getGroupCssVariables(group)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${topic.title}. Grupo ${group.name}. Estado: ${STATUS_LABEL[status]}.`}
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
          <p className="topic-node__group">{group.name}</p>
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
        <span className="topic-node__count">
          {topic.requires.length === 0
            ? "Sin requisitos"
            : `${topic.requires.length} requisito${topic.requires.length === 1 ? "" : "s"}`}
        </span>
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
