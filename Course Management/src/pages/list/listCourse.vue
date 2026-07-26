<script setup>
import {ref, computed} from 'vue';
import {onShow, onLoad} from '@dcloudio/uni-app';
import CourseCard from '@/components/CourseCard.vue';
import { getCoursesAPI, deleteCourseAPI } from '@/api/index.js';
import { getCurrentUser, getUserStorage } from '@/utils/session.js';

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
    const cached = getUserStorage(CACHE_KEY)
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
  uni.navigateBack({ delta: 1 });
};

const handleDelete = (item) => {
  if (!checkTeacherPermission()) return;
  // 枚举该课程所有时段，便于用户确认
  const slotSummary = item.timeSlots
    .map((s, i) => {
      const loc = item.locationList ? item.locationList[i] : undefined;
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
  // 延迟一帧渲染，让页面切换动画先完成
  const CACHE_KEY = 'cachedCourses'
  const CACHE_EXPIRY = 5 * 60 * 1000
  try {
    const cached = getUserStorage(CACHE_KEY)
    if (cached && cached.data && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      setTimeout(() => {
        courses.value = cached.data
      }, 0);
      return
    }
  } catch (e) { /* 忽略 */ }
  loadCourses();
});


</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page-h5">
    <!-- 固定顶部导航栏 -->
    <view class="topbar-h5">
      <view class="topbar-inner">
        <view class="topbar-left-h5">
          <view class="topbar-back-h5" @click="goBack()">
            <text class="topbar-back-icon-h5">←</text>
          </view>
          <text class="topbar-title-h5">{{ title }}</text>
        </view>
        <view class="topbar-add-h5" @click="openAddPage()">
          <text class="topbar-add-icon-h5">+</text>
          <text class="topbar-add-text-h5">添加课程</text>
        </view>
      </view>
    </view>

    <view class="content-h5">
      <!-- 工具栏 -->
      <view class="toolbar-h5">
        <text class="count-text-h5">共 {{ totalCourseCount }} 门课程</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading && groupedCourses.length === 0" class="loading-state-h5">
        <view class="loading-spinner-h5"></view>
        <text class="loading-text-h5">正在加载课程...</text>
      </view>

      <!-- 课程卡片网格 -->
      <view v-else-if="groupedCourses.length > 0" class="card-grid-h5">
        <CourseCard
          v-for="(item, index) in groupedCourses"
          :key="item.id"
          :course="item"
          :showActions="true"
          :grouped="true"
          :style="{ animationDelay: index * 0.06 + 's' }"
          class="card-item-h5"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-box-h5">
        <view class="empty-illustration-h5">
          <text class="empty-emoji-h5">📚</text>
        </view>
        <text class="empty-msg-h5">暂无课程信息</text>
        <text class="empty-hint-h5">开始添加你的第一门课程吧</text>
        <view class="empty-action-btn-h5" @click="openAddPage()">
          <text class="empty-action-icon-h5">+</text>
          <text class="empty-action-text-h5">添加课程</text>
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
        <text class="header-back-icon-mp">←</text>
      </view>
      <view class="header-text-group-mp">
        <text class="header-title-mp">{{ title }}</text>
        <text class="header-subtitle-mp">管理你的所有课程安排</text>
      </view>
      <view class="header-placeholder-mp"></view>
    </view>

    <view class="content-mp">
      <!-- 工具栏 -->
      <view class="toolbar-mp">
        <text class="count-text-mp">共 {{ totalCourseCount }} 门课程</text>
        <view class="add-btn-mp" @click="openAddPage()">
          <text class="add-btn-icon-mp">+</text>
          <text class="add-btn-text-mp">添加课程</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading && groupedCourses.length === 0" class="loading-state-mp">
        <view class="loading-spinner-mp"></view>
        <text class="loading-text-mp">正在加载课程...</text>
      </view>

      <!-- 课程卡片列表 -->
      <view v-else-if="groupedCourses.length > 0" class="card-list-mp">
        <CourseCard
          v-for="(item, index) in groupedCourses"
          :key="item.id"
          :course="item"
          :showActions="true"
          :grouped="true"
          class="card-item-mp"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-box-mp">
        <view class="empty-illustration-mp">
          <text class="empty-emoji-mp">📚</text>
        </view>
        <text class="empty-msg-mp">暂无课程信息</text>
        <text class="empty-hint-mp">开始添加你的第一门课程吧</text>
        <view class="empty-action-btn-mp" @click="openAddPage()">
          <text class="empty-action-icon-mp">+</text>
          <text class="empty-action-text-mp">添加课程</text>
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
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topbar-left-h5 {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .topbar-back-h5 {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(99, 102, 241, 0.15);
    }

    &:active { transform: scale(0.92); }

    .topbar-back-icon-h5 {
      font-size: 18px;
      color: #6366f1;
      font-weight: 600;
    }
  }

  .topbar-title-h5 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .topbar-add-h5 {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
    user-select: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    &:active { transform: scale(0.96); }

    .topbar-add-icon-h5 {
      font-size: 18px;
      color: #ffffff;
      font-weight: 300;
      line-height: 1;
    }

    .topbar-add-text-h5 {
      font-size: 15px;
      color: #ffffff;
      font-weight: 600;
    }
  }
}

