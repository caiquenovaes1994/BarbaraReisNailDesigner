import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Nunca gerar sourcemaps em produção
  },
  server: {
    host: true,
    port: 5174
  }
})
