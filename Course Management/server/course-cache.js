/**
 * Course Cache Module
 *
 * 服务端内存缓存模块。
 * 缓存课程数据到服务器内存中，后续请求直接返回缓存结果，
 * 完全跳过 MySQL 查询，实现亚毫秒级响应。
 *
 * 缓存会在课程数据被添加/修改/删除时自动失效。
 */

// 缓存数据
let cacheData = null;
let cacheTimestamp = 0;

// 缓存有效期（毫秒）
const CACHE_TTL = 30 * 1000; // 30 秒

/**
 * 获取缓存的课程数据
 * @returns {Array|null} 缓存的数据，若缓存不存在或已过期则返回 null
 */
function getCachedCourses() {
  if (!cacheData) return null;
  if (Date.now() - cacheTimestamp > CACHE_TTL) {
    // 缓存过期，清空
    cacheData = null;
    cacheTimestamp = 0;
    return null;
  }
  return cacheData;
}

/**
 * 设置课程数据缓存
 * @param {Array} data - 课程数据数组
 */
function setCachedCourses(data) {
  cacheData = data;
  cacheTimestamp = Date.now();
}

/**
 * 清除课程数据缓存
 * 在添加/修改/删除课程后调用，下次 GET 请求将重新查询 MySQL
 */
function invalidateCourseCache() {
  cacheData = null;
  cacheTimestamp = 0;
}

module.exports = {
  getCachedCourses,
  setCachedCourses,
  invalidateCourseCache
};
