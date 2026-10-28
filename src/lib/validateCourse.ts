import type { Language, Plan, ResourceType, Topic } from "../content/types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_LANGUAGES = new Set<Language>([
  "c",
  "java",
  "csharp",
  "javascript",
  "php",
  "html",
  "css",
  "sql",
  "pseudocode",
  "text",
]);
const VALID_SYLLABUS = new Set(["oficial", "inferido", "propio"]);

const VALID_RESOURCE_TYPES = new Set<ResourceType>([
  "video",
  "lectura",
  "libro",
  "herramienta",
  "practica",
]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDifficulty(value: unknown): boolean {
  return value === 1 || value === 2 || value === 3;
}

function validateExtras(topic: Topic, errors: string[]): void {
  const label = `El tema "${topic.id}"`;

  if (topic.difficulty !== undefined && !isDifficulty(topic.difficulty)) {
    errors.push(`${label} tiene una dificultad inválida (usa 1, 2 o 3).`);
  }
  if (
    topic.estimatedHours !== undefined &&
    !(typeof topic.estimatedHours === "number" && topic.estimatedHours > 0)
  ) {
    errors.push(`${label} tiene un tiempo estimado inválido.`);
  }

  topic.commonMistakes?.forEach((item, index) => {
    if (!isNonEmptyString(item.mistake) || !isNonEmptyString(item.fix)) {
      errors.push(`${label}: el error común ${index + 1} necesita "mistake" y "fix".`);
    }
  });

  topic.exercises?.forEach((exercise, index) => {
    if (!isNonEmptyString(exercise.prompt) || !isDifficulty(exercise.level)) {
      errors.push(`${label}: el ejercicio ${index + 1} necesita "prompt" y "level" (1 a 3).`);
    }
  });

  topic.resources?.forEach((resource, index) => {
    if (!isNonEmptyString(resource.title) || !VALID_RESOURCE_TYPES.has(resource.type)) {
      errors.push(`${label}: el recurso ${index + 1} necesita título y un tipo válido.`);
    }
    if (resource.url !== undefined && !/^https?:\/\//.test(resource.url)) {
      errors.push(`${label}: el recurso ${index + 1} tiene una URL inválida.`);
    }
  });

  topic.checklist?.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(`${label}: el punto ${index + 1} de la autoevaluación está vacío.`);
    }
  });
}

