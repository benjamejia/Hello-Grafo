export type TopicChipTone = "neutral" | "done" | "next" | "equivalent";

const TONE_CLASS: Record<TopicChipTone, string> = {
  neutral:
    "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  done: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60",
  next: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/70",
  equivalent:
    "border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200 dark:hover:bg-teal-900/60",
};

interface TopicChipProps {
  title: string;
  /** Materia del tema enlazado, cuando es distinta de la actual. */
  courseLabel?: string | null;
  completed?: boolean;
  tone: TopicChipTone;
  arrow?: boolean;
  ariaLabel: string;
  onClick: () => void;
}

export function TopicChip({
  title,
  courseLabel,
  completed = false,
  tone,
  arrow = false,
  ariaLabel,
  onClick,
}: TopicChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 ${TONE_CLASS[tone]}`}
    >
      {courseLabel ? <span className="font-semibold opacity-70">{courseLabel} ·</span> : null}
      {title}
      {completed ? (
        <span aria-hidden="true" className="font-bold">
          ✓
        </span>
      ) : null}
      {arrow ? <span aria-hidden="true">→</span> : null}
    </button>
  );
}
