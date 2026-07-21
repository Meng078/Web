<template>
  <!-- #ifdef H5 -->
  <view class="h5-page-container">
    <!-- 背景装饰 -->
    <view class="h5-bg-decoration">
      <view class="h5-bg-circle h5-bg-circle-1"></view>
      <view class="h5-bg-circle h5-bg-circle-2"></view>
    </view>

    <!-- 顶部导航栏 64px 毛玻璃 -->
    <view class="h5-navbar">
      <view class="h5-navbar-inner">
        <text class="h5-back-btn" @click="goBackHome">← 返回主页</text>
        <text class="h5-nav-title">列表管理</text>
        <view class="h5-nav-right"></view>
      </view>
    </view>

    <!-- 主体容器 max-width 1000px -->
    <view class="h5-content-wrapper">
      <!-- 标题区域 -->
      <view class="h5-hero-section">
        <text class="h5-app-title">列表</text>
        <text class="h5-app-subtitle">数据管理 · 编辑与维护</text>
      </view>

      <!-- 自定义下拉刷新指示器 -->
      <view class="h5-refresh-indicator" :style="{ height: indicatorHeight + 'px' }">
        <view class="h5-ri-inner" :style="{ opacity: indicatorOpacity }">
          <template v-if="pullState === 'pulling'">
            <view class="h5-ri-arrow h5-ri-arrow-down"></view>
            <text class="h5-ri-text">下拉刷新</text>
          </template>
          <template v-else-if="pullState === 'ready'">
            <view class="h5-ri-arrow h5-ri-arrow-up"></view>
            <text class="h5-ri-text">释放刷新</text>
          </template>
          <template v-else-if="pullState === 'refreshing'">
            <view class="h5-ri-spinner"></view>
            <text class="h5-ri-text">刷新中...</text>
          </template>
        </view>
      </view>

      <!-- 滚动区域 -->
      <scroll-view
        ref="scrollViewRef"
        scroll-y
        class="h5-scroll-area"
        :style="scrollAreaStyle"
        @scroll="onScroll"
        @scrolltolower="onReachBottom"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
      >
        <!-- 虚拟列表占位容器 -->
        <view
          class="h5-virtual-wrap"
          :style="{ height: virtualWrapHeight + 'px', position: 'relative' }"
        >
          <view
            v-for="item in renderedItems"
            :key="item.id"
            class="h5-list-card h5-virtual-item"
            :style="{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              transform: 'translateY(' + item._top + 'px)',
            }"
          >
            <view class="h5-card-header">
              <text class="h5-item-title">{{ item.title }}</text>
              <view class="h5-item-actions">
                <button class="h5-action-btn h5-btn-edit" @click="handleEdit(item)">编辑</button>
                <button class="h5-action-btn h5-btn-delete" @click="handleDelete(item)">删除</button>
              </view>
            </view>
            <view class="h5-card-meta">
              <text class="h5-card-id">ID: {{ item.id }}</text>
              <text class="h5-card-index">序号: {{ item._index }}</text>
            </view>
          </view>
        </view>

        <!-- 上拉加载区域 -->
        <view class="h5-load-more" @click="onClickLoadMore">
          <template v-if="loadState === 'default'">
            <text class="h5-lm-text">上拉加载更多</text>
          </template>
          <template v-else-if="loadState === 'loading'">
            <view class="h5-lm-spinner"></view>
            <text class="h5-lm-text h5-lm-active">努力加载中...</text>
          </template>
          <template v-else>
            <text class="h5-lm-text h5-lm-done">已完成全部加载</text>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="mp-page-container">
    <!-- 简洁头部 标题栏 + 返回按钮 -->
    <view class="mp-header" :style="{ paddingTop: 'var(--status-bar-height)' }">
      <view class="mp-header-inner">
        <text class="mp-back-btn" @click="goBackHome">←</text>
        <text class="mp-title">列表管理</text>
        <view class="mp-header-right"></view>
      </view>
    </view>

    <!-- 主体容器 全宽 -->
    <view class="mp-content-wrapper">
      <!-- 标题区域 -->
      <view class="mp-hero-section">
        <text class="mp-app-title">列表</text>
        <text class="mp-app-subtitle">数据管理 · 编辑与维护</text>
      </view>

      <!-- 自定义下拉刷新指示器 -->
      <view class="mp-refresh-indicator" :style="{ height: indicatorHeight + 'px' }">
        <view class="mp-ri-inner" :style="{ opacity: indicatorOpacity }">
          <template v-if="pullState === 'pulling'">
            <view class="mp-ri-arrow mp-ri-arrow-down"></view>
            <text class="mp-ri-text">下拉刷新</text>
          </template>
          <template v-else-if="pullState === 'ready'">
            <view class="mp-ri-arrow mp-ri-arrow-up"></view>
            <text class="mp-ri-text">释放刷新</text>
          </template>
          <template v-else-if="pullState === 'refreshing'">
            <view class="mp-ri-spinner"></view>
            <text class="mp-ri-text">刷新中...</text>
          </template>
        </view>
      </view>

      <!-- 滚动区域 -->
      <scroll-view
        ref="scrollViewRef"
        scroll-y
        class="mp-scroll-area"
        :style="scrollAreaStyle"
        @scroll="onScroll"
        @scrolltolower="onReachBottom"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- 虚拟列表占位容器 -->
        <view
          class="mp-virtual-wrap"
          :style="{ height: virtualWrapHeight + 'px', position: 'relative' }"
        >
          <view
            v-for="item in renderedItems"
            :key="item.id"
            class="mp-list-card mp-virtual-item"
            :style="{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              transform: 'translateY(' + item._top + 'px)',
            }"
          >
            <text class="mp-item-title">{{ item.title }}</text>
            <view class="mp-item-actions">
              <button class="mp-action-btn mp-btn-edit" @click="handleEdit(item)">编辑</button>
              <button class="mp-action-btn mp-btn-delete" @click="handleDelete(item)">删除</button>
            </view>
          </view>
        </view>

        <!-- 上拉加载区域 -->
        <view class="mp-load-more" @click="onClickLoadMore">
          <template v-if="loadState === 'default'">
            <text class="mp-lm-text">上拉加载更多</text>
          </template>
          <template v-else-if="loadState === 'loading'">
            <view class="mp-lm-spinner"></view>
            <text class="mp-lm-text mp-lm-active">努力加载中...</text>
          </template>
          <template v-else>
            <text class="mp-lm-text mp-lm-done">已完成全部加载</text>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ===================== 常量 =====================
