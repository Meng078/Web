<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCurrentUser, removeCurrentUser } from '@/utils/session.js';

const currentUser = ref(null);

onShow(() => {
  const user = getCurrentUser();
  if (user) {
    currentUser.value = user;
  } else {
    currentUser.value = null;
  }
});

const goToSchedule = () => {
  // 优先使用 navigateBack 返回上一页（保持页面状态、有返回动画）
  // 若 mine 是页面栈第一页（如登录/注册成功后直接进入），降级为 reLaunch 到课表首页
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/index/index' });
  }
};

const goToLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const goToRegister = () => {
  uni.navigateTo({ url: "/pages/register/index" });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        removeCurrentUser();
        currentUser.value = null;
        uni.reLaunch({ url: '/pages/login/index' });
      }
    }
  });
};

const userInfoItems = [
  { label: '账号类型', field: 'user_type', valueMap: { teacher: '教师', student: '学生' }, default: '--' },
  { label: '用户名', field: 'username', default: '--' },
  { label: '登录状态', field: null, staticValue: '已登录' },
];
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page-h5">
    <!-- 固定顶部导航栏 -->
    <view class="topbar-h5">
      <view class="topbar-inner">
        <text class="topbar-title">个人信息</text>
      </view>
    </view>

    <view class="content-h5">
      <view class="layout-h5">
        <!-- 左侧：个人资料 -->
        <view class="left-col-h5">
          <!-- 用户卡片 -->
          <view class="user-card-h5" v-if="currentUser">
            <view class="user-row-h5">
              <view class="avatar-wrap-h5">
                <text class="avatar-emoji-h5">{{ currentUser.user_type === 'teacher' ? '👨‍🏫' : '🎓' }}</text>
              </view>
              <view class="user-meta-h5">
                <text class="user-name-h5">{{ currentUser.name }}</text>
                <view class="user-tags-h5">
                  <text class="tag-h5 tag-type-h5">{{ currentUser.user_type === 'teacher' ? '教师' : '学生' }}</text>
                  <text class="tag-h5 tag-id-h5">{{ currentUser.username }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="user-card-h5 user-card-guest-h5" v-else @click="goToLogin()">
            <view class="user-row-h5">
              <view class="avatar-wrap-h5 avatar-guest-h5">
                <text class="avatar-emoji-h5">👤</text>
              </view>
              <view class="user-meta-h5">
                <text class="user-name-h5">未登录</text>
                <text class="user-guest-tip-h5">点击登录以使用完整功能</text>
              </view>
              <text class="login-arrow-h5">›</text>
            </view>
          </view>

          <!-- 信息列表 -->
          <view class="info-section-h5" v-if="currentUser">
            <view class="info-row-h5" v-for="(item, idx) in userInfoItems" :key="idx">
              <text class="info-label-h5">{{ item.label }}</text>
              <view class="info-value-wrap-h5">
                <text class="info-value-h5">{{ item.field ? (item.valueMap ? item.valueMap[currentUser[item.field]] || currentUser[item.field] : currentUser[item.field]) : item.staticValue }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 右侧：操作按钮 -->
        <view class="right-col-h5">
          <view class="action-panel-h5">
            <text class="action-panel-title-h5">快捷操作</text>
            <view class="action-list-h5">
              <view v-if="currentUser" class="action-item-h5 logout-item-h5" @click="handleLogout()">
                <text class="action-item-icon-h5">🚪</text>
                <text class="action-item-text-h5">退出登录</text>
              </view>
              <template v-else>
                <view class="action-item-h5 login-item-h5" @click="goToLogin()">
                  <text class="action-item-icon-h5">🔑</text>
                  <text class="action-item-text-h5">登录</text>
                </view>
                <view class="action-item-h5 register-item-h5" @click="goToRegister()">
                  <text class="action-item-icon-h5">📝</text>
                  <text class="action-item-text-h5">注册</text>
                </view>
              </template>
              <view class="action-item-h5 schedule-item-h5" @click="goToSchedule()">
                <text class="action-item-icon-h5">📅</text>
                <text class="action-item-text-h5">返回课表</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="page-mp">
    <!-- 简洁头部 -->
    <view class="header-mp">
      <view class="header-back-mp" @click="goToSchedule()">
        <text class="header-back-icon-mp">‹</text>
      </view>
      <text class="header-title-mp">个人信息</text>
      <view class="header-placeholder-mp"></view>
    </view>

    <view class="content-mp">
      <!-- 用户卡片 -->
      <view class="user-card-mp" v-if="currentUser">
        <view class="user-row-mp">
          <view class="avatar-wrap-mp">
            <text class="avatar-emoji-mp">{{ currentUser.user_type === 'teacher' ? '👨‍🏫' : '🎓' }}</text>
          </view>
          <view class="user-meta-mp">
            <text class="user-name-mp">{{ currentUser.name }}</text>
            <view class="user-tags-mp">
              <text class="tag-mp tag-type-mp">{{ currentUser.user_type === 'teacher' ? '教师' : '学生' }}</text>
              <text class="tag-mp tag-id-mp">{{ currentUser.username }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="user-card-mp user-card-guest-mp" v-else @click="goToLogin()">
        <view class="user-row-mp">
          <view class="avatar-wrap-mp avatar-guest-mp">
            <text class="avatar-emoji-mp">👤</text>
          </view>
          <view class="user-meta-mp">
            <text class="user-name-mp">未登录</text>
            <text class="user-guest-tip-mp">点击登录以使用完整功能</text>
          </view>
          <text class="login-arrow-mp">›</text>
        </view>
      </view>

      <!-- 信息列表 -->
      <view class="info-section-mp" v-if="currentUser">
        <view class="info-row-mp" v-for="(item, idx) in userInfoItems" :key="idx">
          <text class="info-label-mp">{{ item.label }}</text>
          <view class="info-value-wrap-mp">
            <text class="info-value-mp">{{ item.field ? (item.valueMap ? item.valueMap[currentUser[item.field]] || currentUser[item.field] : currentUser[item.field]) : item.staticValue }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section-mp">
        <view v-if="currentUser" class="action-btn-mp logout-btn-mp" @click="handleLogout()">
          <text class="action-btn-text-mp">退出登录</text>
        </view>
        <view v-else class="btn-row-mp">
          <view class="action-btn-mp login-btn-mp" @click="goToLogin()">
            <text class="action-btn-text-mp">登录</text>
          </view>
          <view class="action-btn-mp register-btn-mp" @click="goToRegister()">
            <text class="action-btn-text-mp">注册</text>
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
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topbar-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .topbar-action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.1);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      background: rgba(99, 102, 241, 0.18);
      transform: translateY(-1px);
    }

    &:active { transform: scale(0.96); }

    .topbar-action-text {
      font-size: 15px;
      font-weight: 600;
      color: #6366f1;
    }

    .topbar-action-arrow {
      font-size: 16px;
      color: #6366f1;
      font-weight: 700;
    }
  }
}

