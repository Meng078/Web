<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCoursesAPI } from '@/api/index.js';
import { getCurrentUser, getUserStorage, setUserStorage } from '@/utils/session.js';

const title = ref('智慧课表');
const goToMine = () => { uni.navigateTo({ url: '/pages/mine/mine' }); };
const goToCourseList = () => { uni.navigateTo({ url: '/pages/list/listCourse' }); };
const goToSettings = () => { uni.navigateTo({ url: '/pages/setting/index' }); };

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
    const saved = getUserStorage('weekStartDay');
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

const weeklyGridData = ref(Array.from({ length: timeSlots.length }, () => Array.from({ length: 7 }, () => [])));

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getSlotIndex = (startTime) => {
  if (!startTime) return -1;
  const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  let bestIdx = -1;
  let bestDiff = Infinity;
  for (let i = 0; i < timeSlots.length; i++) {
    const slotStart = parseInt(timeSlots[i].start.split(':')[0]) * 60 + parseInt(timeSlots[i].start.split(':')[1]);
    const diff = Math.abs(startMin - slotStart);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
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
  const currentGrid = Array.from({ length: timeSlots.length }, () => Array.from({ length: 7 }, () => []));
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
      if (slotIdx < 0 || slotIdx >= timeSlots.length) return;

      const courseKey = `${course.id || course.subject}`;
      if (!usedColors[courseKey]) usedColors[courseKey] = getNextColor();

      currentGrid[slotIdx][dayIdx].push({ ...course, color: usedColors[courseKey] });
    });
  });

  weeklyGridData.value = currentGrid;
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
    const cached = getUserStorage(CACHE_KEY);
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data; // 缓存有效，直接返回
    }
  } catch (e) { /* 忽略读取错误 */ }

  // 缓存无效或过期，发起网络请求
  const res = await getCoursesAPI();
  const courses = (res.data || res || []);

  try {
    setUserStorage(CACHE_KEY, {
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
  // 使用 nextTick + 延迟赋值，避免大数据同步赋值阻塞渲染线程
  try {
    const cached = getUserStorage(CACHE_KEY);
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      // 延迟一帧渲染，让页面切换动画先完成
      setTimeout(() => {
        renderCoursesToGrid(cached.data);
      }, 0);
      return;
    }
  } catch (e) { /* 忽略 */ }

  // 缓存不存在（极少情况），后台静默刷新
  loadWeeklyCourses();
});

// 读取设置页面保存的学期配置
const loadSemesterConfig = () => {
  try {
    const saved = getUserStorage('semesterConfig');
    if (saved) return saved;
  } catch (e) {}
  return { springStart: '03-01', springEnd: '07-15', fallStart: '09-01', fallEnd: '01-15' };
};

// 将 MM-DD 字符串转换为 Date 对象（基于当前周所在的年份）
const mmddToDate = (mmdd, refYear) => {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(refYear, m - 1, d);
};

const semesterInfo = computed(() => {
  // 使用用户选中的日期而非每周起始日来判断学期，
  // 这样即使每周起始日改变，选中的日期所在的学期判断不受影响
  const weekDaysList = weekDays.value;
  const idx = selectedDayIndex.value;
  const refDate = (weekDaysList.length > 0 && idx >= 0 && idx < weekDaysList.length)
    ? weekDaysList[idx].date
    : (currentWeekStart.value || new Date());
  const y = refDate.getFullYear();
  const m = refDate.getMonth() + 1;
  const d = refDate.getDate();
  const cfg = loadSemesterConfig();
  const [sStartM, sStartD] = cfg.springStart.split('-').map(Number);
  const [sEndM, sEndD] = cfg.springEnd.split('-').map(Number);
  const [fStartM, fStartD] = cfg.fallStart.split('-').map(Number);
  const [fEndM, fEndD] = cfg.fallEnd.split('-').map(Number);

  // 春季学期：springStart ~ springEnd
  if ((m > sStartM || (m === sStartM && d >= sStartD)) && (m < sEndM || (m === sEndM && d <= sEndD))) {
    return { name: `${y}年春季学期`, inSemester: true, type: 'spring', startMmdd: cfg.springStart, startYear: y };
  }
  // 秋季学期：fallStart ~ fallEnd（可能跨年，结束日期在下一年）
  if ((m > fStartM || (m === fStartM && d >= fStartD)) && m <= 12) {
    return { name: `${y}年秋季学期`, inSemester: true, type: 'fall', startMmdd: cfg.fallStart, startYear: y };
  }
  if (m === 1 || (m === 2 && d <= fEndD) || (m === fEndM && d <= fEndD)) {
    return { name: `${y - 1}年秋季学期`, inSemester: true, type: 'fall', startMmdd: cfg.fallStart, startYear: y - 1 };
  }
  return { name: '', inSemester: false };
});

