<script setup>
import {ref, computed} from 'vue';
import {onLoad} from '@dcloudio/uni-app';
import {addCourseAPI, getCoursesAPI, deleteCourseAPI, updateCourseAPI} from '@/api/index.js';
import { getCurrentUser } from '@/utils/session.js';

const form = ref({
  subject: '',
  teacher: '',
  startDay: '',
  endDay: '',
  startTime: '08:00',
  endTime: '09:40'
});

const errors = ref({
  subject: '',
  startDay: '',
  endDay: '',
  startTime: '',
  endTime: '',
  timeRange: '',
  dateRange: ''
});

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;
form.value.startDay = todayStr;
form.value.endDay = todayStr;

// 编辑模式：记录要编辑的课程名称
const editingCourseName = ref(null);
const editingTeacherName = ref(null);
const isEditing = computed(() => editingCourseName.value !== null);

const navTitle = computed(() => isEditing.value ? '编辑课程' : '添加课程');
const submitBtnText = computed(() => isEditing.value ? '确认修改' : '确认添加');

// ==================== 星期选择 ====================

const weekdayOptions = [
  { value: '周一', label: '一' },
  { value: '周二', label: '二' },
  { value: '周三', label: '三' },
  { value: '周四', label: '四' },
  { value: '周五', label: '五' },
  { value: '周六', label: '六' },
  { value: '周日', label: '日' }
];

// 每个选中星期绑定独立地点：{ day: '周一', location: '1A322' }
const selectedDays = ref([]);

const toggleDay = (day) => {
  const idx = selectedDays.value.findIndex(d => d.day === day);
  if (idx >= 0) {
    selectedDays.value = selectedDays.value.filter(d => d.day !== day);
  } else {
    selectedDays.value = [...selectedDays.value, { day, location: '' }];
  }
};

const selectAllDays = () => {
  selectedDays.value = weekdayOptions.map(w => ({ day: w.value, location: '' }));
};

const clearDays = () => {
  selectedDays.value = [];
};

const isAllSelected = computed(() =>
  selectedDays.value.length === weekdayOptions.length
);

const selectedCount = computed(() => selectedDays.value.length);

const getDayLocation = (day) => {
  const item = selectedDays.value.find(d => d.day === day);
  return item ? item.location : '';
};

const updateDayLocation = (day, location) => {
  const idx = selectedDays.value.findIndex(d => d.day === day);
  if (idx >= 0) {
    const updated = [...selectedDays.value];
    updated[idx] = { ...updated[idx], location };
    selectedDays.value = updated;
  }
};

// ==================== 时间选择 ====================

const timeSlots = [
  {name: '第一单元 (08:00-09:40)', start: '08:00', end: '09:40'},
  {name: '第二单元 (10:10-11:50)', start: '10:10', end: '11:50'},
  {name: '第三单元 (13:30-15:10)', start: '13:30', end: '15:10'},
  {name: '第四单元 (15:40-17:20)', start: '15:40', end: '17:20'},
  {name: '第五单元 (18:30-20:10)', start: '18:30', end: '20:10'}
];
const selectedSlotIndex = ref(-1);

// ==================== 权限校验 ====================

const checkTeacherPermission = () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.user_type !== 'teacher') {
    uni.showToast({ title: '暂无权限', icon: 'none' });
    setTimeout(() => uni.reLaunch({ url: '/pages/list/listCourse' }), 800);
    return false;
  }
  return true;
};

// ==================== 加载课程（编辑模式） ====================

onLoad(async (options) => {
  if (!checkTeacherPermission()) return;

  // 编辑模式：通过课程名+教师名加载所有记录
  if (options.courseName) {
    editingCourseName.value = options.courseName;
    editingTeacherName.value = options.teacherName || '';
    await loadCourseRecords(options.courseName, options.teacherName || '');
  }
});

const loadCourseRecords = async (courseName, teacherName) => {
  uni.showLoading({title: '加载中...'});
  try {
    const result = await getCoursesAPI();
    if (result.success) {
      const records = (result.data || []).filter(
        c => c.course_name === courseName && c.teacher_name === teacherName
      );
      if (records.length > 0) {
        const first = records[0];
        form.value.subject = first.course_name || '';
        form.value.teacher = first.teacher_name || '';
        form.value.startDay = first.start_date || '';
        form.value.endDay = first.end_date || '';
        form.value.startTime = first.start_time || '08:00';
        form.value.endTime = first.end_time || '09:40';

        // 预勾选已有的星期并带上各自地点（去重）
        const dayMap = {};
        records.forEach(r => {
          if (r.weekday) {
            dayMap[r.weekday] = r.course_location || '';
          }
        });
        selectedDays.value = Object.entries(dayMap).map(([day, location]) => ({ day, location }));
      } else {
        uni.showToast({title: '未找到该课程记录', icon: 'none'});
      }
    } else {
      uni.showToast({title: result.message || '课程加载失败', icon: 'none'});
    }
  } catch (e) {
    uni.showToast({title: '网络请求失败，请检查后端服务是否启动', icon: 'none'});
  } finally {
    uni.hideLoading();
  }
};

