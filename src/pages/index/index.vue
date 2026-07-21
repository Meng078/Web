<script setup>
import {ref} from "vue";

const title = ref("Web应用平台");

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/mobile-login/index" });
};

const goToMine = () => {
  uni.navigateTo({ url: "/pages/mine/mine" });
};

const goToWriteLetter = () => {
  uni.navigateTo({ url: "/pages/write-letter/index" });
};

const goToMessageList = () => {
  uni.navigateTo({ url: "/pages/message-list/index" });
};

const goToList = () => {
  uni.navigateTo({ url: "/pages/message-list/list" });
};

const showComingSoon = () => {
  uni.showToast({ title: '功能开发中...', icon: 'none' });
};

const navItems = ref([
  { text: "登录", desc: "手机号快捷登录", action: goToLogin, gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  { text: "我的", desc: "个人中心", action: goToMine, gradient: "linear-gradient(135deg, #06b6d4, #6366f1)" },
  { text: "写信", desc: "发送短信", action: goToWriteLetter, gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { text: "消息", desc: "消息记录", action: goToMessageList, gradient: "linear-gradient(135deg, #3b82f6, #6366f1)" },
  { text: "列表", desc: "数据管理", action: goToList, gradient: "linear-gradient(135deg, #a855f7, #d946ef)" },
  { text: "文档", desc: "开发指南与API", action: showComingSoon, gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { text: "设置", desc: "偏好与系统配置", action: showComingSoon, gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
]);
</script>

<template>
  <view class="page-root">

    <!-- #ifdef H5 -->
    <view class="h5-page">
      <!-- 顶部导航栏 -->
      <view class="h5-navbar">
        <view class="h5-navbar-inner">
          <view class="h5-brand">
            <view class="h5-brand-dot"></view>
            <text class="h5-brand-text">{{ title }}</text>
          </view>
          <view class="h5-nav-actions">
            <text class="h5-nav-link" @click="showComingSoon">文档</text>
            <text class="h5-nav-link" @click="showComingSoon">设置</text>
            <view class="h5-nav-avatar" @click="goToMine">👤</view>
          </view>
        </view>
      </view>

      <!-- Hero 区域 -->
      <view class="h5-hero">
        <view class="h5-hero-badge">
          <text class="h5-hero-badge-text">v1.0 · 跨端应用</text>
        </view>
        <text class="h5-hero-title">{{ title }}</text>
        <text class="h5-hero-subtitle">欢迎使用跨端应用平台 · 高效 · 稳定 · 易用</text>
      </view>

      <!-- 功能卡片网格 -->
      <view class="h5-content">
        <view class="h5-section">
          <view class="h5-section-header">
            <view class="h5-section-title-group">
              <view class="h5-section-bar"></view>
              <text class="h5-section-title">快捷功能</text>
            </view>
            <text class="h5-section-more" @click="showComingSoon">查看更多 ›</text>
          </view>

          <view class="h5-card-grid">
            <view
              class="h5-func-card"
              v-for="(item, index) in navItems"
              :key="index"
              @click="item.action"
            >
              <view class="h5-card-accent" :style="{ background: item.gradient }"></view>
              <view class="h5-card-body">
                <view class="h5-card-icon" :style="{ background: item.gradient }">
                  <text class="h5-card-icon-text">{{ item.text }}</text>
                </view>
                <view class="h5-card-info">
                  <text class="h5-card-title">{{ item.text }}</text>
                  <text class="h5-card-desc">{{ item.desc }}</text>
                </view>
                <text class="h5-card-arrow">→</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部提示 -->
        <view class="h5-footer">
          <view class="h5-footer-divider"></view>
          <text class="h5-footer-text">更多功能持续迭代中，敬请期待</text>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <view class="mp-page">
      <!-- 头部标题栏 -->
      <view class="mp-header">
        <view class="mp-header-inner">
          <text class="mp-header-title">{{ title }}</text>
        </view>
      </view>

      <!-- 副标题 -->
      <view class="mp-subtitle-bar">
        <text class="mp-subtitle-text">跨端应用平台 · 高效 · 稳定 · 易用</text>
      </view>

      <!-- 功能卡片列表 -->
      <view class="mp-content">
        <view class="mp-section-label">
          <view class="mp-label-bar"></view>
          <text class="mp-label-text">快捷功能</text>
        </view>

        <view class="mp-list">
          <view
            class="mp-card"
            v-for="(item, index) in navItems"
            :key="index"
            @click="item.action"
          >
            <view class="mp-card-icon" :style="{ background: item.gradient }">
              <text class="mp-card-icon-text">{{ item.text }}</text>
            </view>
            <view class="mp-card-info">
              <text class="mp-card-title">{{ item.text }}</text>
              <text class="mp-card-desc">{{ item.desc }}</text>
            </view>
            <text class="mp-card-arrow">›</text>
          </view>
        </view>

        <!-- 底部提示 -->
        <view class="mp-footer">
          <text class="mp-footer-text">更多功能持续迭代中</text>
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
.h5-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.h5-brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}
.h5-brand-text {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.5px;
}
.h5-nav-actions {
  display: flex;
  align-items: center;
  gap: 28px;
}
.h5-nav-link {
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
  &:hover {
    color: #6366f1;
  }
}
.h5-nav-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
}

/* Hero 区域 */
.h5-hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 128px 32px 48px;
  text-align: center;
}
.h5-hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  margin-bottom: 24px;
}
.h5-hero-badge-text {
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
}
.h5-hero-title {
  display: block;
  font-size: 42px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: 1px;
  line-height: 1.2;
}
.h5-hero-subtitle {
  display: block;
  font-size: 16px;
  color: #64748b;
  letter-spacing: 0.5px;
}

