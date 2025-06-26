import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://audadmin.zetdigi.com/',
  // base: 'https://portal.zetdigitesting.online/',
  // base: 'https://portal.audiomixingmastering.com/',
  optimizeDeps: {
    include: ["@wojtekmaj/react-daterange-picker"]
  },
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://backend.zetdigitesting.online/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src',
      },
    ]
  },
})
