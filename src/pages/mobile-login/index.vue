<script setup>
import {computed, onUnmounted, ref} from "vue";

const phoneNumber = ref("");
const verificationCode = ref("");
const isagree = ref(false);
const loading = ref(false);
const countdown = ref(0);

const viewedAgreements = ref({ user: false, privacy: false });
const allAgreementsViewed = computed(() => viewedAgreements.value.user && viewedAgreements.value.privacy);

let timer = null;

const phoneError = computed(() => {
  if (!phoneNumber.value) return "";
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) return "手机号格式不正确";
  return "";
});

const codeError = computed(() => {
  if (!verificationCode.value) return "";
  if (!/^\d{4,6}$/.test(verificationCode.value)) return "验证码格式不正确";
  return "";
});

const getVerificationCode = () => {
  // TODO: 后端短信验证码 API 未实现，此处仅为前端 Mock
  // 接入后端后，请替换为调用 sendSmsAPI(phoneNumber.value)
  if (!phoneNumber.value) return uni.showToast({ title: "请输入手机号", icon: "none" });
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) return uni.showToast({ title: "手机号格式不正确", icon: "none" });
  if (countdown.value > 0) return;

  uni.showToast({ title: "验证码已发送", icon: "none" });
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) { clearInterval(timer); timer = null; }
  }, 1000);
};

onUnmounted(() => {
  if (timer) { clearInterval(timer); timer = null; }
});

const onCheckboxTap = () => {
  if (!isagree.value) {
    if (!allAgreementsViewed.value) {
      uni.showToast({ title: '请先阅读所有协议', icon: 'none' });
      return;
    }
    isagree.value = true;
  } else {
    isagree.value = false;
  }
};

// TODO: 后端未实现，以下为 Mock 登录逻辑
// 接入后端后，请将 submitForm 改为调用 loginAPI，并移除此 Mock 代码
const submitForm = () => {
  if (phoneError.value || codeError.value) return;
  if (!phoneNumber.value) return uni.showToast({ title: "请输入手机号", icon: "none" });
  if (!verificationCode.value) return uni.showToast({ title: "请输入验证码", icon: "none" });
  if (!isagree.value) return uni.showToast({ title: "请先同意协议", icon: "none" });

  loading.value = true;
  // ★ Mock 登录：后端 API 就绪后替换为真实请求 ★
  // const result = await loginAPI({ phone: phoneNumber.value, code: verificationCode.value })
  // if (result.success) { ... } else { ... }
  setTimeout(() => {
    loading.value = false;
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => uni.reLaunch({ url: "/pages/index/index" }), 1500);
  }, 1500);
};

const goToAgreement = (type) => {
  viewedAgreements.value = { ...viewedAgreements.value, [type]: true };
  uni.navigateTo({ url: `/pages/agreement/${type}` });
};

const goBack = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};
</script>

<template>
  <view class="login-page">
    <!-- 背景遮罩与装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 头部 -->
      <view class="card-header">
        <text class="card-title">欢迎登录</text>
        <text class="card-subtitle">登录后享受更多专属服务</text>
      </view>

      <!-- 表单 -->
      <view class="form-area">
        <!-- 手机号 -->
        <view class="form-group" :class="{ 'is-error': phoneError }">
          <view class="input-wrapper">
            <input class="form-input" type="tel" placeholder="请输入手机号" maxlength="11" v-model="phoneNumber" />
          </view>
          <view class="error-msg" v-if="phoneError">
            <text class="error-text">{{ phoneError }}</text>
          </view>
        </view>

        <!-- 验证码 -->
        <view class="form-group" :class="{ 'is-error': codeError }">
          <view class="input-wrapper">
            <input class="form-input" type="number" placeholder="请输入验证码" maxlength="6" v-model="verificationCode" />
            <view class="code-btn" :class="{ 'btn-disabled': countdown > 0 }" @tap="getVerificationCode">
              <text class="code-text">{{ countdown > 0 ? `${countdown}s` : "获取验证码" }}</text>
            </view>
          </view>
          <view class="error-msg" v-if="codeError">
            <text class="error-text">{{ codeError }}</text>
          </view>
        </view>

        <!-- 协议 -->
        <view class="agreement-area">
          <view class="custom-checkbox-wrap" @tap="onCheckboxTap()">
            <view class="custom-checkbox" :class="{ 'is-checked': isagree }">
              <text v-if="isagree" class="check-mark">✓</text>
            </view>
          </view>
          <view class="agreement-text">
            <text>我已阅读并同意</text>
            <text class="link" @tap.stop="goToAgreement('user')">《用户协议》</text>
            <text>和</text>
            <text class="link" @tap.stop="goToAgreement('privacy')">《隐私保护协议》</text>
          </view>
        </view>

        <!-- 提交与返回区域 -->
        <view class="submit-area">
          <button class="submit-btn" :class="{ 'btn-active': isagree && !loading }" @tap="submitForm" :loading="loading" :disabled="!isagree">
            <text class="btn-text">立即登录</text>
          </button>
          <text class="back-link" @tap="goBack">取消并返回</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
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
  /* #ifdef H5 */
  filter: blur(80px);
  /* #endif */
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

/* 登录卡片 */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  animation: cardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 头部 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}
.card-title {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}
.card-subtitle {
  display: block;
  font-size: 14px;
  color: #94a3b8;
}

/* 表单区域 */
.form-area {
  width: 100%;
}
.form-group {
  margin-bottom: 16px;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  height: 52px;
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

.form-input {
  flex: 1;
  font-size: 15px;
  color: #1e293b;
  background: transparent;
}

.error-msg {
  margin-top: 6px;
  padding-left: 4px;
}
.error-text {
  font-size: 12px;
  color: #ef4444;
}

/* 验证码按钮 */
.code-btn {
  padding: 8px 14px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  /* #ifdef H5 */
  cursor: pointer;
  transition: all 0.2s;
  /* #endif */
  &:active { transform: scale(0.95); }
  &.btn-disabled {
    background: #f1f5f9;
    .code-text { color: #94a3b8; }
  }
}
.code-text {
  font-size: 13px;
  color: #6366f1;
  font-weight: 600;
  white-space: nowrap;
}

/* 协议 */
.agreement-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0 32px;
  gap: 8px;
  width: 100%;
}
.custom-checkbox-wrap {
  flex-shrink: 0;
  padding: 12px;
  margin: -12px -4px -12px 0;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &.is-checked {
    background: #6366f1;
    border-color: #6366f1;
  }
}
.check-mark {
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
.agreement-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
}
.link {
  color: #6366f1;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
  &:active { opacity: 0.8; }
}

/* 提交与返回区域 */
.submit-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  line-height: 52px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.3s ease;

  &::after { border: none; }

  &.btn-active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
    /* #ifdef H5 */
    cursor: pointer;
    &:hover { filter: brightness(1.05); }
    /* #endif */
    &:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2); }
  }

  .btn-text { color: inherit; }
}

/* 新增返回链接样式 */
.back-link {
  font-size: 14px;
  color: #64748b;
  /* #ifdef H5 */
  cursor: pointer;
  transition: color 0.2s ease;
  /* #endif */
  &:active { opacity: 0.7; color: #475569; }
}

/* PC端响应式微调 */
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    padding: 40px 20px;
  }
}
</style>