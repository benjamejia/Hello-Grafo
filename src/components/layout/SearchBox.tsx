import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Plan } from "../../content/types";
import { getCourseById } from "../../lib/graph";
import { getGroupCssVariables } from "../../lib/groupStyle";
import { useGoToTopic } from "../../lib/navigation";
import { searchTopics } from "../../lib/search";
import { useAppStore } from "../../store/useAppStore";

interface SearchBoxProps {
  plan: Plan;
}

export function SearchBox({ plan }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const goToTopic = useGoToTopic(plan);
  const setPanelTab = useAppStore((state) => state.setPanelTab);

  const results = useMemo(() => searchTopics(plan.topics, query), [plan, query]);
  const showList = open && query.trim().length > 0;

  // "/" enfoca la búsqueda desde cualquier parte, salvo mientras se escribe en otro campo.
  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const choose = (topicId: string): void => {
    // Desde la búsqueda lo útil es ver qué necesitas, así que se abre en "Ruta".
    goToTopic(topicId);
    setPanelTab("ruta");
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) {
        return;
      }
      setOpen(true);
      const offset = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + offset + results.length) % results.length);
    } else if (event.key === "Enter") {
      const result = results[activeIndex];
      if (result) {
        event.preventDefault();
        choose(result.id);
      }
    } else if (event.key === "Escape") {
      // Evita que el Escape también cierre el panel del tema.
      event.stopPropagation();
      if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
    }
  };

  return (
    <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none" data-guide="search">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Buscar un tema
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.2 13.2 3.6 3.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && results[activeIndex] ? `${listId}-${activeIndex}` : undefined
          }
          value={query}
          placeholder="¿Qué quieres aprender?"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          className="min-h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm sm:pr-9 text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 px-1.5 text-[10px] text-slate-400 dark:border-slate-600 sm:block">
          /
        </kbd>
      </div>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Temas encontrados"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400" role="option" aria-selected="false" aria-disabled="true">
              No encontramos ese tema. Prueba con otra palabra.
            </li>
          ) : (
            results.map((topic, index) => {
              const course = getCourseById(plan, topic.courseId);
              const isActive = index === activeIndex;
              return (
                <li
                  key={topic.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isActive}
                  // mousedown en lugar de click: se dispara antes del blur del input.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(topic.id);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    isActive ? "bg-indigo-50 dark:bg-indigo-950/60" : ""
                  }`}
                >
                  {course ? (
                    <span
                      className="group-dot mt-1.5"
                      style={getGroupCssVariables(course)}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900 dark:text-white">
                      {topic.title}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {course?.title}
                      {topic.draft ? " · en construcción" : ""}
                    </span>
                  </span>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
