import type { Course } from "../content/types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_GROUPS = new Set(["previos", "m1", "m2", "m3", "m4", "meta"]);
const VALID_LANGUAGES = new Set(["c", "pseudocode", "text"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateCourse(course: Course): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(course.groups) || course.groups.length === 0) {
    errors.push("El curso debe tener al menos un grupo.");
  }

  if (!Array.isArray(course.topics) || course.topics.length === 0) {
    errors.push("El curso debe tener al menos un tema.");
  }

  const groupIds = new Set<string>();
  for (const group of course.groups ?? []) {
    if (!groupIds.has(group.id)) {
      groupIds.add(group.id);
    } else {
      errors.push(`Grupo duplicado: "${group.id}".`);
    }
    if (!isNonEmptyString(group.name)) {
      errors.push(`El grupo "${group.id}" debe tener un nombre.`);
    }
    if (!isNonEmptyString(group.color?.light) || !isNonEmptyString(group.color?.dark)) {
      errors.push(`El grupo "${group.id}" debe tener color claro y oscuro.`);
    }
  }

  const topicIds = new Set<string>();
  const topicById = new Map<string, Course["topics"][number]>();

  for (const topic of course.topics ?? []) {
    if (!isNonEmptyString(topic.id)) {
      errors.push("Hay un tema sin id.");
      continue;
    }
    if (topicIds.has(topic.id)) {
      errors.push(`Id de tema duplicado: "${topic.id}".`);
      continue;
    }
    topicIds.add(topic.id);
    topicById.set(topic.id, topic);

    if (!VALID_GROUPS.has(topic.group)) {
      errors.push(`El tema "${topic.id}" tiene un grupo inválido: "${topic.group}".`);
    } else if (!groupIds.has(topic.group)) {
      errors.push(`El grupo "${topic.group}" del tema "${topic.id}" no está definido.`);
    }

    if (!isNonEmptyString(topic.title)) {
      errors.push(`El tema "${topic.id}" debe tener un título.`);
    }
    if (!isNonEmptyString(topic.summary)) {
      errors.push(`El tema "${topic.id}" debe tener un resumen.`);
    }
    if (!isNonEmptyString(topic.prior)) {
      errors.push(`El tema "${topic.id}" debe describir conocimientos previos.`);
    }
    if (!isNonEmptyString(topic.why)) {
      errors.push(`El tema "${topic.id}" debe explicar por qué está en esa posición.`);
    }
    if (!Array.isArray(topic.requires)) {
      errors.push(`El tema "${topic.id}" debe tener una lista de requisitos.`);
    } else if (new Set(topic.requires).size !== topic.requires.length) {
      errors.push(`El tema "${topic.id}" tiene requisitos repetidos.`);
    } else if (topic.requires.includes(topic.id)) {
      errors.push(`El tema "${topic.id}" no puede depender de sí mismo.`);
    }

    if (!Array.isArray(topic.examples) || topic.examples.length === 0) {
      errors.push(`El tema "${topic.id}" debe tener al menos un ejemplo.`);
    } else {
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
    }
  }

  for (const topic of course.topics ?? []) {
    for (const requirementId of topic.requires ?? []) {
      if (!topicIds.has(requirementId)) {
        errors.push(
          `El tema "${topic.id}" requiere "${requirementId}", que no existe.`,
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
    const topic = topicById.get(id);
    for (const requirementId of topic?.requires ?? []) {
      if (topicById.has(requirementId)) {
        visit(requirementId, [...path, id]);
      }
    }
    state.set(id, "done");
  };

  for (const id of topicIds) {
    visit(id, []);
  }

  for (const group of course.groups ?? []) {
    const used = (course.topics ?? []).some((topic) => topic.group === group.id);
    if (!used) {
      warnings.push(`El grupo "${group.id}" no tiene temas.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
