import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base relativa: funciona en GitHub Pages sin importar el nombre del repositorio
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()]
});
