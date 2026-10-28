import type { Difficulty } from "../content/types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: "Básico",
  2: "Intermedio",
  3: "Retador",
};

export function formatHours(hours: number): string {
  return hours === 1 ? "≈ 1 hora" : `≈ ${hours} horas`;
}
