<script setup>
import {ref, computed} from 'vue';
import {onShow, onLoad} from '@dcloudio/uni-app';
import CourseCard from '@/components/CourseCard.vue';
import { getCoursesAPI, deleteCourseAPI } from '@/api/index.js';
import { getCurrentUser } from '@/utils/session.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// ==================== 工具函数 ====================

/** 星期权重，用于排序 */
const dayWeight = (timeStr) => {
  if (!timeStr) return 7;
  for (let i = 1; i <= 7; i++) {
    if (timeStr.includes(`周${weekDays[i]}`)) return i;
  }
  return 7;
};

/** 格式化日期为友好显示 */
const formatDateFriendly = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

/** 计算日期范围（取最早的start_date ~ 最晚的end_date） */
const calcDateRange = (records) => {
  const startDates = records
    .map(r => r.start_date)
    .filter(Boolean)
    .sort();
  const endDates = records
    .map(r => r.end_date)
    .filter(Boolean)
    .sort();
  if (startDates.length === 0 && endDates.length === 0) return '';
  const earliest = startDates[0];
  const latest = endDates[endDates.length - 1] || startDates[startDates.length - 1];
  if (!latest || earliest === latest) return earliest ? formatDateFriendly(earliest) : '';
  return `${formatDateFriendly(earliest)} ~ ${formatDateFriendly(latest)}`;
};

/** 提取时段列表（按星期排序） */
const extractTimeSlots = (records) => {
  return records
    .map(r => r.course_time)
    .filter(Boolean)
    .sort((a, b) => dayWeight(a) - dayWeight(b));
};

/** 提取地点列表（与时段一一对应并排序） */
const extractLocations = (records) => {
  return records
    .slice()
    .sort((a, b) => dayWeight(a.course_time) - dayWeight(b.course_time))
    .map(r => r.course_location)
    .filter(Boolean);
};

/** 核心：按课程名+教师名分组 */
const groupCourses = (rawCourses) => {
  const groups = {};

  for (const c of rawCourses) {
    const key = `${c.course_name}|${c.teacher_name}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(c);
  }

  const result = [];
  for (const key of Object.keys(groups)) {
    const records = groups[key];
    const first = records[0];
    const timeSlots = extractTimeSlots(records);
    const locationList = extractLocations(records);
    const uniqueLocations = [...new Set(locationList)];

    result.push({
      id: first.id,                          // 取第一个ID用于编辑跳转
      ids: records.map(r => r.id),           // 所有ID，用于批量删除
      subject: first.course_name,
      teacher: first.teacher_name,
      location: uniqueLocations.join('、'),  // 合并地点
      locationList,                          // 一一对应的地点列表
      timeSlots,                             // 多条时段
      dayDisplay: first.start_date,
      dateRange: calcDateRange(records),     // 日期范围
      records                                 // 保留原始记录
    });
  }

  // 按最早的星期排序
  result.sort((a, b) => dayWeight(a.timeSlots[0]) - dayWeight(b.timeSlots[0]));

  return result;
};

// ==================== 响应式状态 ====================

const title = ref("课程管理中心");
const courses = ref([]);
const isLoading = ref(false);

/** 分组后的课程列表 */
const groupedCourses = computed(() => formatCoursesForDisplay(courses.value));

/** 课程总数量（所有分组后的课程） */
const totalCourseCount = computed(() => groupedCourses.value.length);

const formatCoursesForDisplay = (rawCourses) => {
  // 使用分组逻辑替代原有的逐条映射
  return groupCourses(rawCourses);
};

const loadCourses = async () => {
  // 防止并发重复调用
  if (isLoading.value) return;
  
  isLoading.value = true;

  // ★ 从共享缓存读取，实现秒级加载 ★
  const CACHE_KEY = 'cachedCourses'
  const CACHE_EXPIRY = 5 * 60 * 1000
  let coursesData = null

  try {
    const cached = uni.getStorageSync(CACHE_KEY)
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      coursesData = cached.data
    }
  } catch (e) { /* 忽略 */ }

  if (coursesData) {
    courses.value = coursesData
    isLoading.value = false
    return
  }

  // 缓存未命中，发网络请求（此时服务端返回的是内存缓存，亚毫秒级响应）
  try {
    const result = await getCoursesAPI();
    if (result.success) {
      courses.value = result.data || [];
    } else {
      courses.value = [];
      console.error('获取课程失败:', result.message);
    }
  } catch (e) {
    courses.value = [];
    console.error('加载课程数据失败:', e);
  }
  isLoading.value = false;
};

// ==================== 权限校验 ====================

const checkTeacherPermission = () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.user_type !== 'teacher') {
    uni.showToast({ title: '暂无权限', icon: 'none' });
    return false;
  }
  return true;
};

// ==================== 页面导航 ====================

const goBack = () => {
  uni.reLaunch({url: '/pages/index/index'});
};

const handleDelete = (item) => {
  if (!checkTeacherPermission()) return;
  // 枚举该课程所有时段，便于用户确认
  const slotSummary = item.timeSlots
    .map((s, i) => {
      const loc = item.locationList?.[i];
      return loc ? `  · ${s} @ ${loc}` : `  · ${s}`;
    })
    .join('\n');

  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${item.subject}」吗？\n${slotSummary}\n\n此操作将删除该课程所有时段，不可撤销。`,
    confirmText: '确认删除',
    confirmColor: '#ef4444',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        // 逐个删除分组内的所有课程
        let successCount = 0;
        for (const courseId of item.ids) {
          try {
            const result = await deleteCourseAPI(courseId);
            if (result.success) successCount++;
          } catch (e) {
            console.error('删除课程失败:', e);
          }
        }

        if (successCount > 0) {
          await loadCourses();
          uni.showToast({
            title: `已删除 ${successCount} 条课程记录`,
            icon: 'success'
          });
        } else {
          uni.showToast({title: '删除失败', icon: 'none'});
        }
      }
    }
  });
};

