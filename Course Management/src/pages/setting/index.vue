<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { getUserStorage, setUserStorage } from '@/utils/session.js';

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
    const savedWeekday = getUserStorage('weekStartDay');
    if (savedWeekday) weekStartDay.value = savedWeekday;
    const savedSemester = getUserStorage('semesterConfig');
    if (savedSemester) Object.assign(semesterConfig.value, savedSemester);
  } catch (e) {}
};
loadConfig();

const saveConfig = () => {
  setUserStorage('weekStartDay', weekStartDay.value);
  setUserStorage('semesterConfig', semesterConfig.value);
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

// 日期选择器默认定位到当天日期
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const getCachedCourses = () => {
  let courses = [];
  try {
    const cached = getUserStorage('cachedCourses');
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

  // #ifdef H5
  // H5 环境：生成 xlsx 文件并触发浏览器下载
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
  uni.showModal({
    title: '导出成功',
    content: `已导出 ${courses.length} 条课程数据。\n文件 ${fullFileName} 已开始下载到浏览器默认下载目录。`,
    showCancel: false,
    confirmText: '知道了'
  });
  // #endif

  // #ifndef H5
  // 微信小程序环境：生成 xlsx 文件（base64）并打开预览
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const fullFileName = `${fileName}.xlsx`;
    const tempPath = `${wx.env.USER_DATA_PATH}/${fullFileName}`;
    const fs = uni.getFileSystemManager();
    fs.writeFile({
      filePath: tempPath,
      data: wbout,
      encoding: 'base64',
      success() {
        uni.showModal({
          title: '备份完成',
          content: `备份文件已生成（${courses.length} 条课程）。\n\n点击"打开文件"可预览、转发或保存到手机。`,
          showCancel: true,
          confirmText: '打开文件',
          cancelText: '知道了',
          success(res) {
            if (res.confirm) {
              uni.openDocument({
                filePath: tempPath,
                fileType: 'xlsx',
                showMenu: true,
                success() {
                  console.log('文件已打开');
                },
                fail(err) {
                  console.error('打开文件失败:', err);
                  uni.showToast({ title: '打开文件失败，请重试', icon: 'none' });
                }
              });
            }
          }
        });
      },
      fail(err) {
        console.error('写入文件失败:', err);
        uni.showToast({ title: '导出失败，请重试', icon: 'none' });
      }
    });
  } catch (e) {
    console.error('导出异常:', e);
    uni.showToast({ title: '导出失败，请重试', icon: 'none' });
  }
  // #endif
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page-h5">
    <!-- 固定顶部导航栏 -->
    <view class="topbar-h5">
      <view class="topbar-inner">
        <view class="topbar-back-h5" @click="goBack()">
          <text class="topbar-back-icon-h5">←</text>
          <text class="topbar-back-text-h5">返回</text>
        </view>
        <text class="topbar-title-h5">设置</text>
        <view class="topbar-placeholder-h5"></view>
      </view>
    </view>

    <view class="content-h5">
      <view class="settings-layout-h5">
        <!-- 左列：基本设置 + 学期设置 -->
        <view class="left-col-h5">
          <!-- 基本设置 -->
          <view class="section-header-h5">
            <view class="section-bar-h5 section-bar-basic-h5"></view>
            <text class="section-title-h5">基本设置</text>
          </view>
          <view class="settings-card-h5">
            <picker mode="selector" :range="weekdayOptions" @change="onWeekStartChange($event)">
              <view class="setting-item-h5">
                <view class="setting-left-h5">
                  <text class="setting-icon-h5">📅</text>
                  <text class="setting-label-h5">每周起始日</text>
                </view>
                <view class="setting-right-h5">
                  <text class="setting-value-h5">{{ weekStartDay }}</text>
                  <text class="setting-arrow-h5">›</text>
                </view>
              </view>
            </picker>
          </view>

          <!-- 学期时间设置 -->
          <view class="section-header-h5">
            <view class="section-bar-h5 section-bar-semester-h5"></view>
            <text class="section-title-h5">学期时间设置</text>
          </view>
          <view class="settings-card-h5">
            <view v-for="field in semesterFields" :key="field.key" class="setting-row-wrap-h5">
              <picker mode="date" :value="todayStr" @change="onSemesterChange($event, field.key)">
                <view class="setting-item-h5">
                  <view class="setting-left-h5">
                    <text class="setting-icon-h5">{{ field.key.includes('Start') ? '🌱' : '🍂' }}</text>
                    <text class="setting-label-h5">{{ field.label }}</text>
                  </view>
                  <view class="setting-right-h5">
                    <text class="setting-value-h5">{{ semesterConfig[field.key] }}</text>
                    <text class="setting-arrow-h5">›</text>
                  </view>
                </view>
              </picker>
            </view>
          </view>
        </view>

        <!-- 右列：数据管理 + 关于 -->
        <view class="right-col-h5">
          <!-- 数据管理 -->
          <view class="section-header-h5">
            <view class="section-bar-h5 section-bar-data-h5"></view>
            <text class="section-title-h5">数据管理</text>
          </view>
          <view class="settings-card-h5">
            <view class="setting-item-h5 setting-item-export-h5" @click="exportData()">
              <view class="setting-left-h5">
                <text class="setting-icon-h5">📤</text>
                <view class="setting-text-group-h5">
                  <text class="setting-label-h5">导出课程数据</text>
                  <text class="setting-desc-h5">将课程数据导出为备份文件</text>
                </view>
              </view>
              <view class="setting-right-h5">
                <text class="setting-hint-h5">备份</text>
                <text class="setting-arrow-h5">›</text>
              </view>
            </view>
          </view>

          <!-- 关于 -->
          <view class="section-header-h5">
            <view class="section-bar-h5 section-bar-about-h5"></view>
            <text class="section-title-h5">关于</text>
          </view>
          <view class="settings-card-h5 about-card-h5">
            <view class="about-item-h5">
              <view class="about-logo-h5">
                <text class="about-logo-text-h5">课</text>
              </view>
              <view class="about-info-h5">
                <text class="about-name-h5">{{ appInfo.name }}</text>
                <text class="about-version-h5">v{{ appInfo.version }}</text>
                <text class="about-desc-h5">{{ appInfo.description }}</text>
              </view>
            </view>
          </view>

          <text class="footer-tip-h5">所有配置自动保存至本地</text>
        </view>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="page-mp">
    <!-- 简洁头部 -->
    <view class="header-mp">
      <view class="header-back-mp" @click="goBack()">
        <text class="header-back-icon-mp">‹</text>
        <text class="header-back-text-mp">返回</text>
      </view>
      <text class="header-title-mp">设置</text>
      <view class="header-placeholder-mp"></view>
    </view>

    <scroll-view scroll-y class="scroll-content-mp">
      <!-- 基本设置 -->
      <view class="section-header-mp">
        <view class="section-bar-mp section-bar-basic-mp"></view>
        <text class="section-title-mp">基本设置</text>
      </view>
      <view class="settings-card-mp">
        <picker mode="selector" :range="weekdayOptions" @change="onWeekStartChange($event)">
          <view class="setting-item-mp">
            <view class="setting-left-mp">
              <text class="setting-icon-mp">📅</text>
              <text class="setting-label-mp">每周起始日</text>
            </view>
            <view class="setting-right-mp">
              <text class="setting-value-mp">{{ weekStartDay }}</text>
              <text class="setting-arrow-mp">›</text>
            </view>
          </view>
        </picker>
      </view>

      <!-- 学期时间设置 -->
      <view class="section-header-mp">
        <view class="section-bar-mp section-bar-semester-mp"></view>
        <text class="section-title-mp">学期时间设置</text>
      </view>
      <view class="settings-card-mp">
        <view v-for="field in semesterFields" :key="field.key">
          <picker mode="date" :value="todayStr" @change="onSemesterChange($event, field.key)">
            <view class="setting-item-mp">
              <view class="setting-left-mp">
                <text class="setting-icon-mp">{{ field.key.includes('Start') ? '🌱' : '🍂' }}</text>
                <text class="setting-label-mp">{{ field.label }}</text>
              </view>
              <view class="setting-right-mp">
                <text class="setting-value-mp">{{ semesterConfig[field.key] }}</text>
                <text class="setting-arrow-mp">›</text>
              </view>
            </view>
          </picker>
        </view>
      </view>

      <!-- 数据管理 -->
      <view class="section-header-mp">
        <view class="section-bar-mp section-bar-data-mp"></view>
        <text class="section-title-mp">数据管理</text>
      </view>
      <view class="settings-card-mp">
        <view class="setting-item-mp setting-item-export-mp" @click="exportData()">
          <view class="setting-left-mp">
            <text class="setting-icon-mp">📤</text>
            <view class="setting-text-group-mp">
              <text class="setting-label-mp">导出课程数据</text>
              <text class="setting-desc-mp">将课程数据导出为备份文件</text>
            </view>
          </view>
          <view class="setting-right-mp">
            <text class="setting-hint-mp">备份</text>
            <text class="setting-arrow-mp">›</text>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="section-header-mp">
        <view class="section-bar-mp section-bar-about-mp"></view>
        <text class="section-title-mp">关于</text>
      </view>
      <view class="settings-card-mp about-card-mp">
        <view class="about-item-mp">
          <view class="about-logo-mp">
            <text class="about-logo-text-mp">课</text>
          </view>
          <view class="about-info-mp">
            <text class="about-name-mp">{{ appInfo.name }}</text>
            <text class="about-version-mp">v{{ appInfo.version }}</text>
            <text class="about-desc-mp">{{ appInfo.description }}</text>
          </view>
        </view>
      </view>

      <view class="safe-bottom-mp"></view>
      <text class="footer-tip-mp">所有配置自动保存至本地</text>
    </scroll-view>
  </view>
  <!-- #endif -->
</template>

<style scoped lang="scss">
/* ===================== H5 PC端样式 ===================== */
/* #ifdef H5 */
.page-h5 {
  min-height: 100vh;
  background: #f8fafc;
  padding-top: 64px;
}

.topbar-h5 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 1000;
  display: flex;
  align-items: center;

  .topbar-inner {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topbar-back-h5 {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.08);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(99, 102, 241, 0.15);
    }

    &:active { transform: scale(0.96); }

    .topbar-back-icon-h5 {
      font-size: 18px;
      color: #6366f1;
      font-weight: 600;
    }

    .topbar-back-text-h5 {
      font-size: 15px;
      color: #6366f1;
      font-weight: 600;
    }
  }

  .topbar-title-h5 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .topbar-placeholder-h5 {
    width: 80px;
  }
}

