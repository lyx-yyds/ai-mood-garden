import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署：base 设为仓库名；离线 zip 包场景改为 './'
  base: '/ai-mood-garden/',
  plugins: [react()],
})
