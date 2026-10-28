export type Language =
  | "c"
  | "java"
  | "csharp"
  | "javascript"
  | "php"
  | "html"
  | "css"
  | "sql"
  | "pseudocode"
  | "text";

export interface Example {
  title: string;
  explanation: string;
  language: Language;
  code: string;
  output?: string;
}

/** 1 = básico, 2 = intermedio, 3 = retador. */
export type Difficulty = 1 | 2 | 3;

export interface CommonMistake {
  /** Lo que suele salir mal, en palabras del alumno. */
  mistake: string;
  /** Cómo evitarlo o corregirlo. */
  fix: string;
}

export interface Exercise {
  prompt: string;
  level: Difficulty;
  hint?: string;
}

export type ResourceType = "video" | "lectura" | "libro" | "herramienta" | "practica";

export interface Resource {
  title: string;
  type: ResourceType;
  /** Los libros de la bibliografía pueden no tener enlace. */
  url?: string;
  note?: string;
}

/** Material didáctico extendido de un tema. Todo es opcional. */
export interface TopicExtras {
  difficulty?: Difficulty;
  estimatedHours?: number;
  commonMistakes?: CommonMistake[];
  exercises?: Exercise[];
  resources?: Resource[];
  /** Afirmaciones para autoevaluarse: "Puedo...". */
  checklist?: string[];
}

export interface ColorPair {
  light: string;
  dark: string;
}

export interface CourseModule {
  id: string;
  name: string;
}

/** Origen del temario: programa oficial, inferido de otras fuentes o propio de la herramienta. */
export type SyllabusSource = "oficial" | "inferido" | "propio";

export interface Course {
  id: string;
  code: string | null;
  title: string;
  shortTitle: string;
  /** 0 para conocimientos previos a la carrera. */
  semester: number;
  languages: string;
  syllabus: SyllabusSource;
  note?: string;
  color: ColorPair;
  modules: CourseModule[];
}

/** Tema tal como se escribe en src/content/courses/*.json. */
export interface TopicSource extends TopicExtras {
  id: string;
  module: string;
  title: string;
  /** Ids del mismo curso ("c5") o de otro curso con prefijo ("pe.c5"). */
  requires?: string[];
  /** Temas que enseñan la misma idea en otro lenguaje. No bloquean el avance. */
  equivalentTo?: string[];
  summary: string;
  prior?: string;
  why?: string;
  examples?: Example[];
  /** Tema con contenido incompleto. */
  draft?: boolean;
}

export interface CourseSource extends Course {
  topics: TopicSource[];
}

/** Tema normalizado: todos los ids son globales ("curso.tema"). */
export interface Topic extends TopicExtras {
  id: string;
  courseId: string;
  module: string;
  title: string;
  requires: string[];
  equivalentTo: string[];
  summary: string;
  prior?: string;
  why?: string;
  examples: Example[];
  draft: boolean;
}

export interface Plan {
  title: string;
  subtitle: string;
  courses: Course[];
  topics: Topic[];
}

export type TopicStatus = "completed" | "available" | "pending";

/** "all" muestra toda la ruta; cualquier otro valor es el id de un curso. */
export type CourseFilter = "all" | string;
