/**
 * 定义一组禁止的协议和 URL 前缀，这些协议的页面无法进行脚本注入或操作
 * @type {string[]} forbiddenProtocols - 包含多个禁止的协议前缀的数组
 */
const forbiddenProtocols = [
  'chrome-extension://', // Chrome 扩展程序协议
  'chrome-search://', // Chrome 搜索页面
  'chrome://', // Chrome 内部页面
  'devtools://', // 开发者工具页面
  'edge://', // Edge 浏览器内部页面
  'https://chrome.google.com/webstore', // Chrome 网上应用商店
]

/**
 * 检查给定的 URL 是否属于禁止访问的 URL 列表中的某个协议
 * @param {string} url - 要检查的 URL
 * @returns {boolean} - 如果 URL 以某个禁止的协议开头，返回 true；否则返回 false
 */
export function isForbiddenUrl(url: string): boolean {
  return forbiddenProtocols.some(protocol => url.startsWith(protocol)) // 使用 some 方法判断 URL 是否匹配某个禁止协议
}

/**
 * 判断当前浏览器是否为 Firefox
 * @type {boolean} isFirefox - 如果浏览器的 userAgent 包含 'Firefox' 字符串，返回 true；否则返回 false
 */
export const isFirefox = navigator.userAgent.includes('Firefox') // 使用 userAgent 判断是否为 Firefox 浏览器
