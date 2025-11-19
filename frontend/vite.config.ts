import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许局域网访问
    port: 3000,
    // 移除代理，直接通过环境变量配置 API URL
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react'],
          // Feature chunks
          'teacher': [
            './src/pages/teacher/QuestionManagement.tsx',
            './src/pages/teacher/Analytics.tsx',
          ],
          'student': [
            './src/pages/student/QuizList.tsx',
            './src/pages/student/QuizTaking.tsx',
            './src/pages/student/QuizResult.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})