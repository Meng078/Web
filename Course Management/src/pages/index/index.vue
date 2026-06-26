<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCoursesAPI } from '@/api/index.js';
import { getCurrentUser } from '@/utils/session.js';

const title = ref('智慧课表');
const goToMine = () => { uni.navigateTo({ url: '/pages/mine/mine' }); };
const goToCourseList = () => { uni.navigateTo({ url: '/pages/list/listCourse' }); };
const goToSettings = () => { uni.navigateTo({ url: '/pages/stting/index' }); };

const navItems = ref([
  { text: '课程列表', desc: '浏览所有课程', action: goToCourseList, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { text: '课表设置', desc: '时间轴与显示偏好', action: goToSettings, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { text: '我的', desc: '个人中心', action: goToMine, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
]);

const weekDays = ref([]);
const weekOffset = ref(0);
const currentWeekStart = ref(null);
const selectedDayIndex = ref(0);
const loading = ref(false);

const weekStartDay = ref('周一');

const CHINESE_WEEKDAYS_MONDAY = ['一', '二', '三', '四', '五', '六', '日'];
const CHINESE_WEEKDAYS_SUNDAY = ['日', '一', '二', '三', '四', '五', '六'];

const courseColors = [
  { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' },
  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
];

const loadWeekStartSetting = () => {
  try {
    const saved = uni.getStorageSync('weekStartDay');
    if (saved) weekStartDay.value = saved;
  } catch (e) {}
};

const chineseWeekdays = computed(() => {
  return weekStartDay.value === '周日' ? CHINESE_WEEKDAYS_SUNDAY : CHINESE_WEEKDAYS_MONDAY;
});

const getWeekdayIndex = (courseTime) => {
  if (!courseTime) return -1;
  const days = chineseWeekdays.value;
  for (let i = 0; i < days.length; i++) {
    if (courseTime.includes(days[i])) return i;
  }
  return -1;
};

const initWeekDays = (offset = 0) => {
  const now = new Date();
  const weekStart = weekStartDay.value === '周日' ? 0 : 1;
  const currentDay = now.getDay();
  let firstDay = new Date(now);
  if (weekStart === 0) {
    firstDay.setDate(now.getDate() - currentDay + offset * 7);
  } else {
    firstDay.setDate(now.getDate() - (currentDay || 7) + 1 + offset * 7);
  }
  currentWeekStart.value = firstDay;

  const days = chineseWeekdays.value;
  weekDays.value = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    const isToday = (() => {
      const today = new Date();
      return d.getFullYear() === today.getFullYear() &&
             d.getMonth() === today.getMonth() &&
             d.getDate() === today.getDate();
    })();
    weekDays.value.push({
      date: d,
      weekday: days[i],
      day: d.getDate(),
      month: d.getMonth() + 1,
      isToday,
      isSelected: false,
    });
  }

  if (offset === 0) {
    const todayIdx = weekDays.value.findIndex(d => d.isToday);
    selectedDayIndex.value = todayIdx >= 0 ? todayIdx : 0;
    weekDays.value.forEach((item, idx) => item.isSelected = (idx === selectedDayIndex.value));
  } else {
    selectedDayIndex.value = 0;
    weekDays.value[0].isSelected = true;
  }
};

const prevWeek = () => {
  weekOffset.value--;
  initWeekDays(weekOffset.value);
  loadWeeklyCourses();
};

const nextWeek = () => {
  weekOffset.value++;
  initWeekDays(weekOffset.value);
  loadWeeklyCourses();
};

const weekRangeLabel = computed(() => {
  if (!currentWeekStart.value) return '';
  const start = currentWeekStart.value;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
});

const timeSlots = [
  { id: 1, label: '第一单元', start: '08:00', end: '09:40' },
  { id: 2, label: '第二单元', start: '10:10', end: '11:50' },
  { id: 3, label: '第三单元', start: '13:30', end: '15:10' },
  { id: 4, label: '第四单元', start: '15:40', end: '17:20' },
  { id: 5, label: '第五单元', start: '18:30', end: '20:10' },
];

const weeklyGridData = ref(Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => [])));

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getSlotIndex = (startTime) => {
  if (!startTime) return -1;
  const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  if (startMin <= 580) return 0;
  if (startMin <= 650) return 1;
  if (startMin <= 810) return 2;
  if (startMin <= 940) return 3;
  return 4;
};

let courseColorIndex = 0;
const getNextColor = () => {
  const color = courseColors[courseColorIndex % courseColors.length];
  courseColorIndex++;
  return color;
};

/**
 * 将课程数据映射到课表网格
 * @param {Array} rawCourses - 原始课程数据
 */
const renderCoursesToGrid = (rawCourses) => {
  const allCourses = rawCourses.map(c => ({
    id: c.id,
    subject: c.course_name,
    teacher: c.teacher_name,
    location: c.course_location,
    startDay: c.start_date,
    endDay: c.end_date,
    startTime: c.start_time,
    endTime: c.end_time,
    courseTime: c.course_time,
  }));

  courseColorIndex = 0;
  const currentGrid = Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => []));
  const usedColors = {};

  weekDays.value.forEach((day, dayIdx) => {
    const currentDate = day.date;

    allCourses.forEach(course => {
      let matched = false;
      let targetWeekday = -1;

      if (course.courseTime) {
        targetWeekday = getWeekdayIndex(course.courseTime);
      }
      if (targetWeekday === -1 && course.startDay) {
        targetWeekday = new Date(course.startDay).getDay();
      }
      if (targetWeekday !== dayIdx) return;

      if (course.startDay && course.endDay) {
        const currentDateStr = formatDate(currentDate);
        if (currentDateStr >= course.startDay && currentDateStr <= course.endDay) matched = true;
      } else if (course.startDay) {
        if (formatDate(currentDate) >= course.startDay) matched = true;
      } else if (course.courseTime) {
        matched = true;
      }
      if (!matched) return;

      let slotIdx = -1;
      if (course.startTime) slotIdx = getSlotIndex(course.startTime);
      if (slotIdx < 0 || slotIdx >= 5) return;

      const courseKey = `${course.id || course.subject}`;
      if (!usedColors[courseKey]) usedColors[courseKey] = getNextColor();

      currentGrid[slotIdx][dayIdx].push({ ...course, color: usedColors[courseKey] });
    });
  });

  weeklyGridData.value = currentGrid;
};

