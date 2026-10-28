import type { ReactNode } from "react";
import type { TargetRect } from "./useTargetRect";

/** Espacio entre el elemento iluminado y el borde del hueco. */
const PADDING = 8;

interface GuideSpotlightProps {
  /** Elemento a iluminar; sin él, toda la pantalla queda oscura. */
  rect: TargetRect | null;
  children: ReactNode;
}

/**
 * Capa de la guía: oscurece la app, deja un hueco iluminado sobre el elemento
 * del que se habla y bloquea clics y gestos sobre todo lo demás.
 */
export function GuideSpotlight({ rect, children }: GuideSpotlightProps) {
  const hole = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : // Sin elemento: el hueco se encoge al centro y todo queda oscuro.
      { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Recibe y descarta clics, rueda y toques: la app no se puede usar mientras dura la guía. */}
      <div
        className="absolute inset-0"
        onPointerDown={(event) => event.preventDefault()}
        onWheel={(event) => event.stopPropagation()}
      />
      <div aria-hidden="true" className="guide-spotlight" style={hole} />
      {children}
    </div>
  );
}
