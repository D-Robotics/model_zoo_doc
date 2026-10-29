#!/usr/bin/env node
/**
 * Build the Algolia DocSearch index for this site.
 *
 * Pipeline:
 *   1. crawl the deployed site (sitemap + same-origin BFS)
 *   2. keep only `article .theme-doc-markdown` pages
 *   3. expand every node by the page-level and node-level doc scope
 *   4. aggregate body text onto heading records (keeps billing sane)
 *   5. PUT settings -> clear -> batched addObject -> probe
 *
 * Usage:
 *   npm run algolia:index -- --dry-run
 *   npm run algolia:index -- --dry-run --serve-dir build
 *   npm run algolia:index
 *
 * Env (.env is loaded if present):
 *   ALGOLIA_ADMIN_API_KEY  (required unless --dry-run)
 *   ALGOLIA_APP_ID
 *   ALGOLIA_INDEX_NAME
 *   ALGOLIA_SITE_URL
 *   ALGOLIA_FETCH_CONCURRENCY
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import * as cheerio from 'cheerio';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/* -------------------------------------------------------------------------- */
/* Env + args                                                                  */
/* -------------------------------------------------------------------------- */

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(path.join(repoRoot, '.env'));

const argv = process.argv.slice(2);
function readArg(name) {
  const index = argv.indexOf(name);
  if (index === -1) return null;
  return argv[index + 1] || '';
}
const DRY_RUN = argv.includes('--dry-run');
const SERVE_DIR = readArg('--serve-dir');
const OFFLINE_OUT = readArg('--offline-out');
const MAX_PAGES = Number(readArg('--max-pages') || 0);

const APP_ID = process.env.ALGOLIA_APP_ID || '1VU781LYTV';
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'model_zoo_doc';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';
const CONCURRENCY = Math.max(1, Number(process.env.ALGOLIA_FETCH_CONCURRENCY || 8));
const DEFAULT_LOCALE = process.env.ALGOLIA_DEFAULT_LOCALE || 'zh-Hans';

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : value + '/';
}

let SITE_URL = ensureTrailingSlash(
  process.env.ALGOLIA_SITE_URL || 'https://developer.d-robotics.cc/model_zoo_doc/',
);

const SETTINGS = {
  searchableAttributes: [
    'unordered(hierarchy.lvl0)',
    'unordered(hierarchy.lvl1)',
    'unordered(hierarchy.lvl2)',
    'unordered(hierarchy.lvl3)',
    'unordered(hierarchy.lvl4)',
    'unordered(hierarchy.lvl5)',
    'unordered(hierarchy.lvl6)',
    'content',
  ],
  attributesForFaceting: [
    'type',
    'lang',
    'language',
    'version',
    'docusaurus_tag',
    'filterOnly(product)',
    'filterOnly(rdk_version)',
  ],
  attributesToRetrieve: [
    'hierarchy',
    'content',
    'anchor',
    'url',
    'url_without_anchor',
    'type',
    'lang',
    'language',
    'version',
    'docusaurus_tag',
    'product',
    'rdk_version',
  ],
  attributesToHighlight: ['hierarchy', 'content'],
  attributesToSnippet: ['content:10'],
  camelCaseAttributes: ['hierarchy', 'content'],
  distinct: true,
  attributeForDistinct: 'url',
  customRanking: [
    'desc(weight.pageRank)',
    'desc(weight.level)',
    'asc(weight.position)',
  ],
  ranking: ['words', 'filters', 'typo', 'attribute', 'proximity', 'exact', 'custom'],
  highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
  highlightPostTag: '</span>',
  minWordSizefor1Typo: 3,
  minWordSizefor2Typos: 7,
  allowTyposOnNumericTokens: false,
  minProximity: 1,
  ignorePlurals: true,
  advancedSyntax: true,
  attributeCriteriaComputedByMinProximity: true,
  removeWordsIfNoResults: 'allOptional',
  separatorsToIndex: '_',
};

const WEIGHT_LEVEL = {
  lvl0: 100,
  lvl1: 90,
  lvl2: 80,
  lvl3: 70,
  lvl4: 60,
  lvl5: 50,
  lvl6: 40,
  content: 0,
};

const EXCLUDED_CONTAINER_SELECTOR =
  'nav, footer, .theme-doc-toc-desktop, .theme-doc-toc-mobile, .pagination-nav, .theme-edit-this-page, .hash-link';
