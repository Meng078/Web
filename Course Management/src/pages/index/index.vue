<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const title = ref('智慧课表');
const goToMine = () => { uni.navigateTo({ url: '/pages/mine/mine' }); };
const goToCourseList = () => { uni.navigateTo({ url: '/pages/list/listCourse' }); };
const goToSettings = () => { uni.navigateTo({ url: '/pages/stting/index' }); }; // 注意：原路径拼写为 stting，这里保留以便兼容

const navItems = ref([
  { text: '课程列表', desc: '浏览所有学期课程', action: goToCourseList, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { text: '课表设置', desc: '时间轴与显示偏好', action: goToSettings, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { text: '我的', desc: '个人中心', action: goToMine, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
]);

// 【修复】：去除了 getIco nByIndex 中的空格
const getIconByIndex = (index) => {
  const icons = ['📝', '📋', '⚙️', '👤'];
  return icons[index] || '📌';
};

// ==========================================
// 核心逻辑：周视图与日历计算
// ==========================================
const weekDays = ref([]);
const weekOffset = ref(0);
const currentWeekStart = ref(null);
const selectedDayIndex = ref(0); // 默认选中周一

const initWeekDays = (offset = 0) => {
  const now = new Date();
  const currentDay = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDay + 1 + offset * 7);
  currentWeekStart.value = monday;

  weekDays.value = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.value.push({
      date: d,
      weekday: ['一', '二', '三', '四', '五', '六', '日'][i],
      day: d.getDate(),
      month: d.getMonth() + 1,
      isToday: offset === 0 && i === currentDay - 1,
      isSelected: false,
    });
  }

  // 默认选中逻辑
  if (offset === 0) {
    const todayIdx = weekDays.value.findIndex(d => d.isToday);
    selectedDayIndex.value = todayIdx >= 0 ? todayIdx : 0;
    weekDays.value.forEach((item, idx) => item.isSelected = (idx === selectedDayIndex.value));
  } else {
    selectedDayIndex.value = 0;
    weekDays.value[0].isSelected = true;
  }
};

initWeekDays();

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

// ==========================================
// 课程数据逻辑
// ==========================================
// 【修复】：去除 timeSl ots 中的空格，改为 timeSlots
const timeSlots = [
  { id: 1, label: '第一单元', start: '08:00', end: '09:40' },
  { id: 2, label: '第二单元', start: '10:10', end: '11:50' },
  { id: 3, label: '第三单元', start: '13:30', end: '15:10' },
  { id: 4, label: '第四单元', start: '15:40', end: '17:20' },
  { id: 5, label: '第五单元', start: '18:30', end: '20:10' },
];

const weeklyGridData = ref(Array(5).fill().map(() => Array(7).fill([])));

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 【修复】：去除 load WeeklyCourses 中的空格，改为 loadWeeklyCourses
const loadWeeklyCourses = () => {
  const allCourses = uni.getStorageSync('courses') || [];
  const currentGrid = Array(5).fill().map(() => Array(7).fill([]));

  weekDays.value.forEach((day, dayIdx) => {
    const dateStr = formatDate(day.date);
    const daysCourses = allCourses.filter(c => c.startDay === dateStr);

    daysCourses.forEach(course => {
      let matchedSlot = -1;
      const slotId = course.slotId ? parseInt(course.slotId) : null;

      if (slotId >= 1 && slotId <= 5) {
        matchedSlot = slotId - 1;
      } else {
        if (course.startTime) {
          const startMin = parseInt(course.startTime.split(':')[0]) * 60 + parseInt(course.startTime.split(':')[1]);
          if (startMin <= 580) matchedSlot = 0;
          else if (startMin <= 650) matchedSlot = 1;
          else if (startMin <= 810) matchedSlot = 2;
          else if (startMin <= 940) matchedSlot = 3;
          else matchedSlot = 4;
        }
      }

      if (matchedSlot >= 0 && matchedSlot < 5) {
        currentGrid[matchedSlot][dayIdx].push(course);
      }
    });
  });

  weeklyGridData.value = currentGrid;
};

const selectDay = (index) => {
  weekDays.value.forEach((item, idx) => item.isSelected = (idx === index));
  selectedDayIndex.value = index;
};

onMounted(() => {
  loadWeeklyCourses();
});

onShow(() => {
  loadWeeklyCourses();
});

const hasAnyCourse = computed(() => {
  return weeklyGridData.value.some(slot => slot.some(day => day.length > 0));
});

const semesterInfo = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const day = now.getDate();
  if ((m >= 3 && m < 7) || (m === 7 && day <= 15)) {
    return { name: `${y}年春季学期`, inSemester: true };
  }
  if ((m >= 9 && m <= 12) || (m === 1 && day <= 15)) {
    const semesterYear = m <= 2 ? y - 1 : y;
    return { name: `${semesterYear}年秋季学期`, inSemester: true };
  }
  return { name: '', inSemester: false };
});

