import type { CSSProperties } from "react";
import type { Course } from "../content/types";

export interface GroupCssVariables extends CSSProperties {
  "--group-light": string;
  "--group-dark": string;
}

export function getGroupCssVariables(course: Pick<Course, "color">): GroupCssVariables {
  return {
    "--group-light": course.color.light,
    "--group-dark": course.color.dark,
  };
}
