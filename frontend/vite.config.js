import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-photo-gallery': 'react-photo-gallery', // Directly reference the package name
    },
  },
})
