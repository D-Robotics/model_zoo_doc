/**
 * 扫描 docs / i18n 文档，生成侧边栏产品/版本可见性配置（供 Docusaurus 插件与 CLI 共用）。
 *
 * 版本解析、产品匹配、docId 归一化统一复用 src/context/doc-scope-filter-core.mjs，
 * 保证运行时（浏览器）、构建期（本脚本）与 Algolia 索引器使用同一套规则。
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const matrixJsonPath = path.join(__dirname, '../../src/context/doc-scope-matrix.json');
const matrixJson = require(matrixJsonPath);

const GENERATED_SIDEBAR_CONFIG_ALIAS = '@generated/generated-sidebar-config.json';
const GENERATED_SIDEBAR_CONFIG_FILENAME = 'generated-sidebar-config.json';
const CORE_MODULE_PATH = path.join(__dirname, '../../src/context/doc-scope-filter-core.mjs');

function getGeneratedSidebarConfigPath(siteDir) {
  return path.join(siteDir, '.docusaurus', GENERATED_SIDEBAR_CONFIG_FILENAME);
}

async function loadCore(siteDir) {
  const corePath = siteDir
    ? path.join(siteDir, 'src/context/doc-scope-filter-core.mjs')
    : CORE_MODULE_PATH;
  const core = await import(pathToFileURL(corePath).href);
  return {
    core,
    bound: core.createDocScopeCore({
      VERSION_PRODUCT_MATRIX: matrixJson.VERSION_PRODUCT_MATRIX,
      PRODUCT_VERSION_MATRIX: matrixJson.PRODUCT_VERSION_MATRIX,
    }),
  };
}

function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeProductSeriesKey(s) {
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

function productBelongsToSeries(productEntry, seriesKey) {
  const current = normalizeProductKey(productEntry);
  return current === seriesKey || current.startsWith(seriesKey + ' ');
}

function mergeProducts(existingProducts, incomingProducts, normalizeScopeProductList) {
  const merged = normalizeScopeProductList([
    ...(Array.isArray(existingProducts) ? existingProducts : []),
    ...(Array.isArray(incomingProducts) ? incomingProducts : []),
  ]);

  const deduped = [];
  const seen = new Set();
  for (const entry of merged) {
    const key = normalizeProductKey(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(entry);
  }

  const seriesKeys = deduped
    .map((entry) => normalizeProductSeriesKey(entry))
    .filter(Boolean);
  if (seriesKeys.length === 0) {
    return deduped;
  }

  return deduped.filter((entry) => {
    const isSeriesEntry = Boolean(normalizeProductSeriesKey(entry));
    if (isSeriesEntry) {
      return true;
    }
    return !seriesKeys.some((seriesKey) => productBelongsToSeries(entry, seriesKey));
  });
}

function versionConfigKey(config) {
  if (typeof config === 'string') {
    return 'str::' + config.trim();
  }
  if (config && typeof config === 'object') {
    const op = String(config.operator || '').trim();
    const version = String(config.version || '').trim();
    return 'obj::' + op + '::' + version;
  }
  return 'raw::' + String(config);
}

function mergeVersions(existingVersions, incomingVersions) {
  const merged = [
    ...(Array.isArray(existingVersions) ? existingVersions : []),
    ...(Array.isArray(incomingVersions) ? incomingVersions : []),
  ];
  const out = [];
  const seen = new Set();
  for (const entry of merged) {
    const key = versionConfigKey(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function mergeScopeConfig(existingScope, incomingScope, normalizeScopeProductList) {
  if (!existingScope) {
    return incomingScope;
  }
  return {
    versions: mergeVersions(existingScope.versions, incomingScope.versions),
    products: mergeProducts(
      existingScope.products,
      incomingScope.products,
      normalizeScopeProductList,
    ),
    isCategory: Boolean(existingScope.isCategory || incomingScope.isCategory),
    exclude: Boolean(existingScope.exclude || incomingScope.exclude),
  };
}

function extractFrontMatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontMatterMatch) {
      return null;
    }

    const frontMatter = {};
    frontMatterMatch[1].split(/\r?\n/).forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        frontMatter[key] = value;
      }
    });
    return frontMatter;
  } catch {
    return null;
  }
}

function extractSidebarScopeConfig(filePath, core) {
  try {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (config.versions || config.products || config.exclude) {
      return {
        versions: core.parseVersionScopeList(config.versions),
        products: Array.isArray(config.products)
          ? config.products
          : typeof config.products === 'string'
            ? config.products.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
            : [],
        exclude: Boolean(config.exclude),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function formatVersions(versions) {
  if (!versions || versions.length === 0) return 'all versions';
  return versions
    .map((v) => {
      if (typeof v === 'object' && v.operator) {
        return v.operator + ' ' + v.version;
      }
      return typeof v === 'object' ? v.version : v;
    })
    .join(', ');
}

function scanDirectory(dir, baseDir, config, helpers, verbose) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const { core, bound, normalizeScopeProductList } = helpers;

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, baseDir, config, helpers, verbose);
      continue;
    }

    if (item === '_sidebar_scope.json') {
      const scopeConfig = extractSidebarScopeConfig(fullPath, core);
      if (!scopeConfig) {
        continue;
      }

      const folderPath = path.relative(baseDir, path.dirname(fullPath)).replace(/\\/g, '/');
      const folderId = core.normalizeDocIdFromPath(folderPath);
      const productsNorm = normalizeScopeProductList(scopeConfig.products);
      config[folderId] = mergeScopeConfig(
        config[folderId],
        {
          versions: scopeConfig.versions,
          products: productsNorm,
          isCategory: true,
          exclude: scopeConfig.exclude,
        },
        normalizeScopeProductList,
      );

      if (verbose) {
        console.log('Found folder config: ' + folderPath);
        console.log('  folderId: ' + folderId);
        console.log('  versions: ' + formatVersions(scopeConfig.versions));
        console.log('  products: ' + (productsNorm.join(', ') || 'all products'));
        if (scopeConfig.exclude) {
          console.log('  exclude: true');
        }
      }
      continue;
    }

    if (!item.endsWith('.md') && !item.endsWith('.mdx')) {
      continue;
    }

    const frontMatter = extractFrontMatter(fullPath);
    if (!frontMatter || (!frontMatter.sidebar_versions && !frontMatter.sidebar_products)) {
      continue;
    }

    const relativePath = path
      .relative(baseDir, fullPath)
      .replace(/\.(md|mdx)$/, '')
      .replace(/\\/g, '/');
    const scopeKeys = core.collectDocScopeKeys(relativePath, frontMatter.id);
    const versions = core.parseVersionScopeList(frontMatter.sidebar_versions);

    let products = [];
    if (frontMatter.sidebar_products) {
      if (typeof frontMatter.sidebar_products === 'string') {
        let productsStr = frontMatter.sidebar_products.trim();
        if (
          (productsStr.startsWith('"') && productsStr.endsWith('"')) ||
          (productsStr.startsWith("'") && productsStr.endsWith("'"))
        ) {
          productsStr = productsStr.slice(1, -1).trim();
        }
        products = productsStr.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
      } else {
        products = frontMatter.sidebar_products;
      }
    }

    const productsNorm = normalizeScopeProductList(products);
    const nextScope = { versions, products: productsNorm, isCategory: false, exclude: false };
    for (const key of scopeKeys) {
      config[key] = mergeScopeConfig(config[key], nextScope, normalizeScopeProductList);
    }

    if (verbose) {
      console.log('Found document config: ' + relativePath);
      console.log('  docId keys: ' + scopeKeys.join(', '));
      console.log('  versions: ' + formatVersions(versions));
      console.log('  products: ' + (productsNorm.join(', ') || 'all products'));
    }
  }
}

function validateSidebarScopeConfig(config) {
  const errors = [];
  for (const key of Object.keys(config)) {
    if (/^\d+_/.test(key) || /\/\d+_/.test(key)) {
      errors.push('config key "' + key + '" contains an unparsed numeric prefix');
    }
    if (key !== key.toLowerCase()) {
      errors.push('config key "' + key + '" must be lowercase');
    }
  }
  return errors;
}

async function buildSidebarScopeConfig({
  docsDir,
  i18nEnDocsCurrentDir,
  siteDir,
  verbose = false,
}) {
  const { core, bound } = await loadCore(siteDir);
  const normalizeScopeProductList = bound.normalizeScopeProductList;
  const helpers = { core, bound, normalizeScopeProductList };
  const config = {};

  if (fs.existsSync(docsDir)) {
    if (verbose) {
      console.log('Scanning docs directory:');
    }
    scanDirectory(docsDir, docsDir, config, helpers, verbose);
    if (verbose) {
      console.log('');
    }
  }
  if (i18nEnDocsCurrentDir && fs.existsSync(i18nEnDocsCurrentDir)) {
    if (verbose) {
      console.log('Scanning i18n/en/docusaurus-plugin-content-docs/current directory:');
    }
    scanDirectory(i18nEnDocsCurrentDir, i18nEnDocsCurrentDir, config, helpers, verbose);
    if (verbose) {
      console.log('');
    }
  }

  return config;
}

async function buildAndWriteSidebarScopeConfig({
  configFilePath,
  docsDir,
  i18nEnDocsCurrentDir,
  siteDir,
  verbose = false,
}) {
  if (verbose) {
    console.log('Scanning documentation files...\n');
  }

  const config = await buildSidebarScopeConfig({
    docsDir,
    i18nEnDocsCurrentDir,
    siteDir,
    verbose,
  });

  const errors = validateSidebarScopeConfig(config);
  if (errors.length > 0) {
    console.error('\nConfig format validation failed:\n');
    for (const err of errors) {
      console.error('  - ' + err);
    }
    console.error('');
    throw new Error('sidebar scope config validation failed');
  }

  if (verbose) {
    console.log('Config format validation passed\n');
  }

  const configDir = path.dirname(configFilePath);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

  if (verbose) {
    console.log('Config file written: ' + configFilePath);
    console.log('Found ' + Object.keys(config).length + ' config entries\n');
  }

  return config;
}

module.exports = {
  GENERATED_SIDEBAR_CONFIG_ALIAS,
  GENERATED_SIDEBAR_CONFIG_FILENAME,
  getGeneratedSidebarConfigPath,
  buildSidebarScopeConfig,
  buildAndWriteSidebarScopeConfig,
  validateSidebarScopeConfig,
};
