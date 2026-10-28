import { useEffect, useState } from "react";
import type { GuideTarget } from "./guideScript";

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Posición en pantalla del elemento marcado con data-guide; se actualiza si cambia de tamaño o lugar. */
export function useTargetRect(target: GuideTarget | undefined): TargetRect | null {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }

    let frame = 0;
    const measure = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = document.querySelector(`[data-guide="${target}"]`);
        if (!element) {
          setRect(null);
          return;
        }
        const box = element.getBoundingClientRect();
        setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
      });
    };

    measure();
    const element = document.querySelector(`[data-guide="${target}"]`);
    const observer = new ResizeObserver(measure);
    if (element) {
      observer.observe(element);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target]);

  return rect;
}
