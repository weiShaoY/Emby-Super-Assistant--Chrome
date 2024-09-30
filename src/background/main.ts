import { onMessage, sendMessage } from 'webext-bridge/background' // 引入 webext-bridge 中的消息传递函数
import type { Tabs } from 'webextension-polyfill' // 引入 Tabs 类型

/**
 * 仅在开发模式下启用
 */
if (import.meta.hot) {
  // @ts-expect-error 忽略背景脚本 HMR 的类型错误
  import('/@vite/client') // 加载 Vite 客户端以支持模块热替换
  /**
   * 加载最新的内容脚本，支持内容脚本的 HMR
   */
  import('./contentScriptHMR')
}

/**
 * 可选的侧边面板开关
 * 设置为 true 表示启用侧边面板
 */
const USE_SIDE_PANEL = true

/**
 * 如果使用侧边面板，则在 Chromium 中通过 action 按钮切换侧边面板
 */
if (USE_SIDE_PANEL) {
  // @ts-expect-error 缺少类型定义
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true }) // 设置点击动作按钮时打开面板
    .catch((error: unknown) => console.error(error)) // 捕获并输出错误信息
}

/**
 * 监听扩展安装事件
 * 当扩展被安装时，会输出安装消息
 */
browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

/**
 * 上一个标签页的 ID，初始为 0
 * @type {number}
 */
let previousTabId = 0

/**
 * 监听标签页激活事件
 * 当标签页激活时，发送前一个标签页的标题信息
 */
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId // 更新为当前标签页 ID
    return
  }

  let tab: Tabs.Tab

  try {
    /**
     * 获取上一个标签页的信息
     * @returns {Tabs.Tab} - 返回获取到的标签页对象
     */
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId // 更新为当前标签页 ID
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)

  /**
   * 发送前一个标签页的标题信息到内容脚本
   * @param {string} 'tab-prev' - 消息类型
   * @param {object} { title: tab.title } - 消息内容，包含前一个标签页的标题
   * @param {object} { context: 'content-script', tabId } - 发送的上下文和当前标签页 ID
   */
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

/**
 * 监听 "get-current-tab" 消息，获取当前标签页的标题
 * @returns {object} - 返回包含当前标签页标题的对象
 */
onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId) // 获取当前标签页的信息

    return {
      title: tab?.title, // 返回当前标签页的标题
    }
  }
  catch {
    return {
      title: undefined, // 如果获取失败，返回 undefined
    }
  }
})
