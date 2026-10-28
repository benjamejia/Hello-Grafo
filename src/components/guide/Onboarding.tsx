import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Course, Plan } from "../../content/types";
import { useAppStore } from "../../store/useAppStore";
import { GuideBubble } from "./GuideBubble";
import { GuideSpotlight } from "./GuideSpotlight";
import { ONBOARDING_STEPS } from "./guideScript";
import { useTargetRect, type TargetRect } from "./useTargetRect";

interface OnboardingProps {
  plan: Plan;
}

const SECONDARY_BUTTON =
  "inline-flex min-h-10 items-center rounded-lg px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800";
const PRIMARY_BUTTON =
  "inline-flex min-h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus-visible:ring-offset-slate-900";

const MARGIN = 16;
const GAP = 20;

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

/**
 * Coloca el globo debajo del elemento iluminado; si no cabe, arriba; y si el elemento
 * ocupa casi toda la pantalla (el mapa), abajo al centro, encima de él.
 */
function anchoredPlacement(rect: TargetRect): CSSProperties {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(520, viewportWidth - MARGIN * 2);
  const needed = viewportWidth < 640 ? 300 : 260;
  const centerLeft = rect.left + rect.width / 2 - width / 2;
  const left = Math.min(Math.max(centerLeft, MARGIN), viewportWidth - width - MARGIN);

  if (viewportHeight - (rect.top + rect.height) - GAP >= needed) {
    return { width, left, top: rect.top + rect.height + GAP };
  }
  if (rect.top - GAP >= needed) {
    return { width, left, bottom: viewportHeight - rect.top + GAP };
  }
  return { width, left: (viewportWidth - width) / 2, bottom: MARGIN * 2 };
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
  const rect = useTargetRect(visible ? step.target : undefined);

  // Cada vez que se abre, empieza desde el primer paso.
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      primaryRef.current?.focus();
    }
  }, [visible, stepIndex]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    // En fase de captura, para que los atajos de la app (como "/" del buscador) no actúen debajo de la guía.
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        closeGuide();
      } else if (event.key === "/") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    // Si el foco llega a la app (por ejemplo, con Tab tras un clic en el globo), regresa a la guía.
    const handleFocus = (event: FocusEvent): void => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[role="dialog"]')) {
        primaryRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey, true);
    document.addEventListener("focusin", handleFocus);
    return () => {
      window.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("focusin", handleFocus);
    };
  }, [visible, closeGuide]);

  if (!visible) {
    return null;
  }

  const finishWith = (courseId: string): void => {
    setCourseFilter(courseId);
    closeGuide();
  };

  // Sin elemento que señalar (bienvenida y pregunta final), la mascota va al centro.
  const centered = !step.target || !rect;

  const actions =
    step.action === "elegir-semestre" ? (
      <div className="flex flex-wrap justify-center gap-2">
        {coursesBySemester(plan.courses).map((course, index) => (
          <button
            key={course.id}
            ref={index === 0 ? primaryRef : undefined}
            type="button"
            onClick={() => finishWith(course.id)}
            className="inline-flex min-h-11 items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
          >
            {course.semester}.º semestre
          </button>
        ))}
        <button type="button" onClick={() => finishWith("fund")} className={SECONDARY_BUTTON}>
          Aún no entro
        </button>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="flex gap-1.5" aria-label={`Paso ${stepIndex + 1} de ${ONBOARDING_STEPS.length}`}>
          {ONBOARDING_STEPS.map((item, index) => (
            <li
              key={item.id}
              className={`h-2 rounded-full transition-all ${
                index === stepIndex
                  ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                  : index < stepIndex
                    ? "w-2 bg-indigo-300 dark:bg-indigo-700"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </ol>
        <div className="ml-auto flex gap-1.5">
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
    );

  const bubble = (
    <GuideBubble
      key={step.id}
      mood={step.mood}
      title={step.title}
      onClose={closeGuide}
      actions={actions}
      layout={centered ? "center" : "anchored"}
      style={centered ? { width: "min(480px, 100%)" } : anchoredPlacement(rect)}
    >
      <p>{step.text}</p>
    </GuideBubble>
  );

  return (
    <GuideSpotlight rect={centered ? null : rect}>
      {centered ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <div className="pointer-events-auto relative flex w-full justify-center">{bubble}</div>
        </div>
      ) : (
        bubble
      )}
    </GuideSpotlight>
  );
}