const STATIC_EXTENSION_RE =
  /\.(?:png|jpe?g|gif|webp|svg|ico|css|js|mjs|json|xml|txt|pdf|zip|gz|tgz|map|woff2?|ttf|eot|mp4|webm|wasm)$/i;

const log = (...args) => console.log('[algolia-index]', ...args);
const warn = (...args) => console.warn('[algolia-index] WARN', ...args);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/* Static server for local dry-runs                                            */
/* -------------------------------------------------------------------------- */

function startStaticServer(rootDir, basePath) {
  const normalizedRoot = path.resolve(rootDir);
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      let pathname = decodeURIComponent(url.pathname);
      if (!pathname.startsWith(basePath)) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      let rel = pathname.slice(basePath.length);
      if (rel === '' || rel.endsWith('/')) {
        rel += 'index.html';
      }
      let filePath = path.join(normalizedRoot, rel);
      if (!path.resolve(filePath).startsWith(normalizedRoot)) {
        res.statusCode = 403;
        res.end('forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type =
        ext === '.html'
          ? 'text/html; charset=utf-8'
          : ext === '.xml'
            ? 'application/xml; charset=utf-8'
            : ext === '.json'
              ? 'application/json; charset=utf-8'
              : 'application/octet-stream';
      res.setHeader('content-type', type);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      res.statusCode = 500;
      res.end(String(error && error.message));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Crawl                                                                       */
/* -------------------------------------------------------------------------- */

function basePathOf(siteUrl) {
  const pathname = new URL(siteUrl).pathname;
  return pathname.endsWith('/') ? pathname : pathname + '/';
}

function normalizeUrl(rawUrl, origin) {
  try {
    const url = new URL(rawUrl, origin);
    if (url.origin !== origin) return null;
    url.search = '';
    url.hash = '';
    if (url.pathname.endsWith('/index.html')) {
      url.pathname = url.pathname.slice(0, -'index.html'.length);
    }
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isSameOriginIndexable(url, origin, basePath) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== origin) return false;
    if (!parsed.pathname.startsWith(basePath)) return false;
    const rest = parsed.pathname.slice(basePath.length);
    if (rest === 'search' || rest.startsWith('search/')) return false;
    if (rest === 'blog' || rest.startsWith('blog/')) return false;
    if (STATIC_EXTENSION_RE.test(parsed.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

async function fetchWithProxyRetry(url, init) {
  const execute = () => fetch(url, init);
  try {
    const response = await execute();
    if (response.status === 403 && hasProxyEnv()) {
      clearProxyEnv();
      return execute();
    }
    return response;
  } catch (error) {
    if (hasProxyEnv()) {
      clearProxyEnv();
      return execute();
    }
    throw error;
  }
}

async function fetchText(url) {
  const response = await fetchWithProxyRetry(url, {
    headers: { 'user-agent': 'rdk-doc-algolia-indexer/1.0' },
  });
  if (!response.ok) {
    warn('HTTP ' + response.status + ' for ' + url);
    return null;
  }
  return response.text();
}

async function readSitemap(origin, basePath) {
  const sitemapUrl = origin + basePath + 'sitemap.xml';
  try {
    const response = await fetchWithProxyRetry(sitemapUrl);
    if (!response.ok) {
      warn('sitemap unavailable (' + response.status + '): ' + sitemapUrl);
      return [];
    }
    const xml = await response.text();
    const locs = [];
    const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
    let match;
    while ((match = re.exec(xml))) {
      locs.push(match[1].trim());
    }
    log('sitemap URLs: ' + locs.length);
    return locs;
  } catch (error) {
    warn('sitemap fetch failed: ' + (error && error.message));
    return [];
  }
}

async function crawl(origin, basePath) {
  const seeds = [origin + basePath, origin + basePath + 'RDK', origin + basePath + 'en/RDK'];
  const sitemapUrls = await readSitemap(origin, basePath);
  const queue = [];
  const seen = new Set();

  const enqueue = (url) => {
    // Local dry-runs serve the built site on another origin: keep the path
    // and remap it onto the crawl origin.
    let candidate = url;
    try {
      const parsed = new URL(url, origin);
      if (parsed.origin !== origin && parsed.pathname.startsWith(basePath)) {
        candidate = origin + parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // ignore, normalizeUrl will reject it
    }
    const normalized = normalizeUrl(candidate, origin);
    if (!normalized || seen.has(normalized)) return;
    if (!isSameOriginIndexable(normalized, origin, basePath)) return;
    seen.add(normalized);
    queue.push(normalized);
  };

  sitemapUrls.forEach(enqueue);
  seeds.forEach(enqueue);

  const pages = [];
  let warnings = 0;

  const worker = async () => {
    for (;;) {
      const url = queue.shift();
      if (!url) return;
      if (MAX_PAGES && pages.length >= MAX_PAGES) return;
      let html = null;
      try {
        html = await fetchText(url);
      } catch (error) {
        warn('fetch failed ' + url + ': ' + (error && error.message));
      }
      if (!html) {
        // fetchText already logged the HTTP status (or the catch logged the error).
        warnings += 1;
        continue;
      }

      pages.push({ url, html });

      // Follow same-origin links to catch pages missing from the sitemap.
      const linkRe = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
      let match;
      while ((match = linkRe.exec(html))) {
        const href = match[1];
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
          continue;
        }
        enqueue(new URL(href, url).toString());
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  log('pages fetched: ' + pages.length + ', warnings: ' + warnings);
  return pages;
}

/* -------------------------------------------------------------------------- */
/* Extraction                                                                  */
/* -------------------------------------------------------------------------- */

function cleanText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function docIdFromUrl(url, basePath, locale, defaultLocale) {
  let pathname = decodeURIComponent(new URL(url).pathname);
  if (!pathname.startsWith(basePath)) return '';
  pathname = pathname.slice(basePath.length);
  if (locale && locale !== defaultLocale) {
    const prefix = locale + '/';
    if (pathname === locale) return '';
    if (pathname.startsWith(prefix)) {
      pathname = pathname.slice(prefix.length);
    }
  }
  return pathname.replace(/\/+$/, '').toLowerCase();
}

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function buildScopedUrl(pageUrl, product, version, anchor) {
  const url = new URL(pageUrl);
  url.searchParams.set('p', product);
  url.searchParams.set('v', version);
  if (anchor) {
    url.hash = anchor;
  }
  return url.toString();
}

/**
 * @returns {Array<object>} fine-grained records (before aggregation)
 */
function extractRecords(page, context) {
  const { scopeConfig, pairs, basePath, origin, defaultLocale } = context;
  const $ = cheerio.load(page.html);

  const root = $('article .theme-doc-markdown').first();
  if (!root.length) {
    return null;
  }

  const language = cleanText($('html').attr('lang') || defaultLocale) || defaultLocale;
  const docusaurusTag =
    $('meta[name="docsearch:docusaurus_tag"]').attr('content') || 'docs-default-current';
  const docId = docIdFromUrl(page.url, basePath, language, defaultLocale);

  const pagePairs = pairs.filter((pair) =>
    context.shouldShowDoc(docId, pair.version, pair.product, scopeConfig),
  );
  if (pagePairs.length === 0) {
    return { docId, language, docusaurusTag, pagePairs, records: [] };
  }

  const breadcrumbs = [];
  $('nav.theme-doc-breadcrumbs li.breadcrumbs__item').each((_, el) => {
    const text = cleanText($(el).text());
    if (text) breadcrumbs.push(text);
  });
  const lvl0 =
    breadcrumbs[0] ||
    cleanText($('.theme-doc-sidebar-item-category .menu__link--active').first().text()) ||
    'Documentation';

  const records = [];
  const hierarchy = { lvl0 };
  let currentAnchor = '';
  let position = 0;

  const nodes = root.find('h1, h2, h3, h4, h5, h6, p, li, td').toArray();

  for (const node of nodes) {
    const $node = $(node);
    const tagName = (node.tagName || '').toLowerCase();

    if ($node.closest(EXCLUDED_CONTAINER_SELECTOR).length > 0) {
      continue;
    }
    if (tagName === 'p' && $node.closest('li, td').length > 0) {
      continue;
    }

    const isHeading = /^h[1-6]$/.test(tagName);
    const text = cleanText($node.text());
    if (!text && !isHeading) {
      continue;
    }

    if (isHeading) {
      const level = Number(tagName.slice(1));
      const anchor =
        $node.attr('id') || $node.find('[id]').first().attr('id') || currentAnchor;
      currentAnchor = anchor || currentAnchor;
      for (let i = level + 1; i <= 6; i += 1) {
        delete hierarchy['lvl' + i];
      }
      hierarchy['lvl' + level] = text;
      const type = 'lvl' + level;
      const scopeEl = $node.closest('[data-doc-scope]').first();
      const spec = scopeEl.length ? context.parseScopeAttr(scopeEl.attr('data-doc-scope')) : null;
      const nodePairs = spec
        ? pagePairs.filter((pair) => context.scopeSpecMatches(spec, pair.version, pair.product))
        : pagePairs;
      if (nodePairs.length === 0) {
        position += 1;
        continue;
      }
      for (const pair of nodePairs) {
        records.push(
          makeRecord({
            pair,
            type,
            content: '',
            hierarchy,
            anchor: currentAnchor,
            pageUrl: page.url,
            language,
            docusaurusTag,
            position,
          }),
        );
      }
      position += 1;
      continue;
    }

    const scopeEl = $node.closest('[data-doc-scope]').first();
    const spec = scopeEl.length ? context.parseScopeAttr(scopeEl.attr('data-doc-scope')) : null;
    const nodePairs = spec
      ? pagePairs.filter((pair) => context.scopeSpecMatches(spec, pair.version, pair.product))
      : pagePairs;
    if (nodePairs.length === 0) {
      position += 1;
      continue;
    }

    const content = text.slice(0, 5000);
    for (const pair of nodePairs) {
      records.push(
        makeRecord({
          pair,
          type: 'content',
          content,
          hierarchy,
          anchor: currentAnchor,
          pageUrl: page.url,
          language,
          docusaurusTag,
          position,
        }),
      );
    }
    position += 1;
  }

  return { docId, language, docusaurusTag, pagePairs, records };
}

function makeRecord({
  pair,
  type,
  content,
  hierarchy,
  anchor,
  pageUrl,
  language,
  docusaurusTag,
  position,
}) {
  const url = buildScopedUrl(pageUrl, pair.product, pair.version, anchor);
  const urlWithoutAnchor = buildScopedUrl(pageUrl, pair.product, pair.version, '');
  return {
    objectID: sha1(url + '|' + type + '|' + content + '|' + position),
    hierarchy: { ...hierarchy },
    content,
    type,
    url,
    url_without_anchor: urlWithoutAnchor,
    anchor: anchor || '',
    language,
    lang: language,
    version: 'current',
    docusaurus_tag: docusaurusTag,
    product: pair.product,
    rdk_version: pair.version,
    weight: {
      pageRank: 0,
      level: WEIGHT_LEVEL[type] ?? 0,
      position,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Aggregation (fine-grained -> uploadable, much smaller)                      */
/* -------------------------------------------------------------------------- */

const MAX_HEADING_CONTENT = 2000;
const CHUNK_SIZE = 2000;

function splitChunks(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

function aggregateRecords(fineRecords) {
  const groups = new Map();
  for (const record of fineRecords) {
    let group = groups.get(record.url);
    if (!group) {
      group = { headings: [], contents: [] };
      groups.set(record.url, group);
    }
    if (record.type === 'content') {
      group.contents.push(record);
    } else {
      group.headings.push(record);
    }
  }

  const aggregated = [];
  for (const [url, group] of groups) {
    const body = group.contents.map((record) => record.content).filter(Boolean).join(' ');
    const heading = group.headings[0] || null;

    if (heading) {
      const content = body.slice(0, MAX_HEADING_CONTENT);
      aggregated.push(withFinalObjectId({ ...heading, content }));
      const overflow = body.slice(MAX_HEADING_CONTENT);
      if (overflow) {
        splitChunks(overflow).forEach((chunk, index) => {
          aggregated.push(
            withFinalObjectId({
              ...heading,
              type: 'content',
              content: chunk,
              weight: { pageRank: 0, level: 0, position: heading.weight.position + index + 1 },
            }),
          );
        });
      }
      continue;
    }

    if (body) {
      const first = group.contents[0];
      splitChunks(body).forEach((chunk, index) => {
        aggregated.push(
          withFinalObjectId({
            ...first,
            type: 'content',
            content: chunk,
            weight: { ...first.weight, position: first.weight.position + index },
          }),
        );
      });
    }
  }
  return aggregated;
}

function withFinalObjectId(record) {
  return {
    ...record,
    objectID: sha1(
      record.url +
        '|' +
        record.type +
        '|' +
        record.content +
        '|' +
        record.weight.position,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Algolia REST                                                                */
/* -------------------------------------------------------------------------- */

function algoliaUrl(pathname) {
  return 'https://' + APP_ID + '.algolia.net' + pathname;
}

async function algoliaRequest(pathname, { method = 'GET', body } = {}) {
  const execute = () =>
    fetch(algoliaUrl(pathname), {
      method,
      headers: {
        'X-Algolia-Application-Id': APP_ID,
        'X-Algolia-API-Key': ADMIN_KEY,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response;
  try {
    response = await execute();
  } catch (error) {
    throw new Error('Algolia request failed: ' + (error && error.message));
  }

  if (response.status === 403 && hasProxyEnv()) {
    // Corporate proxies sometimes break the TLS tunnel; retry once without them.
    clearProxyEnv();
    response = await execute();
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    const message = payload && payload.message ? payload.message : text;
    throw new Error('Algolia ' + method + ' ' + pathname + ' -> ' + response.status + ': ' + message);
  }
  return payload;
}

function hasProxyEnv() {
  return Boolean(
    process.env.HTTP_PROXY ||
      process.env.HTTPS_PROXY ||
      process.env.http_proxy ||
      process.env.https_proxy,
  );
}

function clearProxyEnv() {
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']) {
    delete process.env[key];
  }
}

async function waitTask(taskID) {
  if (taskID == null) return;
  for (;;) {
    const response = await algoliaRequest(
      '/1/indexes/' + encodeURIComponent(INDEX_NAME) + '/task/' + taskID,
    );
    if (response && response.status === 'published') {
      return;
    }
    await sleep(120);
  }
}

async function uploadIndex(records, probe) {
  if (!ADMIN_KEY) {
    throw new Error('ALGOLIA_ADMIN_API_KEY is required (Admin or Write key).');
  }

  log('writing settings...');
  await algoliaRequest('/1/indexes/' + encodeURIComponent(INDEX_NAME) + '/settings', {
    method: 'PUT',
    body: SETTINGS,
  });

  log('clearing index...');
  const clear = await algoliaRequest('/1/indexes/' + encodeURIComponent(INDEX_NAME) + '/clear', {
    method: 'POST',
  });
  await waitTask(clear && clear.taskID);

  const BATCH_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const slice = records.slice(i, i + BATCH_SIZE);
    const requests = slice.map((record) => ({ action: 'addObject', body: record }));
    const response = await algoliaRequest('/1/indexes/' + encodeURIComponent(INDEX_NAME) + '/batch', {
      method: 'POST',
      body: { requests },
    });
    await waitTask(response && response.taskID);
    log('uploaded ' + Math.min(i + BATCH_SIZE, records.length) + '/' + records.length);
  }

  log('probing index...');
  const probeResponse = await algoliaRequest('/1/indexes/' + encodeURIComponent(INDEX_NAME) + '/query', {
    method: 'POST',
    body: {
      query: probe.keyword,
      hitsPerPage: 1,
      facetFilters: [
        ['product:' + probe.product, 'rdk_version:' + probe.version],
        'language:' + probe.language,
        'docusaurus_tag:' + probe.docusaurusTag,
      ],
    },
  });
  if (!probeResponse || probeResponse.nbHits === 0) {
    throw new Error(
      'probe query returned 0 hits for ' +
        probe.product +
        ' / ' +
        probe.version +
        ' / ' +
        probe.language +
        '. Index is unusable.',
    );
  }
  log('probe OK: nbHits=' + probeResponse.nbHits);
}

/* -------------------------------------------------------------------------- */
/* Offline index (optional)                                                    */
/* -------------------------------------------------------------------------- */

function writeOfflineIndex(filePath, fineRecords, defaultLocale) {
  const docs = [];
  const headings = [];
  const summaries = [];
  const contents = [];
  const docIndex = new Map();

  for (const record of fineRecords) {
    if (record.language !== defaultLocale) continue;
    const baseUrl = record.url_without_anchor;
    let pageIndex = docIndex.get(baseUrl);
    if (pageIndex == null) {
      pageIndex = docs.length;
      docIndex.set(baseUrl, pageIndex);
      docs.push({
        i: pageIndex,
        t: record.hierarchy.lvl1 || record.hierarchy.lvl0 || '',
        u: baseUrl,
        b: ['lvl0', 'lvl1', 'lvl2']
          .map((key) => record.hierarchy[key])
          .filter(Boolean),
      });
    }
    if (record.type === 'content') {
      contents.push({
        i: 'c' + contents.length,
        t: record.content,
        u: baseUrl,
        p: pageIndex,
        h: record.hierarchy.lvl1 || undefined,
        s: record.anchor || undefined,
      });
    } else {
      headings.push({
        i: 'h' + headings.length,
        t: record.hierarchy[record.type] || '',
        u: record.url,
        h: record.type,
        p: pageIndex,
      });
      if (!record.anchor) {
        summaries.push({
          i: 's' + summaries.length,
          t: record.hierarchy[record.type] || '',
          u: baseUrl,
          p: pageIndex,
        });
      }
    }
  }

  const payload = [
    { documents: docs },
    { documents: headings },
    { documents: summaries },
    { documents: [] },
    { documents: contents },
  ];
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  fs.writeFileSync(path.resolve(filePath), JSON.stringify(payload), 'utf8');
  log('offline search index written: ' + path.resolve(filePath));
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  const matrixJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'src/context/doc-scope-matrix.json'), 'utf8'),
  );
  const corePath = path.join(repoRoot, 'src/context/doc-scope-filter-core.mjs');
  const core = await import(pathToFileURL(corePath).href);

  const { buildSidebarScopeConfig } = require('./lib/sidebar-scope-config-generator.js');
  const scopeConfig = await buildSidebarScopeConfig({
    docsDir: path.join(repoRoot, 'docs'),
    i18nEnDocsCurrentDir: path.join(
      repoRoot,
      'i18n/en/docusaurus-plugin-content-docs/current',
    ),
    siteDir: repoRoot,
  });

  const pairs = core.listVersionProductPairs(matrixJson.VERSION_PRODUCT_MATRIX);
  const defaults = core.deriveDefaultScope(matrixJson.VERSION_PRODUCT_MATRIX);
  log(
    'matrix pairs: ' +
      pairs.map((pair) => pair.product + '@' + pair.version).join(', ') +
      ' (default ' +
      defaults.product +
      '@' +
      defaults.version +
      ')',
  );

  let server = null;
  if (SERVE_DIR) {
    const basePath = basePathOf(SITE_URL);
    const started = await startStaticServer(path.resolve(repoRoot, SERVE_DIR), basePath);
    server = started.server;
    SITE_URL = 'http://127.0.0.1:' + started.port + basePath;
    log('serving ' + SERVE_DIR + ' at ' + SITE_URL);
  }

  const origin = new URL(SITE_URL).origin;
  const basePath = basePathOf(SITE_URL);

  const pages = await crawl(origin, basePath);

  const context = {
    scopeConfig,
    pairs,
    basePath,
    origin,
    defaultLocale: DEFAULT_LOCALE,
    shouldShowDoc: core.shouldShowDoc,
    parseScopeAttr: core.parseScopeAttr,
    scopeSpecMatches: core.scopeSpecMatches,
  };

  const fineRecords = [];
  let indexedPages = 0;
  let skippedPages = 0;
  const perPair = new Map();
  const perLanguage = new Map();

  for (const page of pages) {
    const result = extractRecords(page, context);
    if (!result) {
      skippedPages += 1;
      continue;
    }
    if (result.records.length === 0) {
      skippedPages += 1;
      continue;
    }
    indexedPages += 1;
    for (const record of result.records) {
      fineRecords.push(record);
      const key = record.product + '@' + record.rdk_version;
      perPair.set(key, (perPair.get(key) || 0) + 1);
      perLanguage.set(record.language, (perLanguage.get(record.language) || 0) + 1);
    }
  }

  const uploadRecords = aggregateRecords(fineRecords);

  log('pages with docs: ' + indexedPages + ', skipped: ' + skippedPages);
  log('fine records: ' + fineRecords.length);
  log('aggregated records: ' + uploadRecords.length);
  for (const [key, count] of [...perPair.entries()].sort()) {
    log('  ' + key + ': ' + count + ' fine records');
  }
  for (const [language, count] of [...perLanguage.entries()].sort()) {
    log('  language ' + language + ': ' + count + ' fine records');
  }

  if (OFFLINE_OUT) {
    writeOfflineIndex(OFFLINE_OUT, fineRecords, DEFAULT_LOCALE);
  }

  const sampleSource = uploadRecords.find((record) => record.type === 'content') || uploadRecords[0];
  if (sampleSource) {
    log('sample record:\n' + JSON.stringify(sampleSource, null, 2));
  }

  if (DRY_RUN) {
    log('dry-run: nothing uploaded.');
    if (server) server.close();
    return;
  }

  const probe = {
    keyword: process.env.ALGOLIA_PROBE_KEYWORD || 'RDK',
    product: defaults.product,
    version: defaults.version,
    language: DEFAULT_LOCALE,
    docusaurusTag: 'docs-default-current',
  };
  await uploadIndex(uploadRecords, probe);
  log('done. index=' + INDEX_NAME + ', records=' + uploadRecords.length);
  if (server) server.close();
}

main().catch((error) => {
  console.error('[algolia-index] FAILED:', error && error.message ? error.message : error);
  process.exitCode = 1;
});
