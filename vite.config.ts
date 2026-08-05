import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages de projeto serve em /<repo>/ — a base precisa casar com o nome
  // do repositório (que é a URL aleatória). Absoluta (não "./") por robustez no
  // consumo via iframe. Ao renomear o repo, atualizar aqui e rebuildar.
  base: "/j21ta4t4pfl2q503/",
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          nebula: ["@ikatec/nebula-react"],
        },
      },
    },
  },
});
