import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { Plan } from "../../content/types";
import {
  getAncestorIds,
  getCourseById,
  getEquivalentTopics,
  getModule,
  getTopicStatus,
  getVisibleTopics,
} from "../../lib/graph";
import { NODE_HEIGHT, NODE_WIDTH, calculateLayout } from "../../lib/layout";
import { usePrefersReducedMotion, useResolvedTheme } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";
import { TopicNode, type TopicFlowNode, type TopicNodeData } from "./TopicNode";

const nodeTypes = { topic: TopicNode };

/** Medidas del panel del tema (ver TopicPanel): ancho más margen en escritorio, alto máximo en celular. */
const PANEL_DESKTOP_WIDTH = 472;
const PANEL_MOBILE_HEIGHT = 0.58;

interface CourseMapProps {
  plan: Plan;
}

export function CourseMap({ plan }: CourseMapProps) {
  const resolvedTheme = useResolvedTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const progress = useAppStore((state) => state.progress);
  const courseFilter = useAppStore((state) => state.courseFilter);
  const allPositions = useAppStore((state) => state.positions);
  const selectedTopicId = useAppStore((state) => state.selectedTopicId);
  const focusRequest = useAppStore((state) => state.focusRequest);
  const layoutResetKey = useAppStore((state) => state.layoutResetKey);
  const setNodePosition = useAppStore((state) => state.setNodePosition);
  const resetLayout = useAppStore((state) => state.resetLayout);
  const selectTopic = useAppStore((state) => state.selectTopic);
  const clearFocusRequest = useAppStore((state) => state.clearFocusRequest);

  const flowRef = useRef<ReactFlowInstance<TopicFlowNode, Edge> | null>(null);
  const [flowReady, setFlowReady] = useState(false);
  // Si el mapa se monta para mostrar un tema (cambio automático de materia), se va directo
  // a él sin el fitView inicial; si no, se verían dos movimientos seguidos.
  const [focusOnMount] = useState(() => useAppStore.getState().focusRequest !== null);
  const hasFocusedRef = useRef(false);

  const savedPositions = useMemo(
    () => allPositions[courseFilter] ?? {},
    [allPositions, courseFilter],
  );
  const visible = useMemo(() => getVisibleTopics(plan, courseFilter), [plan, courseFilter]);
  const mapTopics = useMemo(() => [...visible.topics, ...visible.external], [visible]);
  const mapIds = useMemo(() => new Set(mapTopics.map((topic) => topic.id)), [mapTopics]);
  const externalIds = useMemo(
    () => new Set(visible.external.map((topic) => topic.id)),
    [visible.external],
  );
  const layout = useMemo(() => calculateLayout(mapTopics), [mapTopics]);

  const highlightedIds = useMemo(() => {
    if (!selectedTopicId || !mapIds.has(selectedTopicId)) {
      return null;
    }
    const ids = getAncestorIds(plan, selectedTopicId);
    ids.add(selectedTopicId);
    return ids;
  }, [mapIds, plan, selectedTopicId]);

  const equivalentIds = useMemo(() => {
    if (!highlightedIds || !selectedTopicId) {
      return new Set<string>();
    }
    return new Set(
      getEquivalentTopics(plan, selectedTopicId)
        .map((topic) => topic.id)
        .filter((id) => mapIds.has(id)),
    );
  }, [highlightedIds, mapIds, plan, selectedTopicId]);

  const computedNodes = useMemo<TopicFlowNode[]>(() => {
    const nodes: TopicFlowNode[] = [];

    for (const topic of mapTopics) {
      const course = getCourseById(plan, topic.courseId);
      if (!course) {
        continue;
      }

      const position = savedPositions[topic.id] ?? layout.positions[topic.id] ?? { x: 0, y: 0 };
      const isEquivalent = equivalentIds.has(topic.id);

      nodes.push({
        id: topic.id,
        type: "topic",
        position,
        draggable: true,
        selectable: false,
        focusable: false,
        style: { width: NODE_WIDTH },
        data: {
          topic,
          course,
          moduleName: getModule(course, topic.module)?.name ?? topic.module,
          status: getTopicStatus(topic, progress),
          isSelected: selectedTopicId === topic.id,
          isDimmed: highlightedIds !== null && !highlightedIds.has(topic.id) && !isEquivalent,
          isExternal: externalIds.has(topic.id),
          isEquivalent,
        },
      });
    }

    return nodes;
  }, [
    equivalentIds,
    externalIds,
    highlightedIds,
    layout.positions,
    mapTopics,
    plan,
    progress,
    savedPositions,
    selectedTopicId,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState<TopicFlowNode>(computedNodes);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];

    for (const topic of visible.topics) {
      for (const requirementId of topic.requires) {
        if (!mapIds.has(requirementId)) {
          continue;
        }
        const isActive =
          highlightedIds !== null &&
          highlightedIds.has(topic.id) &&
          highlightedIds.has(requirementId);
        const isDimmed = highlightedIds !== null && !isActive;
        const color = isActive
          ? "var(--edge-active)"
          : isDimmed
            ? "var(--edge-dim)"
            : "var(--edge-default)";

        result.push({
          id: `${requirementId}-${topic.id}`,
          source: requirementId,
          target: topic.id,
          type: "smoothstep",
          className: isActive ? "course-edge course-edge--active" : "course-edge",
          style: {
            stroke: color,
            strokeWidth: isActive ? 2.4 : 1.5,
            strokeDasharray: externalIds.has(requirementId) ? "6 4" : undefined,
            opacity: isDimmed ? 0.45 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
            width: 18,
            height: 18,
          },
        });
      }
    }

    // Las equivalencias no son requisitos: se dibujan punteadas y sin flecha.
    if (selectedTopicId) {
      for (const equivalentId of equivalentIds) {
        result.push({
          id: `eq-${selectedTopicId}-${equivalentId}`,
          source: selectedTopicId,
          target: equivalentId,
          type: "straight",
          className: "course-edge course-edge--equivalent",
          style: { stroke: "var(--edge-equivalent)", strokeWidth: 2, strokeDasharray: "2 6" },
        });
      }
    }

    return result;
  }, [equivalentIds, externalIds, highlightedIds, mapIds, selectedTopicId, visible.topics]);

  const handleNodeDragStop: OnNodeDrag<TopicFlowNode> = useCallback(
    (_event, node) => {
      setNodePosition(node.id, node.position);
    },
    [setNodePosition],
  );

  useEffect(() => {
    if (layoutResetKey === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      flowRef.current?.fitView({
        padding: 0.16,
        duration: prefersReducedMotion ? 0 : 450,
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [layoutResetKey, prefersReducedMotion]);

  useEffect(() => {
    if (!focusRequest || !flowReady) {
      return;
    }

    const position = savedPositions[focusRequest.topicId] ?? layout.positions[focusRequest.topicId];
    const instance = flowRef.current;
    clearFocusRequest();
    if (!position || !instance) {
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    // setCenter pone el punto en el centro del mapa. Se desplaza la mitad de lo que tapa
    // el panel para que el tema quede centrado en la parte que sí se ve.
    const zoom = isDesktop ? 1 : 0.85;
    const xOffset = isDesktop ? PANEL_DESKTOP_WIDTH / 2 / zoom : 0;
    const yOffset = isDesktop ? 0 : (window.innerHeight * PANEL_MOBILE_HEIGHT) / 2 / zoom;
    const instant = prefersReducedMotion || (focusOnMount && !hasFocusedRef.current);
    hasFocusedRef.current = true;

    instance.setCenter(
      position.x + NODE_WIDTH / 2 + xOffset,
      position.y + NODE_HEIGHT / 2 + yOffset,
      {
        zoom,
        duration: instant ? 0 : 400,
      },
    );
  }, [
    clearFocusRequest,
    flowReady,
    focusOnMount,
    focusRequest,
    layout.positions,
    prefersReducedMotion,
    savedPositions,
  ]);

  const minimapNodeColor = (node: Node): string => {
    const data = node.data as TopicNodeData;
    return data.course.color[resolvedTheme];
  };

  return (
    <div className="relative h-full w-full" data-guide="map">
      <ReactFlow<TopicFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={() => selectTopic(null)}
        onInit={(instance) => {
          flowRef.current = instance;
          setFlowReady(true);
        }}
        fitView={!focusOnMount}
        fitViewOptions={{ padding: 0.16 }}
        minZoom={0.08}
        maxZoom={1.8}
        nodesConnectable={false}
        edgesFocusable={false}
        colorMode={resolvedTheme}
        className="course-flow"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color={resolvedTheme === "dark" ? "#334155" : "#cbd5e1"}
        />
        <Controls showInteractive={false} />
        <MiniMap
          ariaLabel="Vista general del mapa"
          nodeColor={minimapNodeColor}
          nodeStrokeColor={minimapNodeColor}
          nodeStrokeWidth={2}
          maskColor={
            resolvedTheme === "dark" ? "rgba(2, 6, 23, 0.72)" : "rgba(241, 245, 249, 0.7)"
          }
          pannable
          zoomable
          className="course-minimap"
        />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-start p-3">
        <button
          type="button"
          onClick={resetLayout}
          className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
          aria-label="Restablecer la disposición automática del mapa"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M4 7V3m0 4h4M4 7a7 7 0 1 1-1 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Restablecer disposición</span>
          <span className="sm:hidden">Restablecer</span>
        </button>
      </div>
    </div>
  );
}
