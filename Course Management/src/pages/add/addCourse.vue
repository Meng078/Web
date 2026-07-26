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
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800);
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
      const errorList = [];

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
          errorList.push(`${dayItem.day}：${res.message || '创建失败'}`);
        }
      }

      // 执行更新
      for (const dayItem of toUpdate) {
        const oldRec = oldDayMap[dayItem.day];
        const res = await updateCourseAPI(oldRec.id, buildCourseData(dayItem));
        if (res.success) {
          successCount++;
        } else {
          errorList.push(`${dayItem.day}：${res.message || '更新失败'}`);
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
          uni.navigateBack({ delta: 1 });
        }, 1600);
      } else {
        uni.showToast({title: errorList[0] || '修改失败', icon: 'none'});
      }
    } else {
      // === 添加模式：为每个选中天创建记录 ===
      let successCount = 0;
      const errorList = [];

      for (const dayItem of selectedDays.value) {
        const res = await addCourseAPI(buildCourseData(dayItem));
        if (res.success) {
          successCount++;
        } else {
          errorList.push(`${dayItem.day}：${res.message || '创建失败'}`);
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
          uni.navigateBack({ delta: 1 });
        }, 1600);
      } else {
        uni.showToast({title: errorList[0] || '操作失败', icon: 'none'});
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
        uni.navigateBack({ delta: 1 });
      }
    }
  });
};
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page-h5">
    <!-- 固定顶部导航栏 -->
    <view class="topbar-h5">
      <view class="topbar-inner">
        <text class="topbar-title">{{ navTitle }}</text>
      </view>
    </view>

    <view class="content-h5">
      <view class="form-section-h5">
        <!-- 课程信息 -->
        <view class="form-card-h5">
          <view class="card-title-h5">
            <text class="card-icon-h5">📚</text>
            <text class="card-title-text-h5">课程信息</text>
          </view>
          <view class="input-group-h5">
            <label class="label-text-h5">
              <text class="label-icon-h5">✏️</text>
              <text class="label-content-h5">课程名称</text>
              <text class="required-h5">*</text>
            </label>
            <input
                class="input-field-h5"
                :class="{ 'is-error-h5': errors.subject }"
                v-model="form.subject"
                placeholder="例如：高等数学"
                maxlength="20"
                @blur="validateField('subject')"
                @input="clearFieldError('subject')"
            />
            <text class="error-text-h5" v-if="errors.subject">{{ errors.subject }}</text>
          </view>
          <view class="input-group-h5">
            <label class="label-text-h5">
              <text class="label-icon-h5">👨‍🏫</text>
              <text class="label-content-h5">任课教师</text>
            </label>
            <input
                class="input-field-h5"
                v-model="form.teacher"
                placeholder="张老师"
            />
          </view>
        </view>

        <!-- 上课时间 -->
        <view class="form-card-h5">
          <view class="card-title-h5">
            <text class="card-icon-h5">⏰</text>
            <text class="card-title-text-h5">上课时间</text>
          </view>

          <view class="slot-selector-wrapper-h5">
            <label class="label-text-h5">
              <text class="label-icon-h5">⚡</text>
              <text class="label-content-h5">选择时间单元（快捷填充）</text>
            </label>
            <picker mode="selector" :range="timeSlots" range-key="name" @change="onSlotChange">
              <view class="slot-picker-display-h5" :class="{ 'has-value-h5': selectedSlotIndex >= 0 }">
                <text class="slot-picker-icon-h5">🕐</text>
                <text class="slot-picker-text-h5">
                  {{ selectedSlotIndex >= 0 ? timeSlots[selectedSlotIndex].name : '点击选择时间单元' }}
                </text>
                <text class="slot-picker-arrow-h5">▾</text>
              </view>
            </picker>
          </view>

          <view class="divider-line-h5">
            <text class="divider-text-h5">或手动选择</text>
          </view>

          <!-- 开始日期 + 开始时间 -->
          <view class="date-picker-row-h5">
            <view class="col-half-h5">
              <label class="label-text-h5">
                <text class="label-icon-h5">📅</text>
                <text class="label-content-h5">开始日期</text>
                <text class="required-h5">*</text>
              </label>
              <picker mode="date" :value="form.startDay" @change="onStartDayChange">
                <view class="picker-display-h5" :class="{ 'has-value-h5': form.startDay, 'is-error-h5': errors.startDay }">
                  <text class="display-text-h5">{{ form.startDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text-h5" v-if="errors.startDay">{{ errors.startDay }}</text>
            </view>
            <view class="col-half-h5">
              <label class="label-text-h5">
                <text class="label-icon-h5">🕐</text>
                <text class="label-content-h5">开始时间</text>
                <text class="required-h5">*</text>
              </label>
              <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
                <view class="picker-display-h5" :class="{ 'has-value-h5': form.startTime, 'is-error-h5': errors.startTime }">
                  <text class="display-text-h5">{{ form.startTime }}</text>
                </view>
              </picker>
              <text class="error-text-h5" v-if="errors.startTime">{{ errors.startTime }}</text>
            </view>
          </view>

          <!-- 结束日期 + 结束时间 -->
          <view class="date-picker-row-h5">
            <view class="col-half-h5">
              <label class="label-text-h5">
                <text class="label-icon-h5">📅</text>
                <text class="label-content-h5">结束日期</text>
                <text class="required-h5">*</text>
              </label>
              <picker mode="date" :value="form.endDay" @change="onEndDayChange">
                <view class="picker-display-h5" :class="{ 'has-value-h5': form.endDay, 'is-error-h5': errors.endDay }">
                  <text class="display-text-h5">{{ form.endDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text-h5" v-if="errors.endDay">{{ errors.endDay }}</text>
            </view>
            <view class="col-half-h5">
              <label class="label-text-h5">
                <text class="label-icon-h5">🕐</text>
                <text class="label-content-h5">结束时间</text>
                <text class="required-h5">*</text>
              </label>
              <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
                <view class="picker-display-h5" :class="{ 'has-value-h5': form.endTime, 'is-error-h5': errors.endTime }">
                  <text class="display-text-h5">{{ form.endTime }}</text>
                </view>
              </picker>
              <text class="error-text-h5" v-if="errors.endTime">{{ errors.endTime }}</text>
            </view>
          </view>

          <text class="error-text-h5 date-range-error-h5" v-if="errors.dateRange">{{ errors.dateRange }}</text>
          <text class="error-text-h5 date-range-error-h5" v-if="errors.timeRange" style="margin-top: 4px;">{{ errors.timeRange }}</text>
        </view>

        <!-- 上课星期 -->
        <view class="form-card-h5">
          <view class="card-title-h5">
            <text class="card-icon-h5">📅</text>
            <text class="card-title-text-h5">上课星期与地点</text>
          </view>

          <view class="weekday-section-h5">
            <label class="label-text-h5">
              <text class="label-icon-h5">📅</text>
              <text class="label-content-h5">选择上课星期</text>
              <text class="required-h5">*</text>
            </label>

            <view class="weekday-grid-h5">
              <view
                  v-for="day in weekdayOptions"
                  :key="day.value"
                  class="weekday-tag-h5"
                  :class="{ 'active-h5': selectedDays.some(d => d.day === day.value) }"
                  @click="toggleDay(day.value)"
              >
                <text class="weekday-label-h5">{{ day.label }}</text>
              </view>
            </view>

            <view class="weekday-actions-h5">
              <view class="weekday-action-group-h5">
                <text
                    class="weekday-action-link-h5"
                    :class="{ 'disabled-h5': isAllSelected }"
                    @click="selectAllDays"
                >全选</text>
                <text class="weekday-action-divider-h5">|</text>
                <text
                    class="weekday-action-link-h5"
                    :class="{ 'disabled-h5': selectedDays.length === 0 }"
                    @click="clearDays"
                >清空</text>
              </view>
              <text class="selected-count-h5">已选 <text class="count-num-h5">{{ selectedCount }}</text> 天</text>
            </view>
          </view>

          <!-- 各星期独立地点设置 -->
          <view v-if="selectedDays.length > 0" class="weekday-locations-section-h5">
            <view class="divider-line-h5">
              <text class="divider-text-h5">各星期上课地点</text>
            </view>
            <view
                v-for="dayItem in selectedDays"
                :key="dayItem.day"
                class="weekday-location-row-h5"
            >
              <text class="location-day-label-h5">{{ dayItem.day }}</text>
              <input
                  class="location-input-h5"
                  :value="dayItem.location"
                  @input="updateDayLocation(dayItem.day, $event.detail.value)"
                  placeholder="输入地点，如 1A322"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="action-bar-h5">
        <button class="btn-h5 btn-secondary-h5" @click="handleCancel()">取消</button>
        <button class="btn-h5 btn-primary-h5" @click="handleSubmit()">{{ submitBtnText }}</button>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="page-mp">
    <!-- 简洁头部 -->
    <view class="header-mp">
      <view class="header-back-mp" @click="handleCancel()">
        <text class="header-back-icon-mp">‹</text>
      </view>
      <text class="header-title-mp">{{ navTitle }}</text>
      <view class="header-placeholder-mp"></view>
    </view>

    <view class="content-mp">
      <view class="form-section-mp">
        <!-- 课程信息 -->
        <view class="form-card-mp">
          <view class="card-title-mp">
            <text class="card-icon-mp">📚</text>
            <text class="card-title-text-mp">课程信息</text>
          </view>
          <view class="input-group-mp">
            <label class="label-text-mp">
              <text class="label-icon-mp">✏️</text>
              <text class="label-content-mp">课程名称</text>
              <text class="required-mp">*</text>
            </label>
            <input
                class="input-field-mp"
                :class="{ 'is-error-mp': errors.subject }"
                v-model="form.subject"
                placeholder="例如：高等数学"
                maxlength="20"
                @blur="validateField('subject')"
                @input="clearFieldError('subject')"
            />
            <text class="error-text-mp" v-if="errors.subject">{{ errors.subject }}</text>
          </view>
          <view class="input-group-mp">
            <label class="label-text-mp">
              <text class="label-icon-mp">👨‍🏫</text>
              <text class="label-content-mp">任课教师</text>
            </label>
            <input
                class="input-field-mp"
                v-model="form.teacher"
                placeholder="张老师"
            />
          </view>
        </view>

        <!-- 上课时间 -->
        <view class="form-card-mp">
          <view class="card-title-mp">
            <text class="card-icon-mp">⏰</text>
            <text class="card-title-text-mp">上课时间</text>
          </view>

          <view class="slot-selector-wrapper-mp">
            <label class="label-text-mp">
              <text class="label-icon-mp">⚡</text>
              <text class="label-content-mp">选择时间单元（快捷填充）</text>
            </label>
            <picker mode="selector" :range="timeSlots" range-key="name" @change="onSlotChange">
              <view class="slot-picker-display-mp" :class="{ 'has-value-mp': selectedSlotIndex >= 0 }">
                <text class="slot-picker-icon-mp">🕐</text>
                <text class="slot-picker-text-mp">
                  {{ selectedSlotIndex >= 0 ? timeSlots[selectedSlotIndex].name : '点击选择时间单元' }}
                </text>
                <text class="slot-picker-arrow-mp">▾</text>
              </view>
            </picker>
          </view>

          <view class="divider-line-mp">
            <text class="divider-text-mp">或手动选择</text>
          </view>

          <view class="date-picker-row-mp">
            <view class="col-half-mp">
              <label class="label-text-mp">
                <text class="label-icon-mp">📅</text>
                <text class="label-content-mp">开始日期</text>
                <text class="required-mp">*</text>
              </label>
              <picker mode="date" :value="form.startDay" @change="onStartDayChange">
                <view class="picker-display-mp" :class="{ 'has-value-mp': form.startDay, 'is-error-mp': errors.startDay }">
                  <text class="display-text-mp">{{ form.startDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text-mp" v-if="errors.startDay">{{ errors.startDay }}</text>
            </view>
            <view class="col-half-mp">
              <label class="label-text-mp">
                <text class="label-icon-mp">🕐</text>
                <text class="label-content-mp">开始时间</text>
                <text class="required-mp">*</text>
              </label>
              <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
                <view class="picker-display-mp" :class="{ 'has-value-mp': form.startTime, 'is-error-mp': errors.startTime }">
                  <text class="display-text-mp">{{ form.startTime }}</text>
                </view>
              </picker>
              <text class="error-text-mp" v-if="errors.startTime">{{ errors.startTime }}</text>
            </view>
          </view>

          <view class="date-picker-row-mp">
            <view class="col-half-mp">
              <label class="label-text-mp">
                <text class="label-icon-mp">📅</text>
                <text class="label-content-mp">结束日期</text>
                <text class="required-mp">*</text>
              </label>
              <picker mode="date" :value="form.endDay" @change="onEndDayChange">
                <view class="picker-display-mp" :class="{ 'has-value-mp': form.endDay, 'is-error-mp': errors.endDay }">
                  <text class="display-text-mp">{{ form.endDay || '选择日期' }}</text>
                </view>
              </picker>
              <text class="error-text-mp" v-if="errors.endDay">{{ errors.endDay }}</text>
            </view>
            <view class="col-half-mp">
              <label class="label-text-mp">
                <text class="label-icon-mp">🕐</text>
                <text class="label-content-mp">结束时间</text>
                <text class="required-mp">*</text>
              </label>
              <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
                <view class="picker-display-mp" :class="{ 'has-value-mp': form.endTime, 'is-error-mp': errors.endTime }">
                  <text class="display-text-mp">{{ form.endTime }}</text>
                </view>
              </picker>
              <text class="error-text-mp" v-if="errors.endTime">{{ errors.endTime }}</text>
            </view>
          </view>

          <text class="error-text-mp date-range-error-mp" v-if="errors.dateRange">{{ errors.dateRange }}</text>
          <text class="error-text-mp date-range-error-mp" v-if="errors.timeRange" style="margin-top: 4px;">{{ errors.timeRange }}</text>
        </view>

        <!-- 上课星期 -->
        <view class="form-card-mp">
          <view class="card-title-mp">
            <text class="card-icon-mp">📅</text>
            <text class="card-title-text-mp">上课星期与地点</text>
          </view>

          <view class="weekday-section-mp">
            <label class="label-text-mp">
              <text class="label-icon-mp">📅</text>
              <text class="label-content-mp">选择上课星期</text>
              <text class="required-mp">*</text>
            </label>

            <view class="weekday-grid-mp">
              <view
                  v-for="day in weekdayOptions"
                  :key="day.value"
                  class="weekday-tag-mp"
                  :class="{ 'active-mp': selectedDays.some(d => d.day === day.value) }"
                  @click="toggleDay(day.value)"
              >
                <text class="weekday-label-mp">{{ day.label }}</text>
              </view>
            </view>

            <view class="weekday-actions-mp">
              <view class="weekday-action-group-mp">
                <text
                    class="weekday-action-link-mp"
                    :class="{ 'disabled-mp': isAllSelected }"
                    @click="selectAllDays"
                >全选</text>
                <text class="weekday-action-divider-mp">|</text>
                <text
                    class="weekday-action-link-mp"
                    :class="{ 'disabled-mp': selectedDays.length === 0 }"
                    @click="clearDays"
                >清空</text>
              </view>
              <text class="selected-count-mp">已选 <text class="count-num-mp">{{ selectedCount }}</text> 天</text>
            </view>
          </view>

          <view v-if="selectedDays.length > 0" class="weekday-locations-section-mp">
            <view class="divider-line-mp">
              <text class="divider-text-mp">各星期上课地点</text>
            </view>
            <view
                v-for="dayItem in selectedDays"
                :key="dayItem.day"
                class="weekday-location-row-mp"
            >
              <text class="location-day-label-mp">{{ dayItem.day }}</text>
              <input
                  class="location-input-mp"
                  :value="dayItem.location"
                  @input="updateDayLocation(dayItem.day, $event.detail.value)"
                  placeholder="输入地点，如 1A322"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="action-bar-mp">
        <button class="btn-mp btn-secondary-mp" @click="handleCancel()">取消</button>
        <button class="btn-mp btn-primary-mp" @click="handleSubmit()">{{ submitBtnText }}</button>
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
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
  }

  .topbar-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }
}

.content-h5 {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 32px 48px;
  box-sizing: border-box;
}

.form-section-h5 {
  margin-bottom: 24px;
}

.form-card-h5 {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }

  .card-title-h5 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f1f5f9;

    .card-icon-h5 {
      font-size: 20px;
    }

    .card-title-text-h5 {
      font-size: 18px;
      font-weight: 700;
    }
  }
}

.input-group-h5 {
  margin-bottom: 20px;
}

.label-text-h5 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #475569;
  margin-bottom: 8px;
  font-weight: 600;

  .label-icon-h5 {
    font-size: 14px;
  }

  .label-content-h5 {
    font-size: 15px;
  }

  .required-h5 {
    color: #ef4444;
    margin-left: 2px;
  }
}