const currentWeekNum = computed(() => {
  if (!semesterInfo.value.inSemester) return null;
  const yearMatch = semesterInfo.value.name.match(/(\d+)年/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  const isSpring = semesterInfo.value.name.includes('春');
  const start = isSpring ? new Date(year, 2, 1) : new Date(year, 8, 1);
  const diff = new Date() - start;
  // 【修复】：去除 Math.f loor 中的空格
  return Math.floor(diff / (7 * 86400000)) + 1;
});
</script>

<template>
  <view class="page-container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <!-- 头部标题 -->
      <view class="hero-section">
        <text class="app-title">{{ title }}</text>
        <text class="app-subtitle" v-if="semesterInfo.inSemester">
          {{ semesterInfo.name }} · 第{{ currentWeekNum }}周
        </text>
        <text class="app-subtitle" v-else>
          {{ weekRangeLabel }}
        </text>
      </view>

      <!-- 合并后的主容器 -->
      <view class="unified-card">
        <!-- 模块 2: 课表网格 -->
        <view class="schedule-table">

          <!-- 顶部导航栏 -->
          <view class="top-nav-bar">
            <view class="nav-btn prev-btn" @click="prevWeek">
              <text class="arrow-icon">‹</text>
              <text class="btn-text">上周</text>
            </view>

            <view class="range-label-container">
              <text class="label-text">{{ weekRangeLabel }}</text>
            </view>

            <view class="nav-btn next-btn" @click="nextWeek">
              <text class="btn-text">下周</text>
              <text class="arrow-icon">›</text>
            </view>
          </view>

          <!-- 原有课表头 -->
          <view class="table-header">
            <view class="col-time"></view>
            <view class="col-days">
              <view
                  class="col-day"
                  v-for="(day, i) in weekDays"
                  :key="'h'+i"
              >
                <text class="cell-day">周{{ day.weekday }}</text>
                <text class="cell-date">{{ day.month }}/{{ day.day }}</text>
              </view>
            </view>
          </view>

          <scroll-view scroll-y class="table-body">
            <view v-for="(slot, slotIdx) in timeSlots" :key="slot.id" class="row-slot">
              <view class="col-time cell">
                <text class="time-label">{{ slot.label }}</text>
                <text class="time-info">{{ slot.start }}-{{ slot.end }}</text>
              </view>
              <view class="col-days">
                <view
                    class="col-day cell"
                    v-for="(day, dayIdx) in weekDays"
                    :key="dayIdx"
                    :class="{ 'highlight-today': day.isToday && weekOffset === 0 }"
                >
                  <!-- 渲染该格子的课程 -->
                  <view v-if="weeklyGridData[slotIdx][dayIdx].length > 0">
                    <view
                        class="course-block"
                    >
                      <text class="course-name">{{ weeklyGridData[slotIdx][dayIdx][0].subject || '课程' }}</text>
                      <text class="course-teacher">{{ weeklyGridData[slotIdx][dayIdx][0].teacher || '' }}</text>
                      <text class="course-time">{{ weeklyGridData[slotIdx][dayIdx][0].startTime || '' }}{{ weeklyGridData[slotIdx][dayIdx][0].startTime ? '-' : '' }}{{ weeklyGridData[slotIdx][dayIdx][0].endTime || '' }}</text>
                      <text class="course-loc">{{ weeklyGridData[slotIdx][dayIdx][0].location || '' }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>

          <!-- 空状态提示 -->
          <view class="empty-hint" v-if="!hasAnyCourse">
            <text class="empty-text">📭 本周暂无课程安排</text>
          </view>
        </view>
      </view>

      <!-- 底部核心按钮 -->
      <view class="action-grid">
        <view
            class="nav-card"
            v-for="(item, index) in navItems"
            :key="index"
            @click="item.action"
        >
          <view class="card-bg" :style="{ background: item.gradient }"></view>
          <view class="card-content">
            <text class="nav-text">{{ item.text }}</text>
            <text class="nav-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="footer-tip">© 智慧教务云 · 高效排课</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f0f4f8;
  position: relative;
  overflow: hidden;

  .bg-decoration {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    .bg-circle {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
      &.bg-circle-1 { width: 400px; height: 400px; background: #6366f1; top: -100px; right: -100px; }
      &.bg-circle-2 { width: 300px; height: 300px; background: #10b981; bottom: -50px; left: -50px; }
    }
  }

  .content-wrapper {
    position: relative; z-index: 1; max-width: 1000px; padding: 18px; box-sizing: border-box; margin: 0 auto;
    .hero-section { text-align: center; margin-bottom: 20px; }
    .app-title { display: block; font-size: 30px; font-weight: 800; color: #1e293b; }
    .app-subtitle { display: block; font-size: 14px; color: #64748b}
  }
}

.unified-card {
  background: #fff; border-radius: 16px; margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; overflow: hidden;
}

.top-nav-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9;

  .nav-btn {
    display: flex; align-items: center; gap: 4px; cursor: pointer; color: #6366f1; padding: 8px; transition: opacity 0.2s;
    .btn-text { font-size: 13px; font-weight: 500; }
    .arrow-icon { font-size: 20px; line-height: 1; }
    &:active { opacity: 0.6; }
  }
  .range-label-container { flex: 1; text-align: center; }
  .label-text { font-size: 15px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px; }
}

/* ==========================================
   【新增修改】使用 Flex 进行均匀分布
   ========================================== */
.schedule-table {
  width: 100%;
  display: flex;
  flex-direction: column;

  /* 顶部表头 (星期列) */
  .table-header {
    display: flex;
    background: #fcfcfd;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;

    .col-time {
      flex: 0 0 12%; /* 左侧占据约 12% */
      text-align: center;
      padding: 10px 0;
      color: #94a3b8;
      font-size: 12px;
      font-weight: bold;
    }

    .col-days {
      flex: 1;
      display: flex;

      .col-day {
        flex: 1;
        text-align: center;
        padding: 10px 0;
        border-left: 1px dashed #eee;

        .cell-day {
          display: block; font-size: 13px; color: #6366f1; font-weight: 600;
        }
        .cell-date {
          display: block; font-size: 10px; color: #94a3b8;
        }
      }
    }
  }

  /* 中部内容 (单元列 + 课程网格) */
  .table-body {
    flex: 1;
    display: flex;
    flex-direction: column;

    .row-slot {
      display: flex;
      min-height: 80px;
      border-bottom: 1px dashed #f1f5f9;

      .col-time {
        flex: 0 0 12%; /* 保持与表头一致的比例 */
        padding: 10px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #fbfbfc;

        .time-label { font-size: 12px; color: #6366f1; margin-bottom: 2px; font-weight: 700; }
        .time-info { font-size: 10px; color: #64748b; white-space: nowrap; font-weight: 500; }
      }

      .col-days {
        flex: 1;
        display: flex;

        .col-day {
          flex: 1;
          border-left: 1px solid #f1f5f9;
          position: relative;
          padding: 2px;

          &.highlight-today { background: rgba(99, 102, 241, 0.05); }

          .course-block {
            width: 100%;
            height: 82px;
            box-sizing: border-box;
            padding: 6px 4px;
            background: #eff6ff;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;

            .course-name {
              display: block; font-size: 11px; font-weight: 700; color: #1e3a8a; text-align: center; line-height: 1.3; word-break: break-all;
            }
            .course-teacher {
              display: block; font-size: 9px; color: #6366f1; text-align: center; line-height: 1.4; margin-top: 1px;
            }
            .course-time {
              display: block; font-size: 9px; color: #334155; text-align: center; line-height: 1.4;
            }
            .course-loc {
              display: block; font-size: 9px; color: #64748b; text-align: center; line-height: 1.4;
            }
          }
        }
      }
    }
  }
}

/* --- 底部操作区 --- */
.action-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;
}
.nav-card .card-content { padding: 12px 8px; }
.nav-card .card-icon { font-size: 20px; margin-bottom: 4px; }
.nav-card .nav-text { font-size: 13px; }
.nav-card .nav-desc { font-size: 10px; }
.nav-card {
  position: relative; border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform 0.15s;
  &:active { transform: scale(0.97); }
}
.card-bg { position: absolute; inset: 0; opacity: 0.9; }
.card-content {
  position: relative; z-index: 1; width: 100%; padding: 16px; color: #fff;
  text-align: center;
}

.nav-text { display: block; font-size: 15px; font-weight: 700; }
.nav-desc { display: block; font-size: 11px; opacity: 0.85; }
.footer-tip { text-align: center; color: #cbd5e1; font-size: 12px; margin-top: 10px; }
.empty-hint { padding: 30px 0; text-align: center; }
.empty-text { font-size: 14px; color: #94a3b8; }
</style>