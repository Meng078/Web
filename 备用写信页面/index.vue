<template>
  <view class="letter-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <!-- 内容滚动区 -->
    <scroll-view scroll-y class="content-area" :show-scrollbar="false">
      <!-- 状态栏安全距离占位 -->
      <view class="safe-area-top"></view>

      <!-- 卡片容器（主体与温馨提示已合并至此） -->
      <view class="letter-card">
        <!-- 头部信息：返回 + 标题同行 -->
        <view class="card-header">
          <text class="back-text" @click="navigateBack">返回</text>
          <text class="card-title">书写你的思念</text>
        </view>

        <!-- 顶部警示条 -->
        <view class="alert-tip">
          <view class="tip-icon">i</view>
          <text class="tip-text">请勿发送违规内容，否则可能导致账号封禁</text>
        </view>

        <!-- 表单区域 -->
        <view class="form-area">
          <!-- 手机号输入 -->
          <view class="form-group" :class="{ 'is-error': phoneError }">
            <view class="input-wrapper">
              <input
                  class="form-input"
                  type="number"
                  placeholder="请输入收件人手机号"
                  maxlength="11"
                  v-model="phoneNum"
              />
            </view>
            <view class="error-msg" v-if="phoneError">
              <text class="error-text">{{ phoneError }}</text>
            </view>
          </view>

          <!-- 正文内容 -->
          <view class="form-group" :class="{ 'is-error': contentError }">
            <view class="input-wrapper textarea-wrapper">
              <textarea
                  class="form-textarea"
                  placeholder="请输入信件内容..."
                  maxlength="2000"
                  v-model="messageContent"
                  :show-confirm-bar="false"
              ></textarea>
            </view>

            <!-- 文字统计、计算规则、价格计算已放置在一行 -->
            <view class="info-row">
              <view class="error-msg" v-if="contentError">
                <text class="error-text">{{ contentError }}</text>
              </view>
              <view class="info-stats-inline">
                <text class="char-count">{{ messageContent.length }}/2000</text>
                <text class="calc-text">按70字/条计算</text>
                <text class="price-value">￥{{ price }}</text>
              </view>
            </view>
          </view>

          <!-- 期望发送时间（含秒） -->
          <view class="form-group">
            <view class="input-wrapper time-wrapper">
              <!-- 左侧：展示当前时间（含秒） -->
              <text class="time-display">{{ selectedDateTime }}</text>

              <!-- 右侧：点击触发完整的日期时间选择器（年月日时分秒） -->
              <picker
                  mode="multiSelector"
                  :range="multiRange"
                  :value="multiIndex"
                  @change="onMultiChange"
                  @columnchange="onColumnChange"
                  class="picker-trigger"
              >
                <view class="time-btn-wrapper">
                  <text class="time-action">修改时间</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 勾选框与协议文本已放置在一行 -->
          <view class="agreement-area">
            <checkbox-group @change="agreeChange">
              <label class="checkbox-label">
                <checkbox
                    value="agree"
                    :checked="isagree"
                    color="#6366f1"
                    style="transform: scale(0.8); margin: 0; padding: 0"
                />
              </label>
            </checkbox-group>
            <view class="agreement-text">
              <text>我已阅读并同意</text>
              <text class="link" @click="goToAgreement('user')">《用户协议》</text>
              <text>和</text>
              <text class="link" @click="goToAgreement('privacy')">《隐私保护协议》</text>
            </view>
          </view>

          <!-- 发送按钮 -->
          <view class="submit-area">
            <button
                class="submit-btn"
                :class="{ 'btn-active': isagree && !loading }"
                @click="handleSend"
                :loading="loading"
                :disabled="!isagree"
            >
              <text class="btn-text">发送</text>
            </button>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="section-divider"></view>

        <!-- 底部温馨提示 -->
        <view class="tips-section">
          <scroll-view scroll-y class="tips-scroll" :show-scrollbar="false">
            <view class="tip-item">1、平台使用短信发送，订单提交后将扣费，无法撤回。</view>
            <view class="tip-item">2、通常在1-5分钟内送达，高峰期可能略有延迟。</view>
            <view class="tip-item">3、请确保填写的手机号码准确无误，且处于正常接收状态。</view>
            <view class="tip-item">4、本服务仅限个人合法用途，严禁发送违法、违规或垃圾信息。</view>
            <view class="tip-item">5、短信送达受运营商网络波动影响，如遇拥堵请耐心等待。</view>
          </scroll-view>
        </view>
      </view>

      <view style="height: 50px"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import {computed, ref} from 'vue';

const phoneNum = ref('');
const messageContent = ref('');
const isagree = ref(false);
const loading = ref(false);