.content-h5 {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 32px 48px;
  box-sizing: border-box;
}

.settings-layout-h5 {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.left-col-h5 {
  flex: 1;
  min-width: 0;
}

.right-col-h5 {
  flex: 1;
  min-width: 0;
}

.section-header-h5 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 4px 12px;
  padding-top: 4px;

  .section-bar-h5 {
    width: 4px;
    height: 18px;
    border-radius: 4px;
    flex-shrink: 0;

    &.section-bar-basic-h5 { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
    &.section-bar-semester-h5 { background: linear-gradient(180deg, #10b981, #34d399); }
    &.section-bar-data-h5 { background: linear-gradient(180deg, #f59e0b, #fbbf24); }
    &.section-bar-about-h5 { background: linear-gradient(180deg, #6366f1, #06b6d4); }
  }

  .section-title-h5 {
    font-size: 14px;
    color: #64748b;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
}

.settings-card-h5 {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 24px;
  transition: box-shadow 0.25s;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }

  &.about-card-h5 {
    margin-bottom: 12px;
  }
}

.setting-item-h5 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }

  &:active {
    background: #f1f5f9;
  }

  &:last-child {
    border-bottom: none;
  }

  .setting-left-h5 {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .setting-icon-h5 {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
  }

  .setting-label-h5 {
    font-size: 16px;
    color: #0f172a;
    font-weight: 500;
  }

  .setting-text-group-h5 {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .setting-desc-h5 {
    display: block;
    font-size: 13px;
    color: #94a3b8;
  }

  .setting-right-h5 {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .setting-value-h5 {
    font-size: 15px;
    color: #6366f1;
    font-weight: 600;
  }

  .setting-hint-h5 {
    font-size: 13px;
    color: #94a3b8;
  }

  .setting-arrow-h5 {
    font-size: 20px;
    color: #cbd5e1;
    font-weight: 300;
  }
}

.setting-row-wrap-h5 {
  &:last-child .setting-item-h5 {
    border-bottom: none;
  }
}

.setting-item-export-h5 {
  &:hover {
    background: #fffbeb;
  }
}

.about-item-h5 {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;

  .about-logo-h5 {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
  }

  .about-logo-text-h5 {
    font-size: 24px;
    color: #fff;
    font-weight: 700;
  }

  .about-info-h5 {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .about-name-h5 {
    font-size: 17px;
    color: #0f172a;
    font-weight: 700;
  }

  .about-version-h5 {
    font-size: 13px;
    color: #6366f1;
    font-weight: 600;
  }

  .about-desc-h5 {
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
    margin-top: 2px;
  }
}

.footer-tip-h5 {
  display: block;
  text-align: center;
  color: #cbd5e1;
  font-size: 13px;
  padding: 16px 0 8px;
}
/* #endif */

/* ===================== MP-WEIXIN 微信小程序样式 ===================== */
/* #ifdef MP-WEIXIN */
.page-mp {
  width: 100%;
  /* 固定高度为视口高度，禁止页面整体上下滚动 */
  height: 100vh;
  background: #f0f2f5;
  padding-top: var(--status-bar-height);
  overflow: hidden;
  box-sizing: border-box;
}

.header-mp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e2e8f0;

  .header-back-mp {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.08);
    min-height: 44px;

    &:active { opacity: 0.7; transform: scale(0.96); }

    .header-back-icon-mp {
      font-size: 18px;
      color: #6366f1;
      font-weight: 300;
      line-height: 1;
    }

    .header-back-text-mp {
      font-size: 12px;
      color: #6366f1;
      font-weight: 500;
    }
  }

  .header-title-mp {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  .header-placeholder-mp {
    width: 56px;
  }
}

.scroll-content-mp {
  padding: 12px 16px 32px;
  box-sizing: border-box;
  /* 固定高度 = 视口高度 - 状态栏 - 头部高度 */
  height: calc(100vh - var(--status-bar-height) - 56px);
  /* scroll-view 自身可滚动，但页面整体不滚动 */
  overflow-y: auto;
}

.section-header-mp {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 6px 4px;

  .section-bar-mp {
    width: 3px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;

    &.section-bar-basic-mp { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
    &.section-bar-semester-mp { background: linear-gradient(180deg, #10b981, #34d399); }
    &.section-bar-data-mp { background: linear-gradient(180deg, #f59e0b, #fbbf24); }
    &.section-bar-about-mp { background: linear-gradient(180deg, #6366f1, #06b6d4); }
  }

  .section-title-mp {
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
}

.settings-card-mp {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
  margin-bottom: 4px;

  &.about-card-mp {
    margin-bottom: 4px;
  }
}

.setting-item-mp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  min-height: 44px;
  width: 100%;
  background: transparent;
  box-sizing: border-box;

  &:active { background: #f8fafc; }
  &:last-child { border-bottom: none; }

  .setting-left-mp {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .setting-icon-mp {
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
  }

  .setting-label-mp {
    font-size: 14px;
    color: #1e293b;
    font-weight: 500;
  }

  .setting-text-group-mp {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .setting-desc-mp {
    display: block;
    font-size: 11px;
    color: #94a3b8;
  }

  .setting-right-mp {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .setting-value-mp {
    font-size: 13px;
    color: #6366f1;
    font-weight: 500;
  }

  .setting-hint-mp {
    font-size: 11px;
    color: #94a3b8;
  }

  .setting-arrow-mp {
    font-size: 16px;
    color: #cbd5e1;
    font-weight: 300;
  }
}

.setting-item-export-mp {
  &:active { background: #fffbeb; }
}

.about-item-mp {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;

  .about-logo-mp {
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

  .about-logo-text-mp {
    font-size: 20px;
    color: #fff;
    font-weight: 700;
  }

  .about-info-mp {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .about-name-mp {
    font-size: 14px;
    color: #1e293b;
    font-weight: 600;
  }

  .about-version-mp {
    font-size: 12px;
    color: #6366f1;
    font-weight: 500;
  }

  .about-desc-mp {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.4;
    margin-top: 1px;
  }
}

.safe-bottom-mp {
  height: 0;
}

.footer-tip-mp {
  display: block;
  text-align: center;
  color: #cbd5e1;
  font-size: 11px;
  padding: 12px 0 8px;
}
/* #endif */
</style>
