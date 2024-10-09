import fs from 'fs-extra' // 引入 fs-extra 模块，用于文件操作
import type { Manifest } from 'webextension-polyfill' // 引入 WebExtension 的 Manifest 类型定义
import type PkgType from '../package.json' // 引入 package.json 文件的类型定义
import { isDev, isFirefox, port, r } from '../scripts/utils' // 从 utils 中引入几个工具函数和变量

/**
 * 异步函数，获取并返回 manifest 配置
 */
export async function getManifest() {
  /**
   * 读取 package.json 文件并解析为对象
   * @type {typeof PkgType}
   */
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  /**
   * 更新此文件来更新 manifest.json，可以根据需求进行条件处理
   * @type {Manifest.WebExtensionManifest}
   */
  const manifest: Manifest.WebExtensionManifest = {
    /**
     * 设置扩展的 manifest 版本为 3
     */
    manifest_version: 3,
    /**
     * 扩展的名称，优先使用 displayName，没有则使用包名
     */
    name: pkg.displayName || pkg.name,
    /**
     * 扩展的版本号
     */
    version: pkg.version,
    /**
     * 扩展的描述信息
     */
    description: pkg.description,
    /**
     * 扩展的默认操作
     */
    action: {
      /**
       * 扩展的默认图标
       */
      default_icon: './assets/icon-512.png',
      /**
       * 扩展的默认弹出页面
       */
      default_popup: './dist/popup/index.html',
    },
    options_ui: {
      /**
       * 扩展的设置页面
       */
      page: './dist/options/index.html',
      /**
       * 设置页面在标签页中打开
       */
      open_in_tab: true,
    },
    /**
     * 根据浏览器类型决定使用哪种后台脚本
     */
    background: isFirefox
      ? {
          /**
           * Firefox 中使用的后台脚本
           */
          scripts: ['dist/background/index.mjs'],
          /**
           * 模块类型为 'module'
           */
          type: 'module',
        }
      : {
          /**
           * Chromium 浏览器使用的后台 service worker
           */
          service_worker: './dist/background/index.mjs',
        },
    icons: {
      /**
       * 16px 尺寸的图标
       */
      16: './assets/icon-512.png',
      /**
       * 48px 尺寸的图标
       */
      48: './assets/icon-512.png',
      /**
       * 128px 尺寸的图标
       */
      128: './assets/icon-512.png',
    },
    permissions: [
      /**
       * 允许访问浏览器标签页的权限
       */
      'tabs',
      /**
       * 允许使用存储 API
       */
      'storage',
      /**
       * 允许当前激活的标签页权限
       */
      'activeTab',
      /**
       * 允许扩展使用侧边栏
       */
      'sidePanel',
    ],
    /**
     * 允许扩展访问所有 URL 的主机权限
     */
    host_permissions: ['*://*/*'],
    content_scripts: [
      {
        /**
         * 匹配所有 URL
         */
        matches: ['<all_urls>'],
        /**
         * 注入的内容脚本
         */
        js: ['dist/contentScripts/index.global.js'],

        /**
         *  确保页面加载完成后再注入脚本
         */
        // run_at: 'document_idle',
      },
    ],
    web_accessible_resources: [
      {
        /**
         * 可通过网页访问的资源
         */
        resources: ['dist/contentScripts/style.css'],
        /**
         * 资源可在所有 URL 上访问
         */
        matches: ['<all_urls>'],
      },
    ],
    content_security_policy: {
      /**
       * 设置扩展页面的内容安全策略
       */
      extension_pages: isDev
        /**
         * 开发模式下的 CSP 规则，允许本地开发服务器加载脚本
         */
        ? `script-src 'self' http://localhost:${port}; object-src 'self'`
        /**
         * 生产模式下的 CSP 规则
         */
        : 'script-src \'self\'; object-src \'self\'',
    },
  }

  /**
   * 如果是 Firefox 浏览器，添加 sidepanel 配置
   */
  if (isFirefox) {
    manifest.sidebar_action = {
      /**
       * 侧边栏的默认页面
       */
      default_panel: 'dist/sidepanel/index.html',
    }
  }
  else {
    /**
     * Chromium 浏览器不支持 sidebar_action，所以使用 side_panel
     */
    (manifest as any).side_panel = {
      /**
       * 侧边栏的默认路径
       */
      default_path: 'dist/sidepanel/index.html',
    }
  }

  /**
   * FIXME: 在 MV3 中不起作用
   */
  if (isDev && false) {
    /**
     * 对于内容脚本，由于浏览器会缓存每次的内容脚本，
     * 使用后台脚本始终注入最新版本
     */
    delete manifest.content_scripts
    /**
     * 添加 webNavigation 权限
     */
    manifest.permissions?.push('webNavigation')
  }

  /**
   * 返回构建的 manifest 对象
   */
  return manifest
}