// 时间选择逻辑（支持年月日时分秒完整选择）
const pad = (n) => n.toString().padStart(2, '0');
const now = new Date();
const currentYear = now.getFullYear();

// 各列数据源
const years = Array.from({length: 11}, (_, i) => currentYear - 5 + i);
const months = Array.from({length: 12}, (_, i) => i + 1);
const hours = Array.from({length: 24}, (_, i) => i);
const minutes = Array.from({length: 60}, (_, i) => i);
const seconds = Array.from({length: 60}, (_, i) => i);

// 当前选中的各列索引
const selectedYearIndex = ref(5); // 默认当前年份（-5到+5，索引5为当前年）
const selectedMonthIndex = ref(now.getMonth()); // 0-based
const selectedDayIndex = ref(now.getDate() - 1);
const selectedHourIndex = ref(now.getHours());
const selectedMinuteIndex = ref(now.getMinutes());
const selectedSecondIndex = ref(now.getSeconds());

// 根据年月计算当月天数
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

// 动态生成天数列
const days = computed(() => {
  const year = years[selectedYearIndex.value];
  const month = months[selectedMonthIndex.value];
  const count = getDaysInMonth(year, month);
  return Array.from({length: count}, (_, i) => i + 1);
});

// 多列选择器的 range（带中文单位标识）
const multiRange = computed(() => [
  years.map((y) => y + '年'),
  months.map((m) => m + '月'),
  days.value.map((d) => d + '日'),
  hours.map((h) => pad(h) + '时'),
  minutes.map((m) => pad(m) + '分'),
  seconds.map((s) => pad(s) + '秒'),
]);

// 多列选择器的当前选中索引
const multiIndex = computed(() => [
  selectedYearIndex.value,
  selectedMonthIndex.value,
  selectedDayIndex.value,
  selectedHourIndex.value,
  selectedMinuteIndex.value,
  selectedSecondIndex.value,
]);

// 格式化显示的日期时间字符串（YYYY-MM-DD HH:mm:ss）
const selectedDateTime = computed(() => {
  const year = years[selectedYearIndex.value];
  const month = months[selectedMonthIndex.value];
  const day = days.value[selectedDayIndex.value];
  const hour = hours[selectedHourIndex.value];
  const minute = minutes[selectedMinuteIndex.value];
  const second = seconds[selectedSecondIndex.value];
  if (!day) return '选择时间';
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
});

// 列值变化时更新状态（用于动态调整天数）
const onColumnChange = (e) => {
  const {column, value} = e.detail;
  if (column === 0) {
    selectedYearIndex.value = value;
    // 当年变化时，确保天索引不越界
    if (selectedDayIndex.value >= days.value.length) {
      selectedDayIndex.value = days.value.length - 1;
    }
  }
  if (column === 1) {
    selectedMonthIndex.value = value;
    if (selectedDayIndex.value >= days.value.length) {
      selectedDayIndex.value = days.value.length - 1;
    }
  }
  if (column === 2) selectedDayIndex.value = value;
  if (column === 3) selectedHourIndex.value = value;
  if (column === 4) selectedMinuteIndex.value = value;
  if (column === 5) selectedSecondIndex.value = value;
};

// 确认选择
const onMultiChange = (e) => {
  const vals = e.detail.value;
  selectedYearIndex.value = vals[0];
  selectedMonthIndex.value = vals[1];
  selectedDayIndex.value = Math.min(vals[2], days.value.length - 1);
  selectedHourIndex.value = vals[3];
  selectedMinuteIndex.value = vals[4];
  selectedSecondIndex.value = vals[5];
};

const phoneError = computed(() => {
  if (!phoneNum.value) return '';
  if (!/^1[3-9]\d{9}$/.test(phoneNum.value)) return '请输入有效的11位手机号';
  return '';
});

const contentError = computed(() => {
  if (!messageContent.value) return '请输入信件内容';
  return '';
});

const price = computed(() => {
  const chars = messageContent.value.length;
  if (!chars) return '0.00';
  const count = Math.ceil(chars / 70);
  return (count * 0.05).toFixed(2);
});

const agreeChange = (e) => {
  isagree.value = e.detail.value.length > 0;
};

const handleSend = () => {
  if (!isagree.value) return uni.showToast({title: '请先同意相关协议', icon: 'none'});
  if (!phoneNum.value) return uni.showToast({title: '请输入收件人手机号', icon: 'none'});
  if (!/^1[3-9]\d{9}$/.test(phoneNum.value)) return uni.showToast({title: '手机号格式不正确', icon: 'none'});
  if (!messageContent.value) return uni.showToast({title: '请输入信件内容', icon: 'none'});

  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    uni.showToast({title: '提交成功，正在发送...', icon: 'success'});
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1500);
};

const goToAgreement = (type) => {
  uni.navigateTo({url: `/pages/agreement/${type}`});
};

