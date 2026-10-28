import type { Topic } from "../content/types";

/** Minúsculas y sin acentos, para que "recursion" encuentre "Recursión". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function searchTopics(topics: Topic[], query: string, limit = 8): Topic[] {
  const needle = normalize(query);
  if (needle.length === 0) {
    return [];
  }

  const scored: { topic: Topic; score: number }[] = [];
  for (const topic of topics) {
    const title = normalize(topic.title);
    const score = title.startsWith(needle)
      ? 0
      : title.split(/\s+/).some((word) => word.startsWith(needle))
        ? 1
        : title.includes(needle)
          ? 2
          : normalize(topic.summary).includes(needle)
            ? 3
            : -1;
    if (score >= 0) {
      scored.push({ topic, score });
    }
  }

  // sort es estable: a igual puntaje se conserva el orden de la ruta.
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((item) => item.topic);
}
