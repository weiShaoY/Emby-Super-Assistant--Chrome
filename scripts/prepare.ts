import { execSync } from 'node:child_process' // 引入子进程模块，用于执行同步命令
import fs from 'fs-extra' // 引入 fs-extra 模块，用于文件系统操作
import chokidar from 'chokidar' // 引入 chokidar 模块，用于文件监控
import { isDev, log, port, r } from './utils' // 引入自定义工具函数和变量

/**
 * 在开发模式下生成 stub index.html 文件，用于与 Vite 配合启动开发服务器
 * @returns {Promise<void>} - 异步函数无返回值
 */
async function stubIndexHtml() {
  /**
   * 需要生成 stub 文件的视图列表
   */
  const views = ['options', 'popup', 'sidepanel']

  for (const view of views) {
    /**
     * 确保目标文件夹存在
     */
    await fs.ensureDir(r(`extension/dist/${view}`))

    /**
     * 读取源 index.html 文件内容
     */
    let data = await fs.readFile(r(`src/${view}/index.html`), 'utf-8')

    /**
     * 替换 main.ts 文件的路径为开发服务器地址
     */
    data = data
      .replace('"./main.ts"', `"http://localhost:${port}/${view}/main.ts"`)
      /**
       * 替换开发服务器未启动时的提示
       */
      .replace('<div id="app"></div>', '<div id="app">Vite server did not start</div>')

    /**
     * 将修改后的内容写入到目标文件夹中的 index.html
     */
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, 'utf-8')

    /**
     * 记录日志，表示 stub 文件已生成
     */
    log('PRE', `stub ${view}`)
  }
}

/**
 * 执行 manifest.ts 文件来生成扩展程序的 manifest.json
 * 使用 execSync 同步执行命令
 */
function writeManifest() {
  execSync('npx esno ./scripts/manifest.ts', { stdio: 'inherit' }) // 使用 esno 执行 TypeScript 文件生成 manifest
}

/**
 * 初始化时生成 manifest 文件
 */
writeManifest()

// 如果处于开发模式，则开始监视文件变化
if (isDev) {
  /**
   * 生成 stub index.html 文件
   */
  stubIndexHtml()

  /**
   * 监视 src 目录下的所有 HTML 文件，如果有改动，则重新生成 stub 文件
   */
  chokidar.watch(r('src/**/*.html'))
    .on('change', () => {
      stubIndexHtml()
    })

  /**
   * 监视 manifest.ts 和 package.json 文件的变化，发生改动时重新生成 manifest 文件
   */
  chokidar.watch([r('src/manifest.ts'), r('package.json')])
    .on('change', () => {
      writeManifest()
    })
}
