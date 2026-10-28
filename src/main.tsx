import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./index.css";
import App from "./App";
import { plan } from "./content/plan";
import { validatePlan } from "./lib/validateCourse";

if (import.meta.env.DEV) {
  const result = validatePlan(plan);
  if (result.ok) {
    console.info(
      `[contenido] Válido: ${plan.topics.length} temas en ${plan.courses.length} materias.`,
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
    <App plan={plan} />
  </StrictMode>,
);
