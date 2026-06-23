<template>
  <view class="page-container">

    <view class="safe-area-top"></view>

    <!-- 头部导航 -->
    <view class="header">
      <text class="back-icon" @click="goBack"> &#10094; </text>
      <text class="title">纸质书信</text>
      <view style="width: 24px;"></view>
    </view>

    <!-- 编辑区域 -->
    <view class="card">

      <!-- 书信格式占位提示 —— 增加了 !isFocused 的判断 -->
      <view class= "sim-placeholder " v-show= "!content && !isFocused " >
        <text class= "ph-line ph-salutation " >亲爱的姑娘/先生： </text >
        <text class= "ph-line ph-body " >见字如面，展信舒颜…… </text >
        <text class= "ph-line ph-body " >请输入你想说的话。 </text >
      </view >

      <!-- 文本输入框 —— 新增 focus 和 blur 事件 -->
      <textarea
          class= "message-area "
          v-model= "content "
          maxlength= "900 "
          :show-confirm-bar= "false "
          placeholder= " "
          :adjust-position= "true "
          :cursor-spacing= "20 "
          @focus= "onTextareaFocus "
          @blur= "onTextareaBlur "
      />

      <view class="footer-area">
        <text class="counter">{{ content.length }}/900</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-area">
      <button
          class="send-btn"
          :class="{ disabled: content.trim() === '' }"
          @click="handleNext"
      >
        下一步
      </button>
    </view>
  </view>
</template>

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

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.safe-area-top {
  padding-top: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.back-icon {
  font-size: 24px;
  color: #333;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card {
  flex: 1;
  margin: 0 16px;
  background-image: url('../../assets/letter/009.jpg');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* 半透明遮罩层，叠加在背景图上，实现透明效果 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  z-index: 0;
}

/* 书信格式占位提示 —— pointer-events:none 确保点击穿透到 textarea */
.sim-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

.ph-line {
  display: block;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.ph-salutation {
  margin-bottom: 12px;
}

.ph-body {
  text-indent: 2em;
  margin-bottom: 2px;
}

/* 输入框覆盖整个卡片，保证任意区域可点击编辑 */
.message-area {
  width: 100%;
  flex: 1;
  min-height: 200px;
  padding: 20px;
  box-sizing: border-box;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  resize: none;
  background: transparent;
  position: relative;
  z-index: 2;
  cursor: text;
}

.footer-area {
  height: 40px;
  flex-shrink: 0;
  margin-top: auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.counter {
  font-size: 12px;
  color: #000;
}

.action-area {
  padding: 20px 24px;
  margin-bottom: env(safe-area-inset-bottom);
  position: relative;
  z-index: 2;
}

.send-btn {
  background-color: #4caf50; /* 修正：原代码为 back ground-color */
  color: #fff;
  border-radius: 50px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  height: 50px;
  line-height: 50px;
}

.disabled {
  background-color: #ccc !important; /* 修正：原代码为 !i mportant */
  color: #999 !important;
}
</style>