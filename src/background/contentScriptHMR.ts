import { isFirefox, isForbiddenUrl } from '~/env' // 引入环境判断函数，用于判断是否为 Firefox 浏览器以及是否为禁止的 URL

/**
 * Firefox 从缓存中获取文件，而不是从磁盘重新加载更改，因此 HMR（热更新）不会像 Chromium 浏览器那样工作
 * 使用 webNavigation 事件监听器来检测浏览器导航的提交
 */
browser.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  /**
   * 过滤掉非主窗口的事件
   * @param {number} frameId - 如果 frameId 不为 0，则表示该事件不属于主窗口，直接返回
   */
  if (frameId !== 0)
    return

  /**
   * 如果当前 URL 是被禁止的地址，直接返回
   * @param {string} url - 当前页面的 URL
   */
  if (isForbiddenUrl(url))
    return

  /**
   * 在指定的标签页中注入最新的脚本
   * @param {number} tabId - 当前激活的标签页 ID
   * @param {object} { file: string, runAt: string } - 注入脚本的配置，指定文件路径和注入时机
   * 如果为 Firefox 浏览器，不添加路径前缀；如果为 Chromium 浏览器，添加 './' 前缀
   * runAt: 'document_end' 表示在文档加载完成后注入脚本
   */
  browser.tabs.executeScript(tabId, {
    file: `${isFirefox ? '' : '.'}/dist/contentScripts/index.global.js`, // 根据浏览器环境决定脚本路径
    runAt: 'document_end', // 在文档加载完成后执行脚本
  }).catch(error => console.error(error)) // 捕获并输出执行错误
})
