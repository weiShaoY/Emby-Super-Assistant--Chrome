/* eslint-disable no-console */
import { onMessage } from 'webext-bridge/content-script' // 引入 webext-bridge 的 onMessage，用于消息通信
import { createApp } from 'vue' // 引入 Vue 的 createApp 方法，用于创建应用实例
import App from './views/App.vue' // 引入 Vue 组件 App
import { setupApp } from '~/logic/common-setup' // 引入通用设置函数 setupApp

/**
 * 初始化内容脚本，进行页面挂载和消息监听
 */
(() => {
  /**
   * 输出欢迎信息到控制台，提示内容脚本启动成功
   */
  console.info('[vitesse-webext] Hello world from content script')

  /**
   * 监听来自后台脚本的消息
   * @param {string} 'tab-prev' - 消息名称，表示前一个标签页
   * @param {object} data - 消息中包含的数据
   */
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })

  /**
   * 创建挂载 Vue 应用的 DOM 容器
   * @returns {HTMLDivElement} - 返回创建的 div 容器
   */
  const container = document.createElement('div')
  container.id = __NAME__ // 使用占位符设置容器的 ID

  /**
   * 创建应用的根元素
   * @returns {HTMLDivElement} - 返回创建的根 div
   */
  const root = document.createElement('div')

  /**
   * 创建用于加载样式表的 link 标签
   * @returns {HTMLLinkElement} - 返回创建的 link 标签
   */
  const styleEl = document.createElement('link')

  /**
   * 设置 Shadow DOM
   * 根据环境变量 `__DEV__` 确定 Shadow DOM 的模式
   * @returns {ShadowRoot | HTMLDivElement} - 返回 Shadow DOM 或 container 本身
   */
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container

  /**
   * 设置样式表的属性
   */
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))

  /**
   * 将样式表和根元素添加到 Shadow DOM
   */
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)

  /**
   * 将容器元素添加到当前页面的 body 中
   */
  document.body.appendChild(container)

  /**
   * 创建并初始化 Vue 应用实例
   * @returns {App} - 返回 Vue 应用实例
   */
  const app = createApp(App)

  /**
   * 执行应用的通用设置逻辑
   * @param {App} app - 传入的 Vue 应用实例
   */
  setupApp(app)

  /**
   * 将 Vue 应用实例挂载到根元素
   */
  app.mount(root)
})()
