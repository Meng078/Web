<script setup>
const goBackHome = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/mobile-login/index" });
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
  <view class="page-root">

    <!-- #ifdef H5 -->
    <view class="h5-page">
      <!-- 顶部导航栏 -->
      <view class="h5-navbar">
        <view class="h5-navbar-inner">
          <view class="h5-nav-left" @click="goBackHome">
            <text class="h5-back-icon">←</text>
            <text class="h5-back-text">返回主页</text>
          </view>
          <text class="h5-nav-title">我的</text>
          <view class="h5-nav-right"></view>
        </view>
      </view>

      <!-- 两列布局 -->
      <view class="h5-main">
        <view class="h5-layout">
          <!-- 左列：个人资料 + 统计 -->
          <view class="h5-left-col">
            <!-- 用户卡片 -->
            <view class="h5-user-card" @click="goToLogin">
              <view class="h5-avatar-wrap">
                <view class="h5-avatar">👤</view>
                <view class="h5-avatar-ring"></view>
              </view>
              <view class="h5-user-info">
                <text class="h5-username">未登录</text>
                <text class="h5-user-tip">点击登录以同步数据 ›</text>
              </view>
            </view>

            <!-- 统计数据 -->
            <view class="h5-stats-card">
              <view class="h5-stats-title-row">
                <view class="h5-stats-bar"></view>
                <text class="h5-stats-title">数据概览</text>
              </view>
              <view class="h5-stats-grid">
                <view class="h5-stat-item">
                  <text class="h5-stat-number">0</text>
                  <text class="h5-stat-label">优惠券</text>
                </view>
                <view class="h5-stat-divider"></view>
                <view class="h5-stat-item">
                  <text class="h5-stat-number">¥0.00</text>
                  <text class="h5-stat-label">钱包余额</text>
                </view>
                <view class="h5-stat-divider"></view>
                <view class="h5-stat-item">
                  <text class="h5-stat-number">Lv.1</text>
                  <text class="h5-stat-label">会员等级</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 右列：设置项 -->
          <view class="h5-right-col">
            <view class="h5-settings-card">
              <view class="h5-settings-header">
                <view class="h5-stats-bar"></view>
                <text class="h5-settings-title">功能设置</text>
              </view>
              <view class="h5-menu-list">
                <view
                  class="h5-menu-item"
                  v-for="(item, index) in menuItems"
                  :key="index"
                  @click="item.action"
                >
                  <view class="h5-menu-left">
                    <text class="h5-menu-text">{{ item.text }}</text>
                    <text class="h5-menu-desc">{{ item.desc }}</text>
                  </view>
                  <view class="h5-menu-right">
                    <view class="h5-menu-badge" v-if="item.badge">
                      <text class="h5-badge-text">{{ item.badge }}</text>
                    </view>
                    <text class="h5-menu-arrow">›</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <view class="mp-page">
      <!-- 头部标题栏 -->
      <view class="mp-header">
        <view class="mp-header-inner">
          <view class="mp-header-left" @click="goBackHome">
            <text class="mp-back-icon">‹</text>
          </view>
          <text class="mp-header-title">我的</text>
          <view class="mp-header-right"></view>
        </view>
      </view>

      <!-- 用户信息区 -->
      <view class="mp-content">
        <view class="mp-user-card" @click="goToLogin">
          <view class="mp-avatar">👤</view>
          <view class="mp-user-info">
            <text class="mp-username">未登录</text>
            <text class="mp-user-tip">点击登录以同步数据 ›</text>
          </view>
        </view>

        <!-- 统计数据 -->
        <view class="mp-stats-card">
          <view class="mp-stat-item">
            <text class="mp-stat-number">0</text>
            <text class="mp-stat-label">优惠券</text>
          </view>
          <view class="mp-stat-divider"></view>
          <view class="mp-stat-item">
            <text class="mp-stat-number">¥0.00</text>
            <text class="mp-stat-label">钱包余额</text>
          </view>
          <view class="mp-stat-divider"></view>
          <view class="mp-stat-item">
            <text class="mp-stat-number">Lv.1</text>
            <text class="mp-stat-label">会员等级</text>
          </view>
        </view>

        <!-- 功能列表 -->
        <view class="mp-section-label">
          <view class="mp-label-bar"></view>
          <text class="mp-label-text">功能设置</text>
        </view>

        <view class="mp-menu-card">
          <view
            class="mp-menu-item"
            v-for="(item, index) in menuItems"
            :key="index"
            @click="item.action"
          >
            <view class="mp-menu-left">
              <text class="mp-menu-text">{{ item.text }}</text>
              <text class="mp-menu-desc">{{ item.desc }}</text>
            </view>
            <view class="mp-menu-right">
              <view class="mp-menu-badge" v-if="item.badge">
                <text class="mp-badge-text">{{ item.badge }}</text>
              </view>
              <text class="mp-menu-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->

  </view>
