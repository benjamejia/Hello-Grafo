import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { Course } from "./content/types";
import { CourseMap } from "./components/map/CourseMap";
import { TopicPanel } from "./components/panel/TopicPanel";
import { Header } from "./components/layout/Header";
import { useResolvedTheme } from "./lib/theme";

interface AppProps {
  course: Course;
}

export default function App({ course }: AppProps) {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header course={course} />
      <main className="relative min-h-0 flex-1">
        <ReactFlowProvider>
          <CourseMap course={course} />
        </ReactFlowProvider>
        <TopicPanel course={course} />
      </main>
    </div>
  );
}
