<script setup>
import {computed, ref} from "vue";
import {onShow} from '@dcloudio/uni-app';
import {loginAPI} from '@/api/index.js';
import { getCurrentUser, setCurrentUser } from '@/utils/session.js';

const username = ref("");
const password = ref("");
const isagree = ref(false);
const loading = ref(false);
const showPassword = ref(false);

// 已登录则自动跳转到个人信息页面
onShow(() => {
  const user = getCurrentUser();
  if (user) {
    uni.reLaunch({ url: '/pages/mine/mine' });
  }
});

const usernameError = computed(() => {
  if (!username.value) return "";
  if (username.value.length < 2) return "用户名至少2个字符";
  return "";
});

const passwordError = computed(() => {
  if (!password.value) return "";
  if (password.value.length < 6) return "密码至少6个字符";
  return "";
});

const canSubmit = computed(() => {
  return username.value.length >= 2 && password.value.length >= 6 && isagree.value;
});

const submitForm = async () => {
  if (!username.value) return uni.showToast({ title: "请输入用户名", icon: "none" });
  if (!password.value) return uni.showToast({ title: "请输入密码", icon: "none" });
  if (!isagree.value) return uni.showToast({ title: "请先同意协议", icon: "none" });

  loading.value = true;

  const result = await loginAPI(username.value, password.value);

  loading.value = false;

  if (result.success) {
    setCurrentUser(result.data);
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => uni.reLaunch({ url: "/pages/mine/mine" }), 800);
  } else {
    uni.showToast({ title: result.message || "登录失败", icon: "none" });
  }
};

const goToAgreement = (type) => {
  uni.navigateTo({ url: `/pages/agreement/${type}` });
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' });
};
</script>

<template>
  <view class="login-page">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="login-card">
      <view class="card-header">
        <text class="card-title">欢迎登录</text>
        <text class="card-subtitle">智慧教务系统</text>
      </view>

      <view class="form-area">
        <view class="form-group" :class="{ 'is-error': usernameError }">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input class="form-input" type="text" placeholder="请输入用户名" maxlength="50" v-model="username" />
          </view>
          <view class="error-msg" v-if="usernameError">
            <text class="error-text">{{ usernameError }}</text>
          </view>
        </view>

        <view class="form-group" :class="{ 'is-error': passwordError }">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input class="form-input" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" maxlength="20" v-model="password" />
            <text class="toggle-pwd" @tap="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </text>
          </view>
          <view class="error-msg" v-if="passwordError">
            <text class="error-text">{{ passwordError }}</text>
          </view>
        </view>

        <!-- 协议区域 -->
        <view class="agreement-area">
          <checkbox-group @change="(e) => { isagree = e.detail.value.length > 0 }">
            <label class="checkbox-label">
              <checkbox value="agree" :checked="isagree" color="#6366f1" style="transform: scale(0.8)" />
            </label>
          </checkbox-group>
          <view class="agreement-text" @tap="isagree = !isagree">
            <text>我已阅读并同意</text>
            <text class="link" @tap.stop="goToAgreement('user')">《用户协议》</text>
            <text>、</text>
            <text class="link" @tap.stop="goToAgreement('privacy')">《隐私保护协议》</text>
            <text>和</text>
            <text class="link" @tap.stop="goToAgreement('recharge')">《平台充值协议》</text>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="submit-area">
          <!-- ★ 使用 button 替代 view，确保微信小程序中 @tap 事件正常触发 ★ -->
          <button class="submit-btn" :class="{ 'btn-active': canSubmit }" @tap="submitForm()">
            <text class="btn-text">{{ loading ? '登录中...' : '登录' }}</text>
          </button>
          <button class="link-text" @tap="goToRegister()">还没有账号？立即注册</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
  opacity: 0.4;
  pointer-events: none;
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

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 28px 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  animation: cardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.back-header {
  margin-bottom: 8px;
}
.back-btn {
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  display: inline-block;
  padding: 4px 0;
  transition: color 0.2s;
  &:active { color: #6366f1; }
}
.card-title {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}
.card-subtitle {
  display: block;
  font-size: 13px;
  color: #94a3b8;
}

.form-area {
  width: 100%;
}
.form-group {
  margin-bottom: 12px;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 14px;
  height: 46px;
  transition: all 0.25s ease;

  &:focus-within {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
  &.is-error {
    background: #fef2f2;
    border-color: #ef4444;
  }
}

.input-icon {
  font-size: 16px;
  margin-right: 8px;
}

.form-input {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
  background: transparent;
}

.toggle-pwd {
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  user-select: none;
}

.error-msg {
  margin-top: 4px;
  padding-left: 4px;
}
.error-text {
  font-size: 11px;
  color: #ef4444;
}

.agreement-area {
  display: flex;
  align-items: flex-start;
  margin: 16px 0 20px;
  gap: 6px;
}
.agreement-text {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
}
.link {
  color: #6366f1;
  cursor: pointer;
  &:active { opacity: 0.8; }
}

.submit-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* 改用 button 替代 view，解决微信小程序 @tap 不触发的问题 */
.submit-btn {
  width: 100%;
  height: 46px;
  line-height: 46px;
  border-radius: 12px;
  text-align: center;
  border: none;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  padding: 0;
  outline: none;
  &::after { border: none; }

  &.btn-active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    cursor: pointer;
    &:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2); }
  }

  .btn-text { color: inherit; }
}

.link-text {
  font-size: 13px;
  color: #6366f1;
  cursor: pointer;
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  line-height: normal;
  &::after { border: none; }
  &:active { opacity: 0.7; }
}

@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    padding: 28px 20px 24px;
  }
}
</style>
