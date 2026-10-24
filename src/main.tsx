import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./index.css";
import App from "./App";
import courseJson from "./content/course.json";
import type { Course } from "./content/types";
import { validateCourse } from "./lib/validateCourse";

const course = courseJson as unknown as Course;

if (import.meta.env.DEV) {
  const result = validateCourse(course);
  if (result.ok) {
    console.info(
      `[contenido] Válido: ${course.topics.length} temas y ${course.groups.length} grupos.`,
    );
  } else {
    console.error("[contenido] Se encontraron errores:");
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
  }
  for (const warning of result.warnings) {
    console.warn(`[contenido] ${warning}`);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No se encontró el elemento root.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App course={course} />
  </StrictMode>,
);