// ==================== 表单验证 ====================

const clearFieldError = (field) => {
  errors.value[field] = '';
};

const validateField = (field) => {
  switch (field) {
    case 'subject':
      errors.value.subject = form.value.subject.trim() ? '' : '请输入课程名称';
      break;
    case 'startDay':
      errors.value.startDay = form.value.startDay ? '' : '请选择开始日期';
      break;
    case 'endDay':
      errors.value.endDay = form.value.endDay ? '' : '请选择结束日期';
      break;
    case 'startTime':
      errors.value.startTime = form.value.startTime ? '' : '请选择开始时间';
      break;
    case 'endTime':
      errors.value.endTime = form.value.endTime ? '' : '请选择结束时间';
      break;
  }
  if (['startDay', 'endDay'].includes(field)) {
    validateDateRange();
  }
  if (['startTime', 'endTime'].includes(field)) {
    validateTimeRange();
  }
};

const validateTimeRange = () => {
  if (!form.value.startTime || !form.value.endTime) {
    errors.value.timeRange = '';
    return;
  }
  if (form.value.endTime <= form.value.startTime) {
    errors.value.timeRange = '结束时间应晚于开始时间';
  } else {
    errors.value.timeRange = '';
  }
};

const validateDateRange = () => {
  if (!form.value.startDay || !form.value.endDay) {
    errors.value.dateRange = '';
    return;
  }
  if (form.value.endDay < form.value.startDay) {
    errors.value.dateRange = '结束日期不能早于开始日期';
  } else {
    errors.value.dateRange = '';
  }
};

const validateAll = () => {
  validateField('subject');
  validateField('startDay');
  validateField('endDay');
  validateField('startTime');
  validateField('endTime');
  validateDateRange();
  validateTimeRange();

  if (selectedDays.value.length === 0) {
    uni.showToast({title: '请至少选择一天上课', icon: 'none'});
    return false;
  }

  return !errors.value.subject && !errors.value.startDay && !errors.value.endDay
      && !errors.value.startTime && !errors.value.endTime
      && !errors.value.dateRange && !errors.value.timeRange;
};

// ==================== 时间选择回调 ====================

const onSlotChange = (e) => {
  const idx = e.detail.value;
  selectedSlotIndex.value = idx;
  const slot = timeSlots[idx];
  form.value.startTime = slot.start;
  form.value.endTime = slot.end;
  errors.value.startTime = '';
  errors.value.endTime = '';
  validateTimeRange();
};

const onStartTimeChange = (e) => {
  form.value.startTime = e.detail.value;
  selectedSlotIndex.value = -1;
  validateField('startTime');
};

const onEndTimeChange = (e) => {
  form.value.endTime = e.detail.value;
  selectedSlotIndex.value = -1;
  validateField('endTime');
};

const onStartDayChange = (e) => {
  form.value.startDay = e.detail.value;
  validateField('startDay');
};

const onEndDayChange = (e) => {
  form.value.endDay = e.detail.value;
  validateField('endDay');
};

// ==================== 提交 ====================

