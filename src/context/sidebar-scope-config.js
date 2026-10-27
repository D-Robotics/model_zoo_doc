import { shouldShowDoc as shouldShowDocByConfig } from './doc-scope-filter-core.mjs';

/**
 * 侧边栏显示范围配置
 * 由 sidebar-scope-config-plugin 在 build/start 时生成至 .docusaurus/generated-sidebar-config.json
 * （不进 git；开发时 watch-sidebar-config 也会更新同一文件）
 *
 * 匹配逻辑（文档级优先、目录级取最深祖先、exclude 优先）统一在
 * doc-scope-filter-core.mjs 中实现，与 Algolia 索引器保持一致。
 */

let generatedFrontmatterConfig = {};
try {
  const configModule = require('@generated/generated-sidebar-config.json');
  generatedFrontmatterConfig = configModule || {};
} catch {
  generatedFrontmatterConfig = {};
}

/**
 * 检查指定 docId 的文档是否应该在当前版本/产品下显示
 * @param {string} docId 文档 ID
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {boolean} 是否显示
 */
export function shouldShowDoc(docId, version, product) {
  return shouldShowDocByConfig(docId, version, product, generatedFrontmatterConfig);
}

/**
 * 从侧边栏项目中递归查找第一个可见文档的路径
 * @param {Array} items 侧边栏项目数组
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {string|null} 第一个可见文档的 href，如果没有则返回 null
 */
export function findFirstVisibleDoc(items, version, product) {
  if (!items || !Array.isArray(items)) {
    return null;
  }

  for (const item of items) {
    if (item.type === 'link' && item.docId) {
      if (shouldShowDoc(item.docId, version, product)) {
        return item.href || null;
      }
    }

    if (item.type === 'category' && item.items) {
      const found = findFirstVisibleDoc(item.items, version, product);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * 检查文档是否应该显示（侧边栏用）
 * @param {object} item 侧边栏项
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {boolean} 是否显示
 */
export function shouldShowInSidebar(item, version, product) {
  const rawDocId = item.docId || '';
  return shouldShowDoc(rawDocId, version, product);
}
