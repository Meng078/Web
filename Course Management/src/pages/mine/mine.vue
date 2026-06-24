<script setup>
const goBackHome = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const showComingSoon = () => {
  uni.showToast({ title: '功能开发中...', icon: 'none' });
};

const menuItems = [
  { text: "我的钱包", desc: "余额管理与交易流水", badge: "", action: showComingSoon },
  { text: "优惠券", desc: "查看可用折扣券", badge: "3", action: showComingSoon },
  { text: "联系客服", desc: "获取技术支持与咨询", badge: "", action: showComingSoon },
  { text: "账号设置", desc: "隐私、安全与偏好配置", badge: "", action: showComingSoon },
];
</script>

<template>
  <view class="mine-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>
    <view class="content-wrapper">
      <!-- 返回主页 -->
      <view class="back-row">
        <text class="back-link" @click="goBackHome">返回主页</text>
      </view>
      <!-- 顶部用户信息区 -->
      <view class="user-header">
        <view class="user-card" @click="goToLogin">
          <view class="avatar-placeholder">👤</view>
          <view class="user-info">
            <text class="username">未登录</text>
            <text class="user-tip">点击登录以同步数据 ›</text>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-number">0</text>
          <text class="stat-label">优惠券</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">¥0.00</text>
          <text class="stat-label">钱包余额</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">Lv.1</text>
          <text class="stat-label">会员等级</text>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="menu-section">
        <view class="menu-card">
          <view class="menu-item" v-for="(item, index) in menuItems" :key="index" @click="item.action">
            <view class="menu-left">
              <view class="menu-text-group">
                <text class="menu-text">{{ item.text }}</text>
                <text class="menu-desc">{{ item.desc }}</text>
              </view>
            </view>
            <view class="menu-right">
              <view class="menu-badge" v-if="item.badge">
                <text class="badge-text">{{ item.badge }}</text>
              </view>
              <text class="menu-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.mine-page {
  min-height: 100vh;
  background-color: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.user-header {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;
  &:active { opacity: 0.8; }
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.user-tip {
  font-size: 13px;
  color: #64748b;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 0;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f1f5f9;
  &:last-child { border-right: none; }
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.menu-section {
  margin-bottom: 24px;
}

.menu-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;

  &:hover {
    background-color: #f8fafc;
    padding-left: 28px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-text-group {
  display: flex;
  flex-direction: column;
}

.menu-text {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 3px;
}

.menu-desc {
  font-size: 12px;
  color: #94a3b8;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-badge {
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.badge-text {
  font-size: 11px;
  color: #ffffff;
  font-weight: 600;
}

.menu-arrow {
  font-size: 18px;
  color: #cbd5e1;
  transition: transform 0.2s;
  .menu-item:hover & {
    transform: translateX(4px);
    color: #94a3b8;
  }
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

@media (min-width: 1024px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
}
</style>