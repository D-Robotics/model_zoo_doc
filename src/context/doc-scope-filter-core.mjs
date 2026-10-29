/**
 * Doc scope filtering kernel.
 *
 * This module is intentionally dependency-free (no imports, no template
 * strings) so the exact same source can be used in three places:
 *
 *   1. the browser (React context / hydration)
 *   2. the Algolia indexer (Node)
 *   3. a build-time inline script, if one is ever needed
 *
 * Keeping a single implementation is what guarantees that the indexed scope
 * and the runtime scope never drift apart.
 */

/* -------------------------------------------------------------------------- */
/* Versions                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Compare two dotted versions.
 * @param {string} v1
 * @param {string} v2
 * @returns {number} -1 when v1 < v2, 0 when equal, 1 when v1 > v2
 */
export function compareVersions(v1, v2) {
  const parts1 = String(v1).split('.').map(Number);
  const parts2 = String(v2).split('.').map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i += 1) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Parse "4.0.5", "> 4.0.5", ">=4.0.5", "<5.1.0", "<= 5.1.0".
 * @param {string} versionStr
 * @returns {{operator: string, version: string}|null}
 */
export function parseVersionExpression(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return null;
  }
  let trimmed = versionStr.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  const m = trimmed.match(/^(>=|<=|>|<)?\s*(\d+(?:\.\d+)*)$/);
  if (!m) {
    return null;
  }
  return { operator: m[1] || '', version: m[2] };
}

/**
 * Parse a comma separated version scope list into matchable entries.
 * @param {string|string[]|null|undefined} value
 * @returns {Array<string|{operator: string, version: string}>}
 */
export function parseVersionScopeList(value) {
  if (value == null) {
    return [];
  }
  const rawList = Array.isArray(value)
    ? value.map((item) => String(item).trim())
    : String(value)
        .split(/[,，]/)
        .map((item) => item.trim());
  return rawList
    .filter((item) => item !== '' && item !== '*')
    .map((item) => parseVersionExpression(item) || { operator: '', version: item });
}

/**
 * @param {string} currentVersion
 * @param {string} operator
 * @param {string} version
 * @returns {boolean}
 */
export function versionMatchesOperator(currentVersion, operator, version) {
  const cmp = compareVersions(currentVersion, version);
  switch (operator) {
    case '>':
      return cmp > 0;
    case '>=':
      return cmp >= 0;
    case '<':
      return cmp < 0;
    case '<=':
      return cmp <= 0;
    case '':
    default:
      return cmp === 0;
  }
}

/**
 * Any rule matching is enough (OR).
 * @param {string} currentVersion
 * @param {Array<string|{operator?: string, version: string}>|null|undefined} versionConfigs
 * @returns {boolean}
 */
