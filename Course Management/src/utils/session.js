/**
 * Session 级用户存储工具
 *
 * 使用 uni.setStorageSync/uni.getStorageSync 替代 sessionStorage，
 * 兼容 H5 和微信小程序环境。
 * 包含 JWT Token 存储和会话过期机制。
 */

const USER_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';
const LOGIN_TIME_KEY = 'loginTime';
// 会话有效期：24 小时
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

/**
 * 获取当前登录用户（检查会话是否过期）
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const raw = uni.getStorageSync(USER_KEY);
    if (!raw) return null;

    // 检查会话是否过期
    const loginTime = uni.getStorageSync(LOGIN_TIME_KEY);
    if (loginTime && Date.now() - loginTime > SESSION_TIMEOUT) {
      removeCurrentUser();
      return null;
    }

    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * 保存当前登录用户和 Token
 * @param {object} user - 用户信息
 * @param {string} [token] - JWT Token（可选）
 */
export function setCurrentUser(user, token = null) {
  try {
    uni.setStorageSync(USER_KEY, JSON.stringify(user));
    uni.setStorageSync(LOGIN_TIME_KEY, Date.now());
    if (token) {
      uni.setStorageSync(TOKEN_KEY, token);
    }
  } catch (e) { /* 忽略写入错误 */ }
}

/**
 * 获取 JWT Token
 * @returns {string|null}
 */
export function getToken() {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
}

/**
 * 清除当前登录用户（退出登录或会话过期时调用）
 */
export function removeCurrentUser() {
  try {
    uni.removeStorageSync(USER_KEY);
    uni.removeStorageSync(TOKEN_KEY);
    uni.removeStorageSync(LOGIN_TIME_KEY);
  } catch (e) { /* 忽略 */ }
}

/**
 * 生成用户专属存储 Key（实现用户间数据隔离）
 * 将原始 key 加上当前用户名前缀，避免不同用户共享同一份数据
 * @param {string} key - 原始存储 key
 * @returns {string} 用户专属 key（未登录时返回原始 key）
 */
export function userKey(key) {
  try {
    const user = getCurrentUser();
    if (user && user.username) {
      return `u_${user.username}_${key}`;
    }
  } catch (e) { /* 忽略 */ }
  return key;
}

/**
 * 用户专属存储 - 读取
 * @param {string} key - 原始存储 key
 * @returns {any}
 */
export function getUserStorage(key) {
  try {
    return uni.getStorageSync(userKey(key));
  } catch (e) {
    return null;
  }
}

/**
 * 用户专属存储 - 写入
 * @param {string} key - 原始存储 key
 * @param {any} value - 存储值
 */
export function setUserStorage(key, value) {
  try {
    uni.setStorageSync(userKey(key), value);
  } catch (e) { /* 忽略 */ }
}

/**
 * 用户专属存储 - 删除
 * @param {string} key - 原始存储 key
 */
export function removeUserStorage(key) {
  try {
    uni.removeStorageSync(userKey(key));
  } catch (e) { /* 忽略 */ }
}
