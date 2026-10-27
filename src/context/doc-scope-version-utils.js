/**
 * 文档范围：版本比较与匹配。
 *
 * 具体实现集中在 doc-scope-filter-core.mjs（浏览器 / 索引器 / 构建期共用），
 * 这里只做转发，避免多份规则漂移。
 */
export {
  compareVersions,
  parseVersionExpression,
  parseVersionScopeList,
  versionMatchesOperator,
  matchVersion,
} from './doc-scope-filter-core.mjs';
