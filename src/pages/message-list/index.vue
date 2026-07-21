<template>
  <!-- #ifdef H5 -->
  <view class="h5-page">
    <!-- 背景装饰 -->
    <view class="h5-bg-decoration">
      <view class="h5-bg-circle h5-bg-circle-1"></view>
      <view class="h5-bg-circle h5-bg-circle-2"></view>
    </view>

    <!-- 顶部导航栏 64px 毛玻璃 -->
    <view class="h5-navbar">
      <view class="h5-navbar-inner">
        <text class="h5-back-btn" @click="navigateBack">← 返回</text>
        <text class="h5-nav-title">消息记录</text>
        <view class="h5-nav-right"></view>
      </view>
    </view>

    <!-- 主体：两列布局 max-width 1000px -->
    <view class="h5-main">
      <!-- 左侧：对话列表 -->
      <scroll-view
        scroll-y
        class="h5-conv-scroll"
        :show-scrollbar="false"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="handleRefresh"
        @scrolltolower="handleLoadMore"
      >
        <view class="h5-loading" v-if="loading && !isRefreshing">
          <text class="h5-loading-text">正在加载更多...</text>
        </view>

        <view class="h5-empty" v-if="list.length === 0 && !loading">
          <text class="h5-empty-text">暂无消息记录</text>
        </view>

        <view
          class="h5-conv-item"
          v-for="(item, index) in list"
          :key="item.id"
          :class="{ 'h5-conv-active': currentIndex === index }"
          @click="currentIndex = index"
        >
          <image
            class="h5-conv-avatar"
            :src="item.avatar || DEFAULT_AVATAR"
            mode="aspectFill"
          />
          <view class="h5-conv-info">
            <view class="h5-conv-top">
              <text class="h5-conv-name">{{ item.nickname }}</text>
              <text class="h5-conv-time">{{ item.time }}</text>
            </view>
            <text class="h5-conv-preview">{{ item.content }}</text>
          </view>
        </view>

        <view style="height: 40px;"></view>
      </scroll-view>

      <!-- 右侧：消息详情 -->
      <view class="h5-detail-panel">
        <template v-if="activeItem">
          <scroll-view scroll-y class="h5-detail-scroll" :show-scrollbar="false">
            <view class="h5-detail-header">
              <image
                class="h5-detail-avatar"
                :src="activeItem.avatar || DEFAULT_AVATAR"
                mode="aspectFill"
              />
              <view class="h5-detail-meta">
                <text class="h5-detail-name">{{ activeItem.nickname }}</text>
                <text class="h5-detail-time">{{ activeItem.time }}</text>
              </view>
            </view>

            <view class="h5-detail-bubble">
              <text class="h5-detail-text">{{ activeItem.content }}</text>
            </view>

            <!-- 回复列表 -->
            <view class="h5-reply-section" v-if="activeItem.replies && activeItem.replies.length > 0">
              <text class="h5-reply-title">回复 ({{ activeItem.replies.length }})</text>
              <view
                class="h5-reply-item"
                v-for="(reply, rIdx) in activeItem.replies"
                :key="reply.id"
              >
                <image
                  class="h5-reply-avatar"
                  :src="reply.avatar || DEFAULT_AVATAR"
                  mode="aspectFill"
                />
                <view class="h5-reply-body">
                  <text class="h5-reply-content">{{ reply.content }}</text>
                </view>
                <text class="h5-delete-btn" @click.stop="handleRemoveReply(currentIndex, rIdx)">✕</text>
              </view>
            </view>

            <!-- 底部互动栏 -->
            <view class="h5-interaction-bar">
              <view class="h5-action-item" @click="toggleLike(currentIndex)">
                <view class="h5-icon-box h5-like-icon" :class="{ 'h5-active-like': activeItem.isLiked }">♥</view>
                <text class="h5-count-text">{{ activeItem.likeCount }}</text>
              </view>
              <view class="h5-action-item" @click="openReplyDialog(currentIndex)">
                <view class="h5-icon-box h5-comment-icon">💬</view>
                <text class="h5-count-text">{{ activeItem.commentCount }}</text>
              </view>
            </view>

            <view style="height: 40px;"></view>
          </scroll-view>
        </template>
        <view class="h5-detail-empty" v-else>
          <text class="h5-detail-empty-text">选择左侧消息查看详情</text>
        </view>
      </view>
    </view>

    <!-- 回复对话框 Modal -->
    <view class="h5-modal-mask" v-if="showModal">
      <view class="h5-modal-content">
        <view class="h5-modal-header">
          <text class="h5-modal-title">回复 {{ activeItem?.nickname || '用户' }}</text>
          <view class="h5-close-icon" @click="closeReplyDialog(false)">×</view>
        </view>
        <view class="h5-modal-body">
          <textarea
            class="h5-reply-input"
            v-model="replyContent"
            placeholder="请输入您的疑问或想法..."
            maxlength="200"
            auto-height
          ></textarea>
        </view>
        <view class="h5-modal-footer">
          <button class="h5-btn h5-btn-cancel" @click="closeReplyDialog(false)">取消</button>
          <button class="h5-btn h5-btn-submit" @click="submitReply">提交</button>
        </view>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="mp-page">
    <!-- 简洁头部 标题栏 + 返回按钮 -->
    <view class="mp-header" :style="{ paddingTop: 'var(--status-bar-height)' }">
      <view class="mp-header-inner">
        <text class="mp-back-btn" @click="navigateBack">←</text>
        <text class="mp-title">消息记录</text>
        <view class="mp-header-right"></view>
      </view>
    </view>

    <!-- 列表区域 全宽单列 -->
    <scroll-view
      scroll-y
      class="mp-list-scroll"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
    >
      <view class="mp-loading" v-if="loading && !isRefreshing">
        <text class="mp-loading-text">正在加载更多...</text>
      </view>

      <view class="mp-empty" v-if="list.length === 0 && !loading">
        <text class="mp-empty-text">暂无消息记录</text>
      </view>

      <!-- 列表项 -->
      <view class="mp-item-card" v-for="(item, index) in list" :key="item.id">
        <view class="mp-avatar-wrapper">
          <image
            class="mp-avatar-img"
            :src="item.avatar || DEFAULT_AVATAR"
            mode="aspectFill"
          />
        </view>

        <view class="mp-content-area">
          <view class="mp-meta-row">
            <text class="mp-nickname">{{ item.nickname }}</text>
            <text class="mp-time">{{ item.time }}</text>
          </view>

          <!-- 原消息气泡 -->
          <view class="mp-message-bubble">
            <text class="mp-message-text">{{ item.content }}</text>
          </view>

          <!-- 回复列表区域 -->
          <view class="mp-reply-list" v-if="item.replies && item.replies.length > 0">
            <view class="mp-reply-item" v-for="(reply, rIdx) in item.replies" :key="reply.id">
              <image class="mp-reply-avatar" :src="reply.avatar || DEFAULT_AVATAR" mode="aspectFill" />
              <view class="mp-reply-body">
                <text class="mp-reply-content">{{ reply.content }}</text>
              </view>
              <text class="mp-delete-btn" @click.stop="handleRemoveReply(index, rIdx)">✕</text>
            </view>
          </view>

          <!-- 底部互动栏 -->
          <view class="mp-interaction-bar">
            <view class="mp-action-item" @click="toggleLike(index)">
              <view class="mp-icon-box mp-like-icon" :class="{ 'mp-active-like': item.isLiked }">♥</view>
              <text class="mp-count-text">{{ item.likeCount }}</text>
            </view>
            <view class="mp-action-item" @click="openReplyDialog(index)">
              <view class="mp-icon-box mp-comment-icon">💬</view>
              <text class="mp-count-text">{{ item.commentCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 40px;"></view>
    </scroll-view>

    <!-- 回复对话框 Modal -->
    <view class="mp-modal-mask" v-if="showModal">
      <view class="mp-modal-content">
        <view class="mp-modal-header">
          <text class="mp-modal-title">回复 {{ activeItem?.nickname || '用户' }}</text>
          <view class="mp-close-icon" @click="closeReplyDialog(false)">×</view>
        </view>
        <view class="mp-modal-body">
          <textarea
            class="mp-reply-input"
            v-model="replyContent"
            placeholder="请输入您的疑问或想法..."
            maxlength="200"
            auto-height
          ></textarea>
        </view>
        <view class="mp-modal-footer">
          <button class="mp-btn mp-btn-cancel" @click="closeReplyDialog(false)">取消</button>
          <button class="mp-btn mp-btn-submit" @click="submitReply">提交</button>
        </view>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { saveMessageState, restoreMessageState, clearMessageCache, hasMessageCache } from '@/stores/messageStore';

// 使用 Vite import 引入静态资源，确保路径可靠
import avatar001 from '@/assets/avatars/avatar_001.png';
import avatar002 from '@/assets/avatars/avatar_002.jpg';
import avatar003 from '@/assets/avatars/avatar_003.jpg';
import avatar004 from '@/assets/avatars/avatar_004.jpg';
import avatar005 from '@/assets/avatars/avatar_005.png';
import avatar006 from '@/assets/avatars/avatar_006.png';

const AVATAR_MAP = {
  '木木':     avatar001,
  '大白':     avatar002,
  '小明同学': avatar003,
  '旅行日记': avatar004,
  '深夜食堂': avatar005,
};

const DEFAULT_AVATAR = avatar006;

// 数据状态
const list = ref([]);
const loading = ref(false);
const isRefreshing = ref(false);
const page = ref(1);
const pageSize = 10;

// 弹窗状态
const showModal = ref(false);
const replyContent = ref('');
const currentIndex = ref(-1);

// 计算当前选中的条目
const activeItem = computed(() => {
  return currentIndex.value !== -1 ? list.value[currentIndex.value] : null;
});

// 用户池
const users = [
  { name: '木木', avatar: AVATAR_MAP['木木'] },
  { name: '大白', avatar: AVATAR_MAP['大白'] },
  { name: '小明同学', avatar: AVATAR_MAP['小明同学'] },
  { name: '旅行日记', avatar: AVATAR_MAP['旅行日记'] },
  { name: '深夜食堂', avatar: AVATAR_MAP['深夜食堂'] }
];

// 模拟数据生成器
const generateMockData = () => {
  const contents = [
    '你赶快给我回个电话 你人呢 你可是没有带脑子啊 我问你 接个电话就这么难吗',
    '你给我回个电话可行 你现在到哪了',
    '你现在在哪啊 是骑小黄车回来的吗',
    '高伟莉在吗',
    '因为你的贪 和没有担当，你活成什么样子',
    '今天的天气真不错，适合出去走走',
    '项目进度怎么样了？客户那边反馈如何？',
    '晚安  ，好梦 🌙'
  ];

  return Array.from({ length: pageSize }, (_, i) => {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    return {
      id: `${Date.now()}-${i}`,
      nickname: randomUser.name,
      avatar: randomUser.avatar,
      time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      content: contents[Math.floor(Math.random() * contents.length)],
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      replies: []
    };
  });
};

// 获取数据
const fetchData = async () => {
  if (loading.value) return;
  loading.value = true;

  await new Promise(resolve => setTimeout(resolve, 800));

  if (page.value === 1) {
    list.value = generateMockData();
  } else {
    list.value.push(...generateMockData());
  }

  loading.value = false;
  isRefreshing.value = false;
};

// 下拉刷新
const handleRefresh = () => {
  clearMessageCache();
  page.value = 1;
  isRefreshing.value = true;
  fetchData();
};

const handleLoadMore = () => {
  if (!loading.value) {
    page.value++;
    fetchData();
  }
};

const navigateBack = () => {
  saveMessageState(list.value, page.value);
  uni.reLaunch({ url: '/pages/index/index' });
};

// 初始化
onMounted(() => {
  if (hasMessageCache()) {
    const cached = restoreMessageState();
    if (cached) {
      list.value = cached.list;
      page.value = cached.page;
      return;
    }
  }
  fetchData();
});

// 核心交互逻辑
const toggleLike = (index) => {
  const item = list.value[index];
  if (item) {
    item.isLiked = !item.isLiked;
    item.likeCount += item.isLiked ? 1 : -1;
    list.value[index] = { ...item }; // 触发响应式更新
  }
};

const openReplyDialog = (index) => {
  currentIndex.value = index;
  replyContent.value = '';
  showModal.value = true;
};

const closeReplyDialog = (needClear = true) => {
  showModal.value = false;
  if (needClear) {
    replyContent.value = '';
    currentIndex.value = -1;
  }
};

const submitReply = () => {
  if (!replyContent.value.trim()) {
    uni.showToast({ title: '回复内容不能为空', icon: 'none' });
    return;
  }

  const item = list.value[currentIndex.value];
  if (item) {
    item.replies.push({
      id: Date.now(),
      avatar: DEFAULT_AVATAR,
      content: replyContent.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    item.commentCount += 1;
    list.value[currentIndex.value] = { ...item };

    uni.showToast({ title: '回复成功', icon: 'success' });
    closeReplyDialog(true);
  }
};

const handleRemoveReply = (itemIdx, replyIdx) => {
  const item = list.value[itemIdx];
  if (item && item.replies[replyIdx]) {
    if (item.commentCount > 0) {
      item.commentCount -= 1;
    }
    item.replies.splice(replyIdx, 1);
    list.value[itemIdx] = { ...item };
    uni.showToast({ title: '已撤回', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
/* #ifdef H5 */
.h5-page {
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

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
  opacity: 0.3;
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
  width: 60px;
}

/* 主体两列布局 */
.h5-main {
  flex: 1;
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 88px 24px 24px 24px;
  box-sizing: border-box;
  gap: 24px;
  position: relative;
  z-index: 1;
  height: 100vh;
  overflow: hidden;
}

/* 左侧对话列表 */
.h5-conv-scroll {
  width: 340px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
  overflow: hidden;
}

.h5-loading,
.h5-empty {
  padding: 24px 0;
  text-align: center;
}

.h5-loading-text,
.h5-empty-text {
  font-size: 14px;
  color: #94a3b8;
}

.h5-conv-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &.h5-conv-active {
    background: rgba(99, 102, 241, 0.06);
    border-left: 3px solid #6366f1;
    padding-left: 17px;
  }
}

.h5-conv-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #f1f5f9;
}

.h5-conv-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.h5-conv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h5-conv-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h5-conv-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 8px;
}

.h5-conv-preview {
  font-size: 13px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* 右侧消息详情 */
.h5-detail-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.h5-detail-scroll {
  flex: 1;
  height: 100%;
}

.h5-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.h5-detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #f1f5f9;
}

.h5-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.h5-detail-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.h5-detail-time {
  font-size: 13px;
  color: #94a3b8;
}

.h5-detail-bubble {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 20px 24px;
  margin: 24px 28px;
}

.h5-detail-text {
  font-size: 16px;
  color: #334155;
  line-height: 1.6;
}

.h5-reply-section {
  padding: 0 28px;
  margin-bottom: 24px;
}

.h5-reply-title {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 16px;
  display: block;
}

.h5-reply-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #8b5cf6;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.h5-reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  background-color: #f1f5f9;
}

.h5-reply-body {
  flex: 1;
  min-width: 0;
}

.h5-reply-content {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}

.h5-delete-btn {
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  margin-top: 4px;
  flex-shrink: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #ef4444;
  }
}

.h5-interaction-bar {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 28px;
  border-top: 1px solid #e2e8f0;
}

.h5-action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}

.h5-icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &.h5-like-icon {
    background: #fef2f2;
    color: #ef4444;

    &.h5-active-like {
      background: #ef4444;
      color: #fff;
    }
  }

  &.h5-comment-icon {
    background: #ecfdf5;
    color: #10b981;
  }
}

.h5-count-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.h5-detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.h5-detail-empty-text {
  font-size: 16px;
  color: #94a3b8;
}

/* Modal */
.h5-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.h5-modal-content {
  width: 480px;
  max-width: 90%;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: h5FadeInUp 0.3s ease;
}

@keyframes h5FadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.h5-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.h5-modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
}

