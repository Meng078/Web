<template>
  <view class="page-container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <!-- 标题区域 -->
      <view class="hero-section">
        <view class="back-row">
          <text class="back-link" @click="goBackHome">返回主页</text>
        </view>
        <text class="app-title">列表</text>
        <text class="app-subtitle">数据管理 · 编辑与维护</text>
      </view>

      <!-- 自定义下拉刷新指示器 -->
      <view class="refresh-indicator" :style="{ height: indicatorHeight + 'px' }">
        <view class="ri-inner" :style="{ opacity: indicatorOpacity }">
          <template v-if="pullState === 'pulling'">
            <view class="ri-arrow ri-arrow-down"></view>
            <text class="ri-text">下拉刷新</text>
          </template>
          <template v-else-if="pullState === 'ready'">
            <view class="ri-arrow ri-arrow-up"></view>
            <text class="ri-text">释放刷新</text>
          </template>
          <template v-else-if="pullState === 'refreshing'">
            <view class="ri-spinner"></view>
            <text class="ri-text">刷新中...</text>
          </template>
        </view>
      </view>

      <!-- 滚动区域 -->
      <scroll-view
        ref="scrollViewRef"
        scroll-y
        class="scroll-area"
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
          class="virtual-wrap"
          :style="{ height: virtualWrapHeight + 'px', position: 'relative' }"
        >
          <!-- 仅渲染可见项 + buffer -->
          <view
            v-for="item in renderedItems"
            :key="item.id"
            class="list-card virtual-item"
            :style="{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              transform: 'translateY(' + item._top + 'px)',
            }"
          >
            <text class="item-title">{{ item.title }}</text>
            <view class="item-actions">
              <button class="action-btn btn-edit" @click="handleEdit(item)">编辑</button>
              <button class="action-btn btn-delete" @click="handleDelete(item)">删除</button>
            </view>
          </view>
        </view>

        <!-- 上拉加载区域 -->
        <view class="load-more" @click="onClickLoadMore">
          <template v-if="loadState === 'default'">
            <text class="lm-text">上拉加载更多</text>
          </template>
          <template v-else-if="loadState === 'loading'">
            <view class="lm-spinner"></view>
            <text class="lm-text lm-active">努力加载中...</text>
          </template>
          <template v-else>
            <text class="lm-text lm-done">已完成全部加载</text>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
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
  const viewH = typeof window !== 'undefined' ? window.innerHeight - 200 : 600

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
.page-container {
  min-height: 100vh;
  background-color: #eef2ff;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}
.bg-circle-1 {
  width: 400px;
  height: 400px;
  background: #6366f1;
  top: -100px;
  right: -100px;
}
.bg-circle-2 {
  width: 300px;
  height: 300px;
  background: #10b981;
  bottom: -50px;
  left: -50px;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  padding-top: 48px;
  padding-bottom: 32px;
  height: 100vh;
  overflow: hidden;
}

/* 标题区域 */
.hero-section {
  text-align: center;
  margin-bottom: 0;
  flex-shrink: 0;
}

.back-row {
  text-align: left;
  margin-bottom: 16px;
}

.back-link {
  font-size: 14px;
  color: #6366f1;
  cursor: pointer;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }

  &:active {
    opacity: 0.7;
  }
}

.app-title {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.app-subtitle {
  display: block;
  font-size: 15px;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* ====== 自定义下拉刷新指示器 ====== */
.refresh-indicator {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ri-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;
}

.ri-arrow {
  width: 20px;
  height: 20px;
  border: 2px solid #6366f1;
  border-left: 0;
  border-top: 0;
  transition: transform 0.25s;
}

.ri-arrow-down {
  transform: rotate(45deg);
  margin-top: -8px;
}

.ri-arrow-up {
  transform: rotate(-135deg);
  margin-top: 2px;
}

.ri-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.ri-text {
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
}

/* ====== 滚动区域 ====== */
.scroll-area {
  flex: 1;
  min-height: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  user-select: none;
}

/* 虚拟列表项卡片 */
.virtual-wrap {
  will-change: transform;
}

.list-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  transition: box-shadow 0.25s ease;
  margin-bottom: 0;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.1);
  }
}

.virtual-item {
  margin-bottom: 0;
  // 每个 item 之间留出间距：通过 translateY 定位 + 容器高度 ITEM_HEIGHT 控制
  top: 0;
}

.item-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-btn {
  flex: none;
  width: 100px;
  height: 38px;
  line-height: 38px;
  font-size: 14px;
  border-radius: 19px;
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

.btn-edit {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.btn-delete {
  color: #64748b;
  background: #f1f5f9;
}

/* ====== 上拉加载区域 ====== */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  gap: 8px;
  cursor: pointer;
}

.lm-text {
  font-size: 13px;
  color: #94a3b8;
  transition: color 0.2s;
}

.lm-active {
  color: #6366f1;
}

.lm-done {
  color: #10b981;
}

.lm-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ====== 全局动画 ====== */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* PC端专属优化 */
@media (min-width: 1024px) {
  .app-title {
    font-size: 38px;
  }
}
</style>
