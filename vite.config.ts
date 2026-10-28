import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // En GitHub Pages el sitio vive en /<repositorio>/; en local, en la raíz.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa lo que casi no cambia (librerías) de lo que cambia seguido (contenido y app):
        // al publicar contenido nuevo, el navegador reutiliza de su caché las librerías.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return /@xyflow|@dagrejs|[\/]d3-|classcat/.test(id) ? "grafo" : "react";
          }
          if (id.includes("/src/content/")) {
            return "contenido";
          }
          return undefined;
        },
      },
    },
  },
});