.content-h5 {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 32px 48px;
  box-sizing: border-box;
}

.toolbar-h5 {
  margin-bottom: 24px;
  padding: 0 4px;

  .count-text-h5 {
    font-size: 16px;
    color: #64748b;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.8);
    padding: 8px 20px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
  }
}

.loading-state-h5 {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 16px;

  .loading-spinner-h5 {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin-h5 0.8s linear infinite;
  }

  .loading-text-h5 {
    font-size: 16px;
    color: #94a3b8;
  }
}

@keyframes spin-h5 { to { transform: rotate(360deg); } }

.card-grid-h5 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  .card-item-h5 {
    width: 100%;
    overflow: visible;
    animation: fadeInUp-h5 0.4s ease both;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
    }
  }
}

@keyframes fadeInUp-h5 {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.empty-box-h5 {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  animation: fadeInUp-h5 0.4s ease;

  .empty-illustration-h5 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .empty-emoji-h5 {
    font-size: 56px;
  }

  .empty-msg-h5 {
    font-size: 18px;
    color: #475569;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .empty-hint-h5 {
    font-size: 15px;
    color: #94a3b8;
    margin-bottom: 24px;
  }

  .empty-action-btn-h5 {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 28px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    user-select: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    &:active {
      transform: scale(0.95);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
    }

    .empty-action-icon-h5 {
      font-size: 22px;
      font-weight: 300;
    }

    .empty-action-text-h5 {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
/* #endif */

/* ===================== MP-WEIXIN 微信小程序样式 ===================== */
/* #ifdef MP-WEIXIN */
.page-mp {
  width: 100%;
  min-height: 100vh;
  background: #eef2ff;
  padding-top: var(--status-bar-height);
}

.header-mp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e2e8f0;

  .header-back-mp {
    width: 36px;
    height: 36px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.08);

    &:active { transform: scale(0.9); }

    .header-back-icon-mp {
      font-size: 18px;
      color: #1e293b;
      font-weight: 600;
    }
  }

  .header-text-group-mp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .header-title-mp {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  .header-subtitle-mp {
    font-size: 11px;
    color: #94a3b8;
  }

  .header-placeholder-mp {
    width: 36px;
  }
}

.content-mp {
  padding: 12px 16px 100px;
  box-sizing: border-box;
}

.toolbar-mp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 2px;

  .count-text-mp {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.6);
    padding: 6px 14px;
    border-radius: 20px;
  }

  .add-btn-mp {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 10px;
    min-height: 44px;

    &:active {
      opacity: 0.85;
    }

    .add-btn-icon-mp {
      font-size: 14px;
      color: #fff;
      font-weight: 300;
      line-height: 1;
    }

    .add-btn-text-mp {
      font-size: 13px;
      color: #fff;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }
  }
}

.loading-state-mp {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 10px;

  .loading-spinner-mp {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin-mp 0.8s linear infinite;
  }

  .loading-text-mp {
    font-size: 14px;
    color: #94a3b8;
  }
}

@keyframes spin-mp { to { transform: rotate(360deg); } }

.card-list-mp {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .card-item-mp {
    width: 100%;
    overflow: visible;
  }
}

.empty-box-mp {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  animation: fadeInUp-mp 0.4s ease;

  .empty-illustration-mp {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .empty-emoji-mp {
    font-size: 40px;
  }

  .empty-msg-mp {
    font-size: 15px;
    color: #475569;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .empty-hint-mp {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  .empty-action-btn-mp {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 24px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    min-height: 44px;

    &:active {
      opacity: 0.85;
    }

    .empty-action-icon-mp {
      font-size: 18px;
      font-weight: 300;
    }

    .empty-action-text-mp {
      font-size: 14px;
      font-weight: 600;
    }
  }
}
/* #endif */
</style>
