import type { Course } from "../src/content/types";
import { validateCourse } from "../src/lib/validateCourse";
import courseJson from "../src/content/course.json";

const course = courseJson as unknown as Course;
const result = validateCourse(course);

if (result.warnings.length > 0) {
  console.warn("\nAvisos:");
  for (const warning of result.warnings) {
    console.warn(`  - ${warning}`);
  }
}

if (result.ok) {
  console.log(
    `\nContenido válido: ${course.topics.length} temas y ${course.groups.length} grupos.\n`,
  );
} else {
  console.error("\nErrores de contenido:");
  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }
  console.error("");
  process.exitCode = 1;
}
