<script setup>
import { ref } from "vue";

const title = ref("Hello uni-app");

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/mobile-login/index" });
};

const goToMine = () => {
  uni.navigateTo({ url: "/pages/mine/mine" });
};
</script>

<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" mode="aspectFit" />
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>

    <view class="nav-list">
      <view class="nav-item" @click="goToLogin">
        <text class="nav-icon">🔑</text>
        <text class="nav-text">登录</text>
      </view>
      <view class="nav-item" @click="goToMine">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.nav-list {
  display: flex;
  justify-content: center;
  gap: 60rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.nav-item:active {
  opacity: 0.7;
}

.nav-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.nav-text {
  font-size: 28rpx;
  color: #333333;
}
</style>
