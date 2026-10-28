import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { GuideAvatar } from "./GuideAvatar";
import type { GuideMood } from "./guideScript";

interface GuideBubbleProps {
  mood: GuideMood;
  title: string;
  children: ReactNode;
  /** Botones o controles al pie del globo. */
  actions?: ReactNode;
  onClose: () => void;
  /**
   * "center": la mascota grande arriba y el globo debajo, para momentos protagonistas.
   * "anchored": mascota al lado del globo, junto al elemento que se explica.
   */
  layout?: "center" | "anchored";
  /** Posición calculada por quien lo usa (top/left/bottom). */
  style?: CSSProperties;
}

/** Globo de diálogo del guía. Sirve para la bienvenida y para cualquier momento futuro. */
export function GuideBubble({
  mood,
  title,
  children,
  actions,
  onClose,
  layout = "anchored",
  style,
}: GuideBubbleProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Mantiene el foco dentro del globo mientras la guía está abierta.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const centered = layout === "center";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onKeyDown={handleKeyDown}
      style={style}
      className={`guide-bubble flex ${
        centered ? "relative flex-col items-center gap-3" : "absolute items-end gap-3"
      }`}
    >
      <GuideAvatar mood={mood} size={centered ? "xl" : "lg"} />
      <div
        className={`relative w-full min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6 ${
          centered ? "text-center" : "rounded-bl-sm"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Cerrar la guía"
          title="Cerrar"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
        <h2
          id="guide-title"
          className={`text-lg font-bold leading-snug text-slate-900 dark:text-white sm:text-xl ${
            centered ? "px-8" : "pr-8"
          }`}
        >
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
          {children}
        </div>
        {actions ? <div className="mt-4">{actions}</div> : null}
      </div>
    </div>
  );
}
