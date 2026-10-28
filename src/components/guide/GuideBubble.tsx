import type { ReactNode } from "react";
import { GuideAvatar } from "./GuideAvatar";
import type { GuideMood } from "./guideScript";

interface GuideBubbleProps {
  mood: GuideMood;
  title: string;
  children: ReactNode;
  /** Botones o controles al pie del globo. */
  actions?: ReactNode;
  onClose: () => void;
}

/** Globo de diálogo del guía. Sirve para la bienvenida y para cualquier momento futuro. */
export function GuideBubble({ mood, title, children, actions, onClose }: GuideBubbleProps) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="guide-title"
      className="pointer-events-none absolute inset-x-3 bottom-3 z-50 flex items-end gap-2.5 sm:inset-x-auto sm:bottom-6 sm:left-16 sm:max-w-md"
    >
      <GuideAvatar mood={mood} />
      <div className="pointer-events-auto relative min-w-0 flex-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Cerrar la guía"
          title="Cerrar"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
        <h2 id="guide-title" className="pr-8 text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {children}
        </div>
        {actions ? <div className="mt-3">{actions}</div> : null}
      </div>
    </div>
  );
}
