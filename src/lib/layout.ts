import dagre from "@dagrejs/dagre";
import type { Topic } from "../content/types";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 108;

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
}

/** Calcula posiciones solo para los temas visibles; ignora requisitos fuera de la vista. */
export function calculateLayout(topics: Topic[]): LayoutResult {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 34,
    ranksep: 92,
    marginx: 32,
    marginy: 32,
  });

  const ids = new Set(topics.map((topic) => topic.id));

  for (const topic of topics) {
    graph.setNode(topic.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const topic of topics) {
    for (const requirementId of topic.requires) {
      if (ids.has(requirementId)) {
        graph.setEdge(requirementId, topic.id);
      }
    }
  }

  dagre.layout(graph);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const topic of topics) {
    const node = graph.node(topic.id) as { x: number; y: number } | undefined;
    if (node) {
      positions[topic.id] = {
        x: node.x - NODE_WIDTH / 2,
        y: node.y - NODE_HEIGHT / 2,
      };
    }
  }

  const graphLabel = graph.graph() as { width?: number; height?: number };
  return {
    positions,
    width: graphLabel.width ?? 0,
    height: graphLabel.height ?? 0,
  };
}