/* 内容区 */
.h5-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 64px;
}

.h5-section {
  margin-bottom: 40px;
}
.h5-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.h5-section-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.h5-section-bar {
  width: 4px;
  height: 22px;
  border-radius: 2px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}
.h5-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}
.h5-section-more {
  font-size: 14px;
  color: #6366f1;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.75;
    text-decoration: underline;
  }
}

/* 卡片网格 */
.h5-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.h5-func-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.3);
    .h5-card-arrow {
      transform: translateX(4px);
      color: #6366f1;
    }
  }
  &:active {
    transform: translateY(-2px);
  }
}
.h5-card-accent {
  height: 4px;
  width: 100%;
}
.h5-card-body {
  display: flex;
  align-items: center;
  padding: 24px 28px;
  gap: 18px;
}
.h5-card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.h5-card-icon-text {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.h5-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.h5-card-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}
.h5-card-desc {
  font-size: 13px;
  color: #64748b;
}
.h5-card-arrow {
  font-size: 18px;
  color: #cbd5e1;
  transition: transform 0.28s ease, color 0.28s ease;
}

/* 底部 */
.h5-footer {
  text-align: center;
  padding: 32px 0 16px;
}
.h5-footer-divider {
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: #e2e8f0;
  margin: 0 auto 16px;
}
.h5-footer-text {
  font-size: 13px;
  color: #94a3b8;
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
  justify-content: center;
}
.mp-header-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

/* 副标题 */
.mp-subtitle-bar {
  padding: 24rpx 24rpx 8rpx;
}
.mp-subtitle-text {
  font-size: 24rpx;
  color: #64748b;
}

/* 内容区 */
.mp-content {
  padding: 16rpx 24rpx 0;
}

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

/* 卡片列表 */
.mp-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.mp-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  min-height: 88rpx;
  gap: 20rpx;
  &:active {
    opacity: 0.85;
  }
}
.mp-card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mp-card-icon-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}
.mp-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.mp-card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6rpx;
}
.mp-card-desc {
  font-size: 24rpx;
  color: #64748b;
}
.mp-card-arrow {
  font-size: 36rpx;
  color: #cbd5e1;
}

/* 底部 */
.mp-footer {
  text-align: center;
  padding: 40rpx 0 60rpx;
}
.mp-footer-text {
  font-size: 24rpx;
  color: #94a3b8;
}
/* #endif */
</style>
