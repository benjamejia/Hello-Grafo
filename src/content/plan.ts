import type { Course, CourseSource, Plan, Topic } from "./types";
import fundamentos from "./courses/fundamentos.json";
import pe from "./courses/pe.json";
import poo from "./courses/poo.json";
import poe from "./courses/poe.json";
import bd from "./courses/bd.json";
import web from "./courses/web.json";

/** Orden en que aparecen las materias en la interfaz. */
const SOURCES = [fundamentos, pe, poo, poe, bd, web] as unknown as CourseSource[];

function qualifyId(ref: string, courseId: string): string {
  return ref.includes(".") ? ref : `${courseId}.${ref}`;
}

function buildPlan(sources: CourseSource[]): Plan {
  const courses: Course[] = [];
  const topics: Topic[] = [];

  for (const { topics: courseTopics, ...course } of sources) {
    courses.push(course);
    for (const topic of courseTopics ?? []) {
      topics.push({
        id: qualifyId(topic.id, course.id),
        courseId: course.id,
        module: topic.module,
        title: topic.title,
        requires: (topic.requires ?? []).map((ref) => qualifyId(ref, course.id)),
        equivalentTo: (topic.equivalentTo ?? []).map((ref) => qualifyId(ref, course.id)),
        summary: topic.summary,
        prior: topic.prior,
        why: topic.why,
        examples: topic.examples ?? [],
        draft: topic.draft === true,
        difficulty: topic.difficulty,
        estimatedHours: topic.estimatedHours,
        commonMistakes: topic.commonMistakes,
        exercises: topic.exercises,
        resources: topic.resources,
        checklist: topic.checklist,
      });
    }
  }

  return {
    title: "Ruta de programación",
    subtitle: "Ingeniería en Ciencias Computacionales · CUTonalá",
    courses,
    topics,
  };
}

export const plan = buildPlan(SOURCES);
