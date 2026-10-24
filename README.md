# Mapa de Programación Estructurada

Mapa interactivo de aprendizaje para la materia **Programación Estructurada** en lenguaje C. Muestra los temas, sus requisitos y ejemplos cortos, y guarda el progreso y la disposición de los nodos en el navegador.

## Stack

- React + Vite + TypeScript
- `@xyflow/react` (React Flow)
- `@dagrejs/dagre` para la disposición automática
- Tailwind CSS con modo oscuro por clase
- Zustand con `persist` para progreso, posiciones y tema

No hay backend ni autenticación. Todo el contenido vive en `src/content/course.json`.

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

Abre `src/content/course.json`. Cada tema tiene esta forma:

```json
{
  "id": "c5",
  "group": "m1",
  "title": "Variables y tipos de datos",
  "requires": ["c4", "p5", "p7"],
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

- `id`: identificador único.
- `group`: uno de `previos`, `m1`, `m2`, `m3`, `m4`, `meta`.
- `requires`: ids de temas que deben dominarse antes.
- `language`: `c`, `pseudocode` o `text`.
- `output`: opcional.

Después de editar, ejecuta:

```bash
npm run validate
```

La disposición se recalcula con dagre. Las posiciones que el usuario haya arrastrado y su progreso se guardan en `localStorage` con la clave `mapa-programacion-estructurada`.

## Estructura

```text
/src
  /content      course.json y tipos
  /components   mapa, panel y cabecera
  /store        estado persistente de la aplicación
  /lib          dagre, grafo, tema y validación
/scripts        validador ejecutable con npm run validate
```

## Siguientes pasos

Estas ideas están preparadas para añadirse después, pero no están implementadas:

- Mascota o asistente virtual.
- Ejecución de código dentro de la app.
- Backend con progreso en la nube y cuentas de usuario.
- Asistente de IA para explicar temas o revisar ejercicios.
