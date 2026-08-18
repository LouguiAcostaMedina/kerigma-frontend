import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [
    react({
      include: [/\.js$/, /\.jsx$/] // <-- ajuste importante
    }),
    nodePolyfills({
      // Los polyfills solo se inyectan cuando un módulo los requiere en el cliente
      include: ['stream', 'buffer', 'process', 'util', 'events', 'crypto', 'zlib', 'path', 'fs'],
      globals: {
        process: true,
        Buffer: true
      }
    })
  ],
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@/constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          xlsx: ['xlsx-js-style'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2canvas']
        }
      }
    }
  }
})
