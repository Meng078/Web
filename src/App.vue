<script setup>
import {onHide, onLaunch, onShow} from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* ================= 全局基础重置 ================= */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
  sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
  background-color: #f8fafc;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  /* 安全区域适配 */
  padding-bottom: env(safe-area-inset-bottom);
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  transition: background 0.2s;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* ================= H5端 PC/桌面端优化 ================= */
/* #ifdef H5 */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
  overflow-x: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

/* 解除 Uniapp 默认的居中手机壳模拟，拥抱响应式 */
uni-page-wrapper {
  display: block !important;
  width: 100% !important;
  min-height: 100vh !important;
  overflow-y: auto !important;
  background: #f8fafc !important;
}

uni-page-body {
  width: 100% !important;
  min-height: 100vh !important;
  background: transparent !important;
  /* 关键：移除原 max-width: 430px 限制，允许内容自适应宽度 */
  max-width: 100% !important;
  box-shadow: none !important;
}

/* 统一页面容器基础样式（供各页面 class="page-container" 继承） */
.page-container, .agreement-page, .mine-page, .login-page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}
/* #endif */
</style>