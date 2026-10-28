import type { GuideMood } from "./guideScript";

interface GuideAvatarProps {
  mood: GuideMood;
}

/**
 * Avatar provisional del guía: un nodo del grafo con cara.
 * Para usar la mascota, reemplaza el contenido de este componente
 * (imagen, SVG animado o Lottie) y usa `mood` para elegir la pose.
 */
export function GuideAvatar({ mood }: GuideAvatarProps) {
  const happy = mood === "saluda" || mood === "celebra";
  const lookX = mood === "senala" ? 1.5 : mood === "piensa" ? -1.5 : 0;
  const lookY = mood === "piensa" ? -1.5 : 0;

  return (
    <svg
      viewBox="0 0 48 48"
      className="guide-avatar h-12 w-12 shrink-0 drop-shadow-sm"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21" className="fill-indigo-600 dark:fill-indigo-500" />
      <circle cx="24" cy="24" r="21" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx={17 + lookX} cy={21 + lookY} r="3" fill="white" />
      <circle cx={31 + lookX} cy={21 + lookY} r="3" fill="white" />
      {happy ? (
        <path d="M16 29q8 7 16 0" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      ) : mood === "piensa" ? (
        <path d="M19 31h10" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      ) : (
        <path d="M18 30q6 4 12 0" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {mood === "celebra" ? (
        <path d="M5 8l2 3M43 8l-2 3M24 1v3" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