export function matchVersion(currentVersion, versionConfigs) {
  if (!versionConfigs || versionConfigs.length === 0) {
    return true;
  }
  for (const config of versionConfigs) {
    if (typeof config === 'string') {
      const parsed = parseVersionExpression(config);
      if (parsed && versionMatchesOperator(currentVersion, parsed.operator, parsed.version)) {
        return true;
      }
      continue;
    }
    if (config && typeof config === 'object' && config.version) {
      const op = config.operator != null ? config.operator : '';
      if (versionMatchesOperator(currentVersion, op, config.version)) {
        return true;
      }
    }
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

/** @param {string} s */
export function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ');
}

/**
 * @param {string|null|undefined} a
 * @param {string|null|undefined} b
 * @returns {boolean}
 */
export function productKeysEqual(a, b) {
  if (a == null || b == null) {
    return false;
  }
  return normalizeProductKey(a) === normalizeProductKey(b);
}

/**
 * "RDK-X5" means the whole RDK X5 family; "RDK X5" is an exact product name.
 * @param {string|null|undefined} s
 * @returns {string|null}
 */
export function normalizeProductSeriesKey(s) {
  if (s == null || typeof s !== 'string') {
    return null;
  }
  const match = s.trim().match(/^rdk\s*-\s*(.+)$/i);
  if (!match) {
    return null;
  }
  const suffix = match[1].trim().replace(/\s+/g, ' ');
  if (!suffix) {
    return null;
  }
  return normalizeProductKey('RDK ' + suffix);
}

/**
 * @param {string} currentProduct
 * @param {string} seriesKey
 * @returns {boolean}
 */
export function productBelongsToSeries(currentProduct, seriesKey) {
  const current = normalizeProductKey(currentProduct);
  return current === seriesKey || current.startsWith(seriesKey + ' ');
}

/**
 * Build a lowercase -> canonical product lookup from the version matrix.
 * @param {Record<string, string[]>} VERSION_PRODUCT_MATRIX
 * @returns {Map<string, string>}
 */
export function buildCanonicalProductLookup(VERSION_PRODUCT_MATRIX) {
  const map = new Map();
  const matrix = VERSION_PRODUCT_MATRIX || {};
  for (const list of Object.values(matrix)) {
    if (!Array.isArray(list)) continue;
    for (const canonical of list) {
      map.set(normalizeProductKey(canonical), canonical);
    }
  }
  return map;
}

/**
 * @param {string|null|undefined} input
 * @param {Map<string, string>} lookup
 * @returns {string|null}
 */
export function resolveCanonicalProductWithLookup(input, lookup) {
  if (input == null || String(input).trim() === '') {
    return null;
  }
  return lookup.get(normalizeProductKey(input)) || null;
}

/**
 * Does a configured product list match the current product?
 * Empty / missing list means "unrestricted".
 * @param {string[]|null|undefined} scopeProducts
 * @param {string|null|undefined} currentProduct
 * @returns {boolean}
 */
export function scopeProductsMatchCurrent(scopeProducts, currentProduct) {
  if (!scopeProducts || scopeProducts.length === 0) {
    return true;
  }
  if (currentProduct == null || String(currentProduct).trim() === '') {
    return false;
  }
  const cur = normalizeProductKey(currentProduct);
  for (const entry of scopeProducts) {
    if (typeof entry !== 'string') continue;
    const seriesKey = normalizeProductSeriesKey(entry);
    if (seriesKey && productBelongsToSeries(currentProduct, seriesKey)) {
      return true;
    }
    if (normalizeProductKey(entry) === cur) {
      return true;
    }
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Doc ids                                                                     */
/* -------------------------------------------------------------------------- */

/** @param {string|null|undefined} pathOrDocId */
export function normalizeDocIdFromPath(pathOrDocId) {
  if (!pathOrDocId) {
    return '';
  }
  return String(pathOrDocId)
    .toLowerCase()
    .split('/')
    .map((part) => part.replace(/^\d+_/, ''))
    .join('/');
}

/** @param {string|null|undefined} id */
export function normalizeFrontMatterDocId(id) {
  if (id == null || typeof id !== 'string') {
    return '';
  }
  return id.trim().toLowerCase();
}

/**
 * @param {string} relativePathWithoutExt
 * @param {string|null|undefined} frontMatterId
 * @returns {string[]}
 */
export function collectDocScopeKeys(relativePathWithoutExt, frontMatterId) {
  const keys = new Set();
  const pathKey = normalizeDocIdFromPath(relativePathWithoutExt);
  if (pathKey) keys.add(pathKey);
  const idKey = normalizeFrontMatterDocId(frontMatterId);
  if (idKey) keys.add(idKey);
  return [...keys];
}

/**
 * @param {string} docId
 * @returns {string[]}
 */
export function collectDocScopeLookupCandidates(docId) {
  const keys = new Set();
  const pathKey = normalizeDocIdFromPath(docId);
  const idKey = normalizeFrontMatterDocId(docId);
  if (pathKey) keys.add(pathKey);
  if (idKey) keys.add(idKey);
  for (const key of [...keys]) {
    if (key.includes('-')) keys.add(key.replace(/-/g, '_'));
    if (key.includes('_')) keys.add(key.replace(/_/g, '-'));
  }
  return [...keys];
}

/* -------------------------------------------------------------------------- */
/* Scope specs                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Parse the JSON payload written by remark-doc-scope into data-doc-scope.
 * @param {string|null|undefined} raw
 * @returns {{versions: Array<{operator: string, version: string}>, products: string[]}|null}
 */
export function parseScopeAttr(raw) {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      versions: Array.isArray(parsed.versions) ? parsed.versions : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
    };
  } catch {
    return null;
  }
}

/**
 * @param {{versions?: any[], products?: string[]}|null|undefined} spec
 * @param {string} version
 * @param {string} product
 * @returns {boolean}
 */
export function scopeSpecMatches(spec, version, product) {
  if (!spec) {
    return true;
  }
  return (
    matchVersion(version, spec.versions || []) &&
    scopeProductsMatchCurrent(spec.products || [], product)
  );
}

/**
 * Resolve the scope config for a doc.
 * Precedence: document-level config, then the deepest matching ancestor
 * directory config (deepest wins, not "first inserted wins").
 *
 * @param {string} docId
 * @param {Record<string, any>} config
 * @returns {{scope: any, matchedKey: string}|null}
 */
export function lookupDocScopeConfig(docId, config) {
  if (!docId || !config) {
    return null;
  }
  for (const key of collectDocScopeLookupCandidates(docId)) {
    const scope = config[key];
    if (scope && !scope.isCategory) {
      return { scope, matchedKey: key };
    }
  }

  const normalizedId = normalizeDocIdFromPath(docId);
  if (!normalizedId) {
    return null;
  }
  let best = null;
  let bestDepth = -1;
  for (const key of Object.keys(config)) {
    const scope = config[key];
    if (!scope || !scope.isCategory) continue;
    const normalizedConfigPath = normalizeDocIdFromPath(key);
    if (!normalizedConfigPath) continue;
    const isUnder =
      normalizedId === normalizedConfigPath ||
      normalizedId.startsWith(normalizedConfigPath + '/');
    if (!isUnder) continue;
    const depth = normalizedConfigPath.split('/').length;
    if (depth > bestDepth) {
      bestDepth = depth;
      best = { scope, matchedKey: key };
    }
  }
  return best;
}

/**
 * An excluded directory excludes its whole subtree, regardless of deeper
 * overrides.
 * @param {string} normalizedDocId
 * @param {Record<string, any>} config
 * @returns {boolean}
 */
export function isUnderExcludedDirectory(normalizedDocId, config) {
  for (const key of Object.keys(config)) {
    const scope = config[key];
    if (!scope || !scope.isCategory || !scope.exclude) continue;
    const normalizedConfigPath = normalizeDocIdFromPath(key);
    if (!normalizedConfigPath) continue;
    if (
      normalizedDocId === normalizedConfigPath ||
      normalizedDocId.startsWith(normalizedConfigPath + '/')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Should this document be visible for (version, product)?
 *
 * @param {string} docId
 * @param {string} version
 * @param {string} product
 * @param {Record<string, any>} config generated sidebar scope config
 * @returns {boolean}
 */
export function shouldShowDoc(docId, version, product, config) {
  if (!config) {
    return true;
  }
  const normalizedId = normalizeDocIdFromPath(docId);
  if (normalizedId && isUnderExcludedDirectory(normalizedId, config)) {
    return false;
  }
  const found = lookupDocScopeConfig(docId, config);
  if (!found) {
    return true;
  }
  const scope = found.scope;
  if (scope.exclude) {
    return false;
  }
  return (
    matchVersion(version, scope.versions || []) &&
    scopeProductsMatchCurrent(scope.products || [], product)
  );
}

/* -------------------------------------------------------------------------- */
/* Matrix helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * First version of the matrix and its first product are the site defaults.
 * @param {Record<string, string[]>} VERSION_PRODUCT_MATRIX
 * @returns {{version: string, product: string}}
 */
export function deriveDefaultScope(VERSION_PRODUCT_MATRIX) {
  const matrix = VERSION_PRODUCT_MATRIX || {};
  const version = Object.keys(matrix)[0] || '';
  const products = (version && matrix[version]) || [];
  return { version, product: products[0] || '' };
}

/**
 * All (product, version) pairs of the matrix.
 * @param {Record<string, string[]>} VERSION_PRODUCT_MATRIX
 * @returns {Array<{product: string, version: string}>}
 */
export function listVersionProductPairs(VERSION_PRODUCT_MATRIX) {
  const matrix = VERSION_PRODUCT_MATRIX || {};
  const pairs = [];
  for (const version of Object.keys(matrix)) {
    const products = matrix[version] || [];
    for (const product of products) {
      pairs.push({ product, version });
    }
  }
  return pairs;
}

/**
 * Create matrix-bound helpers. Only the functions that need the matrix are
 * exposed; everything else can be imported directly.
 *
 * @param {{VERSION_PRODUCT_MATRIX?: Record<string, string[]>, PRODUCT_VERSION_MATRIX?: Record<string, string[]>}} matrix
 */
export function createDocScopeCore(matrix) {
  const versionProductMatrix = (matrix && matrix.VERSION_PRODUCT_MATRIX) || {};
  const productVersionMatrix = (matrix && matrix.PRODUCT_VERSION_MATRIX) || {};
  const canonicalLookup = buildCanonicalProductLookup(versionProductMatrix);

  function resolveCanonicalProduct(input) {
    return resolveCanonicalProductWithLookup(input, canonicalLookup);
  }

  function normalizeScopeProductList(products) {
    if (!Array.isArray(products)) {
      return [];
    }
    return products.map((p) => {
      if (typeof p !== 'string') {
        return p;
      }
      const canonical = resolveCanonicalProduct(p);
      return canonical || p.trim();
    });
  }

  function resolveProductForVersion(pRaw, version) {
    const list = versionProductMatrix[version];
    if (!list || list.length === 0) {
      return '';
    }
    if (pRaw == null || String(pRaw).trim() === '') {
      return list[0];
    }
    const canonical = resolveCanonicalProduct(pRaw);
    if (canonical && list.includes(canonical)) {
      return canonical;
    }
    for (const item of list) {
      if (normalizeProductKey(item) === normalizeProductKey(pRaw)) {
        return item;
      }
    }
    return list[0];
  }

  function resolveCanonicalProductKeyForMatrix(p) {
    if (p == null || String(p).trim() === '') {
      return null;
    }
    const canonical = resolveCanonicalProduct(p);
    if (canonical && productVersionMatrix[canonical]) {
      return canonical;
    }
    for (const key of Object.keys(productVersionMatrix)) {
      if (normalizeProductKey(key) === normalizeProductKey(p)) {
        return key;
      }
    }
    return null;
  }

  return {
    versionProductMatrix,
    productVersionMatrix,
    canonicalLookup,
    resolveCanonicalProduct,
    normalizeScopeProductList,
    resolveProductForVersion,
    resolveCanonicalProductKeyForMatrix,
    deriveDefaultScope: () => deriveDefaultScope(versionProductMatrix),
    listVersionProductPairs: () => listVersionProductPairs(versionProductMatrix),
  };
}
