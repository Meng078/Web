<script setup>
import { ref } from 'vue';

// ★ xlsx 库仅在 H5 环境使用，微信小程序中不加载
// 微信小程序不支持 Buffer/process 等 Node.js API，xlsx 无法在此环境运行

const weekdayOptions = ['周一', '周日'];
const weekStartDay = ref('周一');

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

const appInfo = {
  name: '课表管理',
  version: '1.0.0',
  description: '一款简洁高效的课程表管理工具，支持学期配置、课程导入导出等功能。'
};

const loadConfig = () => {
  try {
    const savedWeekday = uni.getStorageSync('weekStartDay');
    if (savedWeekday) weekStartDay.value = savedWeekday;
    const savedSemester = uni.getStorageSync('semesterConfig');
    if (savedSemester) Object.assign(semesterConfig.value, savedSemester);
  } catch (e) {}
};
loadConfig();

const saveConfig = () => {
  uni.setStorageSync('weekStartDay', weekStartDay.value);
  uni.setStorageSync('semesterConfig', semesterConfig.value);
};

const onWeekStartChange = (e) => {
  weekStartDay.value = weekdayOptions[e.detail.value];
  saveConfig();
  uni.showToast({ title: '已保存', icon: 'success' });
};

const onSemesterChange = (e, key) => {
  semesterConfig.value[key] = e.detail.value.slice(5);
  saveConfig();
  uni.showToast({ title: '已保存', icon: 'success' });
};

const toPickerDate = (mmdd) => `2000-${mmdd}`;

const getCachedCourses = () => {
  let courses = [];
  try {
    const cached = uni.getStorageSync('cachedCourses');
    if (cached && cached.data) {
      courses = cached.data;
    }
  } catch (e) {}
  return courses;
};

const exportData = async () => {
  // 从正确的缓存 Key 读取课程数据
  const courses = getCachedCourses();

  if (!courses.length) {
    uni.showToast({ title: '暂无课程数据可导出', icon: 'none' });
    return;
  }

  const fileName = `课表数据备份_${new Date().toISOString().slice(0, 10)}`;

  // #ifdef H5
  // H5 环境：使用 xlsx 库导出 Excel
  const XLSX = await import('xlsx');
  // 构建表格数据
  const headers = [
    '课程名称', '任课教师', '上课时间', '上课地点',
    '星期', '时间段', '开始日期', '结束日期',
    '开始时间', '结束时间'
  ];
  const rows = courses.map(c => [
    c.course_name || '', c.teacher_name || '', c.course_time || '',
    c.course_location || '', c.weekday || '', c.time_range || '',
    c.start_date || '', c.end_date || '', c.start_time || '', c.end_time || ''
  ]);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 16 },
    { wch: 8 },  { wch: 14 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, '课程数据');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fullFileName = `${fileName}.xlsx`;
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  uni.showToast({ title: '导出成功', icon: 'success' });
  // #endif

  // #ifndef H5
  // 非 H5 环境（微信小程序等）：导出为 .txt 文件
  try {
    const fs = uni.getFileSystemManager();
    const fullFileName = `${fileName}.txt`;
    const tempPath = `${uni.env.USER_DATA_PATH}/${fullFileName}`;
    const jsonData = JSON.stringify(courses, null, 2);
    fs.writeFile({
      filePath: tempPath,
      data: jsonData,
      encoding: 'utf8',
      success() {
        uni.saveFile({
          tempFilePath: tempPath,
          success(res) {
            uni.showToast({ title: `已导出 ${courses.length} 条课程`, icon: 'success' });
          },
          fail() {
            // saveFile 失败时，直接告知用户文件已生成
            uni.showToast({ title: '备份文件已生成', icon: 'success' });
          }
        });
      },
      fail(err) {
        console.error('导出失败:', err);
        uni.showToast({ title: '导出失败，请重试', icon: 'none' });
      }
    });
  } catch (e) {
    console.error('导出异常:', e);
    uni.showToast({ title: '导出失败', icon: 'none' });
  }
  // #endif
};

const goBack = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};
</script>

<template>
  <view class="page-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
      <view class="bg-circle bg-circle-3"></view>
    </view>

    <view class="content-wrapper">
      <view class="navbar">
        <button class="nav-back" @click="goBack()">
          <text class="nav-back-icon">‹</text>
          <text class="nav-back-text">返回</text>
        </button>
        <text class="nav-title">设置</text>
        <view class="nav-placeholder"></view>
      </view>

      <scroll-view scroll-y class="scroll-content" show-scrollbar="false">
        <view class="section-header">
          <view class="section-icon section-icon-basic"></view>
          <text class="section-title">基本设置</text>
        </view>
        <view class="settings-card">
          <picker mode="selector" :range="weekdayOptions" @change="onWeekStartChange($event)">
            <view class="setting-item">
              <view class="setting-left">
                <text class="setting-icon-text">📅</text>
                <text class="setting-label">每周起始日</text>
              </view>
              <view class="setting-right">
                <text class="setting-value">{{ weekStartDay }}</text>
                <text class="setting-arrow">›</text>
              </view>
            </view>
          </picker>
        </view>

        <view class="section-header">
          <view class="section-icon section-icon-semester"></view>
          <text class="section-title">学期时间设置</text>
        </view>
        <view class="settings-card">
          <view v-for="field in semesterFields" :key="field.key">
            <picker mode="date" :value="toPickerDate(semesterConfig[field.key])" @change="onSemesterChange($event, field.key)">
              <view class="setting-item">
                <view class="setting-left">
                  <text class="setting-icon-text">{{ field.key.includes('Start') ? '🌱' : '🍂' }}</text>
                  <text class="setting-label">{{ field.label }}</text>
                </view>
                <view class="setting-right">
                  <text class="setting-value">{{ semesterConfig[field.key] }}</text>
                  <text class="setting-arrow">›</text>
                </view>
              </view>
            </picker>
          </view>
        </view>

        <view class="section-header">
          <view class="section-icon section-icon-data"></view>
          <text class="section-title">数据管理</text>
        </view>
        <view class="settings-card">
          <button class="setting-item" @click="exportData()">
            <view class="setting-left">
              <text class="setting-icon-text">📤</text>
              <view>
                <text class="setting-label">导出课程数据</text>
                <text class="setting-desc">将课程数据导出为 JSON 备份文件</text>
              </view>
            </view>
            <view class="setting-right">
              <text class="setting-hint">备份</text>
              <text class="setting-arrow">›</text>
            </view>
          </button>
        </view>

        <view class="section-header">
          <view class="section-icon section-icon-about"></view>
          <text class="section-title">关于</text>
        </view>
        <view class="settings-card">
          <view class="about-item">
            <view class="about-logo">
              <text class="about-logo-text">课</text>
            </view>
            <view class="about-info">
              <text class="about-name">{{ appInfo.name }}</text>
              <text class="about-version">v{{ appInfo.version }}</text>
              <text class="about-desc">{{ appInfo.description }}</text>
            </view>
          </view>
        </view>

        <view class="safe-bottom"></view>

        <view class="footer-tip">所有配置自动保存至本地</view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding-top: var(--status-bar-height);
}

