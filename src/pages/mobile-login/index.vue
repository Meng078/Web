<script setup>
import { ref, computed } from "vue";

const phoneNumber = ref("");
const verificationCode = ref("");
const isagree = ref(false);
const loading = ref(false);
const countdown = ref(0);

let timer = null;

// 手机号校验
const phoneError = computed(() => {
  if (!phoneNumber.value) return "";
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
    return "手机号格式不正确";
  }
  return "";
});

// 验证码校验
const codeError = computed(() => {
  if (!verificationCode.value) return "";
  if (!/^\d{4,6}$/.test(verificationCode.value)) {
    return "验证码格式不正确";
  }
  return "";
});

const getVerificationCode = () => {
  if (!phoneNumber.value) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
    uni.showToast({ title: "手机号格式不正确", icon: "none" });
    return;
  }
  if (countdown.value > 0) return;

  // TODO: 调用发送验证码接口
  uni.showToast({ title: "验证码已发送", icon: "none" });
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
};

const agreeChange = (e) => {
  isagree.value = e.detail.value.length > 0;
};

const submitForm = () => {
  if (!phoneNumber.value) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
    uni.showToast({ title: "手机号格式不正确", icon: "none" });
    return;
  }
  if (!verificationCode.value) {
    uni.showToast({ title: "请输入验证码", icon: "none" });
    return;
  }
  if (!/^\d{4,6}$/.test(verificationCode.value)) {
    uni.showToast({ title: "验证码格式不正确", icon: "none" });
    return;
  }
  if (!isagree.value) {
    uni.showToast({ title: "请先同意协议", icon: "none" });
    return;
  }
  loading.value = true;
  // TODO: 调用登录接口
  setTimeout(() => {
    loading.value = false;
    uni.showToast({ title: "登录成功", icon: "success" });
    // 登录成功后跳转首页
    setTimeout(() => {
      uni.reLaunch({ url: "/pages/index/index" });
    }, 1500);
  }, 1500);
};

// 跳转到协议页面
const goToAgreement = (type) => {
  uni.navigateTo({
    url: `/pages/agreement/${type}`,
  });
};
</script>

<template>
  <view class="login-container">
    <view class="login-header">
      <image class="login-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="login-title">欢迎登录</text>
    </view>

    <view class="login-form">
      <!-- 手机号输入 -->
      <view class="bind-setinfo-item">
        <input
          class="bind-setinfo-input"
          type="tel"
          placeholder="请输入手机号"
          maxlength="11"
          v-model="phoneNumber"
        />
      </view>
      <view class="error-tip" v-if="phoneError">{{ phoneError }}</view>

      <!-- 验证码输入 -->
      <view class="bind-setinfo-item">
        <input
          class="bind-setinfo-input code-input"
          type="number"
          placeholder="请输入验证码"
          maxlength="6"
          v-model="verificationCode"
        />
        <view
          class="verification-code"
          :class="{ disabled: countdown > 0 }"
          @click="getVerificationCode"
        >
          {{ countdown > 0 ? `${countdown}s` : "获取验证码" }}
        </view>
      </view>
      <view class="error-tip" v-if="codeError">{{ codeError }}</view>

      <!-- 协议复选框 -->
      <view class="agreement-box">
        <checkbox-group @change="agreeChange">
          <label>
            <checkbox value="agree" :checked="isagree" />
          </label>
        </checkbox-group>
        <view class="agreement-text">
          我已阅读并同意
          <text class="agreement-link" @click="goToAgreement('user')">《用户协议》</text>
          、
          <text class="agreement-link" @click="goToAgreement('privacy')">《隐私保护协议》</text>
          和
          <text class="agreement-link" @click="goToAgreement('recharge')">《平台充值协议》</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button class="btn-submit" @click="submitForm" :loading="loading">
        确定登录
      </button>
    </view>
  </view>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 0 60rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 160rpx;
  margin-bottom: 80rpx;
}

.login-logo {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 30rpx;
}

.login-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
}

.login-form {
  width: 100%;
}

.bind-setinfo-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eeeeee;
  margin-bottom: 30rpx;
  padding: 20rpx 0;
}

.bind-setinfo-input {
  flex: 1;
  font-size: 30rpx;
  height: 60rpx;
}

.code-input {
  flex: 1;
}

.verification-code {
  color: #007aff;
  font-size: 28rpx;
  white-space: nowrap;
  padding: 10rpx 20rpx;
  border-left: 1rpx solid #eeeeee;
}

.verification-code.disabled {
  color: #999999;
}

.agreement-box {
  display: flex;
  align-items: center;
  margin: 30rpx 0 50rpx;
}

.agreement-text {
  font-size: 24rpx;
  color: #666666;
  margin-left: 10rpx;
}

.agreement-link {
  color: #007aff;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #007aff;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-submit::after {
  border: none;
}

.error-tip {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-top: -20rpx;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}
</style>
