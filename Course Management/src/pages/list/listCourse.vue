<script setup>
import {ref, onMounted} from 'vue';
import {onShow} from '@dcloudio/uni-app';
import CourseCard from '@/components/CourseCard.vue';

// 星期映射
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 格式化日期：2026-06-24 → 6月24日 周三
const formatDateFriendly = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekDays[d.getDay()]}`;
};

// 获取当前周第几天的日期字符串（1=周一, 7=周日）
const getWeekDate = (dayOffset) => {
  const now = new Date();
  const currentDay = now.getDay() || 7;
  const target = new Date(now);
  target.setDate(now.getDate() - currentDay + dayOffset);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// --- 状态数据 ---
const title = ref("课程管理中心");

// 课程数据（从本地存储加载）
const courses = ref([]);

// 用于展示的格式化数据
const displayCourses = ref([]);

// 格式化存储数据为列表展示格式
const formatCoursesForDisplay = (rawCourses) => {
  return rawCourses.map((c, idx) => ({
    id: c.id || idx,
    subject: c.subject || '未命名课程',
    teacher: c.teacher || '未知教师',
    timeDisplay: c.time || (c.startTime ? `${c.startTime}-${c.endTime}` : ''),
    dayDisplay: c.startDay || '',
    dayFriendly: formatDateFriendly(c.startDay),
    location: c.location || '未知地点',
    _raw: c
  }));
};

// 从本地存储加载课程
const loadCourses = () => {
  let stored = [];
  try {
    stored = uni.getStorageSync('courses') || [];
  } catch (e) {
    stored = [];
  }

  if (stored.length > 0) {
    courses.value = stored;
  } else {
    // 首次使用时，基于当前周生成动态示例数据
    courses.value = [
      {
        id: 101,
        subject: "Web前端开发",
        teacher: "张伟",
        startDay: getWeekDate(1),
        startTime: "09:00",
        endDay: getWeekDate(1),
        endTime: "10:30",
        location: "J302"
      },
      {
        id: 102,
        subject: "数据库原理",
        teacher: "李娜",
        startDay: getWeekDate(3),
        startTime: "14:00",
        endDay: getWeekDate(3),
        endTime: "15:30",
        location: "M201"
      },
      {
        id: 103,
        subject: "计算机网络",
        teacher: "王强",
        startDay: getWeekDate(5),
        startTime: "10:00",
        endDay: getWeekDate(5),
        endTime: "11:30",
        location: "J302"
      },
      {
        id: 104,
        subject: "高等数学",
        teacher: "陈教授",
        startDay: getWeekDate(2),
        startTime: "08:00",
        endDay: getWeekDate(2),
        endTime: "09:40",
        location: "C101"
      }
    ];
    uni.setStorageSync('courses', courses.value);
  }
  displayCourses.value = formatCoursesForDisplay(courses.value);
};

// 保存到本地存储
const saveCourses = () => {
  try {
    uni.setStorageSync('courses', courses.value);
  } catch (e) {
    console.error('保存课程数据失败:', e);
  }
  displayCourses.value = formatCoursesForDisplay(courses.value);
};

// --- 方法定义 ---

// 返回首页（强制绑定主页）
const goBack = () => {
  uni.reLaunch({url: '/pages/index/index'});
};

// 核心知识点：数组操作 - 删除（同步到本地存储）
const handleDelete = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这门课程吗？此操作不可撤销。',
    success: (res) => {
      if (res.confirm) {
        courses.value.splice(index, 1);
        saveCourses();
        uni.showToast({title: '已删除', icon: 'success'});
      }
    }
  });
};

// 编辑（跳转到添加课程页面）
const handleEdit = (item) => {
  uni.navigateTo({url: '/pages/add/addCourse'});
};

// 添加课程
const openAddPage = () => {
  uni.navigateTo({url: '/pages/add/addCourse'});
};

// 页面加载时读取存储
onMounted(() => {
  loadCourses();
});

// 每次页面显示时刷新数据（从添加页面返回时自动更新列表）
onShow(() => {
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
        <view class="back-btn" @click="goBack">
          <text class="arrow">返回</text>
        </view>
        <text class="main-title">{{ title }}</text>
      </view>

      <view class="toolbar">
        <text class="count-text">共 {{ displayCourses.length }} 门课程</text>
        <view class="add-btn" @click="openAddPage">
          <text class="add-icon">+</text>
        </view>
      </view>

      <view class="card-list">
        <block v-if="displayCourses.length > 0">
          <CourseCard
              v-for="(item, index) in displayCourses"
              :key="item.id"
              :course="item"
              :showActions="true"
              @edit="handleEdit(item)"
              @delete="handleDelete(index)"
          />
        </block>
        <view v-else class="empty-box">
          <text class="empty-emoji">📚</text>
          <text class="empty-msg">暂无课程信息</text>
          <text class="empty-hint">点击右上角 + 添加第一门课程</text>
        </view>
      </view>
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

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  padding: 24px;
  box-sizing: border-box;
}

.header-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;

  .back-btn {
    position: absolute;
    left: 0;
    cursor: pointer;
    margin-right: 12px;
    padding: 4px 12px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.08);
    transition: opacity 0.15s;
  }

  .back-btn:active {
    opacity: 0.6;
  }

  .arrow {
    font-size: 14px;
    color: #6366f1;
    font-weight: 600;
  }

  .main-title {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .count-text {
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
  }

  .add-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    cursor: pointer;
    transition: all 0.2s;

    &:active {
      transform: scale(0.9);
    }

    .add-icon {
      font-size: 28px;
      color: #fff;
      font-weight: 300;
    }
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 课程卡片样式已移至 components/CourseCard.vue */

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;

  .empty-emoji {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-msg {
    font-size: 16px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 13px;
    color: #94a3b8;
  }
}

@media (min-width: 768px) {
  .page-container {
    justify-content: center;
    align-items: center;
  }
  .content-wrapper {
    max-width: 800px;
  }
}
</style>
