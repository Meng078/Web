<script setup>
import { ref } from 'vue';

// --- 每周起始日 ---
const weekdayOptions = ['周一', '周日'];
const weekStartDay = ref('周一');

// --- 学期配置 ---
const semesterConfig = ref({
  springStart: '03-01',
  springEnd: '07-15',
  fallStart: '09-01',
  fallEnd: '01-15'
});

const semesterFields = [
  { key: 'springStart', label: '春季学期开始' },
  { key: 'springEnd', label: '春季学期结束' },
  { key: 'fallStart', label: '秋季学期开始' },
  { key: 'fallEnd', label: '秋季学期结束' },
];

// --- 加载已保存配置 ---
const loadConfig = () => {
  try {
    const savedWeekday = uni.getStorageSync('weekStartDay');
    if (savedWeekday) weekStartDay.value = savedWeekday;

    const savedSemester = uni.getStorageSync('semesterConfig');
    if (savedSemester) Object.assign(semesterConfig.value, savedSemester);
  } catch (e) {}
};
loadConfig();

// --- 持久化到本地 ---
const saveConfig = () => {
  uni.setStorageSync('weekStartDay', weekStartDay.value);
  uni.setStorageSync('semesterConfig', semesterConfig.value);
};

// --- 每周起始日变更 ---
const onWeekStartChange = (e) => {
  weekStartDay.value = weekdayOptions[e.detail.value];
  saveConfig();
  uni.showToast({ title: '已保存', icon: 'success' });
};

// --- 学期日期变更 ---
const onSemesterChange = (e, key) => {
  semesterConfig.value[key] = e.detail.value.slice(5); // YYYY-MM-DD → MM-DD
  saveConfig();
  uni.showToast({ title: '已保存', icon: 'success' });
};

// 将 MM-DD 转为 picker 可用完整日期
const toPickerDate = (mmdd) => `2000-${mmdd}`;

// --- 导出课程数据 ---
const exportData = () => {
  let courses = [];
  try {
    courses = uni.getStorageSync('courses') || [];
  } catch (e) {}

  if (courses.length === 0) {
    uni.showToast({ title: '暂无课程数据可导出', icon: 'none' });
    return;
  }

  const payload = {
    exportTime: new Date().toLocaleString('zh-CN'),
    weekStartDay: weekStartDay.value,
    semesterConfig: semesterConfig.value,
    courseCount: courses.length,
    courses
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `课表数据备份_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  uni.showToast({ title: '导出成功', icon: 'success' });
};

// --- 返回（强制绑定主页） ---
const goBack = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};
</script>

<template>
  <view class="page-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <!-- 顶部导航栏 -->
      <view class="navbar">
        <view class="nav-back" @click="goBack">
          <text class="icon-arrow">返回</text>
        </view>
        <text class="nav-title">课表设置</text>
        <view class="nav-placeholder"></view>
      </view>

      <scroll-view scroll-y class="scroll-content">
        <!-- 基本设置 -->
        <view class="section-title">基本设置</view>
        <view class="settings-card">
          <picker mode="selector" :range="weekdayOptions" @change="onWeekStartChange">
            <view class="setting-item">
              <text class="setting-label">每周起始日</text>
              <view class="setting-right">
                <text class="setting-value">{{ weekStartDay }}</text>
                <text class="setting-arrow">›</text>
              </view>
            </view>
          </picker>
        </view>

        <!-- 学期时间设置 -->
        <view class="section-title">学期时间设置</view>
        <view class="settings-card">
          <view
              v-for="field in semesterFields"
              :key="field.key"
          >
            <picker
                mode="date"
                :value="toPickerDate(semesterConfig[field.key])"
                @change="(e) => onSemesterChange(e, field.key)"
            >
              <view class="setting-item">
                <text class="setting-label">{{ field.label }}</text>
                <view class="setting-right">
                  <text class="setting-value">{{ semesterConfig[field.key] }}</text>
                  <text class="setting-arrow">›</text>
                </view>
              </view>
            </picker>
          </view>
        </view>

        <!-- 数据管理 -->
        <view class="section-title">数据管理</view>
        <view class="settings-card">
          <view class="setting-item" @click="exportData">
            <text class="setting-label">导出课程数据</text>
            <view class="setting-right">
              <text class="setting-hint">JSON 备份</text>
              <text class="setting-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 占位 -->
        <view style="height: 24px;"></view>

        <view class="footer-tip">所有配置自动保存至本地</view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  .bg-circle {
    position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
    &.bg-circle-1 { width: 400px; height: 400px; background: #6366f1; top: -100px; right: -100px; }
    &.bg-circle-2 { width: 300px; height: 300px; background: #10b981; bottom: -50px; left: -50px; }
  }
}

.content-wrapper {
  position: relative; z-index: 1;
  width: 100%; max-width: 1200px;
  padding: 24px;
  box-sizing: border-box;
}

/* --- 导航栏（与列表页 header-area 一致） --- */
.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;

  .nav-back {
    position: absolute;
    left: 0;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.08);
    transition: opacity 0.15s;
    &:active { opacity: 0.6; }
  }
  .icon-arrow { font-size: 14px; color: #6366f1; font-weight: 600; }
  .nav-title {
    font-size: 28px; font-weight: 800; color: #1e293b;
  }
  .nav-placeholder { display: none; }
}

/* --- 滚动内容 --- */
.scroll-content {
  padding: 0;
  box-sizing: border-box;
}

/* --- 分区标题 --- */
.section-title {
  font-size: 13px; color: #94a3b8; font-weight: 600;
  margin: 24px 0 8px 4px; letter-spacing: 0.5px;
}

/* --- 设置卡片 --- */
.settings-card {
  background: #ffffff; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* --- 设置项 --- */
.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer; transition: background 0.15s;
  &:active { background: #f8fafc; }
  &:last-child { border-bottom: none; }

  .setting-label {
    font-size: 15px; color: #1e293b; font-weight: 500;
  }
  .setting-right {
    display: flex; align-items: center; gap: 8px;
  }
  .setting-value {
    font-size: 14px; color: #6366f1; font-weight: 500;
  }
  .setting-hint {
    font-size: 12px; color: #94a3b8;
  }
  .setting-arrow {
    font-size: 18px; color: #cbd5e1;
  }
}

/* --- 底部提示 --- */
.footer-tip {
  text-align: center; color: #cbd5e1; font-size: 12px; padding: 20px 0;
}

@media (min-width: 768px) {
  .content-wrapper {
    max-width: 800px;
  }
}
</style>
