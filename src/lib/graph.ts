import type {
  Course,
  CourseFilter,
  CourseModule,
  Plan,
  Topic,
  TopicStatus,
} from "../content/types";

export function getTopicById(plan: Plan, id: string): Topic | undefined {
  return plan.topics.find((topic) => topic.id === id);
}

export function getCourseById(plan: Plan, id: string): Course | undefined {
  return plan.courses.find((course) => course.id === id);
}

export function getModule(course: Course, moduleId: string): CourseModule | undefined {
  return course.modules.find((module) => module.id === moduleId);
}

export function getAncestorIds(plan: Plan, topicId: string): Set<string> {
  const ancestors = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): void => {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);

    const topic = getTopicById(plan, id);
    if (!topic) {
      return;
    }

    for (const requirementId of topic.requires) {
      ancestors.add(requirementId);
      visit(requirementId);
    }
  };

  visit(topicId);
  return ancestors;
}

export function getNextTopics(plan: Plan, topicId: string): Topic[] {
  return plan.topics.filter((topic) => topic.requires.includes(topicId));
}

/** Equivalencias en ambos sentidos: si A dice que equivale a B, B también muestra A. */
export function getEquivalentTopics(plan: Plan, topicId: string): Topic[] {
  const topic = getTopicById(plan, topicId);
  const ids = new Set(topic?.equivalentTo ?? []);
  for (const other of plan.topics) {
    if (other.equivalentTo.includes(topicId)) {
      ids.add(other.id);
    }
  }
  ids.delete(topicId);
  return plan.topics.filter((other) => ids.has(other.id));
}

export interface VisibleTopics {
  /** Temas de la vista actual. */
  topics: Topic[];
  /** Requisitos directos que pertenecen a otra materia. */
  external: Topic[];
}

export function getVisibleTopics(plan: Plan, filter: CourseFilter): VisibleTopics {
  if (filter === "all") {
    return { topics: plan.topics, external: [] };
  }

  const topics = plan.topics.filter((topic) => topic.courseId === filter);
  const ownIds = new Set(topics.map((topic) => topic.id));
  const externalIds = new Set<string>();
  for (const topic of topics) {
    for (const requirementId of topic.requires) {
      if (!ownIds.has(requirementId)) {
        externalIds.add(requirementId);
      }
    }
  }

  return {
    topics,
    external: plan.topics.filter((topic) => externalIds.has(topic.id)),
  };
}

/**
 * Temas de la vista más todos sus requisitos, aunque sean de otra materia, en el orden de la ruta.
 * Sirve para sugerir el siguiente paso: si te falta algo de una materia anterior, empieza por ahí.
 */
export function getStudyCandidates(plan: Plan, filter: CourseFilter): Topic[] {
  if (filter === "all") {
    return plan.topics;
  }
  const ids = new Set<string>();
  for (const topic of getVisibleTopics(plan, filter).topics) {
    ids.add(topic.id);
    for (const ancestorId of getAncestorIds(plan, topic.id)) {
      ids.add(ancestorId);
    }
  }
  return plan.topics.filter((topic) => ids.has(topic.id));
}

export function isTopicAvailable(topic: Topic, progress: Record<string, boolean>): boolean {
  return topic.requires.every((requirementId) => progress[requirementId] === true);
}

export function getTopicStatus(topic: Topic, progress: Record<string, boolean>): TopicStatus {
  if (progress[topic.id] === true) {
    return "completed";
  }
  return isTopicAvailable(topic, progress) ? "available" : "pending";
}

export function getNextAvailableTopic(
  topics: Topic[],
  progress: Record<string, boolean>,
): Topic | undefined {
  return topics.find(
    (topic) => progress[topic.id] !== true && isTopicAvailable(topic, progress),
  );
}

/**
 * Siguiente tema sugerido hacia la meta. Primero intenta continuar el hilo del tema
 * recién dominado (lo que sigue en el mapa); si no hay, toma el primero disponible
 * en el orden de la ruta. Así se evitan saltos de una rama a otra.
 */
export function suggestNextTopic(
  plan: Plan,
  goal: CourseFilter,
  progress: Record<string, boolean>,
  fromTopicId: string | null,
): Topic | undefined {
  const available = getStudyCandidates(plan, goal).filter(
    (topic) => progress[topic.id] !== true && isTopicAvailable(topic, progress),
  );
  const continuation = fromTopicId
    ? available.find((topic) => topic.requires.includes(fromTopicId))
    : undefined;
  return continuation ?? available[0];
}

/** Requisitos (directos o indirectos) que faltan para un tema y el primero que ya se puede estudiar. */
export function getMissingPath(
  plan: Plan,
  topic: Topic,
  progress: Record<string, boolean>,
): { missing: number; start: Topic | undefined } {
  const ancestorIds = getAncestorIds(plan, topic.id);
  const missing = plan.topics.filter(
    (other) => ancestorIds.has(other.id) && progress[other.id] !== true,
  );
  return {
    missing: missing.length,
    start: missing.find((other) => isTopicAvailable(other, progress)),
  };
}

export function getCompletedCount(topics: Topic[], progress: Record<string, boolean>): number {
  return topics.filter((topic) => progress[topic.id] === true).length;
}