.h5-close-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }
}

.h5-modal-body {
  padding: 24px 28px;
}

.h5-reply-input {
  width: 100%;
  min-height: 120px;
  font-size: 15px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
}

.h5-modal-footer {
  padding: 20px 28px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.h5-btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 22px;
  font-size: 15px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
}

.h5-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.h5-btn-submit {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.mp-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
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

/* 列表区域 */
.mp-list-scroll {
  flex: 1;
  height: 100vh;
  padding-top: calc(var(--status-bar-height) + 44px);
  box-sizing: border-box;
}

.mp-loading,
.mp-empty {
  padding: 12px 0;
  text-align: center;
}

.mp-loading-text,
.mp-empty-text {
  font-size: 13px;
  color: #94a3b8;
}

.mp-item-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  margin: 0 12px 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  gap: 10px;
}

.mp-avatar-wrapper {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.mp-avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: block;
}

.mp-content-area {
  flex: 1;
  min-width: 0;
}

.mp-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.mp-nickname {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.mp-time {
  font-size: 11px;
  color: #94a3b8;
}

.mp-message-bubble {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.mp-message-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.mp-reply-list {
  margin-bottom: 10px;
}

.mp-reply-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #8b5cf6;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.mp-reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f1f5f9;
  flex-shrink: 0;
  margin-top: 2px;
}

.mp-reply-body {
  flex: 1;
  min-width: 0;
}

.mp-reply-content {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.mp-delete-btn {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1;
  margin-top: 2px;
  align-self: flex-end;
  min-width: 44px;
  text-align: right;

  &:active {
    color: #ef4444;
  }
}

.mp-interaction-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.mp-action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 44px;
}

.mp-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;

  &.mp-like-icon {
    background: #fef2f2;
    color: #ef4444;

    &.mp-active-like {
      background: #ef4444;
      color: #fff;
    }
  }

  &.mp-comment-icon {
    background: #ecfdf5;
    color: #10b981;
  }
}

.mp-count-text {
  font-size: 13px;
  color: #64748b;
}

/* Modal */
.mp-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mp-modal-content {
  width: 85%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  animation: mpFadeInUp 0.3s ease;
}

@keyframes mpFadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mp-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.mp-modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.mp-close-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #94a3b8;
}

.mp-modal-body {
  padding: 16px;
}

.mp-reply-input {
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  color: #334155;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.mp-modal-footer {
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
}

.mp-btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 22px;
  font-size: 14px;
  border: none;
  margin-bottom: 0;

  &::after {
    border: none;
  }
}

.mp-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.mp-btn-submit {
  background: #6366f1;
  color: #ffffff;
}
/* #endif */
</style>