const navigateBack = () => {
  uni.reLaunch({url: '/pages/index/index'});
};
</script>

<style lang="scss" scoped>
.letter-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

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

.content-area {
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 1;
  background-color: transparent;
}

.safe-area-top {
  height: var(--status-bar-height, 20px);
  width: 100%;
}

/* 卡片主体 */
.letter-card {
  position: relative;
  z-index: 2;
  width: calc(100% - 40px);
  max-width: 440px;
  margin: 40px auto 0;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 24px 0px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.card-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.back-text {
  position: absolute;
  left: 0;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-text:active {
  opacity: 0.7;
  color: #475569;
}

.card-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.alert-tip {
  background-color: #ecfdf5;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  border-radius: 12px;

  .tip-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #10b981;
    color: #10b981;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tip-text {
    font-size: 12px;
    color: #10b981;
    line-height: 1.4;
  }
}

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

  &.textarea-wrapper {
    height: 140px;
    align-items: flex-start;
    padding: 12px 16px;
  }
}

.form-input,
.form-textarea {
  flex: 1;
  font-size: 15px;
  color: #1e293b;
  background: transparent;
}

.form-textarea {
  height: 100%;
  line-height: 1.5;
  resize: none;
  width: 100%;
}

/* 统计与价格行布局 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  min-height: 16px;
}

.info-stats-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.error-msg {
  margin-top: 4px;
  padding-left: 4px;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
}

.calc-text {
  font-size: 12px;
  color: #94a3b8;
}

.price-value {
  color: #ef4444;
  font-weight: 700;
  font-size: 13px;
}

.time-wrapper {
  cursor: pointer;
  justify-content: space-between;

  .time-display {
    color: #0f172a;
    font-weight: 500;
  }

  /* 针对 Picker 的样式优化 */
  .picker-trigger {
    flex-shrink: 0;
  }

  .time-btn-wrapper {
    display: flex;
    align-items: center;
  }

  .time-action {
    color: #6366f1;
    font-size: 13px;
    padding: 4px 8px;
  }
}

/* 协议勾选一行布局 */
.agreement-area {
  display: flex;
  align-items: center;
  margin: 18px 0 18px;
  gap: 8px;
  flex-wrap: nowrap;

  .agreement-text {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;

    .link {
      color: #6366f1;
      font-weight: 500;
    }
  }
}

.submit-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 按钮居中样式 */
.submit-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &::after {
    border: none;
  }

  &.btn-active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    }
  }

  .btn-text {
    color: inherit;
  }
}

/* 分割线 */
.section-divider {
  margin-top: 18px;
  margin-bottom: 18px;
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

/* 底部温馨提示 */
.tips-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 90px;
  overflow: hidden;
}

.tips-scroll {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
}

.tips-scroll::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}

.tip-item {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>

<!-- 放在 <script setup> 后面，注意这里不要写 scoped 属性，必须是全局样式 -->
<style lang="scss">
/* ========================================== */
/*      修复：解除 Uni-app Picker 300px 限制    */
/* ========================================== */

/* 1. 针对截图中的报错源：覆盖大屏下的外壳宽度限制 */
@media screen and (min-width: 500px) and (min-height: 500px) {
  .uni-picker-container .uni-picker-custom {
    /* 将限制放宽到 400px，以容纳 6 列数据 */
    width: 360px !important;
    min-width: 360px !important;
    /* 防止在小屏幕上溢出屏幕边缘 */
    max-width: 90% !important;

    /* 调整垂直定位，保证居中效果 */
    left: 50% !important;
    right: auto !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
  }
}

/* 2. 优化 Picker 内部排列（确保内部内容能正确铺开） */
.uni-picker-view-wrapper {
  width: 360px !important;       /* 内容区固定 360px */
  min-width: 360px !important;

  .uni-picker-view {
    display: flex !important;  /* 强制 Flex 横向排列 */

    .uni-picker-view-col {
      width: 60px !important; /* 6列 x 60px = 360px */
      border-right: 1px solid #f0f0f0; /* 可选：列分隔线 */

      .uni-picker-item {
        white-space: nowrap !important; /* 禁止换行 */
        text-align: center !important;
        font-size: 12px !important;      /* 适当缩小字体 */
        color: #333 !important;

        /* 处理文字过长（如年份） */
        overflow: hidden;
      }
    }

    /* 最后一列去掉右边框 */
    .uni-picker-view-col:last-child {
      border-right: none !important;
    }
  }
}

/* ========================================== */
/*      修复：Toast 提示文字显示不全           */
/* ========================================== */

.uni-toast {
  max-width: 360px !important;
  width: 200px !important;
}

.uni-toast .uni-toast__title {
  white-space: nowrap !important;
}
</style>