</template>

<style scoped lang="scss">
/* ======================== H5 PC 端样式 ======================== */
/* #ifdef H5 */
.h5-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 顶部导航栏 */
.h5-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #e2e8f0;
}
.h5-navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.h5-nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.06);
  transition: background 0.2s ease;
  &:hover {
    background: rgba(99, 102, 241, 0.12);
  }
}
.h5-back-icon {
  font-size: 16px;
  color: #6366f1;
  font-weight: 600;
}
.h5-back-text {
  font-size: 14px;
  color: #6366f1;
  font-weight: 500;
}
.h5-nav-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.h5-nav-right {
  width: 100px;
}

/* 主内容区 */
.h5-main {
  padding-top: 64px;
}
.h5-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 64px;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 32px;
  align-items: start;
}

/* 左列 */
.h5-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 用户卡片 */
.h5-user-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.08);
  }
  &:active {
    transform: scale(0.99);
  }
}
.h5-avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
}
.h5-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.h5-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #6366f1, #8b5cf6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
}
.h5-user-info {
  display: flex;
  flex-direction: column;
}
.h5-username {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}
.h5-user-tip {
  font-size: 14px;
  color: #64748b;
}

/* 统计卡片 */
.h5-stats-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid #e2e8f0;
}
.h5-stats-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.h5-stats-bar {
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}
.h5-stats-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.h5-stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.h5-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.h5-stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}
.h5-stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}
.h5-stat-label {
  font-size: 13px;
  color: #64748b;
}

/* 右列 - 设置项 */
.h5-settings-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.h5-settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 28px 28px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.h5-settings-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.h5-menu-list {
  display: flex;
  flex-direction: column;
}
.h5-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  cursor: pointer;
  transition: background-color 0.18s ease, padding-left 0.18s ease;
  border-bottom: 1px solid #f1f5f9;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f8fafc;
    padding-left: 36px;
    .h5-menu-arrow {
      transform: translateX(4px);
      color: #6366f1;
    }
  }
  &:active {
    background-color: #f1f5f9;
  }
}
.h5-menu-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.h5-menu-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}
.h5-menu-desc {
  font-size: 13px;
  color: #94a3b8;
}
.h5-menu-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.h5-menu-badge {
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.h5-badge-text {
  font-size: 12px;
  color: #ffffff;
  font-weight: 700;
}
.h5-menu-arrow {
  font-size: 22px;
  color: #cbd5e1;
  transition: transform 0.2s ease, color 0.2s ease;
}
/* #endif */

/* ======================== MP-WEIXIN 小程序端样式 ======================== */
/* #ifdef MP-WEIXIN */
.mp-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 头部标题栏 */
.mp-header {
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
}
.mp-header-inner {
  padding-top: var(--status-bar-height);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24rpx;
  padding-right: 24rpx;
}
.mp-header-left {
  width: 60rpx;
  display: flex;
  align-items: center;
}
.mp-back-icon {
  font-size: 44rpx;
  color: #0f172a;
}
.mp-header-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}
.mp-header-right {
  width: 60rpx;
}

/* 内容区 */
.mp-content {
  padding: 24rpx;
}

/* 用户卡片 */
.mp-user-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  gap: 24rpx;
  margin-bottom: 20rpx;
  &:active {
    opacity: 0.85;
  }
}
.mp-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  flex-shrink: 0;
}
.mp-user-info {
  display: flex;
  flex-direction: column;
}
.mp-username {
  font-size: 36rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8rpx;
}
.mp-user-tip {
  font-size: 26rpx;
  color: #64748b;
}

/* 统计卡片 */
.mp-stats-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 0;
  margin-bottom: 32rpx;
}
.mp-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mp-stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e2e8f0;
}
.mp-stat-number {
  font-size: 36rpx;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8rpx;
}
.mp-stat-label {
  font-size: 24rpx;
  color: #64748b;
}

/* 区块标签 */
.mp-section-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding: 8rpx 0;
}
.mp-label-bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 3rpx;
  background: #6366f1;
}
.mp-label-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

/* 功能列表 */
.mp-menu-card {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}
.mp-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 28rpx;
  min-height: 88rpx;
  border-bottom: 1rpx solid #f1f5f9;
  &:last-child {
    border-bottom: none;
  }
  &:active {
    background-color: #f8fafc;
  }
}
.mp-menu-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.mp-menu-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6rpx;
}
.mp-menu-desc {
  font-size: 24rpx;
  color: #94a3b8;
}
.mp-menu-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.mp-menu-badge {
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #ef4444, #f87171);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
}
.mp-badge-text {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 700;
}
.mp-menu-arrow {
  font-size: 40rpx;
  color: #cbd5e1;
}
/* #endif */
</style>