/**
 * 清除课程数据缓存（添加/编辑/删除课程后调用）
 */
const clearCourseCache = () => {
  try {
    uni.removeStorageSync(CACHE_KEY);
  } catch (e) { /* 忽略 */ }
};

const loadWeeklyCourses = async () => {
  loading.value = true;
  let rawCourses = [];
  try {
    rawCourses = await getCoursesWithCache();
  } catch (e) {
    rawCourses = [];
  }

  renderCoursesToGrid(rawCourses);
  loading.value = false;
};

const selectDay = (index) => {
  weekDays.value.forEach((item, idx) => item.isSelected = (idx === index));
  selectedDayIndex.value = index;
};

let touchStartX = 0;
const onTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
const onTouchEnd = (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? nextWeek() : prevWeek();
};

const checkAuth = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    uni.reLaunch({ url: '/pages/login/index' });
    return false;
  }
  return true;
};

// ★ 缓存配置：课程数据缓存 5 分钟，减少重复请求 ★
const CACHE_KEY = 'cachedCourses';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 分钟

/**
 * 获取课程数据（带缓存）
 * 优先读取缓存，缓存过期或没有缓存时才发起网络请求
 */
const getCoursesWithCache = async () => {
  try {
    const cached = uni.getStorageSync(CACHE_KEY);
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data; // 缓存有效，直接返回
    }
  } catch (e) { /* 忽略读取错误 */ }

  // 缓存无效或过期，发起网络请求
  const res = await getCoursesAPI();
  const courses = (res.data || res || []);

  try {
    uni.setStorageSync(CACHE_KEY, {
      data: courses,
      timestamp: Date.now()
    });
  } catch (e) { /* 忽略写入错误 */ }

  return courses;
};

const refreshWeekView = () => {
  if (!checkAuth()) return;
  loadWeekStartSetting();
  initWeekDays(weekOffset.value);
  loadWeeklyCourses();
};

// ★ 首次加载标记，防止 onMounted + onShow 重复执行 ★
let _hasMounted = false;

onMounted(() => {
  refreshWeekView();
  _hasMounted = true;
});

// ★ onShow 时跳过首次（onMounted 已执行），仅从缓存渲染
//   切换 Tab 回来时直接读缓存，无需网络请求，实现秒级显示
onShow(() => {
  if (!checkAuth()) return;

  // 首次显示由 onMounted 处理，跳过
  if (!_hasMounted) return;

  loadWeekStartSetting();
  initWeekDays(weekOffset.value);

  // 直接读取缓存渲染，0 网络等待
  try {
    const cached = uni.getStorageSync(CACHE_KEY);
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      renderCoursesToGrid(cached.data);
      return;
    }
  } catch (e) { /* 忽略 */ }

  // 缓存不存在（极少情况），后台静默刷新
  loadWeeklyCourses();
});

