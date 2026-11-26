import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the app works on GitHub Pages under any repo subpath
// (e.g. username.github.io/rolly-around-studios/) and also at a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
})