export function validatePlan(plan: Plan): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (plan.courses.length === 0) {
    errors.push("El plan debe tener al menos una materia.");
  }

  const moduleIdsByCourse = new Map<string, Set<string>>();
  for (const course of plan.courses) {
    if (moduleIdsByCourse.has(course.id)) {
      errors.push(`Materia duplicada: "${course.id}".`);
      continue;
    }
    if (course.id.includes(".")) {
      errors.push(`El id de la materia "${course.id}" no puede contener puntos.`);
    }
    if (!isNonEmptyString(course.title) || !isNonEmptyString(course.shortTitle)) {
      errors.push(`La materia "${course.id}" debe tener título y título corto.`);
    }
    if (!isNonEmptyString(course.color?.light) || !isNonEmptyString(course.color?.dark)) {
      errors.push(`La materia "${course.id}" debe tener color claro y oscuro.`);
    }
    if (!VALID_SYLLABUS.has(course.syllabus)) {
      errors.push(`La materia "${course.id}" tiene un origen de temario inválido.`);
    }

    const moduleIds = new Set<string>();
    for (const module of course.modules ?? []) {
      if (moduleIds.has(module.id)) {
        errors.push(`Módulo duplicado "${module.id}" en la materia "${course.id}".`);
      }
      moduleIds.add(module.id);
      if (!isNonEmptyString(module.name)) {
        errors.push(`El módulo "${module.id}" de "${course.id}" debe tener nombre.`);
      }
    }
    moduleIdsByCourse.set(course.id, moduleIds);
  }

  const topicById = new Map<string, Topic>();

  for (const topic of plan.topics) {
    if (!isNonEmptyString(topic.id) || topic.id.endsWith(".")) {
      errors.push(`Hay un tema sin id en la materia "${topic.courseId}".`);
      continue;
    }
    if (topicById.has(topic.id)) {
      errors.push(`Id de tema duplicado: "${topic.id}".`);
      continue;
    }
    topicById.set(topic.id, topic);

    const modules = moduleIdsByCourse.get(topic.courseId);
    if (modules && !modules.has(topic.module)) {
      errors.push(`El tema "${topic.id}" usa el módulo "${topic.module}", que no existe.`);
    }

    if (!isNonEmptyString(topic.title)) {
      errors.push(`El tema "${topic.id}" debe tener un título.`);
    }
    if (!isNonEmptyString(topic.summary)) {
      errors.push(`El tema "${topic.id}" debe tener un resumen.`);
    }

    if (new Set(topic.requires).size !== topic.requires.length) {
      errors.push(`El tema "${topic.id}" tiene requisitos repetidos.`);
    } else if (topic.requires.includes(topic.id)) {
      errors.push(`El tema "${topic.id}" no puede depender de sí mismo.`);
    }
    if (topic.equivalentTo.includes(topic.id)) {
      errors.push(`El tema "${topic.id}" no puede ser equivalente a sí mismo.`);
    }

    // Los borradores solo necesitan título, resumen y requisitos.
    if (!topic.draft) {
      if (!isNonEmptyString(topic.prior)) {
        errors.push(`El tema "${topic.id}" debe describir conocimientos previos.`);
      }
      if (!isNonEmptyString(topic.why)) {
        errors.push(`El tema "${topic.id}" debe explicar por qué está en esa posición.`);
      }
      if (topic.examples.length === 0) {
        errors.push(`El tema "${topic.id}" debe tener al menos un ejemplo.`);
      }
    }

    topic.examples.forEach((example, index) => {
      const label = `El ejemplo ${index + 1} del tema "${topic.id}"`;
      if (!isNonEmptyString(example.title)) {
        errors.push(`${label} debe tener un título.`);
      }
      if (!isNonEmptyString(example.explanation)) {
        errors.push(`${label} debe tener una explicación.`);
      }
      if (!VALID_LANGUAGES.has(example.language)) {
        errors.push(`${label} tiene un lenguaje inválido.`);
      }
      if (!isNonEmptyString(example.code)) {
        errors.push(`${label} debe tener código o texto de ejemplo.`);
      }
      if (example.language === "c" && !example.code.includes("int main")) {
        warnings.push(`${label} no parece ser un programa completo en C.`);
      }
    });

    validateExtras(topic, errors);
  }

  for (const topic of topicById.values()) {
    for (const requirementId of topic.requires) {
      if (!topicById.has(requirementId)) {
        errors.push(`El tema "${topic.id}" requiere "${requirementId}", que no existe.`);
      }
    }
    for (const equivalentId of topic.equivalentTo) {
      if (!topicById.has(equivalentId)) {
        errors.push(
          `El tema "${topic.id}" dice ser equivalente a "${equivalentId}", que no existe.`,
        );
      }
    }
  }

  const state = new Map<string, "visiting" | "done">();

  const visit = (id: string, path: string[]): void => {
    const current = state.get(id);
    if (current === "done") {
      return;
    }
    if (current === "visiting") {
      const cycleStart = path.indexOf(id);
      const cycle = [...path.slice(cycleStart), id].join(" → ");
      errors.push(`Ciclo de dependencias detectado: ${cycle}.`);
      return;
    }

    state.set(id, "visiting");
    for (const requirementId of topicById.get(id)?.requires ?? []) {
      if (topicById.has(requirementId)) {
        visit(requirementId, [...path, id]);
      }
    }
    state.set(id, "done");
  };

  for (const id of topicById.keys()) {
    visit(id, []);
  }

  for (const course of plan.courses) {
    const courseTopics = plan.topics.filter((topic) => topic.courseId === course.id);
    if (courseTopics.length === 0) {
      warnings.push(`La materia "${course.id}" no tiene temas.`);
      continue;
    }
    for (const moduleId of moduleIdsByCourse.get(course.id) ?? []) {
      if (!courseTopics.some((topic) => topic.module === moduleId)) {
        warnings.push(`El módulo "${moduleId}" de "${course.id}" no tiene temas.`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