const hasAnyCourse = computed(() => weeklyGridData.value.some(slot => slot.some(day => day.length > 0)));

const semesterInfo = computed(() => {
  const refDate = currentWeekStart.value || new Date();
  const y = refDate.getFullYear();
  const m = refDate.getMonth() + 1;
  const d = refDate.getDate();
  if ((m >= 3 && m < 7) || (m === 7 && d <= 15)) return { name: `${y}年春季学期`, inSemester: true };
  if ((m >= 9 && m <= 12) || (m === 1 && d <= 15)) return { name: `${(m <= 2 ? y - 1 : y)}年秋季学期`, inSemester: true };
  return { name: '', inSemester: false };
});

const currentWeekNum = computed(() => {
  if (!semesterInfo.value.inSemester) return null;
  const refDate = currentWeekStart.value || new Date();
  const y = parseInt(semesterInfo.value.name.match(/(\d+)年/)?.[1] || refDate.getFullYear());
  const start = semesterInfo.value.name.includes('春') ? new Date(y, 2, 1) : new Date(y, 8, 1);
  return Math.floor((refDate - start) / (7 * 86400000)) + 1;
});
</script>

<template>
  <view class="page-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <view class="hero-section">
        <text class="app-title">{{ title }}</text>
        <text class="app-subtitle" v-if="semesterInfo.inSemester">
          {{ semesterInfo.name }} · 第{{ currentWeekNum }}周
        </text>
        <text class="app-subtitle" v-else>{{ weekRangeLabel }}</text>
      </view>

      <view class="unified-card">
        <view class="schedule-table">
          <view class="top-nav-bar">
            <view class="nav-btn prev-btn" @click="prevWeek()">
              <text class="arrow-icon">‹</text>
              <text class="btn-text">上周</text>
            </view>
            <view class="range-label-container">
              <text class="label-text">{{ weekRangeLabel }}</text>
            </view>
            <view class="nav-btn next-btn" @click="nextWeek()">
              <text class="btn-text">下周</text>
              <text class="arrow-icon">›</text>
            </view>
          </view>

          <view class="table-header">
            <view class="col-time"></view>
            <view class="col-days" @touchstart="onTouchStart" @touchend="onTouchEnd">
              <view class="col-day" v-for="(day, i) in weekDays" :key="'h'+i"
                :class="{ 'today-header': day.isToday && weekOffset === 0 }" @click="selectDay(i)">
                <text class="cell-day">周{{ day.weekday }}</text>
                <text class="cell-date">{{ day.month }}/{{ day.day }}</text>
              </view>
            </view>
          </view>

          <scroll-view scroll-y class="table-body">
            <view v-if="loading" class="loading-mask">
              <view class="loading-spinner"></view>
            </view>

            <view v-for="(slot, slotIdx) in timeSlots" :key="slot.id" class="row-slot">
              <view class="col-time cell">
                <text class="time-label">{{ slot.label }}</text>
                <text class="time-info">{{ slot.start }}-{{ slot.end }}</text>
              </view>
              <view class="col-days">
                <view class="col-day cell" v-for="(day, dayIdx) in weekDays" :key="dayIdx"
                  :class="{ 'highlight-today': day.isToday && weekOffset === 0, 'selected-day': day.isSelected }">
                  <view v-if="weeklyGridData[slotIdx][dayIdx].length > 0" class="course-list">
                    <view v-for="(course, cIdx) in weeklyGridData[slotIdx][dayIdx]" :key="cIdx" class="course-block"
                      :style="{ background: course.color.bg, borderLeftColor: course.color.border }">
                      <text class="course-name" :style="{ color: course.color.text }">{{ course.subject }}</text>
                      <text class="course-teacher">{{ course.teacher }}</text>
                      <text class="course-location">{{ course.location }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>

        </view>
      </view>

      <view class="action-grid">
        <button class="nav-card" v-for="(item, index) in navItems" :key="index" @click="item.action()">
          <view class="card-bg" :style="{ background: item.gradient }"></view>
          <view class="card-content">
            <text class="nav-text">{{ item.text }}</text>
            <text class="nav-desc">{{ item.desc }}</text>
          </view>
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%);
  position: relative;
  overflow-x: hidden;
  padding-top: var(--status-bar-height);

  .bg-decoration {
    position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 0; pointer-events: none;
    .bg-circle {
      position: absolute; border-radius: 50%; /* #ifdef H5 */ filter: blur(100px); /* #endif */ opacity: 0.3;
      &.bg-circle-1 { width: 400px; height: 400px; background: #6366f1; top: -120px; right: -80px; }
      &.bg-circle-2 { width: 300px; height: 300px; background: #10b981; bottom: -80px; left: -60px; }
    }
  }

  .content-wrapper {
    position: relative; z-index: 1; max-width: 100%; padding: 16px 12px 32px; box-sizing: border-box; margin: 0 auto;
  }
}

/* ===== 英雄区头部 ===== */
.hero-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.25);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -40%;
    left: -20%;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .app-title {
    display: block;
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 2px;
    position: relative;
    z-index: 1;
  }
  .app-subtitle {
    display: block;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 6px;
    position: relative;
    z-index: 1;
  }
}

