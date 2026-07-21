<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const content = ref('');
const isFocused = ref(false);

onShow(() => {
  // 判断来源：只有从配置页返回时才恢复草稿
  const pages = getCurrentPages();
  const prevRoute = pages.length > 1 ? pages[pages.length - 2].route : '';

  if (prevRoute === 'pages/paper-letter/config' && uni.getStorageSync('letterDraft')) {
    // 从配置页返回 → 恢复草稿内容
    content.value = uni.getStorageSync('currentLetterContent') || '';
  } else {
    // 从其他页面进来（主页等）→ 清空内容和存储
    content.value = '';
    uni.removeStorageSync('letterDraft');
    uni.removeStorageSync('currentLetterContent');
  }
  isFocused.value = content.value.length > 0;
});

/**
 * 核心联动逻辑：保存内容并跳转至配置页
 */
const handleNext = () => {
  if (!content.value || content.value.trim().length === 0) {
    uni.showToast({ title: '请先写下内容', icon: 'none' });
    return;
  }
  uni.setStorageSync('currentLetterContent', content.value);
  uni.setStorageSync('letterDraft', true); // 标记为草稿，返回时恢复内容
  uni.showLoading({ title: '正在生成信封...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.navigateTo({ url: '/pages/paper-letter/config' });
  }, 800);
};

const goBack = () => {
  // 从写信页返回主页时，清除草稿标记和内容
  uni.removeStorageSync('letterDraft');
  uni.removeStorageSync('currentLetterContent');
  uni.reLaunch({ url: '/pages/index/index' });
};

// 新增：聚焦时隐藏提示语
const onTextareaFocus = () => {
  isFocused.value = true;
};

// 新增：失焦时，若内容为空则重新显示提示语
const onTextareaBlur = () => {
  isFocused.value = false;
};
</script>

<template>
  <view class="page-root">

    <!-- #ifdef H5 -->
    <view class="h5-page">
      <!-- 桌面端顶部栏 -->
      <view class="h5-topbar">
        <view class="h5-topbar-inner">
          <view class="h5-topbar-left" @click="goBack">
            <text class="h5-topbar-back">←</text>
            <text class="h5-topbar-back-text">返回</text>
          </view>
          <text class="h5-topbar-title">纸质书信</text>
          <view class="h5-topbar-right">
            <text class="h5-topbar-counter">{{ content.length }}/900</text>
          </view>
        </view>
      </view>

      <!-- 居中编辑器 -->
      <view class="h5-editor-wrap">
        <view class="h5-card">
          <!-- 背景图片 -->
          <image class="h5-card-bg" src="/static/letter/009.jpg" mode="aspectFill"></image>

          <!-- 半透明遮罩 -->
          <view class="h5-card-overlay"></view>

          <!-- 书信格式占位提示 -->
          <view class="h5-placeholder" v-show="!content && !isFocused">
            <text class="h5-ph-line h5-ph-salutation">亲爱的姑娘/先生：</text>
            <text class="h5-ph-line h5-ph-body">见字如面，展信舒颜……</text>
            <text class="h5-ph-line h5-ph-body">请输入你想说的话。</text>
          </view>

          <!-- 文本输入框 -->
          <textarea
            class="h5-textarea"
            v-model="content"
            maxlength="900"
            :show-confirm-bar="false"
            placeholder=" "
            :adjust-position="true"
            :cursor-spacing="20"
            @focus="onTextareaFocus"
            @blur="onTextareaBlur"
          />
        </view>

        <!-- 底部操作栏 -->
        <view class="h5-action">
          <button
            class="h5-send-btn"
            :class="{ 'h5-send-disabled': content.trim() === '' }"
            @click="handleNext"
          >
            下一步
          </button>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <view class="mp-page">
      <!-- 头部标题栏 -->
      <view class="mp-header">
        <view class="mp-header-inner">
          <view class="mp-header-left" @click="goBack">
            <text class="mp-back-icon">‹</text>
          </view>
          <text class="mp-header-title">纸质书信</text>
          <view class="mp-header-right">
            <text class="mp-header-counter">{{ content.length }}/900</text>
          </view>
        </view>
      </view>

      <!-- 全屏编辑器 -->
      <view class="mp-card">
        <!-- 背景图片 -->
        <image class="mp-card-bg" src="/static/letter/009.jpg" mode="aspectFill"></image>

        <!-- 半透明遮罩 -->
        <view class="mp-card-overlay"></view>

        <!-- 书信格式占位提示 -->
        <view class="mp-placeholder" v-show="!content && !isFocused">
          <text class="mp-ph-line mp-ph-salutation">亲爱的姑娘/先生：</text>
          <text class="mp-ph-line mp-ph-body">见字如面，展信舒颜……</text>
          <text class="mp-ph-line mp-ph-body">请输入你想说的话。</text>
        </view>

        <!-- 文本输入框 -->
        <textarea
          class="mp-textarea"
          v-model="content"
          maxlength="900"
          :show-confirm-bar="false"
          placeholder=" "
          :adjust-position="true"
          :cursor-spacing="20"
          @focus="onTextareaFocus"
          @blur="onTextareaBlur"
        />
      </view>

      <!-- 底部操作栏 -->
      <view class="mp-action">
        <button
          class="mp-send-btn"
          :class="{ 'mp-send-disabled': content.trim() === '' }"
          @click="handleNext"
        >
          下一步
        </button>
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
  display: flex;
  flex-direction: column;
}

