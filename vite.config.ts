import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      "^/api": {
        target: 'https://www.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})