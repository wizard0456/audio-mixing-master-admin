import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: 'https://audadmin.zetdigi.com/',
  // base: 'https://portal.zetdigitesting.online/',
  // base: 'https://audiomixingmastering.com/admin',
  // base: 'http://69.55.54.209/admin',
  // base: 'https://69.55.54.209/admin',
  optimizeDeps: {
    include: ["@wojtekmaj/react-daterange-picker"]
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
