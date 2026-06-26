<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 课程数据（单条记录兼容） */
  course: { type: Object, required: true },
  /** 是否显示操作按钮 */
  showActions: { type: Boolean, default: false },
  /** 是否为分组模式（多条时段合并为一张卡片） */
  grouped: { type: Boolean, default: false }
});

defineEmits(['edit', 'delete']);

const accentColors = [
  '#6366f1', '#8b5cf6', '#10b981', '#f59e0b',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6'
];

const accentColor = computed(() => {
  const subject = props.course.subject || '';
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return accentColors[Math.abs(hash) % accentColors.length];
});

/** 时段列表（分组模式下取 timeSlots，否则用单个 timeDisplay） */
const timeSlotList = computed(() => {
  if (props.grouped && props.course.timeSlots?.length) {
    return props.course.timeSlots;
  }
  const t = props.course.timeDisplay;
  return t ? [t] : [];
});

/** 地点列表（分组模式下多地点去重） */
const locationList = computed(() => {
  if (props.grouped && props.course.locationList?.length) {
    return [...new Set(props.course.locationList)];
  }
  return props.course.location ? [props.course.location] : [];
});

/** 是否有多条地点 */
const hasMultiLocations = computed(() => locationList.value.length > 1);
</script>

<template>
  <view class="course-card" :class="{ 'is-grouped': grouped }">
    <view class="accent-bar" :style="{ backgroundColor: accentColor }"></view>

    <view class="card-main">
      <!-- 头部：课程名 -->
      <view class="card-header">
        <text class="subject">{{ course.subject }}</text>
      </view>

      <!-- 时段列表 -->
      <view class="time-slot-list" v-if="timeSlotList.length > 0">
        <view
          class="time-slot-item"
          v-for="(slot, si) in timeSlotList"
          :key="si"
        >
          <view class="slot-dot" :style="{ backgroundColor: accentColor }"></view>
          <text class="slot-text">{{ slot }}</text>
          <!-- 如果多条地点一一对应，显示对应地点 -->
          <text
            class="slot-location"
            v-if="hasMultiLocations && course.locationList && course.locationList[si]"
          >
            {{ course.locationList[si] }}
          </text>
        </view>
      </view>

      <!-- 教师 & 地点 -->
      <view class="card-body">
        <view class="meta-row">
          <text class="meta-item">👨‍🏫 {{ course.teacher }}</text>
          <text class="meta-dot"></text>
          <text class="meta-item" v-if="!hasMultiLocations">
            📍 {{ course.location || '待定' }}
          </text>
          <text class="meta-item" v-else>
            📍 {{ locationList.join('、') }}
          </text>
          <text class="meta-dot" v-if="course.dateRange"></text>
          <text class="meta-item date-range" v-if="course.dateRange">
            📅 {{ course.dateRange }}
          </text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="card-actions" v-if="showActions">
      <button class="act-btn edit" @click.stop="$emit('edit', course)">
        <text>编辑</text>
      </button>
      <button class="act-btn del" @click.stop="$emit('delete')">
        <text>删除</text>
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.course-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: stretch;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
    border-color: #e2e8f0;
  }

  &:active {
    transform: translateY(-1px) scale(0.995);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition-duration: 0.1s;
  }

  .accent-bar {
    width: 4px;
    min-height: 100%;
    flex-shrink: 0;
    border-radius: 0 3px 3px 0;
  }

  .card-main {
    flex: 1;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-header {
    .subject {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
  }

  /* ===== 时段列表（核心优化） ===== */
  .time-slot-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .time-slot-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #f8fafc;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;

      .slot-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .slot-text {
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
      }

      .slot-location {
        color: #94a3b8;
        font-size: 11px;
        margin-left: 2px;
        &::before {
          content: '@';
          margin-right: 1px;
          color: #94a3b8;
        }
      }
    }
  }

  .card-body {
    .meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .meta-item {
        font-size: 12px;
        color: #64748b;
        line-height: 1.4;

        &.date-range {
          color: #94a3b8;
          font-size: 11px;
        }
      }

      .meta-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #cbd5e1;
        flex-shrink: 0;
      }
    }
  }

  .card-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    border-left: 1px solid #f1f5f9;
    background: linear-gradient(to left, #fafbfc, transparent);

    .act-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 64px;
      height: 28px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      /* 重置微信小程序 button 默认样式 */
      margin: 0;
      padding: 0;
      outline: none;
      &::after { border: none; }

      &.edit {
        background: #ffffff;
        color: #6366f1;
        border: 1px solid #c7d2fe;

        &:hover {
          background: #eef2ff;
          border-color: #a5b4fc;
          transform: scale(1.03);
        }

        &:active {
          background: #e0e7ff;
          transform: scale(0.96);
        }
      }

      &.del {
        background: #fef2f2;
        color: #ef4444;
        border: 1px solid #fecaca;

        &:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          transform: scale(1.03);
        }

        &:active {
          background: #fecaca;
          transform: scale(0.96);
        }
      }
    }
  }
}
</style>
