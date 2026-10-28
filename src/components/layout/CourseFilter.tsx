import type { Course } from "../../content/types";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useAppStore } from "../../store/useAppStore";

interface CourseFilterProps {
  courses: Course[];
}

function semesterLabel(course: Course): string | null {
  return course.semester === 0 ? null : `${course.semester}.º`;
}

const CHIP =
  "inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 sm:text-xs";
const CHIP_IDLE =
  "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";
const CHIP_ACTIVE =
  "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/70 dark:text-indigo-100";

export function CourseFilter({ courses }: CourseFilterProps) {
  const courseFilter = useAppStore((state) => state.courseFilter);
  const setCourseFilter = useAppStore((state) => state.setCourseFilter);

  return (
    <div
      role="group"
      aria-label="Filtrar el mapa por materia"
      className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5"
    >
      <button
        type="button"
        onClick={() => setCourseFilter("all")}
        aria-pressed={courseFilter === "all"}
        className={`${CHIP} ${courseFilter === "all" ? CHIP_ACTIVE : CHIP_IDLE}`}
      >
        Toda la ruta
      </button>

      {courses.map((course) => {
        const isActive = courseFilter === course.id;
        return (
          <button
            key={course.id}
            type="button"
            onClick={() => setCourseFilter(course.id)}
            aria-pressed={isActive}
            title={`${course.title} · ${course.languages}`}
            className={`${CHIP} ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
          >
            <span className="group-dot" style={getGroupCssVariables(course)} aria-hidden="true" />
            <span className="font-semibold">{semesterLabel(course)}</span>
            <span>{course.shortTitle}</span>
          </button>
        );
      })}
    </div>
  );
}
