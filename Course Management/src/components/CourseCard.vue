<script setup>
/**
 * CourseCard 课程卡片组件
 *
 * 可复用在 listCourse.vue 列表页和 index.vue 主页课程展示中。
 *
 * Props:
 *   - course       : Object  课程数据（含 subject, teacher, timeDisplay, dayDisplay, location 等）
 *   - showActions  : Boolean 是否显示"编辑/删除"操作按钮（列表页用）
 *
 * Emits:
 *   - edit   : 点击编辑按钮时触发，传递课程数据
 *   - delete : 点击删除按钮时触发，传递课程索引
 */
defineProps({
  course: {type: Object, required: true},
  showActions: {type: Boolean, default: false}
});

defineEmits(['edit', 'delete']);
</script>

<template>
  <view class="course-card">
    <view class="card-main">
      <view class="card-header">
        <text class="subject">{{ course.subject }}</text>
        <view class="tag" v-if="course.dayFriendly">
          {{ course.dayFriendly }}
        </view>
      </view>
      <view class="card-body">
        <text class="meta-line">
          🕐 {{ course.timeDisplay || '全天' }}
          &nbsp;|&nbsp; 👨‍🏫 {{ course.teacher }}
          &nbsp;|&nbsp; 📍 {{ course.location }}
        </text>
      </view>
    </view>

    <!-- 操作按钮区：仅在列表页展示 -->
    <view class="card-actions" v-if="showActions">
      <button class="act-btn edit" @click.stop="$emit('edit', course)">编辑</button>
      <button class="act-btn del" @click.stop="$emit('delete')">删除</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.course-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: stretch;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .card-main {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;

    .subject {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }

    .tag {
      font-size: 11px;
      background: #e0e7ff;
      color: #4338ca;
      padding: 3px 8px;
      border-radius: 6px;
    }
  }

  .meta-line {
    font-size: 14px;
    color: #64748b;
  }

  .card-actions {
    width: 100px;
    background: #f8fafc;
    border-left: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;

    .act-btn {
      width: 70%;
      height: 32px;
      border-radius: 16px;
      font-size: 13px;
      border: none;

      &.edit {
        background: #fff;
        color: #3b82f6;
        border: 1px solid #bfdbfe;
      }

      &.del {
        background: #fef2f2;
        color: #ef4444;
        border: 1px solid #fecaca;
      }
    }
  }
}
</style>
