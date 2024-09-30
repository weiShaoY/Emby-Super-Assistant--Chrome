import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

/**
 * 使用 `useWebExtensionStorage` 进行数据存储
 * @type {string} storageDemo - 存储在 webext 中的示例数据，默认值为 'Storage Demo'
 */
export const storageDemo = useWebExtensionStorage('webext-demo', 'Storage Demo')
