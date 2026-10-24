import type { CSSProperties } from "react";
import type { GroupDefinition } from "../content/types";

export interface GroupCssVariables extends CSSProperties {
  "--group-light": string;
  "--group-dark": string;
}

export function getGroupCssVariables(group: GroupDefinition): GroupCssVariables {
  return {
    "--group-light": group.color.light,
    "--group-dark": group.color.dark,
  };
}
