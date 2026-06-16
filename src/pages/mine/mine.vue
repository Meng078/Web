<script setup>
const goToLogin = () => {
  uni.navigateTo({ url: "/pages/mobile-login/index" });
};
</script>

<template>
  <view class="mine-container">
    <!-- 用户头像区域 -->
    <view class="user-header">
      <image class="avatar" src="/static/logo.png" mode="aspectFit" />
      <view class="user-info">
        <text class="username">未登录</text>
        <text class="user-tip">点击登录账号</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goToLogin">
        <text class="menu-text">登录账号</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">我的收藏</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">设置</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mine-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 60rpx 40rpx;
  background-color: #ffffff;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.user-tip {
  font-size: 24rpx;
  color: #999999;
}

.menu-list {
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:active {
  background-color: #f8f8f8;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 30rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #cccccc;
}
</style>
