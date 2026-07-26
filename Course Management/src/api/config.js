/**
 * API 基础配置
 *
 * 【真机调试必读】
 * 将 apiBaseURL 改为开发电脑的局域网 IP 地址，例如：
 *   "http://192.168.1.100:3001/api"
 *
 * 查看方法：
 *   Windows: 打开 CMD 输入 ipconfig，找到 IPv4 地址
 *   macOS/Linux: 终端输入 ifconfig 或 ip addr
 *
 * 本地开发时（H5 + 模拟器）使用 Vite 代理，无需配置完整 URL
 * 微信小程序真机调试时请改为局域网 IP 地址
 */

// #ifdef H5
// H5 环境：开发时使用 Vite 代理（/api），生产环境使用完整 URL
export const apiBaseURL = import.meta.env.DEV
  ? '/api'
  : 'http://192.168.237.56:3001/api'
// #endif

// #ifndef H5
// 非 H5 环境（微信小程序等）：使用完整 URL
// ★ 真机调试时请改为局域网 IP，如：http://192.168.1.100:3001/api ★
export const apiBaseURL = 'http://192.168.237.56:3001/api'
// #endif
