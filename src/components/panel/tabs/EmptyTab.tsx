import type { ReactNode } from "react";

export function EmptyTab({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </p>
  );
}
