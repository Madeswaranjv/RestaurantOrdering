import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs work from both Vite's dev server and Electron's
  // packaged custom protocol.
  base: './',
})
