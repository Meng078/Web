/**
 * API 请求模块
 * 封装所有与后端通信的 HTTP 请求
 *
 * 使用 uni.request 替代 fetch，兼容 H5 和微信小程序环境。
 *
 * Base URL 从配置文件中读取，真机调试时请修改 src/api/config.js
 * ★ 用于微信小程序正式发布时，请将 apiBaseURL 改为 HTTPS 公网地址 ★
 */

// ==================== 请求配置 ====================

import { apiBaseURL } from './config.js'
import { getToken, removeUserStorage } from '@/utils/session.js'
const BASE_URL = apiBaseURL

/**
 * 统一请求函数（使用 uni.request）
 *
 * ★ 重要：使用 callback 方式而非 .then() 链式调用
 * 微信小程序中 uni.request() 返回的是 requestTask 而非 Promise，
 * .then() 链式调用会抛出 TypeError，导致请求永远挂起。
 *
 * ★ 超时保障：使用 Promise.race 添加 JavaScript 层超时，
 * 防止 uni.request 的 timeout 参数在某些情况下不触发 fail 回调
 * 导致请求永久挂起。
 *
 * @param {string} endpoint - API 端点（如 '/courses'）
 * @param {object} options - 请求选项 { method, data, headers }
 * @returns {Promise<object>} 响应数据
 */
function uniRequest(endpoint, options = {}) {
  const REQUEST_TIMEOUT = 15000 // 请求超时（毫秒）

  const requestPromise = new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`
    const method = (options.method || 'GET').toUpperCase()
    const data = options.data || {}

    // 对于 GET 请求，将 data 参数拼接到 URL 上
    let requestUrl = url
    if (method === 'GET' && Object.keys(data).length > 0) {
      const params = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      requestUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`
    }

    const requestConfig = {
      url: requestUrl,
      method: method,
      data: method === 'GET' ? undefined : JSON.stringify(data),
      header: (() => {
        const headers = {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
        const token = getToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        return headers
      })(),
      dataType: 'json',
      // 微信小程序请求超时设置（毫秒）
      timeout: REQUEST_TIMEOUT,
      // ★ callback 方式（兼容 H5 和微信小程序） ★
      success(response) {
        const { statusCode, data: responseData } = response

        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData)
        } else {
          // 处理 HTTP 错误状态码
          const statusMessages = {
            400: '请求参数有误',
            401: '用户名或密码错误',
            404: '请求的资源不存在',
            409: '数据冲突，请检查后重试',
            500: '服务器内部错误，请稍后重试'
          }

          const errorMessage = (responseData && responseData.message) ||
            statusMessages[statusCode] ||
            '请求失败 (' + statusCode + ')'

          resolve({
            success: false,
            message: errorMessage,
            status: statusCode
          })
        }
      },
      fail(err) {
        console.error(`[API Error] ${endpoint}:`, err.message || err.errMsg || '未知错误')
        reject({
          success: false,
          message: '网络连接失败，请检查网络连接或后端服务是否正常'
        })
      }
    }

    uni.request(requestConfig)
  })

  // JavaScript 层超时保障：确保 Promise 不会永久挂起
  // 比 uni.request 的 timeout 多 2 秒缓冲，优先让原生超时触发
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        success: false,
        message: '请求超时，请检查网络连接或后端服务是否正常'
      })
    }, REQUEST_TIMEOUT + 2000)
  })

  return Promise.race([requestPromise, timeoutPromise])
}

/**
 * 清除前端课程数据缓存（用户专属键）
 * 在添加/修改/删除课程后调用，确保首页下次显示时获取最新数据
 */
function clearCourseCache() {
  try {
    removeUserStorage('cachedCourses')
  } catch (e) { /* 忽略写入错误 */ }
}

// =================== 认证相关 API ===================

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<object>} 登录结果
 */
export function loginAPI(username, password) {
  return uniRequest('/login', {
    method: 'POST',
    data: { username, password }
  })
}

/**
 * 用户注册
 * @param {object} userData - { username, password, name, user_type }
 * @returns {Promise<object>} 注册结果
 */
export function registerAPI(userData) {
  return uniRequest('/register', {
    method: 'POST',
    data: userData
  })
}

// =================== 课程相关 API ===================

/**
 * 获取所有课程
 * @returns {Promise<object>} 课程列表
 */
export function getCoursesAPI() {
  return uniRequest('/courses', {
    method: 'GET',
    data: { _t: Date.now() }
  })
}

/**
 * 添加新课程
 * @param {object} courseData - 课程数据
 * @returns {Promise<object>} 添加结果
 */
export async function addCourseAPI(courseData) {
  const result = await uniRequest('/courses', {
    method: 'POST',
    data: courseData
  })
  if (result.success !== false) clearCourseCache()
  return result
}

/**
 * 更新课程
 * @param {number} id - 课程 ID
 * @param {object} courseData - 要更新的字段
 * @returns {Promise<object>} 更新结果
 */
export async function updateCourseAPI(id, courseData) {
  const result = await uniRequest(`/courses/${id}`, {
    method: 'PUT',
    data: courseData
  })
  if (result.success !== false) clearCourseCache()
  return result
}

/**
 * 删除课程
 * @param {number} id - 课程 ID
 * @returns {Promise<object>} 删除结果
 */
export async function deleteCourseAPI(id) {
  const result = await uniRequest(`/courses/${id}`, { method: 'DELETE' })
  if (result.success !== false) clearCourseCache()
  return result
}
