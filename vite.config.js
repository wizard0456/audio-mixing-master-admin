import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://audadmin.zetdigi.com/',
  optimizeDeps: {
    include: []
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src',
      },
    ]
  },
})
