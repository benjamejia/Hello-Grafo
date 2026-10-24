import dagre from "@dagrejs/dagre";
import type { Course } from "../content/types";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 108;

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
}

export function calculateLayout(course: Course): LayoutResult {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 34,
    ranksep: 92,
    marginx: 32,
    marginy: 32,
  });

  for (const topic of course.topics) {
    graph.setNode(topic.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const topic of course.topics) {
    for (const requirementId of topic.requires) {
      graph.setEdge(requirementId, topic.id);
    }
  }

  dagre.layout(graph);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const topic of course.topics) {
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
