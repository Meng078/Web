<template>
  <view class="page-container">
    <!-- 背景装饰（同主页） -->
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

      <!-- 列表容器 -->
      <view class="list-section">
        <view class="section-header">
          <text class="section-title">数据列表</text>
        </view>

        <view class="list-card" v-for="(item, index) in listData" :key="item.id">
          <text class="item-title">{{ item.title }}</text>

          <view class="item-actions">
            <button class="action-btn btn-edit" @click="handleEdit(item)">编辑</button>
            <button class="action-btn btn-delete" @click="handleDelete(item)">删除</button>
          </view>
        </view>

        <!-- 底部提示 -->
        <view class="footer-tip">
          <text class="tip-text">没有更多了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import {ref} from 'vue';

// 模拟数据
const listData = ref([
  {id: 101, title: '新数据5', content: ''},
  {id: 102, title: '新数据6', content: ''},
  {id: 103, title: '新数据7', content: ''},
  {id: 104, title: '新数据8', content: ''},
  {id: 105, title: '新数据9', content: ''},
]);

// 处理编辑
const handleEdit = (item) => {
  console.log('点击编辑：', item);
  uni.showToast({title: `编辑 ${item.title}`, icon: 'none'});
};

// 处理删除
const handleDelete = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除 ${item.title} 吗？`,
    success: (res) => {
      if (res.confirm) {
        // 删除逻辑
        listData.value = listData.value.filter(i => i.id !== item.id);
        uni.showToast({title: '删除成功', icon: 'success'});
      }
    }
  });
};

// 返回主页（强制绑定）
const goBackHome = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #eef2ff;
  padding: 48px 0 32px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰（同主页） */
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
}

/* 标题区域（同主页） */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

/* 返回按钮 */
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
}

/* 列表容器卡片（同主页 nav-section） */
.list-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

/* 单个列表项卡片 */
.list-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
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

/* 按钮通用样式（同主页紫色主题） */
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

/* 底部提示（同主页） */
.footer-tip {
  text-align: center;
  padding: 20px 0;

  .tip-text {
    font-size: 13px;
    color: #94a3b8;
  }
}

/* PC端专属优化 */
@media (min-width: 1024px) {
  .app-title { font-size: 38px; }
}
</style>