const ITEM_HEIGHT = 140          // 每个列表项预估高度
const BUFFER = 5                 // 上下额外渲染项数
const PAGE_SIZE = 20             // 每页条目数
const MAX_PAGES = 3              // 模拟总页数
const REFRESH_THRESHOLD = 50     // 触发刷新的下拉距离
const LM_HEIGHT = 60             // 上拉加载区域高度

// ===================== 数据 =====================
const allData = ref([])
const page = ref(0)
const loadState = ref('default')   // 'default' | 'loading' | 'complete'
const hasMore = computed(() => page.value < MAX_PAGES)

// 滚动位置（虚拟列表用）
const scrollTop = ref(0)

// 下拉刷新状态
const pullState = ref('idle')      // 'idle' | 'pulling' | 'ready' | 'refreshing'
const pullDistance = ref(0)
let touchStartY = 0
let touchStartST = 0
let isTouching = false
const transitionEnabled = ref(true)

// ===================== 计算属性 =====================

// 虚拟列表可见区间
const visibleRange = computed(() => {
  const total = allData.value.length
  if (total === 0) return { start: 0, end: 0 }

  const listOffset = 200 // 标题区域近似高度
  const listScrollTop = Math.max(0, scrollTop.value - listOffset)
  const sysInfo = uni.getSystemInfoSync()
  const viewH = sysInfo.windowHeight - 200

  const start = Math.max(0, Math.floor(listScrollTop / ITEM_HEIGHT) - BUFFER)
  const end = Math.min(total, Math.ceil((listScrollTop + viewH) / ITEM_HEIGHT) + BUFFER)
  return { start, end }
})

// 实际渲染的可见项
const renderedItems = computed(() => {
  const { start, end } = visibleRange.value
  return allData.value.slice(start, end).map((item, i) => ({
    ...item,
    _top: (start + i) * ITEM_HEIGHT,
  }))
})

// 虚拟容器总高度 = 所有项 + 加载区域
const virtualWrapHeight = computed(() => {
  return allData.value.length * ITEM_HEIGHT
})

// 下拉指示器高度（带阻尼）
const indicatorHeight = computed(() => {
  if (pullState.value === 'idle') return 0
  if (pullState.value === 'refreshing') return 50
  return Math.min(pullDistance.value, 80)
})

const indicatorOpacity = computed(() => Math.min(indicatorHeight.value / 40, 1))

// 内容偏移量（scroll-view 的 translateY）
const contentOffset = computed(() => {
  if (pullState.value === 'idle') return 0
  return indicatorHeight.value
})

const scrollAreaStyle = computed(() => {
  const style = {}
  if (contentOffset.value > 0) {
    style.transform = 'translateY(' + contentOffset.value + 'px)'
  }
  if (!transitionEnabled.value) {
    style.transition = 'none'
  }
  return style
})

// ===================== 上拉加载 =====================

