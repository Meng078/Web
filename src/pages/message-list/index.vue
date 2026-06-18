<template>
  <view class="message-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <!-- 顶部标题栏 -->
    <view class="card-header-container">
      <view class="card-header">
        <text class="back-text" @click="navigateBack">返回</text>
        <text class="card-title">消息记录</text>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view
        scroll-y
        class="list-scroll-view"
        :show-scrollbar="false"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="handleRefresh"
        @scrolltolower="handleLoadMore"
    >
      <!-- 提示文字 -->
      <view class="loading-status" v-if="loading && !isRefreshing">
        <text class="status-text">正在加载更多...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="list.length === 0 && !loading">
        <text>暂无消息记录</text>
      </view>

      <!-- 列表项 -->
      <view class="item-card" v-for="(item, index) in list" :key="item.id">
        <view class="avatar-wrapper">
          <img
              class="avatar-img"
              :src="item.avatar || DEFAULT_AVATAR"
              alt="头像"
          />
        </view>

        <view class="content-area">
          <view class="meta-row">
            <text class="nickname">{{ item.nickname }}</text>
            <text class="time">{{ item.time }}</text>
          </view>

          <!-- 原消息气泡 -->
          <view class="message-bubble">
            <text class="message-text">{{ item.content }}</text>
          </view>

          <!-- 回复列表区域 -->
          <view class="reply-list" v-if="item.replies && item.replies.length > 0">
            <view class="reply-item" v-for="(reply, rIdx) in item.replies" :key="reply.id">
              <img class="reply-avatar" :src="reply.avatar || DEFAULT_AVATAR" alt="回复头像" />
              <view class="reply-body">
                <text class="reply-content">{{ reply.content }}</text>
              </view>
              <!-- 撤回/删除按钮 -->
              <text class="delete-btn" @click.stop="handleRemoveReply(index, rIdx)">✕</text>
            </view>
          </view>

          <!-- 底部互动栏 -->
          <view class="interaction-bar">
            <view class="action-item" @click="toggleLike(index)">
              <view class="icon-box like-icon" :class="{ 'active-like': item.isLiked }">♥</view>
              <text class="count-text">{{ item.likeCount }}</text>
            </view>

            <view class="action-item" @click="openReplyDialog(index)">
              <view class="icon-box comment-icon">💬</view>
              <text class="count-text">{{ item.commentCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 40px;"></view>
    </scroll-view>

    <!-- 回复对话框 Modal -->
    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">回复 {{ activeItem?.nickname || '用户' }}</text>
          <view class="close-icon" @click="closeReplyDialog(false)">×</view>
        </view>

        <view class="modal-body">
          <textarea
              class="reply-input"
              v-model="replyContent"
              placeholder="请输入您的疑问或想法..."
              maxlength="200"
              auto-height
          ></textarea>
        </view>

        <view class="modal-footer">
          <button class="btn btn-cancel" @click="closeReplyDialog(false)">取消</button>
          <button class="btn btn-submit" @click="submitReply">提交</button>
        </view>
      </view>
    </view>
  </view>
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
.message-page {
  min-height: 100vh;
  background-color: #eef2ff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

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

.card-header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 20px 20px 0 20px;
  background: linear-gradient(180deg, rgba(238, 242, 255, 1) 0%, rgba(238, 242, 255, 0) 100%);
}

.card-header {
  width: calc(100% - 40px);
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 12px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-text {
  position: absolute;
  left: 24px;
  font-size: 14px;
  color: #64748b;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.list-scroll-view {
  flex: 1;
  height: 100vh;
  padding: 80px 16px 20px 16px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.loading-status, .empty-state {
  padding: 10px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}

.item-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 12px;
}

.avatar-wrapper {
  /* 确保头像容器不被压缩 */
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f1f5f9;
  /* 增强图片显示属性 */
  display: block;
  object-fit: cover;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.nickname {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.time {
  font-size: 12px;
  color: #94a3b8;
}

.message-bubble {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.message-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.reply-list {
  margin-bottom: 10px;
}

.reply-item {
  background: #fcfcfc;
  border: 1px solid #f1f5f9;
  border-left: 3px solid #cbd5e1;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f1f5f9;
  flex-shrink: 0;
  margin-top: 2px;
  object-fit: cover;
}

.reply-body {
  flex: 1;
  min-width: 0;
}

.reply-content {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.delete-btn {
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  margin-top: 2px;
  align-self: flex-end;

  &:active {
    color: #ef4444;
  }
}

.interaction-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.icon-box {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 50%;

  &.like-icon {
    background: #fef2f2;
    color: #ef4444;

    &.active-like {
      background: #ef4444;
      color: #fff;
    }
  }

  &.comment-icon {
    background: #ecfdf5;
    color: #10b981;
  }
}

.count-text {
  font-size: 12px;
  color: #64748b;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 80%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.close-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.reply-input {
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  color: #334155;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  flex: 1;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 0;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-submit {
  background: #3b82f6;
  color: #ffffff;
}
</style>