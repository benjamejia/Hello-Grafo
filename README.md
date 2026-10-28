# Ruta de programación · ICC CUTonalá

Ruta de aprendizaje interactiva para las materias de programación de los primeros semestres de **Ingeniería en Ciencias Computacionales** (CUTonalá): Programación Estructurada (C), POO (Java), POE (C#), Bases de Datos y Programación Web. Muestra los temas, sus requisitos (también entre materias), los temas equivalentes en otro lenguaje y ejemplos cortos. Guarda el progreso y la disposición de los nodos en el navegador.

## Stack

- React + Vite + TypeScript
- `@xyflow/react` (React Flow)
- `@dagrejs/dagre` para la disposición automática
- Tailwind CSS con modo oscuro por clase
- Zustand con `persist` para progreso, posiciones y tema

No hay backend ni autenticación. El contenido vive en `src/content/courses/*.json` (un archivo por materia) y se une en `src/content/plan.ts`.

## Cómo levantarlo

Requisitos: Node.js 20.19+ o 22.12+ y npm.

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run validate` | Valida ids, dependencias, ciclos y ejemplos del contenido. |
| `npm run build` | Revisa TypeScript y genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve la versión de producción localmente. |

En modo desarrollo, el contenido también se valida al arrancar y los resultados aparecen en la consola del navegador.

## Editar un tema

Cada materia es un archivo en `src/content/courses/` con sus datos (`id`, `code`, `title`, `shortTitle`, `semester`, `languages`, `syllabus`, `color`, `modules`) y su lista de `topics`. Cada tema tiene esta forma:

```json
{
  "id": "c5",
  "module": "m1",
  "title": "Variables y tipos de datos",
  "requires": ["c4", "fund.p5", "fund.p7"],
  "equivalentTo": ["poo.j2"],
  "summary": "Descripción breve.",
  "prior": "Conocimientos previos.",
  "why": "Por qué está en esa posición del mapa.",
  "examples": [
    {
      "title": "Ejemplo",
      "explanation": "Explicación breve.",
      "language": "c",
      "code": "#include <stdio.h>\nint main(void) { return 0; }",
      "output": "Salida esperada"
    }
  ]
}
```

- `id`: único dentro de la materia. Su id global es `materia.tema` (por ejemplo `pe.c5`).
- `module`: uno de los `modules` de la materia.
- `requires`: temas que deben dominarse antes. Sin prefijo apuntan a la misma materia; con prefijo (`fund.p5`, `poo.o1`), a otra.
- `equivalentTo` (opcional): la misma idea en otro lenguaje. No bloquea el avance y se muestra en ambos sentidos.
- `draft: true`: tema en construcción. Solo exige `title`, `summary` y `requires`; `prior`, `why` y `examples` se vuelven opcionales.
- `language`: `c`, `java`, `csharp`, `javascript`, `php`, `html`, `css`, `sql`, `pseudocode` o `text`.
- `output`: opcional.

Para añadir una materia, crea su archivo y agrégalo a `SOURCES` en `src/content/plan.ts`.

### Ficha extendida (opcional)

Cada tema puede traer material extra. Se muestra en las pestañas **Aprender**, **Practicar** y **Recursos** del panel:

```json
{
  "difficulty": 2,
  "estimatedHours": 3,
  "commonMistakes": [
    { "mistake": "Olvidar el & en scanf.", "fix": "scanf necesita la dirección: &edad." }
  ],
  "exercises": [
    { "level": 1, "prompt": "Lee un número e indica si es par.", "hint": "Usa %." }
  ],
  "resources": [
    { "title": "Python Tutor en modo C", "type": "herramienta", "url": "https://pythontutor.com/c.html" },
    { "title": "Sznajdleder (2017)", "type": "libro", "note": "Capítulo de decisiones." }
  ],
  "checklist": ["Distingo = de ==."]
}
```

- `difficulty` y `level`: 1 básico, 2 intermedio, 3 retador.
- `resources[].type`: `video`, `lectura`, `libro`, `herramienta` o `practica`. `url` es opcional (los libros pueden no tener).
- `checklist`: autoevaluación "¿Ya lo dominas?". Las casillas marcadas se guardan en el navegador; cuando están todas, la app sugiere marcar el tema como dominado.

Hoy tienen ficha completa `pe.c4`, `pe.d2`, `pe.d6`, `pe.e1`, `pe.e2` y `pe.f3`, y todos los temas de Previos y Estructurada tienen dificultad y tiempo estimado.

## Cómo se elige el siguiente paso

- La **meta** es la materia que el alumno eligió (con los botones de materia o en la guía). Cuando la app cambia sola de vista para mostrar un requisito de otra materia, la meta no cambia.
- Los candidatos son los temas de la meta más todos sus requisitos, directos o indirectos, aunque sean de otras materias. Solo entran temas no dominados cuyos requisitos ya están dominados.
- Primero se intenta **continuar el hilo**: un tema que dependa del que se acaba de dominar. Si no hay, se toma el primero disponible en el orden de la ruta. Esto reduce alrededor de 25 % los saltos entre ramas del mapa.
- La lógica está en `suggestNextTopic` (`src/lib/graph.ts`) y se usa en el botón de la cabecera, en la barra **Continuar** del mapa y en el pie del panel después de marcar un tema como dominado.

## Guía y futura mascota

La guía de bienvenida sale la primera vez que se abre la app y se puede repetir con el botón **?**. Está en `src/components/guide/`:

| Archivo | Qué es |
| --- | --- |
| `guideScript.ts` | El guion: pasos, texto, elemento a resaltar (`target`) y estado de ánimo (`mood`). |
| `GuideAvatar.tsx` | Avatar provisional. **Es lo único que hay que cambiar para poner la mascota**; recibe `mood` (`saluda`, `explica`, `senala`, `piensa`, `celebra`) para elegir la pose. |
| `GuideBubble.tsx` | Globo de diálogo reutilizable para otros momentos (pruebas de bloque, logros, etc.). |
| `Onboarding.tsx` | Controla el recorrido y la pregunta final "¿En qué semestre vas?". |

Para resaltar un elemento nuevo, márcalo con `data-guide="nombre"` y agrega el nombre a `GuideTarget`.

Después de editar, ejecuta:

```bash
npm run validate
```

La disposición se recalcula con dagre para cada vista (una materia o toda la ruta). Las posiciones arrastradas, el progreso y el filtro de materia se guardan en `localStorage` con la clave `mapa-programacion-estructurada`.

## Estructura

```text
/src
  /content      plan.ts, tipos y /courses con un JSON por materia
  /components   mapa, panel y cabecera
  /store        estado persistente de la aplicación
  /lib          dagre, grafo, tema y validación
/scripts        validador ejecutable con npm run validate
```

## Siguientes pasos

Estas ideas están preparadas para añadirse después, pero no están implementadas:

- Mascota que reemplace el avatar provisional y acompañe en más momentos (pruebas de bloque, logros).
- Pruebas o autoevaluaciones por módulo.
- Ejecución de código dentro de la app.
- Backend con progreso en la nube y cuentas de usuario.
- Asistente de IA para explicar temas o revisar ejercicios.