const loadPage = () => {
  if (loadState.value === 'loading' || (!hasMore.value && allData.value.length > 0)) return

  loadState.value = 'loading'

  setTimeout(() => {
    const nextPage = page.value + 1

    if (nextPage > MAX_PAGES) {
      loadState.value = 'complete'
      page.value = MAX_PAGES
      return
    }

    const startId = (nextPage - 1) * PAGE_SIZE + 1
    const newItems = Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: startId + i,
      title: '新数据' + (startId + i),
      content: '',
      _index: allData.value.length + i,
    }))
    allData.value.push(...newItems)
    page.value = nextPage
    loadState.value = nextPage >= MAX_PAGES ? 'complete' : 'default'
  }, 1000)
}

const onReachBottom = () => {
  if (loadState.value === 'loading' || loadState.value === 'complete') return
  loadPage()
}

const onClickLoadMore = () => {
  if (loadState.value === 'loading' || loadState.value === 'complete') return
  loadPage()
}

// ===================== 下拉刷新 =====================

const doRefresh = () => {
  pullState.value = 'refreshing'
  transitionEnabled.value = true

  setTimeout(() => {
    // 重置数据
    const firstPageItems = Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: i + 1,
      title: '新数据' + (i + 1),
      content: '',
      _index: i,
    }))
    allData.value = firstPageItems
    page.value = 1
    loadState.value = MAX_PAGES > 1 ? 'default' : 'complete'
    scrollTop.value = 0

    // 动画回弹
    pullState.value = 'idle'
    pullDistance.value = 0

    uni.showToast({ title: '刷新成功', icon: 'success' })
  }, 1000)
}

// 统一拖拽处理（兼容触摸和鼠标）
const startDrag = (clientY) => {
  if (pullState.value === 'refreshing') return
  touchStartY = clientY
  touchStartST = scrollTop.value
  isTouching = true
  transitionEnabled.value = false
}

const moveDrag = (clientY) => {
  if (pullState.value === 'refreshing' || !isTouching) return

  const dy = clientY - touchStartY

  // 只在页面顶部且下拉时触发
  if (scrollTop.value <= 2 && dy > 0) {
    pullDistance.value = dy * 0.4 // 阻尼系数
    pullState.value = pullDistance.value > REFRESH_THRESHOLD ? 'ready' : 'pulling'
  } else if (scrollTop.value <= 2 && pullState.value !== 'idle') {
    // 回到顶部但未下拉 → 复位
    pullState.value = 'idle'
    pullDistance.value = 0
  }
}

const endDrag = () => {
  isTouching = false
  transitionEnabled.value = true

  if (pullState.value === 'ready') {
    doRefresh()
  } else if (pullState.value === 'pulling') {
    pullState.value = 'idle'
    pullDistance.value = 0
  }
}

// 触摸事件
const onTouchStart = (e) => startDrag(e.touches[0].clientY)
const onTouchMove = (e) => moveDrag(e.touches[0].clientY)
const onTouchEnd = () => endDrag()

// 鼠标事件（桌面PC兼容）
const onMouseDown = (e) => startDrag(e.clientY)
const onMouseMove = (e) => moveDrag(e.clientY)
const onMouseUp = () => endDrag()
const onMouseLeave = () => { if (isTouching) endDrag() }

// ===================== 滚动 =====================

const onScroll = (e) => {
  scrollTop.value = e.detail.scrollTop
}

// ===================== 操作方法 =====================

const goBackHome = () => {
  uni.reLaunch({ url: '/pages/index/index' })
}

const handleEdit = (item) => {
  uni.showToast({ title: '编辑 ' + item.title, icon: 'none' })
}

const handleDelete = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除 ' + item.title + ' 吗？',
    success: (res) => {
      if (res.confirm) {
        const idx = allData.value.findIndex(i => i.id === item.id)
        if (idx !== -1) {
          allData.value.splice(idx, 1)
        }
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    },
  })
}

// ===================== 生命周期 =====================

onMounted(() => {
  // 初始展示3条随机数据
  const pool = ['数据分析报告', '用户反馈汇总', '系统更新日志', '项目进度跟踪']
  const selected = [...pool].sort(() => Math.random() - 0.5).slice(0, 3)
  allData.value = selected.map((title, i) => ({
    id: -(i + 1), // 负数ID避免与后续加载页冲突
    title,
    content: '',
    _index: i,
  }))
  page.value = 0
  loadState.value = 'default'
})
</script>

<style scoped lang="scss">
/* #ifdef H5 */
.h5-page-container {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.h5-bg-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.h5-bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.h5-bg-circle-1 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  top: -150px;
  right: -150px;
}

.h5-bg-circle-2 {
  width: 400px;
  height: 400px;
  background: #8b5cf6;
  bottom: -100px;
  left: -100px;
}

/* 顶部导航栏 64px 毛玻璃 */
.h5-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 100;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid #e2e8f0;
}

