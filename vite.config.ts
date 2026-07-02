import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 默认相对路径（离线 zip / file:// 可用）
  // GitHub Pages 部署时通过 --base /ai-mood-garden/ 覆盖，互不影响
  base: './',
  plugins: [react()],
})
