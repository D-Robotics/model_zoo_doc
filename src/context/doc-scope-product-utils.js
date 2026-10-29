/**
 * 文档范围：产品匹配。
 *
 * 具体实现集中在 doc-scope-filter-core.mjs（浏览器 / 索引器 / 构建期共用），
 * 这里绑定当前站点的产品/版本矩阵后转发。
 */
import { createDocScopeCore } from './doc-scope-filter-core.mjs';
import { PRODUCT_VERSION_MATRIX, VERSION_PRODUCT_MATRIX } from './doc-scope-matrix.js';

const core = createDocScopeCore({
  VERSION_PRODUCT_MATRIX,
  PRODUCT_VERSION_MATRIX,
});

export {
  normalizeProductKey,
  productKeysEqual,
  normalizeProductSeriesKey,
  productBelongsToSeries,
  scopeProductsMatchCurrent,
} from './doc-scope-filter-core.mjs';

export const resolveCanonicalProduct = core.resolveCanonicalProduct;
export const normalizeScopeProductList = core.normalizeScopeProductList;
export const resolveProductForVersion = core.resolveProductForVersion;
export const resolveCanonicalProductKeyForMatrix = core.resolveCanonicalProductKeyForMatrix;
