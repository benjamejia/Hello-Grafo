import type { GroupDefinition } from "../../content/types";
import { getGroupCssVariables } from "../../lib/groupStyle";

interface LegendProps {
  groups: GroupDefinition[];
}

export function Legend({ groups }: LegendProps) {
  return (
    <ul
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 sm:text-xs"
      aria-label="Leyenda de grupos"
    >
      {groups.map((group) => (
        <li key={group.id} className="flex items-center gap-1.5">
          <span className="group-dot" style={getGroupCssVariables(group)} aria-hidden="true" />
          <span>{group.name}</span>
        </li>
      ))}
    </ul>
  );
}
