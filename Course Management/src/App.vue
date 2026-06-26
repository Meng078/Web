<script setup>
import {onHide, onLaunch, onShow} from '@dcloudio/uni-app'
import { getCoursesAPI } from '@/api/index.js'

/**
 * ★ 预加载课程数据到前端缓存
 * 在应用启动时立即获取课程数据并存入 localStorage，
 * 当首页（index）挂载时可直接读取缓存，无需等待网络请求
 */
const CACHE_KEY = 'cachedCourses'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 分钟

const preloadCourseData = async () => {
  try {
    // 先检查缓存是否已有效，避免重复请求
    const cached = uni.getStorageSync(CACHE_KEY)
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return // 缓存有效，无需预加载
    }

    // 缓存无效/过期，发起请求
    const res = await getCoursesAPI()
    const courses = (res.data || res || [])

    // 写入缓存
    uni.setStorageSync(CACHE_KEY, {
      data: courses,
      timestamp: Date.now()
    })
  } catch (e) {
    // 预加载失败不影响正常使用，首页会自行加载
  }
}

onLaunch(() => {
  console.log('App Launch')

  // ★ 应用启动立即开始预加载课程数据 ★
  // 这比任何页面 onMounted/onShow 都早触发，
  // 确保用户进入首页时数据已在缓存中
  preloadCourseData()
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
  /* #ifdef H5 */
  /* 安全区域适配 */
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
}

/* #ifdef H5 */
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
  overflow-y: auto;
}

#app {
  width: 100%;
  height: 100%;
}

/* 解除 Uniapp 默认的居中手机壳模拟，拥抱响应式 */
/* 关键：只覆盖宽度相关属性，不碰 height / overflow，让 uni-app 默认 CSS 正常工作 */
uni-page-wrapper {
  display: block !important;
  width: 100% !important;
  background: #f8fafc !important;
  /* 默认 overflow: visible，不拦截滚动事件 */
}

uni-page-body {
  width: 100% !important;
  background: transparent !important;
  max-width: 100% !important;
  box-shadow: none !important;
  margin: 0 !important;
  /* 不设固定 height / overflow，内容可自然溢出到 html */
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


</style>