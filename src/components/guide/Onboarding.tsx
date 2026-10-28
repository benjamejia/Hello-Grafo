import { useEffect, useRef, useState } from "react";
import type { Course, Plan } from "../../content/types";
import { useAppStore } from "../../store/useAppStore";
import { GuideBubble } from "./GuideBubble";
import { ONBOARDING_STEPS } from "./guideScript";

interface OnboardingProps {
  plan: Plan;
}

const SECONDARY_BUTTON =
  "inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800";
const PRIMARY_BUTTON =
  "inline-flex min-h-9 items-center rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-offset-slate-900";

/** Primera materia de cada semestre: la que se muestra al elegir ese semestre. */
function coursesBySemester(courses: Course[]): Course[] {
  const bySemester = new Map<number, Course>();
  for (const course of courses) {
    if (course.semester > 0 && !bySemester.has(course.semester)) {
      bySemester.set(course.semester, course);
    }
  }
  return [...bySemester.values()].sort((a, b) => a.semester - b.semester);
}

export function Onboarding({ plan }: OnboardingProps) {
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const guideOpen = useAppStore((state) => state.guideOpen);
  const closeGuide = useAppStore((state) => state.closeGuide);
  const setCourseFilter = useAppStore((state) => state.setCourseFilter);
  const [stepIndex, setStepIndex] = useState(0);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const visible = !onboardingDone || guideOpen;
  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  // Cada vez que se abre, empieza desde el primer paso.
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
    }
  }, [visible]);

  // Resalta el elemento del que habla el paso actual.
  useEffect(() => {
    if (!visible || !step.target) {
      return;
    }
    const element = document.querySelector(`[data-guide="${step.target}"]`);
    element?.classList.add("guide-target");
    return () => element?.classList.remove("guide-target");
  }, [visible, step]);

  useEffect(() => {
    if (visible) {
      primaryRef.current?.focus();
    }
  }, [visible, stepIndex]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeGuide();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [visible, closeGuide]);

  if (!visible) {
    return null;
  }

  const finishWith = (courseId: string): void => {
    setCourseFilter(courseId);
    closeGuide();
  };

  const progressLabel = `Paso ${stepIndex + 1} de ${ONBOARDING_STEPS.length}`;

  return (
    <GuideBubble
      mood={step.mood}
      title={step.title}
      onClose={closeGuide}
      actions={
        step.action === "elegir-semestre" ? (
          <div className="flex flex-wrap gap-1.5">
            {coursesBySemester(plan.courses).map((course, index) => (
              <button
                key={course.id}
                ref={index === 0 ? primaryRef : undefined}
                type="button"
                onClick={() => finishWith(course.id)}
                className="inline-flex min-h-9 items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
              >
                {course.semester}.º semestre
              </button>
            ))}
            <button type="button" onClick={() => finishWith("fund")} className={SECONDARY_BUTTON}>
              Aún no entro
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400" aria-live="polite">
              {progressLabel}
            </span>
            <div className="flex gap-1">
              {stepIndex === 0 ? (
                <button type="button" onClick={closeGuide} className={SECONDARY_BUTTON}>
                  Saltar guía
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepIndex((index) => index - 1)}
                  className={SECONDARY_BUTTON}
                >
                  Atrás
                </button>
              )}
              <button
                ref={primaryRef}
                type="button"
                onClick={() => (isLast ? closeGuide() : setStepIndex((index) => index + 1))}
                className={PRIMARY_BUTTON}
              >
                {stepIndex === 0 ? "Empezar" : "Siguiente"}
              </button>
            </div>
          </div>
        )
      }
    >
      <p>{step.text}</p>
    </GuideBubble>
  );
}