.content-h5 {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 32px 48px;
  box-sizing: border-box;
}

.layout-h5 {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.left-col-h5 {
  flex: 1;
  min-width: 0;
}

.right-col-h5 {
  flex: 0 0 320px;
}

.user-card-h5 {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.28);
  }

  &.user-card-guest-h5 {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
    }
  }

  .user-row-h5 {
    display: flex;
    align-items: center;
  }

  .avatar-wrap-h5 {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;

    &.avatar-guest-h5 {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .avatar-emoji-h5 {
    font-size: 32px;
  }

  .user-meta-h5 {
    flex: 1;
    min-width: 0;
  }

  .user-name-h5 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    display: block;
    margin-bottom: 8px;
  }

  .user-tags-h5 {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tag-h5 {
    font-size: 13px;
    padding: 4px 12px;
    border-radius: 10px;
    font-weight: 500;
  }

  .tag-type-h5 {
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
  }

  .tag-id-h5 {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
  }

  .user-guest-tip-h5 {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
    display: block;
    margin-top: 4px;
  }

  .login-arrow-h5 {
    font-size: 28px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
    margin-left: 12px;
  }
}

.info-section-h5 {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;

  .info-row-h5 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    transition: background 0.15s;

    &:hover { background: #f8fafc; }

    &:not(:last-child) {
      border-bottom: 1px solid #f1f5f9;
    }

    .info-label-h5 {
      font-size: 16px;
      color: #64748b;
      font-weight: 500;
    }

    .info-value-wrap-h5 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-value-h5 {
      font-size: 16px;
      color: #0f172a;
      font-weight: 600;
    }
  }
}

.action-panel-h5 {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;

  .action-panel-title-h5 {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f1f5f9;
  }

  .action-list-h5 {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-item-h5 {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:active { transform: scale(0.97); }

    .action-item-icon-h5 {
      font-size: 20px;
    }

    .action-item-text-h5 {
      font-size: 16px;
      font-weight: 600;
    }

    &.logout-item-h5 {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;

      &:hover {
        background: #fee2e2;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
      }
    }

    &.login-item-h5 {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
      }
    }

    &.register-item-h5 {
      background: #f8fafc;
      color: #6366f1;
      border: 1px solid #6366f1;

      &:hover {
        background: rgba(99, 102, 241, 0.06);
        transform: translateY(-2px);
      }
    }

    &.schedule-item-h5 {
      background: #f0f9ff;
      color: #0284c7;
      border: 1px solid #bae6fd;

      &:hover {
        background: #e0f2fe;
        transform: translateY(-2px);
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
  background: #f0f2f5;
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
  padding: 12px 16px 32px;
  box-sizing: border-box;
}

.user-card-mp {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
  margin-bottom: 12px;

  &.user-card-guest-mp {
    &:active { transform: scale(0.98); }
  }

  .user-row-mp {
    display: flex;
    align-items: center;
  }

  .avatar-wrap-mp {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    flex-shrink: 0;

    &.avatar-guest-mp {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .avatar-emoji-mp {
    font-size: 24px;
  }

  .user-meta-mp {
    flex: 1;
    min-width: 0;
  }

  .user-name-mp {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    display: block;
    margin-bottom: 4px;
  }

  .user-tags-mp {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tag-mp {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 500;
  }

  .tag-type-mp {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .tag-id-mp {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.75);
  }

  .user-guest-tip-mp {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    display: block;
    margin-top: 2px;
  }

  .login-arrow-mp {
    font-size: 22px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
    margin-left: 8px;
  }
}

.info-section-mp {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;

  .info-row-mp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    min-height: 44px;

    &:not(:last-child) {
      border-bottom: 1px solid #f1f5f9;
    }

    .info-label-mp {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .info-value-wrap-mp {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-value-mp {
      font-size: 14px;
      color: #1e293b;
      font-weight: 600;
    }
  }
}

.action-section-mp {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-btn-mp {
  min-height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  box-sizing: border-box;

  &:active { opacity: 0.85; }

  .action-btn-text-mp {
    font-size: 14px;
    font-weight: 600;
  }
}

.logout-btn-mp {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.btn-row-mp {
  display: flex;
  gap: 12px;
  width: 100%;
}

.login-btn-mp {
  flex: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
}

.register-btn-mp {
  flex: 1;
  background: #ffffff;
  color: #6366f1;
  border: 1px solid #6366f1;
}
/* #endif */
</style>
