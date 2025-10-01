import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: 5173,
      // this sets the host to 0.0.0.0
      host: '0.0.0.0',
      
      strictPort: true,
    cors: true
    },
})
