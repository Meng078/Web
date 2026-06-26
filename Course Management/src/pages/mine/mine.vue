<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCurrentUser, removeCurrentUser } from '@/utils/session.js';

const currentUser = ref(null);

onShow(() => {
  const user = getCurrentUser();
  if (user) {
    currentUser.value = user;
  } else {
    currentUser.value = null;
  }
});

const goToSchedule = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const goToRegister = () => {
  uni.navigateTo({ url: "/pages/register/index" });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        removeCurrentUser();
        currentUser.value = null;
        uni.showToast({ title: '已退出登录', icon: 'success' });
      }
    }
  });
};

const userInfoItems = [
  { label: '账号类型', field: 'user_type', valueMap: { teacher: '教师', student: '学生' }, default: '--' },
  { label: '用户名', field: 'username', default: '--' },
  { label: '登录状态', field: null, staticValue: '已登录' },
];
</script>

<template>
  <view class="mine-page">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <view class="nav-header">
        <text class="nav-title">个人信息</text>
        <button class="nav-action" @click="goToSchedule()">
          <text class="nav-action-text">课表</text>
          <view class="nav-action-icon">
            <text class="icon-arrow">›</text>
          </view>
        </button>
      </view>

      <view class="user-card" v-if="currentUser">
        <view class="user-row">
          <view class="avatar-wrap">
            <text class="avatar-emoji">{{ currentUser.user_type === 'teacher' ? '👨‍🏫' : '🎓' }}</text>
          </view>
          <view class="user-meta">
            <text class="user-name">{{ currentUser.name }}</text>
            <view class="user-tags">
              <text class="tag tag-type">{{ currentUser.user_type === 'teacher' ? '教师' : '学生' }}</text>
              <text class="tag tag-id">{{ currentUser.username }}</text>
            </view>
          </view>
        </view>
      </view>

      <button class="user-card user-card-guest" v-else @click="goToLogin()">
        <view class="user-row">
          <view class="avatar-wrap avatar-guest">
            <text class="avatar-emoji">👤</text>
          </view>
          <view class="user-meta">
            <text class="user-name">未登录</text>
            <text class="user-guest-tip">点击登录以使用完整功能</text>
          </view>
          <text class="login-arrow">›</text>
        </view>
      </button>

      <view class="info-section" v-if="currentUser">
        <view class="info-row" v-for="(item, idx) in userInfoItems" :key="idx">
          <text class="info-label">{{ item.label }}</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ item.field ? (item.valueMap ? item.valueMap[currentUser[item.field]] || currentUser[item.field] : currentUser[item.field]) : item.staticValue }}</text>
          </view>
        </view>
      </view>

      <view class="action-section">
        <button v-if="currentUser" class="action-btn logout-btn" @click="handleLogout()">
          <text class="action-btn-text">退出登录</text>
        </button>
        <view v-else class="btn-row">
          <button class="action-btn login-btn" @click="goToLogin()">
            <text class="action-btn-text">登录</text>
          </button>
          <button class="action-btn register-btn" @click="goToRegister()">
            <text class="action-btn-text">注册</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.mine-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--status-bar-height);
}

.bg-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  /* #ifdef H5 */
  filter: blur(80px);
  /* #endif */
  opacity: 0.35;
}
.bg-circle-1 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  top: -80px;
  right: -80px;
}
.bg-circle-2 {
  width: 250px;
  height: 250px;
  background: #10b981;
  bottom: -60px;
  left: -60px;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  box-sizing: border-box;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  min-height: 36px;
}

.nav-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.nav-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(99, 102, 241, 0.12);
  padding: 2px 7px;
    box-sizing: border-box;
    border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s ease;
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  border: 1px solid rgba(99, 102, 241, 0.15);
  outline: none;
  flex-shrink: 0;
  height: auto;
  line-height: normal;
  min-width: 0;
  &::after { border: none; }
  &:active { transform: scale(0.95); background: rgba(99, 102, 241, 0.2); }
}

.nav-action-text {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
}

.nav-action-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-arrow {
  font-size: 12px;
  color: #ffffff;
  font-weight: 700;
  line-height: 1;
}

.user-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.2);
  margin-bottom: 12px;
  /* 重置微信小程序 button 默认样式 */
  border: none;
  outline: none;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  display: block;
  &::after { border: none; }
}

.user-card-guest {
  cursor: pointer;
  &:active { transform: scale(0.98); }
}

.user-row {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.avatar-guest {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
}

.avatar-emoji {
  font-size: 24px;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 4px;
}

.user-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.tag-type {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.tag-id {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
}

.user-guest-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 2px;
}

.login-arrow {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
  margin-left: 8px;
}

.info-section {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.info-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.info-value-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

.action-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-btn {
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  padding: 0 16px;
  border: none;
  outline: none;
  &::after { border: none; }
  &:active { transform: scale(0.97); }
}

.logout-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  width: 100%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.btn-row {
  display: flex;
  gap: 12px;
}

.login-btn {
  flex: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
}

.register-btn {
  flex: 1;
  background: #ffffff;
  color: #6366f1;
  border: 1px solid #6366f1;
}

.action-btn-text {
  font-size: 14px;
  font-weight: 600;
}
</style>