/* 桌面端顶部栏 */
.h5-topbar {
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
.h5-topbar-inner {
  max-width: 700px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.h5-topbar-left {
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
.h5-topbar-back {
  font-size: 16px;
  color: #6366f1;
  font-weight: 600;
}
.h5-topbar-back-text {
  font-size: 14px;
  color: #6366f1;
  font-weight: 500;
}
.h5-topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.h5-topbar-right {
  min-width: 80px;
  display: flex;
  justify-content: flex-end;
}
.h5-topbar-counter {
  font-size: 13px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

/* 居中编辑器 */
.h5-editor-wrap {
  flex: 1;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: 88px 24px 32px;
  display: flex;
  flex-direction: column;
}

.h5-card {
  flex: 1;
  min-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}
.h5-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.h5-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.55);
  z-index: 0;
}

/* 占位提示 */
.h5-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}
.h5-ph-line {
  display: block;
  font-size: 16px;
  line-height: 1.9;
  color: #475569;
}
.h5-ph-salutation {
  margin-bottom: 16px;
  font-weight: 500;
}
.h5-ph-body {
  text-indent: 2em;
  margin-bottom: 4px;
}

/* 输入框 */
.h5-textarea {
  width: 100%;
  flex: 1;
  min-height: 300px;
  padding: 24px;
  box-sizing: border-box;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.9;
  color: #1e293b;
  resize: none;
  cursor: text;
  background: transparent;
  position: relative;
  z-index: 2;
  font-family: inherit;
}

/* 底部操作栏 */
.h5-action {
  padding-top: 24px;
  display: flex;
  justify-content: center;
}
.h5-send-btn {
  width: 100%;
  height: 52px;
  line-height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
}
.h5-send-disabled {
  background: #cbd5e1;
  color: #94a3b8;
  &:hover {
    transform: none;
    box-shadow: none;
  }
}
/* #endif */

/* ======================== MP-WEIXIN 小程序端样式 ======================== */
/* #ifdef MP-WEIXIN */
.mp-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* 头部标题栏 */
.mp-header {
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
  flex-shrink: 0;
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
  width: 80rpx;
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
  min-width: 100rpx;
  display: flex;
  justify-content: flex-end;
}
.mp-header-counter {
  font-size: 24rpx;
  color: #94a3b8;
}

/* 全屏编辑器 */
.mp-card {
  flex: 1;
  margin: 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.mp-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.mp-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.55);
  z-index: 0;
}

/* 占位提示 */
.mp-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  z-index: 1;
}
.mp-ph-line {
  display: block;
  font-size: 30rpx;
  line-height: 1.9;
  color: #475569;
}
.mp-ph-salutation {
  margin-bottom: 24rpx;
  font-weight: 500;
}
.mp-ph-body {
  text-indent: 2em;
  margin-bottom: 8rpx;
}

/* 输入框 */
.mp-textarea {
  width: 100%;
  flex: 1;
  min-height: 400rpx;
  padding: 32rpx;
  box-sizing: border-box;
  border: none;
  font-size: 30rpx;
  line-height: 1.9;
  color: #1e293b;
  background: transparent;
  position: relative;
  z-index: 2;
}

/* 底部操作栏 */
.mp-action {
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
}
.mp-send-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  &:active {
    opacity: 0.85;
  }
}
.mp-send-disabled {
  background: #cbd5e1;
  color: #94a3b8;
}
/* #endif */
</style>