const handleEdit = (item) => {
  if (!checkTeacherPermission()) return;
  uni.navigateTo({
    url: `/pages/add/addCourse?courseName=${encodeURIComponent(item.subject)}&teacherName=${encodeURIComponent(item.teacher)}`
  });
};

const openAddPage = () => {
  if (!checkTeacherPermission()) return;
  uni.navigateTo({url: '/pages/add/addCourse'});
};

// ==================== 生命周期 ====================

// ★ 使用 _loaded 标记防止 onLoad + onShow 首次重复执行 ★
let _loaded = false;

onLoad(() => {
  loadCourses();
  _loaded = true;
});
onShow(() => {
  // 首次加载由 onLoad 处理
  if (!_loaded) return;
  // 后续从共享缓存读取（已由首页/App 预加载），实现秒级显示
  const CACHE_KEY = 'cachedCourses'
  const CACHE_EXPIRY = 5 * 60 * 1000
  try {
    const cached = uni.getStorageSync(CACHE_KEY)
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      courses.value = cached.data
      return
    }
  } catch (e) { /* 忽略 */ }
  loadCourses();
});


</script>

<template>
  <view class="page-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <view class="header-area">
        <button class="back-btn" @click="goBack()">
          <text class="back-icon">←</text>
        </button>
        <view class="header-text-group">
          <text class="main-title">{{ title }}</text>
          <text class="header-subtitle">管理你的所有课程安排</text>
        </view>
      </view>

      <view class="toolbar">
        <text class="count-text">共 {{ totalCourseCount }} 门课程</text>
        <button class="header-add-btn" @click="openAddPage()">
          <text class="add-btn-icon">+</text>
          <text class="add-btn-text">添加课程</text>
        </button>
      </view>

      <view v-if="isLoading && groupedCourses.length === 0" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载课程...</text>
      </view>

      <view v-else-if="groupedCourses.length > 0" class="card-list">
        <CourseCard
          v-for="(item, index) in groupedCourses"
          :key="item.id"
          :course="item"
          :showActions="true"
          :grouped="true"
          :style="{ animationDelay: index * 0.06 + 's' }"
          class="card-item"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
      </view>

      <view v-else class="empty-box">
        <view class="empty-illustration">
          <text class="empty-emoji">📚</text>
        </view>
        <text class="empty-msg">暂无课程信息</text>
        <text class="empty-hint">开始添加你的第一门课程吧</text>
        <button class="empty-action-btn" @click="openAddPage()">
          <text class="empty-action-icon">+</text>
          <text>添加课程</text>
        </button>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #eef2ff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--status-bar-height);
}

.bg-decoration {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  /* #ifdef H5 */
  filter: blur(80px);
  /* #endif */
  opacity: 0.4;
}

.bg-circle-1 {
  width: 250px;
  height: 250px;
  background: #6366f1;
  top: -80px;
  right: -80px;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  background: #10b981;
  bottom: -40px;
  left: -40px;
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
  padding: 20px 16px 100px;
  box-sizing: border-box;

  /* 关键优化：利用环境函数增加底部物理间距，防止被手机底部手势条或浮动按钮遮挡 */
  /* #ifdef H5 */
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  /* #endif */
  /* #ifdef MP-WEIXIN */
  padding-bottom: 100px;
  /* #endif */

  .card-item {
    width: 100%;
    /* 确保子组件操作栏不因内容溢出而被裁剪 */
    overflow: visible !important;
  }
}

.header-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  padding-top: 4px;
  position: relative;
  padding-left: 36px;
  padding-right: 10px;
  min-height: 36px;

  .back-btn {
    position: absolute;
    left: 0;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    /* #ifdef H5 */
    backdrop-filter: blur(8px);
    /* #endif */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    /* 重置微信小程序 button 默认样式 */
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    &::after { border: none; }

    &:active {
      transform: scale(0.9);
      background: rgba(255, 255, 255, 0.95);
    }

    .back-icon {
      font-size: 15px;
      color: #1e293b;
      font-weight: 600;
    }
  }

  .header-text-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .main-title {
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.3;
  }

  .header-subtitle {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
  }
}

.header-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 2px 5px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
  /* 重置微信小程序 button 默认样式 — 防止按钮过大 */
  margin: 0;
  border: none;
  outline: none;
  height: auto;
  line-height: normal;
  min-width: 0;
  overflow: visible;
  &::after { border: none; }
  &:active {
    transform: scale(0.93);
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
  }
  .add-btn-icon {
    font-size: 12px;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }
  .add-btn-text {
    font-size: 11px;
    color: #fff;
    font-weight: 600;
    line-height: 1;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 2px;

  .count-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.6);
    padding: 4px 12px;
    border-radius: 20px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 10px;

  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 14px;
    color: #94a3b8;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item {
  animation: fadeInUp 0.4s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  animation: fadeInUp 0.4s ease;

  .empty-illustration {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }

  .empty-emoji {
    font-size: 40px;
  }

  .empty-msg {
    font-size: 15px;
    color: #475569;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .empty-hint {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .empty-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 24px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

    &:active {
      transform: scale(0.95);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
    }

    .empty-action-icon {
      font-size: 18px;
      font-weight: 300;
    }
  }
}

@media (min-width: 768px) {
  .page-container {
    justify-content: center;
  }
  .content-wrapper {
    max-width: 800px;
  }
}

</style>