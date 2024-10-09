import { defineConfig } from 'vite'
import { sharedConfig } from './vite.config.mjs'
import { isDev, r } from './scripts/utils'
import packageJson from './package.json'

// 使用 Vite 打包 content script
export default defineConfig({
  // 合并共享配置
  ...sharedConfig,
  define: {
    /**
     * 是否为开发环境
     */
    '__DEV__': isDev,
    /**
     * 项目名称，来自 package.json
     */
    '__NAME__': JSON.stringify(packageJson.name),
    /**
     * 设置环境变量，开发环境为 'development'，生产环境为 'production'
     * 解决 Vite issue:
     * @see https://github.com/vitejs/vite/issues/9320
     * @see https://github.com/vitejs/vite/issues/9186
     */
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  build: {
    /**
     * 开发环境下启用文件监听
     */
    watch: isDev ? {} : undefined,
    /**
     * 输出目录，指定为扩展的 content scripts 的路径
     */
    outDir: r('extension/dist/contentScripts'),
    /**
     * 禁用 CSS 代码拆分，所有 CSS 文件将合并到一起
     */
    cssCodeSplit: false,
    /**
     * 不清空输出目录，保留已有文件
     */
    emptyOutDir: false,
    /**
     * 开发环境下启用内联 source map，生产环境则禁用
     */
    sourcemap: isDev ? 'inline' : false,
    lib: {
      /**
       * 指定 content script 的入口文件
       */
      entry: r('src/contentScripts/index.ts'),
      /**
       * 使用 package.json 中的项目名称作为库名
       */
      name: packageJson.name,
      /**
       * 打包格式为 iife（立即调用函数表达式），适用于浏览器环境
       */
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        /**
         * 指定入口文件的输出文件名
         */
        entryFileNames: 'index.global.js',
        /**
         * 将输出结果扩展到现有对象，而不是覆盖
         */
        extend: true,
      },
    },
  },
})