const currentWeekNum = computed(() => {
  if (!semesterInfo.value.inSemester) return null;
  const weekDaysList = weekDays.value;
  const idx = selectedDayIndex.value;
  const refDate = (weekDaysList.length > 0 && idx >= 0 && idx < weekDaysList.length)
    ? weekDaysList[idx].date
    : (currentWeekStart.value || new Date());
  const info = semesterInfo.value;
  const startDate = mmddToDate(info.startMmdd, info.startYear);
  return Math.floor((refDate - startDate) / (7 * 86400000)) + 1;
});
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page-h5">
    <!-- 固定顶部导航栏 -->
    <view class="topbar-h5">
      <view class="topbar-inner">
        <text class="topbar-brand">{{ title }}</text>
        <view class="topbar-meta" v-if="semesterInfo.inSemester">
          <text class="topbar-semester">{{ semesterInfo.name }}</text>
          <text class="topbar-week">第{{ currentWeekNum }}周</text>
        </view>
        <view class="topbar-meta" v-else>
          <text class="topbar-semester">{{ weekRangeLabel }}</text>
        </view>
        <!-- 导航链接集成到导航栏 -->
        <view class="topbar-nav-h5">
          <view class="topbar-nav-item-h5" v-for="(item, index) in navItems" :key="index" @click="item.action()">
            <text class="topbar-nav-text-h5">{{ item.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content-h5">
      <!-- 课表卡片 -->
      <view class="schedule-card-h5">
        <!-- 周次切换导航 -->
        <view class="weeknav-h5">
          <view class="weeknav-btn-h5" @click="prevWeek()">
            <text class="weeknav-arrow-h5">‹</text>
            <text class="weeknav-btntext-h5">上周</text>
          </view>
          <view class="weeknav-center-h5">
            <text class="weeknav-label-h5">{{ weekRangeLabel }}</text>
          </view>
          <view class="weeknav-btn-h5" @click="nextWeek()">
            <text class="weeknav-btntext-h5">下周</text>
            <text class="weeknav-arrow-h5">›</text>
          </view>
        </view>

        <!-- 课表网格 -->
        <view class="grid-wrapper-h5">
          <!-- 表头 -->
          <view class="grid-header-h5">
            <view class="grid-time-col-h5"></view>
            <view class="grid-days-h5">
              <view class="grid-day-head-h5" v-for="(day, i) in weekDays" :key="'h5-h'+i"
                :class="{ 'today-head-h5': day.isToday && weekOffset === 0 }" @click="selectDay(i)">
                <text class="day-name-h5">周{{ day.weekday }}</text>
                <text class="day-date-h5">{{ day.month }}/{{ day.day }}</text>
              </view>
            </view>
          </view>

          <!-- 表体 -->
          <scroll-view scroll-y class="grid-body-h5">
            <view v-if="loading" class="loading-mask-h5">
              <view class="loading-spinner-h5"></view>
            </view>

            <view v-for="(slot, slotIdx) in timeSlots" :key="slot.id" class="grid-row-h5">
              <view class="grid-time-col-h5 time-cell-h5">
                <text class="time-label-h5">{{ slot.label }}</text>
                <text class="time-info-h5">{{ slot.start }}-{{ slot.end }}</text>
              </view>
              <view class="grid-days-h5">
                <view class="grid-day-cell-h5" v-for="(day, dayIdx) in weekDays" :key="dayIdx"
                  :class="{ 'highlight-today-h5': day.isToday && weekOffset === 0, 'selected-day-h5': day.isSelected }">
                  <view v-if="weeklyGridData[slotIdx][dayIdx].length > 0" class="course-list-h5">
                    <view v-for="(course, cIdx) in weeklyGridData[slotIdx][dayIdx]" :key="cIdx" class="course-block-h5"
                      :style="{ background: course.color.bg, borderLeftColor: course.color.border }">
                      <text class="course-name-h5" :style="{ color: course.color.text }">{{ course.subject }}</text>
                      <text class="course-teacher-h5">{{ course.teacher }}</text>
                      <text class="course-location-h5">{{ course.location }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="page-mp">
    <!-- 简洁头部 -->
    <view class="header-mp">
      <text class="header-title-mp">{{ title }}</text>
    </view>

    <view class="content-mp">
      <!-- 学期信息条 -->
      <view class="semester-bar-mp">
        <text class="semester-text-mp" v-if="semesterInfo.inSemester">
          {{ semesterInfo.name }} · 第{{ currentWeekNum }}周
        </text>
        <text class="semester-text-mp" v-else>{{ weekRangeLabel }}</text>
      </view>

      <!-- 课表卡片 -->
      <view class="schedule-card-mp">
        <!-- 周次切换 -->
        <view class="weeknav-mp">
          <view class="weeknav-btn-mp" @click="prevWeek()">
            <text class="weeknav-arrow-mp">‹</text>
            <text class="weeknav-btntext-mp">上周</text>
          </view>
          <text class="weeknav-label-mp">{{ weekRangeLabel }}</text>
          <view class="weeknav-btn-mp" @click="nextWeek()">
            <text class="weeknav-btntext-mp">下周</text>
            <text class="weeknav-arrow-mp">›</text>
          </view>
        </view>

        <!-- 课表网格 -->
        <view class="grid-wrapper-mp">
          <view class="grid-header-mp">
            <view class="grid-time-col-mp"></view>
            <view class="grid-days-mp" @touchstart="onTouchStart" @touchend="onTouchEnd">
              <view class="grid-day-head-mp" v-for="(day, i) in weekDays" :key="'mp-h'+i"
                :class="{ 'today-head-mp': day.isToday && weekOffset === 0 }" @click="selectDay(i)">
                <text class="day-name-mp">周{{ day.weekday }}</text>
                <text class="day-date-mp">{{ day.month }}/{{ day.day }}</text>
              </view>
            </view>
          </view>

          <scroll-view scroll-y class="grid-body-mp">
            <view v-if="loading" class="loading-mask-mp">
              <view class="loading-spinner-mp"></view>
            </view>

            <view v-for="(slot, slotIdx) in timeSlots" :key="slot.id" class="grid-row-mp">
              <view class="grid-time-col-mp time-cell-mp">
                <text class="time-label-mp">{{ slot.label }}</text>
                <text class="time-info-mp">{{ slot.start }}-{{ slot.end }}</text>
              </view>
              <view class="grid-days-mp">
                <view class="grid-day-cell-mp" v-for="(day, dayIdx) in weekDays" :key="dayIdx"
                  :class="{ 'highlight-today-mp': day.isToday && weekOffset === 0, 'selected-day-mp': day.isSelected }">
                  <view v-if="weeklyGridData[slotIdx][dayIdx].length > 0" class="course-list-mp">
                    <view v-for="(course, cIdx) in weeklyGridData[slotIdx][dayIdx]" :key="cIdx" class="course-block-mp"
                      :style="{ background: course.color.bg, borderLeftColor: course.color.border }">
                      <text class="course-name-mp" :style="{ color: course.color.text }">{{ course.subject }}</text>
                      <text class="course-teacher-mp">{{ course.teacher }}</text>
                      <text class="course-location-mp">{{ course.location }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 导航卡片 -->
      <view class="action-grid-mp">
        <view class="nav-card-mp" v-for="(item, index) in navItems" :key="index" @click="item.action()">
          <view class="nav-card-bg-mp" :style="{ background: item.gradient }"></view>
          <view class="nav-card-content-mp">
            <text class="nav-text-mp">{{ item.text }}</text>
            <text class="nav-desc-mp">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>
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
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .topbar-brand {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 1px;
  }

  .topbar-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-semester {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .topbar-week {
    font-size: 13px;
    color: #6366f1;
    font-weight: 700;
    background: rgba(99, 102, 241, 0.1);
    padding: 4px 12px;
    border-radius: 20px;
  }

  .topbar-nav-h5 {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .topbar-nav-item-h5 {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 10px;
    transition: all 0.2s;
    user-select: none;

    .topbar-nav-text-h5 {
      font-size: 15px;
      font-weight: 600;
      color: #64748b;
    }

    &:hover {
      background: rgba(99, 102, 241, 0.08);

      .topbar-nav-text-h5 {
        color: #6366f1;
      }
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

.content-h5 {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 32px 48px;
  box-sizing: border-box;
}

.schedule-card-h5 {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 32px;
}

.weeknav-h5 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  .weeknav-btn-h5 {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      background: rgba(99, 102, 241, 0.15);
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.96);
    }

    .weeknav-arrow-h5 {
      font-size: 22px;
      line-height: 1;
    }

    .weeknav-btntext-h5 {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .weeknav-center-h5 {
    flex: 1;
    text-align: center;
  }

  .weeknav-label-h5 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.5px;
  }
}

.grid-wrapper-h5 {
  display: flex;
  flex-direction: column;
}

.grid-header-h5 {
  display: flex;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;

  .grid-time-col-h5 {
    flex: 0 0 120px;
  }

  .grid-days-h5 {
    flex: 1;
    display: flex;

    .grid-day-head-h5 {
      flex: 1;
      text-align: center;
      padding: 12px 4px;
      border-left: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;

      &:hover {
        background: rgba(99, 102, 241, 0.04);
      }

      &.today-head-h5 {
        background: linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04));

        .day-name-h5 { color: #6366f1; }
        .day-date-h5 { color: #6366f1; font-weight: 700; }
      }

      .day-name-h5 {
        display: block;
        font-size: 15px;
        color: #64748b;
        font-weight: 600;
      }

      .day-date-h5 {
        display: block;
        font-size: 13px;
        color: #94a3b8;
        margin-top: 2px;
      }
    }
  }
}

.grid-body-h5 {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 560px;

  .loading-mask-h5 {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loading-spinner-h5 {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin-h5 0.8s linear infinite;
    }
  }

  @keyframes spin-h5 { to { transform: rotate(360deg); } }

  .grid-row-h5 {
    display: flex;
    min-height: 96px;
    border-bottom: 1px solid #f1f4f9;

    &:last-child { border-bottom: none; }

    .grid-time-col-h5 {
      flex: 0 0 120px;
    }

    .time-cell-h5 {
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;

      .time-label-h5 {
        font-size: 14px;
        color: #6366f1;
        font-weight: 700;
      }

      .time-info-h5 {
        font-size: 12px;
        color: #94a3b8;
        white-space: nowrap;
        font-weight: 500;
        margin-top: 4px;
      }
    }

    .grid-days-h5 {
      flex: 1;
      display: flex;

      .grid-day-cell-h5 {
        flex: 1;
        border-left: 1px solid #f1f4f9;
        position: relative;
        padding: 6px;
        min-height: 96px;

        &.highlight-today-h5 { background: rgba(99, 102, 241, 0.03); }
        &.selected-day-h5 {
          background: rgba(99, 102, 241, 0.06);
          box-shadow: inset 0 0 0 2px rgba(99, 102, 241, 0.15);
        }

        .course-list-h5 {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .course-block-h5 {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 10px;
          border-radius: 10px;
          border-left: 4px solid;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          &:active { transform: scale(0.97); }

          .course-name-h5 {
            display: block;
            font-size: 14px;
            font-weight: 700;
            text-align: left;
            line-height: 1.3;
            word-break: break-all;
          }

          .course-teacher-h5 {
            display: block;
            font-size: 12px;
            color: #6366f1;
            text-align: left;
            line-height: 1.4;
            margin-top: 2px;
          }

          .course-location-h5 {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            text-align: left;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

/* #endif */

/* ===================== MP-WEIXIN 微信小程序样式 ===================== */
/* #ifdef MP-WEIXIN */
.page-mp {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%);
  padding-top: var(--status-bar-height);
}

.header-mp {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e2e8f0;

  .header-title-mp {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }
}

.content-mp {
  padding: 12px 12px 32px;
  box-sizing: border-box;
}

.semester-bar-mp {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  text-align: center;

  .semester-text-mp {
    font-size: 13px;
    color: #ffffff;
    font-weight: 600;
  }
}

.schedule-card-mp {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  overflow: hidden;
  margin-bottom: 12px;
}

.weeknav-mp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8faff;
  border-bottom: 1px solid #eef2f6;

  .weeknav-btn-mp {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.06);
    color: #6366f1;
    min-height: 44px;

    &:active { background: rgba(99, 102, 241, 0.15); }

    .weeknav-arrow-mp {
      font-size: 18px;
      line-height: 1;
    }

    .weeknav-btntext-mp {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .weeknav-label-mp {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }
}

.grid-wrapper-mp {
  display: flex;
  flex-direction: column;
}

.grid-header-mp {
  display: flex;
  background: #fafbfd;
  border-bottom: 1px solid #eef2f6;
  flex-shrink: 0;

  .grid-time-col-mp {
    flex: 0 0 64px;
  }

  .grid-days-mp {
    flex: 1;
    display: flex;

    .grid-day-head-mp {
      flex: 1;
      text-align: center;
      padding: 8px 2px;
      border-left: 1px solid #eef2f6;
      min-height: 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &:active { background: #f1f5f9; }

      &.today-head-mp {
        background: linear-gradient(180deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.04));
        .day-name-mp { color: #6366f1; }
        .day-date-mp { color: #6366f1; font-weight: 600; }
      }

      .day-name-mp {
        font-size: 12px;
        color: #64748b;
        font-weight: 600;
      }

      .day-date-mp {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 1px;
      }
    }
  }
}

.grid-body-mp {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 380px;

  .loading-mask-mp {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loading-spinner-mp {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin-mp 0.8s linear infinite;
    }
  }

  @keyframes spin-mp { to { transform: rotate(360deg); } }

  .grid-row-mp {
    display: flex;
    min-height: 68px;
    border-bottom: 1px solid #f1f4f9;

    &:last-child { border-bottom: none; }

    .grid-time-col-mp {
      flex: 0 0 64px;
    }

    .time-cell-mp {
      padding: 6px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafbfd;
      border-right: 1px solid #eef2f6;

      .time-label-mp {
        font-size: 11px;
        color: #6366f1;
        font-weight: 700;
      }

      .time-info-mp {
        font-size: 9px;
        color: #94a3b8;
        white-space: nowrap;
        font-weight: 500;
        margin-top: 2px;
      }
    }

    .grid-days-mp {
      flex: 1;
      display: flex;

      .grid-day-cell-mp {
        flex: 1;
        border-left: 1px solid #f1f4f9;
        position: relative;
        padding: 4px;
        min-height: 68px;

        &.highlight-today-mp { background: rgba(99, 102, 241, 0.03); }
        &.selected-day-mp {
          background: rgba(99, 102, 241, 0.05);
          box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.12);
        }

        .course-list-mp {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .course-block-mp {
          width: 100%;
          box-sizing: border-box;
          padding: 4px 5px;
          border-radius: 6px;
          border-left: 3px solid;
          display: flex;
          flex-direction: column;
          overflow: visible;

          &:active { transform: scale(0.97); }

          .course-name-mp {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-align: left;
            line-height: 1.3;
            /* 完整显示课程名称，不截断不换行 */
            white-space: nowrap;
            word-break: keep-all;
            overflow: visible;
          }

          .course-teacher-mp {
            display: block;
            font-size: 9px;
            color: #6366f1;
            text-align: left;
            line-height: 1.4;
            margin-top: 1px;
          }

          .course-location-mp {
            display: block;
            font-size: 8px;
            color: #94a3b8;
            text-align: left;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

.action-grid-mp {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.nav-card-mp {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 44px;

  &:active { opacity: 0.85; }

  .nav-card-bg-mp {
    position: absolute;
    inset: 0;
  }

  .nav-card-content-mp {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 16px 8px;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;

    .nav-text-mp {
      display: block;
      font-size: 14px;
      font-weight: 700;
      /* 文字不换行，完整显示 */
      white-space: nowrap;
    }

    .nav-desc-mp {
      display: block;
      font-size: 11px;
      opacity: 0.85;
      margin-top: 3px;
      /* 描述文字也不换行 */
      white-space: nowrap;
    }
  }
}
/* #endif */
</style>