/* ===== 课表卡片 ===== */
.unified-card {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f6;
  overflow: hidden;
}

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f8faff;
  border-bottom: 1px solid #eef2f6;

  .nav-btn {
    display: flex; align-items: center; gap: 4px; cursor: pointer;
    padding: 6px 12px; border-radius: 8px;
    background: rgba(99, 102, 241, 0.06);
    color: #6366f1; transition: all 0.2s; user-select: none;
    .btn-text { font-size: 13px; font-weight: 600; }
    .arrow-icon { font-size: 18px; line-height: 1; }
    &:active { background: rgba(99, 102, 241, 0.15); transform: scale(0.95); }
  }
  .range-label-container { flex: 1; text-align: center; }
  .label-text { font-size: 14px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px; }
}

.schedule-table {
  width: 100%;
  display: flex;
  flex-direction: column;

  .table-header {
    display: flex;
    background: #fafbfd;
    border-bottom: 1px solid #eef2f6;
    flex-shrink: 0;

    .col-time {
      flex: 0 0 80px;
      text-align: center;
      padding: 8px 0;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .col-days {
      flex: 1; display: flex;
      .col-day {
        flex: 1; text-align: center; padding: 8px 2px;
        border-left: 1px solid #eef2f6;
        cursor: pointer; transition: all 0.2s; user-select: none;
        &:active { background: #f1f5f9; }
        &.today-header {
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.04));
          .cell-day { color: #6366f1; }
          .cell-date { color: #6366f1; font-weight: 600; }
        }
        .cell-day { display: block; font-size: 12px; color: #64748b; font-weight: 600; }
        .cell-date { display: block; font-size: 10px; color: #94a3b8; margin-top: 1px; }
      }
    }
  }
}

.table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 440px;

  .loading-mask {
    position: absolute; inset: 0;
    background: rgba(255, 255, 255, 0.85);
    display: flex; align-items: center; justify-content: center; z-index: 10;
    .loading-spinner {
      width: 32px; height: 32px;
      border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .row-slot {
    display: flex;
    min-height: 68px;
    border-bottom: 1px solid #f1f4f9;
    transition: background 0.15s;
    &:last-child { border-bottom: none; }

    .col-time {
      flex: 0 0 80px;
      padding: 6px 4px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background-color: #fafbfd;
      border-right: 1px solid #eef2f6;
      .time-label { font-size: 11px; color: #6366f1; font-weight: 700; }
      .time-info { font-size: 9px; color: #94a3b8; white-space: nowrap; font-weight: 500; margin-top: 2px; }
    }
    .col-days {
      flex: 1; display: flex;
      .col-day {
        flex: 1;
        border-left: 1px solid #f1f4f9;
        position: relative;
        padding: 4px;
        min-height: 68px;

        &.highlight-today { background: rgba(99, 102, 241, 0.03); }
        &.selected-day { background: rgba(99, 102, 241, 0.05); box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.12); }

        .course-list { display: flex; flex-direction: column; gap: 2px; }
        .course-block {
          width: 100%; box-sizing: border-box;
          padding: 4px 5px; border-radius: 6px;
          border-left: 3px solid;
          display: flex; flex-direction: column;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          &:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .course-name { display: block; font-size: 11px; font-weight: 700; text-align: left; line-height: 1.3; word-break: break-all; }
          .course-teacher { display: block; font-size: 9px; color: #6366f1; text-align: left; line-height: 1.4; margin-top: 1px; }
          .course-location { display: block; font-size: 8px; color: #94a3b8; text-align: left; line-height: 1.4; }
        }
      }
    }
  }
}

/* ===== 底部导航卡片 ===== */
.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 8px;
}
.nav-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  width: 100%;
  &::after { border: none; }
  &:active { transform: scale(0.95); }
  &:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
}
.card-bg { position: absolute; inset: 0; opacity: 1; }
.card-content {
  position: relative; z-index: 1;
  width: 100%; padding: 16px 12px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
}
.nav-text { display: block; font-size: 15px; font-weight: 700; }
.nav-desc { display: block; font-size: 11px; opacity: 0.85; margin-top: 3px; }

</style>
