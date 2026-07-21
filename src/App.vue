<script setup>
import {onHide, onLaunch, onShow} from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // #ifdef H5
  // 每次启动都默认显示登录页面，而不是上次离开时的页面
  // 使用 sessionStorage 区分"首次启动"和"页面刷新"：
  //   - 首次启动（关闭浏览器后重新打开）：重定向到登录页
  //   - 页面刷新（F5/Ctrl+R）：保持当前页面，不执行任何操作
  if (!sessionStorage.getItem('appLaunched')) {
    sessionStorage.setItem('appLaunched', '1');
    uni.reLaunch({ url: '/pages/mobile-login/index' });
  }
  // #endif
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
  /* #ifdef H5 */
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
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

/* H5 端页面切换淡入动画 */
uni-page-wrapper {
  animation: pageFadeIn 0.25s ease;
}

@keyframes pageFadeIn {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ================= 微信小程序端全局页面切换动画 ================= */
/* #ifdef MP-WEIXIN */
/* 给每个页面根元素添加淡入动画，让页面切换更丝滑 */
page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  animation: mpPageFadeIn 0.2s ease;
}

/* 全局盒模型重置，确保 padding/border 不撑破容器 */
view, text, image, input, button, textarea, scroll-view {
  box-sizing: border-box;
}

@keyframes mpPageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* #endif */

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
  overflow-x: hidden !important;
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

/* uni.showModal 弹窗宽度覆盖 */
.uni-modal {
  width: 320px !important;
  max-width: 320px !important;
}

/* 统一页面容器基础样式（供各页面 class="page-container" 继承） */
.page-container, .agreement-page, .mine-page, .login-page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}
/* #endif */

/* ================= 微信小程序端优化 ================= */
/* #ifdef MP-WEIXIN */
page {
  /* 微信小程序安全区域适配 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
</style>