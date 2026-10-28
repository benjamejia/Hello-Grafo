import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { Plan } from "./content/types";
import { CourseMap } from "./components/map/CourseMap";
import { NextStepDock } from "./components/map/NextStepDock";
import { TopicPanel } from "./components/panel/TopicPanel";
import { Header } from "./components/layout/Header";
import { Onboarding } from "./components/guide/Onboarding";
import { useResolvedTheme } from "./lib/theme";
import { useAppStore } from "./store/useAppStore";

interface AppProps {
  plan: Plan;
}

export default function App({ plan }: AppProps) {
  const resolvedTheme = useResolvedTheme();
  const courseFilter = useAppStore((state) => state.courseFilter);
  const setCourseFilter = useAppStore((state) => state.setCourseFilter);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Un filtro guardado puede apuntar a una materia que ya no existe.
  useEffect(() => {
    if (courseFilter !== "all" && !plan.courses.some((course) => course.id === courseFilter)) {
      setCourseFilter("all");
    }
  }, [courseFilter, plan, setCourseFilter]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header plan={plan} />
      <main className="relative min-h-0 flex-1">
        <ReactFlowProvider key={courseFilter}>
          <CourseMap plan={plan} />
        </ReactFlowProvider>
        <NextStepDock plan={plan} />
        <TopicPanel plan={plan} />
        <Onboarding plan={plan} />
      </main>
    </div>
  );
}