.h5-navbar-inner {
  max-width: 1000px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.h5-back-btn {
  font-size: 16px;
  color: #6366f1;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}

.h5-nav-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.h5-nav-right {
  width: 80px;
}

/* 主体容器 */
.h5-content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1000px;
  padding: 88px 24px 24px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 标题区域 */
.h5-hero-section {
  text-align: center;
  margin-bottom: 0;
  flex-shrink: 0;
  padding-bottom: 8px;
}

.h5-app-title {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.h5-app-subtitle {
  display: block;
  font-size: 16px;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* 下拉刷新指示器 */
.h5-refresh-indicator {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.h5-ri-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;
}

.h5-ri-arrow {
  width: 20px;
  height: 20px;
  border: 2px solid #6366f1;
  border-left: 0;
  border-top: 0;
  transition: transform 0.25s;
}

.h5-ri-arrow-down {
  transform: rotate(45deg);
  margin-top: -8px;
}

.h5-ri-arrow-up {
  transform: rotate(-135deg);
  margin-top: 2px;
}

.h5-ri-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: h5Spin 0.7s linear infinite;
}

.h5-ri-text {
  font-size: 14px;
  color: #6366f1;
  font-weight: 500;
}

/* 滚动区域 */
.h5-scroll-area {
  flex: 1;
  min-height: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  user-select: none;
}

.h5-virtual-wrap {
  will-change: transform;
}

/* 列表卡片 */
.h5-list-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 0;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
    transform: translateY(-2px);
  }
}

.h5-virtual-item {
  top: 0;
}

.h5-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.h5-item-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
}

.h5-card-meta {
  display: flex;
  gap: 20px;
}

.h5-card-id,
.h5-card-index {
  font-size: 13px;
  color: #94a3b8;
}

.h5-item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.h5-action-btn {
  flex: none;
  width: 100px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-weight: 500;

  &::after {
    border: none;
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
}

.h5-btn-edit {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.h5-btn-delete {
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

/* 上拉加载区域 */
.h5-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  gap: 8px;
  cursor: pointer;
}

.h5-lm-text {
  font-size: 14px;
  color: #94a3b8;
  transition: color 0.2s;
}

.h5-lm-active {
  color: #6366f1;
}

.h5-lm-done {
  color: #10b981;
}

.h5-lm-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: h5Spin 0.7s linear infinite;
}

@keyframes h5Spin {
  to {
    transform: rotate(360deg);
  }
}
/* #endif */

/* #ifdef MP-WEIXIN */
.mp-page-container {
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
}

/* 简洁头部 */
.mp-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.mp-header-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.mp-back-btn {
  font-size: 20px;
  color: #0f172a;
  width: 44px;
  height: 44px;
  line-height: 44px;
  text-align: center;
}

.mp-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.mp-header-right {
  width: 44px;
}

/* 主体容器 */
.mp-content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--status-bar-height) + 44px + 16px);
  padding-bottom: 16px;
  height: 100vh;
  overflow: hidden;
}

/* 标题区域 */
.mp-hero-section {
  text-align: center;
  margin-bottom: 0;
  flex-shrink: 0;
  padding-bottom: 4px;
}

.mp-app-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.mp-app-subtitle {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

/* 下拉刷新指示器 */
.mp-refresh-indicator {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mp-ri-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.mp-ri-arrow {
  width: 18px;
  height: 18px;
  border: 2px solid #6366f1;
  border-left: 0;
  border-top: 0;
  transition: transform 0.25s;
}

.mp-ri-arrow-down {
  transform: rotate(45deg);
  margin-top: -6px;
}

.mp-ri-arrow-up {
  transform: rotate(-135deg);
  margin-top: 2px;
}

.mp-ri-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: mpSpin 0.7s linear infinite;
}

.mp-ri-text {
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
}

/* 滚动区域 */
.mp-scroll-area {
  flex: 1;
  min-height: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.mp-virtual-wrap {
  will-change: transform;
}

/* 列表卡片 */
.mp-list-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 0;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  &:active {
    background-color: #f8fafc;
  }
}

.mp-virtual-item {
  top: 0;
}

.mp-item-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 14px;
}

.mp-item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.mp-action-btn {
  flex: none;
  width: 80px;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: opacity 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

.mp-btn-edit {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.mp-btn-delete {
  color: #64748b;
  background: #f1f5f9;
}

/* 上拉加载区域 */
.mp-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  gap: 8px;
}

.mp-lm-text {
  font-size: 13px;
  color: #94a3b8;
  transition: color 0.2s;
}

.mp-lm-active {
  color: #6366f1;
}

.mp-lm-done {
  color: #10b981;
}

.mp-lm-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: mpSpin 0.7s linear infinite;
}

@keyframes mpSpin {
  to {
    transform: rotate(360deg);
  }
}
/* #endif */
</style>