.bg-decoration {
  position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 0; pointer-events: none;
  .bg-circle {
    position: absolute; border-radius: 50%; opacity: 0.25;
    &.bg-circle-1 { width: 280px; height: 280px; background: linear-gradient(135deg, #6366f1, #8b5cf6); top: -100px; right: -60px; /* #ifdef H5 */ filter: blur(80px); /* #endif */ }
    &.bg-circle-2 { width: 200px; height: 200px; background: linear-gradient(135deg, #10b981, #34d399); bottom: -40px; left: -30px; /* #ifdef H5 */ filter: blur(60px); /* #endif */ }
    &.bg-circle-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #f59e0b, #fbbf24); top: 40%; left: 60%; /* #ifdef H5 */ filter: blur(70px); /* #endif */ }
  }
}

.content-wrapper {
  position: relative; z-index: 1;
  width: 100%; max-width: 600px;
  padding: 10px;
  box-sizing: border-box;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
  padding: 4px 0;

  .nav-back {
    position: absolute;
    left: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
     gap: 2px;
      padding: 2px 5px;
      box-sizing: border-box;
      border-radius: 7px;
    background: rgba(255, 255, 255, 0.8);
    /* #ifdef H5 */
    backdrop-filter: blur(8px);
    /* #endif */
    border: 1px solid rgba(226, 232, 240, 0.6);
    transition: all 0.2s;
    /* 重置微信小程序 button 默认样式 */
    margin: 0;
    outline: none;
    height: auto;
    line-height: normal;
    min-width: 0;
    &::after { border: none; }
    &:active { opacity: 0.7; transform: scale(0.96); }
  }
  .nav-back-icon { font-size: 18px; color: #6366f1; font-weight: 300; line-height: 1; }
  .nav-back-text { font-size: 12px; color: #6366f1; font-weight: 500; }
  .nav-title {
    font-size: 18px; font-weight: 700; color: #1e293b;
    letter-spacing: -0.3px;
  }
  .nav-placeholder { width: 62px; }
}

.scroll-content {
  padding: 0 2px;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 6px 4px;

  .section-icon {
    width: 3px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;

    &.section-icon-basic { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
    &.section-icon-semester { background: linear-gradient(180deg, #10b981, #34d399); }
    &.section-icon-data { background: linear-gradient(180deg, #f59e0b, #fbbf24); }
    &.section-icon-about { background: linear-gradient(180deg, #6366f1, #06b6d4); }
  }

  .section-title {
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
}

.settings-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s;
  /* 重置微信小程序 button 默认样式 */
  width: 100%;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  outline: none;
  text-align: left;
  box-sizing: border-box;
  &::after { border: none; }
  &:active { background: #f8fafc; }
  &:last-child { border-bottom: none; }

  .setting-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .setting-icon-text {
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
  }

  .setting-label {
    font-size: 13px;
    color: #1e293b;
    font-weight: 500;
  }

  .setting-desc {
    display: block;
    font-size: 11px;
    color: #94a3b8;
    margin-top: 1px;
  }

  .setting-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .setting-value {
    font-size: 12px;
    color: #6366f1;
    font-weight: 500;
  }
  .setting-hint {
    font-size: 11px;
    color: #94a3b8;
  }
  .setting-arrow {
    font-size: 16px;
    color: #cbd5e1;
    font-weight: 300;
  }
}

.about-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px;

  .about-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(99, 102, 241, 0.25);
  }
  .about-logo-text {
    font-size: 20px;
    color: #fff;
    font-weight: 700;
  }
  .about-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .about-name {
    font-size: 14px;
    color: #1e293b;
    font-weight: 600;
  }
  .about-version {
    font-size: 12px;
    color: #6366f1;
    font-weight: 500;
  }
  .about-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.4;
    margin-top: 1px;
  }
}

.safe-bottom {
  height: 0;
  /* #ifdef H5 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
}

.footer-tip {
  text-align: center;
  color: #cbd5e1;
  font-size: 11px;
  padding: 12px 0 8px;
}

@media (min-width: 768px) {
  .content-wrapper { max-width: 640px; }
}
</style>
