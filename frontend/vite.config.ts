import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Define o caminho base relativo para funcionar em qualquer subpasta do GitHub Pages:
    base: './',
});