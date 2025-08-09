import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')

  return {
    base: '/hotdog_tracker_prototype/',
    plugins: [
      react(),
      // Bundle analyzer - generates stats.html after build
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@types': resolve(__dirname, 'src/types'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@constants': resolve(__dirname, 'src/constants'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@test': resolve(__dirname, 'src/test'),
        '@config': resolve(__dirname, 'src/config'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },

    // Build optimizations
    build: {
      // Generate source maps for production debugging
      sourcemap: true,

      // Optimize chunk splitting
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            // Add more chunks as your app grows
          },
        },
      },

      // Build target
      target: 'esnext',

      // Enable minification
      minify: 'esbuild',

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },

    // Environment variables prefix
    envPrefix: ['VITE_', 'REACT_APP_'],

    // Dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom'],
      // Exclude any problematic dependencies
      exclude: [],
    },

    // Test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
  }
})
