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

const showComingSoon = () => {
  uni.showToast({ title: '功能开发中...', icon: 'none' });
};

const navItems = ref([
  { text: "登录", desc: "手机号快捷登录", action: goToLogin, gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  { text: "我的", desc: "个人中心", action: goToMine, gradient: "linear-gradient(135deg, #06b6d4, #6366f1)" },
  { text: "写信", desc: "发送短信", action: goToWriteLetter, gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { text: "消息", desc: "消息记录", action: goToMessageList, gradient: "linear-gradient(135deg, #3b82f6, #6366f1)" },
  { text: "文档", desc: "开发指南与API", action: showComingSoon, gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { text: "设置", desc: "偏好与系统配置", action: showComingSoon, gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
]);
</script>

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
        <text class="app-title">{{ title }}</text>
        <text class="app-subtitle">欢迎使用跨端应用平台 · 高效 · 稳定 · 易用</text>
      </view>

      <!-- 功能导航卡片 -->
      <view class="nav-section">
        <view class="section-header">
          <text class="section-title">快捷功能</text>
          <text class="section-more" @click="showComingSoon">查看更多 ›</text>
        </view>
        <view class="nav-grid">
          <view class="nav-card" v-for="(item, index) in navItems" :key="index" @click="item.action">
            <view class="nav-card-bg" :style="{ background: item.gradient }"></view>
            <view class="nav-card-content">
              <text class="nav-text">{{ item.text }}</text>
              <text class="nav-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="footer-tip">
        <text class="tip-text">更多功能持续迭代中，敬请期待</text>
      </view>
    </view>
  </view>
</template>

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
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
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

.nav-section {
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

.section-more {
  font-size: 13px;
  color: #6366f1;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.nav-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
  }
}

.nav-card-bg {
  position: absolute;
  inset: 0;
  opacity: 0.12;
}

.nav-card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 14px;
  min-height: 110px;
}

.nav-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.nav-desc {
  font-size: 12px;
  color: #64748b;
}

.footer-tip {
  text-align: center;
  padding: 20px 0;
}

.tip-text {
  font-size: 13px;
  color: #94a3b8;
}

/* PC端专属优化 */
@media (min-width: 1024px) {
  .app-title { font-size: 38px; }
  .nav-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>