const handleSubmit = async () => {
  if (!validateAll()) return;

  uni.showLoading({title: '正在保存...'});

  try {
    // 构建提交数据
    const buildCourseData = (dayItem) => ({
      course_name: form.value.subject,
      teacher_name: form.value.teacher || '',
      course_location: dayItem.location || '',
      course_time: `${dayItem.day} ${form.value.startTime}-${form.value.endTime}`,
      start_date: form.value.startDay || null,
      end_date: form.value.endDay || null,
      start_time: form.value.startTime,
      end_time: form.value.endTime
    });

    if (isEditing.value) {
      // === 编辑模式：对比新旧数据，差异化更新 ===
      // 获取当前数据库中的旧记录
      const allResult = await getCoursesAPI();
      const oldRecords = (allResult.data || []).filter(
        c => c.course_name === editingCourseName.value &&
             c.teacher_name === editingTeacherName.value
      );

      // 建立 oldDay → record 的映射
      const oldDayMap = {};
      oldRecords.forEach(r => {
        if (r.weekday) oldDayMap[r.weekday] = r;
      });

      // 新选中的 day 集合
      const newDaysSet = new Set(selectedDays.value.map(d => d.day));

      // 需要删除的：old 有但 new 没有的天
      const toDelete = oldRecords.filter(r => r.weekday && !newDaysSet.has(r.weekday));
      // 需要新增的：new 有但 old 没有的天
      const toAdd = selectedDays.value.filter(d => !oldDayMap[d.day]);
      // 需要更新的：new 和 old 都有的天
      const toUpdate = selectedDays.value.filter(d => oldDayMap[d.day]);

      let successCount = 0;
      const errors = [];

      // 执行删除
      for (const rec of toDelete) {
        const res = await deleteCourseAPI(rec.id);
        if (res.success) successCount++;
      }

      // 执行新增
      for (const dayItem of toAdd) {
        const res = await addCourseAPI(buildCourseData(dayItem));
        if (res.success) {
          successCount++;
        } else {
          errors.push(`${dayItem.day}：${res.message || '创建失败'}`);
        }
      }

      // 执行更新
      for (const dayItem of toUpdate) {
        const oldRec = oldDayMap[dayItem.day];
        const res = await updateCourseAPI(oldRec.id, buildCourseData(dayItem));
        if (res.success) {
          successCount++;
        } else {
          errors.push(`${dayItem.day}：${res.message || '更新失败'}`);
        }
      }

      uni.hideLoading();

      if (successCount > 0) {
        uni.showToast({
          title: `修改成功，共处理 ${successCount} 条记录`,
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => {
          uni.reLaunch({url: '/pages/list/listCourse'});
        }, 1600);
      } else {
        uni.showToast({title: errors[0] || '修改失败', icon: 'none'});
      }
    } else {
      // === 添加模式：为每个选中天创建记录 ===
      let successCount = 0;
      const errors = [];

      for (const dayItem of selectedDays.value) {
        const res = await addCourseAPI(buildCourseData(dayItem));
        if (res.success) {
          successCount++;
        } else {
          errors.push(`${dayItem.day}：${res.message || '创建失败'}`);
        }
      }

      uni.hideLoading();

      if (successCount > 0) {
        uni.showToast({
          title: `添加成功，共 ${successCount} 条记录`,
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => {
          uni.reLaunch({url: '/pages/list/listCourse'});
        }, 1600);
      } else {
        uni.showToast({title: errors[0] || '操作失败', icon: 'none'});
      }
    }
  } catch (e) {
    uni.hideLoading();
    uni.showToast({title: '网络请求失败', icon: 'none'});
  }
};

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
</script>

<template>
  <view class="page-container">
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="content-wrapper">
      <view class="navbar">
        <text class="nav-title">{{ navTitle }}</text>
      </view>

      <view class="form-section">
        <!-- 课程信息 -->
        <view class="form-card">
          <view class="card-title">
            <text class="card-icon">📚</text>
            <text>课程信息</text>
          </view>
          <view class="input-group">
            <label class="label-text">
              <text class="label-icon">✏️</text>
              课程名称
              <text class="required">*</text>
            </label>
            <input
                class="input-field"
                :class="{ 'is-error': errors.subject }"
                v-model="form.subject"
                placeholder="例如：高等数学"
                maxlength="20"
                @blur="validateField('subject')"
                @input="clearFieldError('subject')"
            />
            <text class="error-text" v-if="errors.subject">{{ errors.subject }}</text>
          </view>
          <view class="input-group">
            <label class="label-text">
              <text class="label-icon">👨‍🏫</text>
              任课教师
            </label>
            <input
                class="input-field"
                v-model="form.teacher"
                placeholder="张老师"
            />
          </view>
        </view>

        <!-- 上课时间 -->
        <view class="form-card">
          <view class="card-title">
            <text class="card-icon">⏰</text>
            <text>上课时间</text>
          </view>

          <view class="slot-selector-wrapper">
            <label class="label-text">
              <text class="label-icon">⚡</text>
              选择时间单元（快捷填充）
            </label>
            <picker mode="selector" :range="timeSlots" range-key="name" @change="onSlotChange">
              <view class="slot-picker-display" :class="{ 'has-value': selectedSlotIndex >= 0 }">
                <text class="slot-picker-icon">🕐</text>
                <text class="slot-picker-text">
                  {{ selectedSlotIndex >= 0 ? timeSlots[selectedSlotIndex].name : '点击选择时间单元' }}
                </text>
                <text class="slot-picker-arrow">▾</text>
              </view>
            </picker>
          </view>

          <view class="divider-line">
            <text class="divider-text">或手动选择</text>
          </view>

          <!-- 开始日期 + 开始时间 -->
          <view class="date-picker-row">
            <view class="col-half">
              <label class="label-text">
                <text class="label-icon">📅</text>
                开始日期
                <text class="required">*</text>
              </label>
              <picker mode="date" :value="form.startDay" @change="onStartDayChange">
                <view class="picker-display" :class="{ 'has-value': form.startDay, 'is-error': errors.startDay }">
                  <text class="display-text">{{ form.startDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text" v-if="errors.startDay">{{ errors.startDay }}</text>
            </view>
            <view class="col-half">
              <label class="label-text">
                <text class="label-icon">🕐</text>
                开始时间
                <text class="required">*</text>
              </label>
              <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
                <view class="picker-display" :class="{ 'has-value': form.startTime, 'is-error': errors.startTime }">
                  <text class="display-text">{{ form.startTime }}</text>
                </view>
              </picker>
              <text class="error-text" v-if="errors.startTime">{{ errors.startTime }}</text>
            </view>
          </view>

          <!-- 结束日期 + 结束时间 -->
          <view class="date-picker-row">
            <view class="col-half">
              <label class="label-text">
                <text class="label-icon">📅</text>
                结束日期
                <text class="required">*</text>
              </label>
              <picker mode="date" :value="form.endDay" @change="onEndDayChange">
                <view class="picker-display" :class="{ 'has-value': form.endDay, 'is-error': errors.endDay }">
                  <text class="display-text">{{ form.endDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text" v-if="errors.endDay">{{ errors.endDay }}</text>
            </view>
            <view class="col-half">
              <label class="label-text">
                <text class="label-icon">🕐</text>
                结束时间
                <text class="required">*</text>
              </label>
              <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
                <view class="picker-display" :class="{ 'has-value': form.endTime, 'is-error': errors.endTime }">
                  <text class="display-text">{{ form.endTime }}</text>
                </view>
              </picker>
              <text class="error-text" v-if="errors.endTime">{{ errors.endTime }}</text>
            </view>
          </view>

          <text class="error-text date-range-error" v-if="errors.dateRange">{{ errors.dateRange }}</text>
          <text class="error-text date-range-error" v-if="errors.timeRange" style="margin-top: 4px;">{{ errors.timeRange }}</text>
        </view>

        <!-- 上课星期 -->
        <view class="form-card">
          <view class="card-title">
            <text class="card-icon">📅</text>
            <text>上课星期与地点</text>
          </view>

          <view class="weekday-section">
            <label class="label-text">
              <text class="label-icon">📅</text>
              选择上课星期
              <text class="required">*</text>
            </label>

            <view class="weekday-grid">
              <view
                  v-for="day in weekdayOptions"
                  :key="day.value"
                  class="weekday-tag"
                  :class="{ active: selectedDays.some(d => d.day === day.value) }"
                  @click="toggleDay(day.value)"
              >
                <text class="weekday-label">{{ day.label }}</text>
              </view>
            </view>

            <view class="weekday-actions">
              <view class="weekday-action-group">
                <text
                    class="weekday-action-link"
                    :class="{ disabled: isAllSelected }"
                    @click="selectAllDays"
                >全选</text>
                <text class="weekday-action-divider">|</text>
                <text
                    class="weekday-action-link"
                    :class="{ disabled: selectedDays.length === 0 }"
                    @click="clearDays"
                >清空</text>
              </view>
              <text class="selected-count">已选 <text class="count-num">{{ selectedCount }}</text> 天</text>
            </view>
          </view>

          <!-- 各星期独立地点设置 -->
          <view v-if="selectedDays.length > 0" class="weekday-locations-section">
            <view class="divider-line">
              <text class="divider-text">各星期上课地点</text>
            </view>
            <view
                v-for="dayItem in selectedDays"
                :key="dayItem.day"
                class="weekday-location-row"
            >
              <text class="location-day-label">{{ dayItem.day }}</text>
              <input
                  class="location-input"
                  :value="dayItem.location"
                  @input="updateDayLocation(dayItem.day, $event.detail.value)"
                  placeholder="输入地点，如 1A322"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="action-bar">
        <button class="btn btn-secondary" @click="handleCancel()">取消</button>
        <button class="btn btn-primary" @click="handleSubmit()">{{ submitBtnText }}</button>
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
  padding-top: var(--status-bar-height);
}

.bg-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    /* #ifdef H5 */
    filter: blur(60px);
    /* #endif */
    opacity: 0.3;

    &.bg-circle-1 {
      width: 300px;
      height: 300px;
      background: #6366f1;
      top: -80px;
      right: -80px;
    }

    &.bg-circle-2 {
      width: 220px;
      height: 220px;
      background: #10b981;
      bottom: -40px;
      left: -40px;
    }
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  padding: 20px 14px;
  box-sizing: border-box;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  .nav-title {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
  }
}

.form-section {
  margin-bottom: 16px;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  /* #ifdef H5 */
  backdrop-filter: blur(12px);
  /* #endif */
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: box-shadow 0.3s;

  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f1f5f9;

    .card-icon {
      font-size: 16px;
    }
  }
}

.input-group {
  margin-bottom: 10px;
}

.row-inputs {
  display: flex;
  gap: 10px;
}

.col-half {
  flex: 1;
  min-width: 0;
}

.label-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 600;

  .required {
    color: #ef4444;
    margin-left: 2px;
  }

  .label-icon {
    font-size: 11px;
    margin-right: 2px;
  }
}

.input-field {
  width: 100%;
  height: 38px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #1e293b;
  box-sizing: border-box;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s;

  &:focus {
    background: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &.is-error {
    border-color: #ef4444;
    background: #fef2f2;

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.error-text {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 2px;
  padding-left: 2px;
  font-weight: 500;
  animation: fadeSlideIn 0.2s ease;
}

.date-range-error {
  margin-top: 6px;
  padding: 6px 10px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
  text-align: center;
  font-size: 11px;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slot-selector-wrapper {
  margin-bottom: 2px;
}

.slot-picker-display {
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1.5px dashed #a5b4fc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  padding: 0 10px;
  box-sizing: border-box;

  &.has-value {
    border-style: solid;
    border-color: #6366f1;
    background: linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%);
  }

  &:active {
    transform: scale(0.98);
  }

  .slot-picker-icon {
    font-size: 14px;
    margin-right: 6px;
    flex-shrink: 0;
  }

  .slot-picker-text {
    flex: 1;
    font-size: 13px;
    color: #4338ca;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot-picker-arrow {
    font-size: 12px;
    color: #6366f1;
    margin-left: 6px;
    flex-shrink: 0;
  }
}

.divider-line {
  display: flex;
  align-items: center;
  height: 1px;
  background: #e2e8f0;
  margin: 12px 0;

  .divider-text {
    padding: 0 12px;
    font-size: 11px;
    color: #94a3b8;
    background: #fff;
    flex-shrink: 0;
  }
}

.date-picker-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.picker-display {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &.has-value {
    border-color: #c7d2fe;
    background: #eef2ff;
  }

  &.is-error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .display-text {
    width: 100%;
    padding: 0 10px;
    font-size: 13px;
    color: #1e293b;
    text-align: left;
  }
}

/* ===== 星期选择器 ===== */

.weekday-section {
  margin-top: 0;
}

.weekday-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.weekday-tag {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f1f5f9;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  .weekday-label {
    font-size: 15px;
    font-weight: 600;
    color: #64748b;
    transition: color 0.25s;
  }

  &:active {
    transform: scale(0.9);
  }

  &.active {
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    border-color: #6366f1;
    box-shadow: 0 3px 10px rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);

    .weekday-label {
      color: #4338ca;
    }
  }
}

.weekday-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.weekday-action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weekday-action-link {
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;

  &:active {
    opacity: 0.7;
  }

  &.disabled {
    color: #cbd5e1;
    cursor: default;
    pointer-events: none;
  }
}

.weekday-action-divider {
  font-size: 12px;
  color: #cbd5e1;
}

.selected-count {
  font-size: 12px;
  color: #94a3b8;

  .count-num {
    color: #6366f1;
    font-weight: 700;
    font-size: 14px;
  }
}

/* ===== 各星期地点设置 ===== */

.weekday-locations-section {
  margin-top: 10px;
}

.weekday-location-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 4px 0;
}

.location-day-label {
  width: 32px;
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  text-align: center;
  flex-shrink: 0;
}

.location-input {
  flex: 1;
  height: 34px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #1e293b;
  box-sizing: border-box;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s;

  &:focus {
    background: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

/* ===== 操作按钮 ===== */

.action-bar {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  /* 重置微信小程序 button 默认样式 */
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  &::after { border: none; }

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
</style>
