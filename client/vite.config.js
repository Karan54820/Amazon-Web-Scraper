import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Make environment variables available to the client
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || 'http://localhost:5000'),
      // Add a global process definition to avoid "process is not defined" errors
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        REACT_APP_API_URL: env.REACT_APP_API_URL || 'http://localhost:5000'
      })
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      open: true
    },
    build: {
      outDir: 'build',
      sourcemap: mode === 'development',
      minify: mode === 'production',
      // Chunk size optimization
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['framer-motion'],
          },
        },
      },
    },
  }
})