.input-field-h5 {
  width: 100%;
  height: 48px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #0f172a;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;

  &:focus {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  &.is-error-h5 {
    border-color: #ef4444;
    background: #fef2f2;

    &:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.error-text-h5 {
  display: block;
  font-size: 13px;
  color: #ef4444;
  margin-top: 6px;
  padding-left: 4px;
  font-weight: 500;
  animation: fadeSlideIn-h5 0.2s ease;
}

.date-range-error-h5 {
  margin-top: 8px;
  padding: 10px 16px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
  text-align: center;
  font-size: 13px;
}

@keyframes fadeSlideIn-h5 {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.slot-selector-wrapper-h5 {
  margin-bottom: 4px;
}

.slot-picker-display-h5 {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px dashed #a5b4fc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  padding: 0 16px;
  box-sizing: border-box;

  &.has-value-h5 {
    border-style: solid;
    border-color: #6366f1;
    background: linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%);
  }

  &:active { transform: scale(0.98); }

  .slot-picker-icon-h5 {
    font-size: 18px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .slot-picker-text-h5 {
    flex: 1;
    font-size: 15px;
    color: #4338ca;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot-picker-arrow-h5 {
    font-size: 14px;
    color: #6366f1;
    margin-left: 8px;
    flex-shrink: 0;
  }
}

.divider-line-h5 {
  display: flex;
  align-items: center;
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
  position: relative;

  .divider-text-h5 {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 16px;
    font-size: 13px;
    color: #94a3b8;
    background: #ffffff;
    flex-shrink: 0;
  }
}

.date-picker-row-h5 {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.col-half-h5 {
  flex: 1;
  min-width: 0;
}

.picker-display-h5 {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: #c7d2fe;
  }

  &.has-value-h5 {
    border-color: #c7d2fe;
    background: #eef2ff;
  }

  &.is-error-h5 {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .display-text-h5 {
    width: 100%;
    padding: 0 16px;
    font-size: 15px;
    color: #0f172a;
    text-align: left;
  }
}

.weekday-section-h5 {
  margin-top: 0;
}

.weekday-grid-h5 {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.weekday-tag-h5 {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #f1f5f9;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  .weekday-label-h5 {
    font-size: 18px;
    font-weight: 600;
    color: #64748b;
    transition: color 0.25s;
  }

  &:active { transform: scale(0.9); }

  &.active-h5 {
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);

    .weekday-label-h5 { color: #4338ca; }
  }
}

.weekday-actions-h5 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.weekday-action-group-h5 {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weekday-action-link-h5 {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;

  &:active { opacity: 0.7; }

  &.disabled-h5 {
    color: #cbd5e1;
    cursor: default;
    pointer-events: none;
  }
}

.weekday-action-divider-h5 {
  font-size: 14px;
  color: #cbd5e1;
}

.selected-count-h5 {
  font-size: 14px;
  color: #94a3b8;

  .count-num-h5 {
    color: #6366f1;
    font-weight: 700;
    font-size: 16px;
  }
}

.weekday-locations-section-h5 {
  margin-top: 16px;
}

.weekday-location-row-h5 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.location-day-label-h5 {
  width: 48px;
  font-size: 15px;
  font-weight: 700;
  color: #4338ca;
  text-align: center;
  flex-shrink: 0;
}

.location-input-h5 {
  flex: 1;
  height: 44px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 15px;
  color: #0f172a;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;

  &:focus {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.action-bar-h5 {
  display: flex;
  gap: 16px;
}

.btn-h5 {
  flex: 1;
  height: 52px;
  line-height: 52px;
  text-align: center;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
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

.btn-primary-h5 {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);

  &:hover {
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  }
}

.btn-secondary-h5 {
  background: #f1f5f9;
  color: #64748b;

  &:hover {
    background: #e2e8f0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
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
  }

  .header-back-icon-mp {
    font-size: 20px;
    color: #6366f1;
    font-weight: 300;
    line-height: 1;
  }

  .header-title-mp {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .header-placeholder-mp {
    width: 36px;
  }
}

.content-mp {
  padding: 12px 14px 32px;
  box-sizing: border-box;
}

.form-section-mp {
  margin-bottom: 12px;
}

.form-card-mp {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  .card-title-mp {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f1f5f9;

    .card-icon-mp {
      font-size: 16px;
    }

    .card-title-text-mp {
      font-size: 15px;
      font-weight: 700;
    }
  }
}

.input-group-mp {
  margin-bottom: 10px;
}

.label-text-mp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 600;

  .label-icon-mp {
    font-size: 11px;
  }

  .label-content-mp {
    font-size: 12px;
  }

  .required-mp {
    color: #ef4444;
    margin-left: 2px;
  }
}

.input-field-mp {
  width: 100%;
  min-height: 44px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: #1e293b;
  box-sizing: border-box;
  border: 1.5px solid #e2e8f0;

  &.is-error-mp {
    border-color: #ef4444;
    background: #fef2f2;
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.error-text-mp {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
  padding-left: 2px;
  font-weight: 500;
}

.date-range-error-mp {
  margin-top: 6px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
  text-align: center;
  font-size: 11px;
}

.slot-selector-wrapper-mp {
  margin-bottom: 4px;
}

.slot-picker-display-mp {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1.5px dashed #a5b4fc;
  border-radius: 8px;
  padding: 0 10px;
  box-sizing: border-box;

  &.has-value-mp {
    border-style: solid;
    border-color: #6366f1;
    background: linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%);
  }

  &:active { opacity: 0.85; }

  .slot-picker-icon-mp {
    font-size: 14px;
    margin-right: 6px;
    flex-shrink: 0;
  }

  .slot-picker-text-mp {
    flex: 1;
    font-size: 13px;
    color: #4338ca;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot-picker-arrow-mp {
    font-size: 12px;
    color: #6366f1;
    margin-left: 6px;
    flex-shrink: 0;
  }
}

.divider-line-mp {
  display: flex;
  align-items: center;
  height: 1px;
  background: #e2e8f0;
  margin: 12px 0;
  position: relative;

  .divider-text-mp {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 12px;
    font-size: 11px;
    color: #94a3b8;
    background: #fff;
    flex-shrink: 0;
  }
}

.date-picker-row-mp {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.col-half-mp {
  flex: 1;
  min-width: 0;
}

.picker-display-mp {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  box-sizing: border-box;

  &.has-value-mp {
    border-color: #c7d2fe;
    background: #eef2ff;
  }

  &.is-error-mp {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .display-text-mp {
    width: 100%;
    padding: 0 10px;
    font-size: 13px;
    color: #1e293b;
    text-align: left;
  }
}

.weekday-section-mp {
  margin-top: 0;
}

.weekday-grid-mp {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.weekday-tag-mp {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f1f5f9;
  border: 2px solid transparent;

  .weekday-label-mp {
    font-size: 15px;
    font-weight: 600;
    color: #64748b;
  }

  &:active { opacity: 0.85; }

  &.active-mp {
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    border-color: #6366f1;

    .weekday-label-mp { color: #4338ca; }
  }
}

.weekday-actions-mp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.weekday-action-group-mp {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weekday-action-link-mp {
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;

  &:active { opacity: 0.7; }

  &.disabled-mp {
    color: #cbd5e1;
  }
}

.weekday-action-divider-mp {
  font-size: 12px;
  color: #cbd5e1;
}

.selected-count-mp {
  font-size: 12px;
  color: #94a3b8;

  .count-num-mp {
    color: #6366f1;
    font-weight: 700;
    font-size: 14px;
  }
}

.weekday-locations-section-mp {
  margin-top: 10px;
}

.weekday-location-row-mp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 4px 0;
}

.location-day-label-mp {
  width: 32px;
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  text-align: center;
  flex-shrink: 0;
}

.location-input-mp {
  flex: 1;
  min-height: 40px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #1e293b;
  box-sizing: border-box;
  border: 1.5px solid #e2e8f0;

  &::placeholder {
    color: #94a3b8;
  }
}

.action-bar-mp {
  display: flex;
  gap: 10px;
}

.btn-mp {
  flex: 1;
  min-height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;

  &::after { border: none; }
  &:active { opacity: 0.85; }
}

.btn-primary-mp {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.btn-secondary-mp {
  background: #f1f5f9;
  color: #64748b;
}
/* #endif */
</style>
