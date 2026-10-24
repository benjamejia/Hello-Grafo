import type { Course, Group, GroupDefinition, Topic, TopicStatus } from "../content/types";

export function getTopicById(course: Course, id: string): Topic | undefined {
  return course.topics.find((topic) => topic.id === id);
}

export function getGroupById(course: Course, id: Group): GroupDefinition | undefined {
  return course.groups.find((group) => group.id === id);
}

export function getAncestorIds(course: Course, topicId: string): Set<string> {
  const ancestors = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): void => {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);

    const topic = getTopicById(course, id);
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

export function getNextTopics(course: Course, topicId: string): Topic[] {
  return course.topics.filter((topic) => topic.requires.includes(topicId));
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
  course: Course,
  progress: Record<string, boolean>,
): Topic | undefined {
  return course.topics.find(
    (topic) => progress[topic.id] !== true && isTopicAvailable(topic, progress),
  );
}

export function getCompletedCount(course: Course, progress: Record<string, boolean>): number {
  return course.topics.filter((topic) => progress[topic.id] === true).length;
}
