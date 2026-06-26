/**
 * Session 级用户存储工具
 *
 * 使用 uni.setStorageSync/uni.getStorageSync 替代 sessionStorage，
 * 兼容 H5 和微信小程序环境。
 * 在 App 启动时自动清除，模拟 session 行为。
 */

const KEY = 'currentUser';

/**
 * 获取当前登录用户
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const raw = uni.getStorageSync(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * 保存当前登录用户
 * @param {object} user
 */
export function setCurrentUser(user) {
  try {
    uni.setStorageSync(KEY, JSON.stringify(user));
  } catch (e) { /* 忽略写入错误 */ }
}

/**
 * 清除当前登录用户（退出登录时调用）
 */
export function removeCurrentUser() {
  try {
    uni.removeStorageSync(KEY);
  } catch (e) { /* 忽略 */ }
}
