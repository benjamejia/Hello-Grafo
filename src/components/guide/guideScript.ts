/**
 * Estado de ánimo del guía en cada mensaje. Hoy solo cambia la cara del avatar
 * provisional; la futura mascota puede tener una pose o animación por cada uno.
 */
export type GuideMood = "saluda" | "explica" | "senala" | "piensa" | "celebra";

/** Elementos marcados con data-guide="..." que el guía puede resaltar. */
export type GuideTarget = "map" | "filter" | "search" | "next-step";

export interface GuideStep {
  id: string;
  mood: GuideMood;
  title: string;
  text: string;
  target?: GuideTarget;
  /** Paso interactivo: en lugar de "Siguiente" muestra una pregunta. */
  action?: "elegir-semestre";
}

export const ONBOARDING_STEPS: GuideStep[] = [
  {
    id: "bienvenida",
    mood: "saluda",
    title: "¡Hola! Te doy la bienvenida",
    text: "Aquí puedes ver qué temas de programación vas a estudiar en la carrera y en qué orden. Cada tarjeta del mapa es un tema.",
  },
  {
    id: "mapa",
    mood: "explica",
    target: "map",
    title: "Las flechas marcan el camino",
    text: "Una flecha de A a B significa que conviene dominar A antes de B. Los temas «Disponibles» ya tienen todo lo que necesitan; los «Pendientes» todavía no.",
  },
  {
    id: "materias",
    mood: "senala",
    target: "filter",
    title: "Elige una materia",
    text: "Aquí cambias de materia o ves toda la ruta de 1.º a 4.º semestre. Las tarjetas punteadas son temas de otra materia que vas a necesitar.",
  },
  {
    id: "busqueda",
    mood: "senala",
    target: "search",
    title: "¿Buscas algo en específico?",
    text: "Escribe un tema, por ejemplo «arreglos», y te muestro dónde está y todo lo que necesitas antes. Tip: presiona / para buscar.",
  },
  {
    id: "siguiente",
    mood: "explica",
    target: "next-step",
    title: "¿No sabes por dónde empezar?",
    text: "Este botón te lleva al primer tema que ya puedes estudiar. Cuando lo domines, márcalo y el mapa se actualiza.",
  },
  {
    id: "semestre",
    mood: "piensa",
    title: "Una última pregunta",
    text: "¿En qué semestre vas? Así te muestro primero tu materia. Puedes cambiarla cuando quieras.",
    action: "elegir-semestre",
  },
];
