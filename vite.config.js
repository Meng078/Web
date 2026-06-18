import {defineConfig} from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  // PC端开发推荐配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.json', '.vue', '.scss', '.css']
  },
  server: {
    port: 3000, // 推荐端口，避免与常见服务冲突
    open: true  // 启动时自动打开浏览器
  }
})