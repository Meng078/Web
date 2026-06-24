<script setup>
import {ref} from 'vue';

// --- 响应式数据 ---
const form = ref({
  subject: '',     // 课程名称
  teacher: '',     // 教师
  location: '',    // 地点
  startDay: '',    // 开始日期 (YYYY-MM-DD)
  startTime: '08:00',   // 开始时间 (HH:mm)
  endDay: '',      // 结束日期
  endTime: '09:40'      // 结束时间
});

// 设置默认今天的日期
const setTodayDefaults = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  form.value.startDay = todayStr;
  form.value.endDay = todayStr;
};
setTodayDefaults();

// --- 方法逻辑 ---

// 提交课程
const handleSubmit = () => {
  if (!form.value.subject) {
    uni.showToast({title: '请输入课程名称', icon: 'none'});
    return;
  }

  // 日期逻辑验证
  if (form.value.endDay < form.value.startDay) {
    uni.showToast({title: '结束日期不能早于开始日期', icon: 'none'});
    return;
  }
  if (form.value.endDay === form.value.startDay && form.value.endTime <= form.value.startTime) {
    uni.showToast({title: '同一天时，结束时间应晚于开始时间', icon: 'none'});
    return;
  }

  uni.showLoading({title: '正在保存...'});

  setTimeout(() => {
    let courses = [];
    try {
      courses = uni.getStorageSync('courses') || [];
    } catch (e) {
      courses = [];
    }

    const newCourse = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      subject: form.value.subject,
      teacher: form.value.teacher || '',
      location: form.value.location || '',
      startDay: form.value.startDay,
      startTime: form.value.startTime,
      endDay: form.value.endDay,
      endTime: form.value.endTime
    };
    courses.push(newCourse);

    uni.setStorageSync('courses', courses);

    uni.hideLoading();
    uni.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      uni.reLaunch({url: '/pages/list/listCourse'});
    }, 1600);
  }, 500);
};

// 取消
const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '确定要放弃本次编辑吗？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({url: '/pages/list/listCourse'});
      }
    }
  });
};

// 日期选择器事件
const onStartDayChange = (e) => {
  form.value.startDay = e.detail.value;
};
const onStartTimeChange = (e) => {
  form.value.startTime = e.detail.value;
};
const onEndDayChange = (e) => {
  form.value.endDay = e.detail.value;
};
const onEndTimeChange = (e) => {
  form.value.endTime = e.detail.value;
};
</script>

<template>
  <view class="page-container">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <!-- 顶部导航栏 -->
      <view class="navbar">
        <view class="nav-back" @click="handleCancel">
          <text class="icon-arrow">返回</text>
        </view>
        <text class="nav-title">添加新课程</text>
        <view class="nav-placeholder"></view>
      </view>

      <!-- 主体表单区域 -->
      <view class="form-section">

        <!-- 基本信息卡片 -->
        <view class="form-card">
          <view class="card-title">📚 课程信息</view>
          <view class="input-group">
            <label class="label-text">课程名称 <span class="required">*</span></label>
            <input
                class="input-field"
                v-model="form.subject"
                placeholder="例如：高等数学"
                maxlength="20"
            />
          </view>
          <view class="row-inputs">
            <view class="input-group col-half">
              <label class="label-text">任课教师</label>
              <input
                  class="input-field"
                  v-model="form.teacher"
                  placeholder="张老师"
              />
            </view>
          </view>
          <view class="input-group col-half">
            <label class="label-text">上课地点</label>
            <input
                class="input-field"
                v-model="form.location"
                placeholder="A-101"
            />
          </view>
        </view>

        <!-- 时间设定卡片 -->
        <view class="form-card">
          <view class="card-title">⏰ 时间安排</view>

          <!-- 开始时间 -->
          <view class="date-picker-row">
            <view class="col-half">
              <label class="label-text">开始日期</label>
              <picker mode="date" :value="form.startDay" @change="onStartDayChange">
                <view class="picker-display" :class="{ 'has-value': form.startDay }">
                  <text class="display-text">{{ form.startDay }}</text>
                </view>
              </picker>
            </view>
            <view class="col-half">
              <label class="label-text">开始时间</label>
              <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
                <view class="picker-display" :class="{ 'has-value': form.startTime }">
                  <text class="display-text">{{ form.startTime }}</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 结束时间 -->
          <view class="divider-line"></view>

          <view class="date-picker-row">
            <view class="col-half">
              <label class="label-text">结束日期</label>
              <picker mode="date" :value="form.endDay" @change="onEndDayChange">
                <view class="picker-display" :class="{ 'has-value': form.endDay }">
                  <text class="display-text">{{ form.endDay }}</text>
                </view>
              </picker>
            </view>
            <view class="col-half">
              <label class="label-text">结束时间</label>
              <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
                <view class="picker-display" :class="{ 'has-value': form.endTime }">
                  <text class="display-text">{{ form.endTime }}</text>
                </view>
              </picker>
            </view>
          </view>
        </view>

      </view>

      <!-- 底部固定操作栏 -->
      <view class="action-bar">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">确认添加</button>
      </view>

    </view>
  </view>
</template>

<style scoped lang="scss">
/* --- 布局容器（与课程列表页一致） --- */
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

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;

    &.bg-circle-1 {
      width: 400px;
      height: 400px;
      background: #6366f1;
      top: -100px;
      right: -100px;
    }

    &.bg-circle-2 {
      width: 300px;
      height: 300px;
      background: #10b981;
      bottom: -50px;
      left: -50px;
    }
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  height: 100vh;
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* --- 导航栏（与课程列表页一致） --- */
.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  position: relative;

  .nav-back {
    position: absolute;
    left: 0;
    cursor: pointer;
    margin-right: 12px;
    padding: 4px 12px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.08);
    transition: opacity 0.15s;

    &:active {
      opacity: 0.6;
    }
  }

  .icon-arrow {
    font-size: 14px;
    color: #6366f1;
    font-weight: 600;
  }

  .nav-title {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
  }

  .nav-placeholder {
    display: none;
  }
}

/* --- 表单区域（自动撑满剩余空间） --- */
.form-section {
  flex: 1;
  overflow-y: auto;
}

/* --- 通用卡片样式（与课程列表页统一） --- */
.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* --- 表单控件样式 --- */
.input-group {
  margin-bottom: 8px;
}

.row-inputs {
  display: flex;
  gap: 16px;
}

.col-half {
  flex: 1;
}

.label-text {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;

  .required {
    color: #ef4444;
  }
}

.input-field {
  width: 96%;
  height: 44px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 15px;
  color: #334155;
  transition: all 0.2s;

  &:focus {
    background: #fff;
    outline: none;
    border: 2px solid #6366f1;
  }
}

/* --- 日期选择器样式 --- */
.divider-line {
  height: 1px;
  background: #f1f5f9;
  margin: 16px 0;
}

.date-picker-row {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.picker-display {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &.has-value {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .display-text {
    width: 100%;
    text-align: center;
    padding-left: 14px;
    font-size: 15px;
    color: #1e293b;
  }
}

/* --- 底部按钮区（居中限定宽度） --- */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 16px 24px 24px;
  box-sizing: border-box;
  //background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 48px;
  line-height: 48px;
  text-align: center;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.97) translateY(0);
  }
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);

  &:hover {
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  }
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;

  &:hover {
    background: #e2e8f0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
}

@media (min-width: 768px) {
  .scroll-content {
    max-height: calc(100vh - 260px);
  }
}
</style>