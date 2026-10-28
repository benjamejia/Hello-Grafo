import { plan } from "../src/content/plan";
import { validatePlan } from "../src/lib/validateCourse";

const result = validatePlan(plan);

if (result.warnings.length > 0) {
  console.warn("\nAvisos:");
  for (const warning of result.warnings) {
    console.warn(`  - ${warning}`);
  }
}

if (result.ok) {
  const drafts = plan.topics.filter((topic) => topic.draft).length;
  console.log(
    `\nContenido válido: ${plan.topics.length} temas (${drafts} en construcción) en ${plan.courses.length} materias.\n`,
  );
} else {
  console.error("\nErrores de contenido:");
  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }
  console.error("");
  process.exitCode = 1;
}
